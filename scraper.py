#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
import re
import os
import time
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from pathlib import Path

def clean_filename(filename):
    """Clean filename for safe filesystem usage"""
    # Remove or replace invalid characters
    filename = re.sub(r'[<>:"/\\|?*]', '-', filename)
    filename = re.sub(r'\s+', '-', filename)  # Replace spaces with hyphens
    filename = filename.strip('-')  # Remove leading/trailing hyphens
    return filename[:50]  # Limit length

def download_image(url, filepath, max_retries=3):
    """Download image from URL and save to filepath"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
    }
    
    for attempt in range(max_retries):
        try:
            print(f"    Downloading: {os.path.basename(filepath)} (attempt {attempt + 1})")
            response = requests.get(url, headers=headers, timeout=15, stream=True)
            response.raise_for_status()
            
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            print(f"    Saved: {filepath}")
            return True
            
        except Exception as e:
            print(f"    Error downloading {url}: {e}")
            if attempt < max_retries - 1:
                time.sleep(2)
            else:
                return False

def extract_product_info(html_content):
    """Extract all product information from HTML"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    product_info = {
        'name': '',
        'price': 0.0,
        'original_price': 0.0,
        'description': '',
        'brand': '',
        'category': '',
        'images': [],
        'details': []
    }
    
    # Extract product name from multiple sources
    name_selectors = [
        'h1.pdp-product-name',
        '.product-name h1',
        'h1[data-testid="product-name"]',
        '.pdp-product-name',
        'h1.product-title',
        '.product-detail h1',
        'title',
        '[property="og:title"]'
    ]
    
    for selector in name_selectors:
        if selector == 'title':
            elem = soup.find('title')
            if elem:
                product_info['name'] = elem.get_text().strip()
                break
        elif selector == '[property="og:title"]':
            elem = soup.find('meta', {'property': 'og:title'})
            if elem and elem.get('content'):
                product_info['name'] = elem.get('content').strip()
                break
        else:
            elem = soup.select_one(selector)
            if elem:
                product_info['name'] = elem.get_text().strip()
                break
    
    # Extract price information
    price_selectors = [
        '.price-current',
        '.pdp-price .price',
        '[data-testid="price-current"]',
        '.price .current',
        '.product-price .current',
        '.price-value',
        '.current-price'
    ]
    
    for selector in price_selectors:
        elem = soup.select_one(selector)
        if elem:
            price_text = elem.get_text().strip()
            price_match = re.search(r'[\d,.]+', price_text.replace('$', '').replace('€', ''))
            if price_match:
                product_info['price'] = float(price_match.group().replace(',', ''))
                break
    
    # Extract original price (if on sale)
    original_price_selectors = [
        '.price-original',
        '.price .original',
        '[data-testid="price-original"]',
        '.was-price',
        '.price-old',
        '.original-price'
    ]
    
    for selector in original_price_selectors:
        elem = soup.select_one(selector)
        if elem:
            orig_price_text = elem.get_text().strip()
            orig_price_match = re.search(r'[\d,.]+', orig_price_text.replace('$', '').replace('€', ''))
            if orig_price_match:
                product_info['original_price'] = float(orig_price_match.group().replace(',', ''))
                break
    
    # If no original price found, use current price
    if product_info['original_price'] == 0.0:
        product_info['original_price'] = product_info['price']
    
    # Extract description
    desc_selectors = [
        '.product-description',
        '.pdp-description',
        '[data-testid="product-description"]',
        '.product-details .description',
        '[property="og:description"]'
    ]
    
    for selector in desc_selectors:
        if selector == '[property="og:description"]':
            elem = soup.find('meta', {'property': 'og:description'})
            if elem and elem.get('content'):
                product_info['description'] = elem.get('content').strip()
                break
        else:
            elem = soup.select_one(selector)
            if elem:
                product_info['description'] = elem.get_text().strip()
                break
    
    # Extract images from multiple sources
    image_urls = set()
    
    # Method 1: Find all img tags
    img_elements = soup.find_all('img')
    for img in img_elements:
        src = img.get('src') or img.get('data-src') or img.get('data-lazy-src') or img.get('data-original')
        if src:
            # Convert relative URLs to absolute
            if src.startswith('//'):
                src = 'https:' + src
            elif src.startswith('/'):
                src = 'https://shop.wwe.com' + src
            
            # Filter out small/icon images
            if any(size in src.lower() for size in ['thumb', 'icon', 'logo', 'sprite', 'favicon']):
                continue
            
            # Filter for actual product images
            if any(keyword in src.lower() for keyword in ['product', 'image', 'photo', '.jpg', '.jpeg', '.png', '.webp']):
                image_urls.add(src)
    
    # Method 2: Extract from meta tags
    meta_images = soup.find_all('meta', {'property': ['og:image', 'twitter:image']})
    for meta in meta_images:
        content = meta.get('content')
        if content:
            if content.startswith('//'):
                content = 'https:' + content
            image_urls.add(content)
    
    # Method 3: Extract from JSON-LD structured data
    script_tags = soup.find_all('script', type='application/ld+json')
    for script in script_tags:
        try:
            if script.string:
                json_data = json.loads(script.string)
                
                def extract_images_from_json(data):
                    images = []
                    if isinstance(data, dict):
                        if 'image' in data:
                            img_data = data['image']
                            if isinstance(img_data, list):
                                for img in img_data:
                                    if isinstance(img, str):
                                        images.append(img)
                                    elif isinstance(img, dict) and 'url' in img:
                                        images.append(img['url'])
                            elif isinstance(img_data, str):
                                images.append(img_data)
                        
                        # Recursively search for images in nested objects
                        for key, value in data.items():
                            if isinstance(value, (dict, list)):
                                images.extend(extract_images_from_json(value))
                    
                    elif isinstance(data, list):
                        for item in data:
                            images.extend(extract_images_from_json(item))
                    
                    return images
                
                json_images = extract_images_from_json(json_data)
                for img_url in json_images:
                    if img_url.startswith('//'):
                        img_url = 'https:' + img_url
                    image_urls.add(img_url)
                    
        except json.JSONDecodeError:
            continue
    
    # Method 4: Find images in CSS background-image properties
    style_tags = soup.find_all('style')
    for style in style_tags:
        if style.string:
            bg_images = re.findall(r'background-image:\s*url\(["\']?([^"\']+)["\']?\)', style.string)
            for bg_img in bg_images:
                if bg_img.startswith('//'):
                    bg_img = 'https:' + bg_img
                elif bg_img.startswith('/'):
                    bg_img = 'https://shop.wwe.com' + bg_img
                image_urls.add(bg_img)
    
    # Method 5: Regex search for image URLs in the entire HTML
    img_patterns = [
        r'https://[^"\'\s>]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^"\'\s>]*)?',
        r'//[^"\'\s>]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^"\'\s>]*)?'
    ]
    
    for pattern in img_patterns:
        found_images = re.findall(pattern, html_content, re.IGNORECASE)
        for img_url in found_images:
            if img_url.startswith('//'):
                img_url = 'https:' + img_url
            image_urls.add(img_url)
    
    # Convert set to list and filter
    filtered_images = []
    for img_url in image_urls:
        # Skip very small images, icons, etc.
        if any(skip in img_url.lower() for skip in ['favicon', 'icon', 'logo', 'sprite', '16x16', '32x32', '64x64']):
            continue
        
        # Skip data URLs
        if img_url.startswith('data:'):
            continue
            
        filtered_images.append(img_url)
    
    product_info['images'] = filtered_images[:10]  # Limit to 10 images
    
    return product_info

def save_product_images(product_info, base_dir="public"):
    """Download and save all product images"""
    if not product_info['images']:
        print("No images found to download")
        return []
    
    # Create safe product name for folder
    product_name = clean_filename(product_info['name']) or 'unknown-product'
    product_dir = os.path.join(base_dir, product_name)
    
    print(f"Creating directory: {product_dir}")
    os.makedirs(product_dir, exist_ok=True)
    
    saved_images = []
    
    for i, img_url in enumerate(product_info['images']):
        try:
            # Get file extension from URL
            parsed_url = urlparse(img_url)
            path = parsed_url.path
            ext = os.path.splitext(path)[1] or '.jpg'
            
            # Create filename
            filename = f"{product_name}-{i+1:02d}{ext}"
            filepath = os.path.join(product_dir, filename)
            
            # Download image
            if download_image(img_url, filepath):
                # Store relative path for use in React
                relative_path = f"/{product_name}/{filename}"
                saved_images.append({
                    'original_url': img_url,
                    'local_path': filepath,
                    'public_path': relative_path,
                    'filename': filename
                })
            
            # Small delay to be respectful
            time.sleep(0.5)
            
        except Exception as e:
            print(f"Error processing image {img_url}: {e}")
            continue
    
    return saved_images

def generate_kit_data(product_info, saved_images, kit_id, wrestler_name, kit_price, kit_original_price):
    """Generate kit data structure for price-anchoring"""
    
    # Use local images if available, fallback to original URLs
    image_paths = []
    if saved_images:
        for img in saved_images[:5]:  # Limit to 5 images
            image_paths.append(img['public_path'])
    else:
        # Fallback to original URLs
        for img_url in product_info['images'][:5]:
            image_paths.append(img_url)
    
    # Generate items list
    items = [
        f'"{product_info["name"]}"',
        '"Official Limited Edition Badge"',
        '"Custom Name + Number"',
        '"Official Champion Signature"'
    ]
    
    # Calculate savings percentage
    if kit_original_price > 0:
        savings = int((1 - kit_price / kit_original_price) * 100)
    else:
        savings = 50  # Default fallback
    
    kit_data = {
        'id': kit_id,
        'name': product_info['name'] or f"{wrestler_name} Kit",
        'wrestler': wrestler_name,
        'price': kit_price,
        'originalPrice': kit_original_price,
        'savings': savings,
        'description': product_info['description'][:50] + "..." if product_info['description'] else f"{wrestler_name} Collection",
        'items': items,
        'images': image_paths
    }
    
    return kit_data

def generate_price_anchoring_code(kit_data):
    """Generate TypeScript code for price-anchoring component"""
    
    # Format items
    items_str = ',\n'.join(f'      {item}' for item in kit_data['items'])
    
    # Format images
    images_str = ',\n'.join(f'      "{img}"' for img in kit_data['images'])
    
    code = f'''  {{
    id: "{kit_data['id']}",
    name: "{kit_data['name']}",
    wrestler: "{kit_data['wrestler']}",
    price: {kit_data['price']},
    originalPrice: {kit_data['originalPrice']:.2f},
    savings: {kit_data['savings']},
    description: "{kit_data['description']}",
    items: [
{items_str}
    ],
    images: [
{images_str}
    ]
  }}'''
    
    return code

def main():
    """Main scraper function"""
    html_file = 'html.html'
    
    if not os.path.exists(html_file):
        print(f"File {html_file} not found!")
        print("Please save the product HTML content to html.html and try again.")
        return
    
    print("WWE Product Scraper Started!")
    print("=" * 50)
    
    # Read HTML file
    print(f"Reading {html_file}...")
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Extract product information
    print("Extracting product information...")
    product_info = extract_product_info(html_content)
    
    print(f"\nPRODUCT FOUND:")
    print(f"  Name: {product_info['name']}")
    print(f"  Price: ${product_info['price']}")
    print(f"  Original Price: ${product_info['original_price']}")
    print(f"  Description: {product_info['description'][:100]}...")
    print(f"  Images found: {len(product_info['images'])}")
    
    # Download images
    print(f"\nDOWNLOADING IMAGES:")
    saved_images = save_product_images(product_info)
    
    if saved_images:
        print(f"Successfully downloaded {len(saved_images)} images")
    else:
        print("No images were downloaded, using original URLs")
    
    # Generate kit data (automatic values based on product)
    print(f"\nGENERATING KIT DATA:")
    
    # Auto-detect kit info from product name
    product_name_lower = product_info['name'].lower()
    
    if 'john cena' in product_name_lower:
        kit_id = "john-cena"
        wrestler_name = "John Cena"
        kit_price = 49.99
        kit_original_price = 110.99
    elif 'cody rhodes' in product_name_lower:
        kit_id = "cody-rhodes"
        wrestler_name = "Cody Rhodes"
        kit_price = 49.99
        kit_original_price = 149.99
    else:
        kit_id = "custom-kit"
        wrestler_name = "WWE Superstar"
        kit_price = 49.99
        kit_original_price = max(product_info['original_price'] * 2, 99.99)
    
    print(f"  Kit ID: {kit_id}")
    print(f"  Wrestler: {wrestler_name}")
    print(f"  Kit Price: ${kit_price}")
    print(f"  Original Price: ${kit_original_price}")
    
    kit_data = generate_kit_data(product_info, saved_images, kit_id, wrestler_name, kit_price, kit_original_price)
    
    # Generate TypeScript code
    ts_code = generate_price_anchoring_code(kit_data)
    
    # Save results
    print(f"\nSAVING RESULTS:")
    
    # Save raw data
    with open('extracted_product_data.json', 'w', encoding='utf-8') as f:
        result_data = {
            'product_info': product_info,
            'saved_images': saved_images,
            'kit_data': kit_data,
            'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        json.dump(result_data, f, indent=2, ensure_ascii=False)
    
    # Save TypeScript code
    with open('kit_code.ts', 'w', encoding='utf-8') as f:
        f.write(ts_code)
    
    print(f"extracted_product_data.json - Complete scraped data")
    print(f"kit_code.ts - Ready-to-use TypeScript code")
    
    print(f"\nNEXT STEPS:")
    print(f"1. Copy the code from kit_code.ts")
    print(f"2. Add it to the kits array in price-anchoring.tsx")
    print(f"3. Images are saved in public/{clean_filename(product_info['name'])}/")
    print(f"4. Update your component to use the new kit!")
    
    return kit_data

if __name__ == "__main__":
    main() 