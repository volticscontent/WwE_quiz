"use client"

import { useState, useEffect } from "react"
import { CheckCircle } from "lucide-react"
import Image from "next/image"

interface Kit {
  id: string
  name: string
  wrestler: string
  price: number
  originalPrice: number
  savings: number
  description: string
  items: string[]
  images: string[]
}

const kits: Kit[] = [
  {
    id: "john-cena",
    name: "John Cena Farewell Tour Kit",
    wrestler: "John Cena",
    price: 49.99,
    originalPrice: 149.99,
    savings: 55,
    description: "3 Official Farewell Tour T-Shirts",
    items: [
      "Blue SummerSlam 2025 T-Shirt",
      "Green SummerSlam 2025 T-Shirt", 
      "Black San Antonio T-Shirt",
      "Official Limited Edition Badge",
      "Custom Name + Number",
      "Official Champion Signature"
    ],
    images: [
      "/KIT JOHN.png",
      "/Men's-Green-John-Cena-Farewell-Tour-SummerSlam-202/Men's-Green-John-Cena-Farewell-Tour-SummerSlam-202-10.jpg",
      "/Men's-Green-John-Cena-Farewell-Tour-SummerSlam-202/Men's-Green-John-Cena-Farewell-Tour-SummerSlam-202-08.jpg",
      "/Men's-Black-John-Cena-Farewell-Tour-2025-San-Anton/Men's-Black-John-Cena-Farewell-Tour-2025-San-Anton-04.jpg"
    ]
  },
  {
    id: "cody-rhodes", 
    name: "Cody Rhodes American Nightmare Kit",
    wrestler: "Cody Rhodes",
    price: 49.99,
    originalPrice: 149.99,
    savings: 64,
    description: "Jacket + T-Shirt + Hat Collection",
    items: [
      "Stars & Stripes Windbreaker Jacket",
      "Stars & Stripes Nightmare T-Shirt",
      "Americana Skull Adjustable Hat",
      "Official Limited Edition Badge",
      "Custom Name + Number", 
      "Official Champion Signature"
    ],
    images: [     
      "/KIT CODY.png",
      "/Men's-White-Cody-Rhodes-Stars-and-Stripes-Windbrea/Men's-White-Cody-Rhodes-Stars-and-Stripes-Windbrea-09.jpg",
      "/Men's-White-Cody-Rhodes-Stars-&-Stripes-Nightmare-/Men's-White-Cody-Rhodes-Stars-&-Stripes-Nightmare--01.jpg",
      "/Men's-White-Cody-Rhodes-Americana-Skull-Adjustable/Men's-White-Cody-Rhodes-Americana-Skull-Adjustable-01.jpg"
    ]
  }
]

interface PriceAnchoringProps {
  correctAnswers: number
  onBuyClick?: (selectedKit: string) => void
}

export default function PriceAnchoring({ correctAnswers, onBuyClick }: PriceAnchoringProps) {
  const [selectedKit, setSelectedKit] = useState<string>("john-cena")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const selectedKitData = kits.find(kit => kit.id === selectedKit) || kits[0]
  const discount = correctAnswers * 25
  const finalPrice = selectedKitData.price // Use the kit's specific price

  // Auto-rotate images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => 
        (prev + 1) % selectedKitData.images.length
      )
    }, 3000)
    
    return () => clearInterval(interval)
  }, [selectedKitData.images.length])

  // Reset image index when kit changes
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [selectedKit])

  return (
    <div className="bg-white px-5 pt-4 pb-8">
      <h1 className="text-center text-[#2c2c2c] text-2xl font-bold font-sans mb-4">Make Your Choice</h1>
      <div className="flex justify-center mb-6"><span className="text-sm text-wrap text-center text-gray-500">Choose your favorite WWE Superstar and save up to 70% off! - Max $100</span></div>
      {/* Kit Selection Tabs */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {kits.map((kit) => (
            <button
              key={kit.id}
              onClick={() => setSelectedKit(kit.id)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                selectedKit === kit.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {kit.wrestler}
            </button>
          ))}
        </div>
      </div>

      {/* Product Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-30 rounded-lg overflow-hidden bg-gray-50 relative">
            <Image
              src={selectedKitData.images[currentImageIndex]}
              alt={selectedKitData.name}
              width={96}
              height={96}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/96x96/f3f4f6/6b7280?text=WWE"
              }}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">{selectedKitData.name}</h3>
            <p className="text-sm text-gray-500">{selectedKitData.description}</p>
            <div className="flex items-center mt-1">
              <span className="text-xs text-gray-400">
                Image {currentImageIndex + 1} of {selectedKitData.images.length}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Original Price</p>
          <p className="text-2xl font-light line-through text-red-500">${selectedKitData.originalPrice}</p>
        </div>
      </div>
      
      {/* Thumbnail Gallery */}
      <div className="mb-6">
        <div className="flex space-x-2 mt-30 justify-center">
          {selectedKitData.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-[0.2px] transition-all duration-200 ${
                index === currentImageIndex
                  ? 'border-[#7070706c] scale-105 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:scale-102'
              }`}
            >
              <Image
                src={image}
                alt={`${selectedKitData.name} view ${index + 1}`}
                width={64}
                height={64}
                className="w-full h-full px-2 py-2 object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-4 mb-8">
        <div className="h-px bg-gray-100" />

        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-gray-900 uppercase tracking-wide font-medium">FINAL PRICE</span>
          <div className="text-right">
            <span className="block text-3xl font-semibold text-gray-900">${finalPrice.toFixed(2)}</span>
            <span className="text-sm text-[#ca0d0d]">You save ${discount}</span>
          </div>
        </div>
        
        {/* Buy Now Button */}
        {onBuyClick && (
          <div className="mt-6">
            <button
              onClick={() => onBuyClick(selectedKit)}
              className="w-full bg-[#18d431] hover:bg-[#33ff00] shadow-xl shadow-gray-500/35 hover:shadow-green-200 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Buy Now - Get This Kit
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
