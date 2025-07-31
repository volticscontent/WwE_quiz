#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Auto WWE Scraper - Monitors html.html for changes and runs scraper automatically
"""

import os
import time
import subprocess
import sys
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class HTMLFileHandler(FileSystemEventHandler):
    """Handler for HTML file changes"""
    
    def __init__(self):
        self.last_processed = 0
        self.debounce_time = 2  # Wait 2 seconds after last change
        
    def on_modified(self, event):
        """Called when a file is modified"""
        if event.is_directory:
            return
            
        # Check if it's the html.html file
        if event.src_path.endswith('html.html'):
            current_time = time.time()
            
            # Debounce - wait a bit to avoid multiple triggers
            if current_time - self.last_processed > self.debounce_time:
                self.last_processed = current_time
                print(f"\n🔄 DETECTED CHANGE: {event.src_path}")
                print("⏳ Waiting 2 seconds for file to be fully saved...")
                time.sleep(2)
                self.run_scraper()
    
    def run_scraper(self):
        """Run the scraper script"""
        try:
            print("\n" + "="*60)
            print("🚀 AUTO-RUNNING WWE SCRAPER...")
            print("="*60)
            
            # Run the scraper
            result = subprocess.run([sys.executable, 'scraper.py'], 
                                  capture_output=True, 
                                  text=True, 
                                  cwd=os.getcwd())
            
            if result.returncode == 0:
                print("✅ SCRAPER COMPLETED SUCCESSFULLY!")
                print("\n📋 SCRAPER OUTPUT:")
                print(result.stdout)
                
                # Check if files were generated
                if os.path.exists('kit_code.ts'):
                    print("\n🎯 NEW KIT CODE GENERATED!")
                    print("📄 Check kit_code.ts for the updated code")
                    
                    # Show the generated code
                    try:
                        with open('kit_code.ts', 'r', encoding='utf-8') as f:
                            code_content = f.read()
                            print("\n📝 GENERATED CODE:")
                            print("-" * 40)
                            print(code_content)
                            print("-" * 40)
                    except Exception as e:
                        print(f"❌ Error reading kit_code.ts: {e}")
                        
                if os.path.exists('extracted_product_data.json'):
                    print("📄 extracted_product_data.json updated")
                    
            else:
                print("❌ SCRAPER FAILED!")
                print("📋 ERROR OUTPUT:")
                print(result.stderr)
                
        except Exception as e:
            print(f"❌ Error running scraper: {e}")
        
        print("\n" + "="*60)
        print("👀 MONITORING FOR NEXT CHANGE...")
        print("💡 Save html.html again to run scraper")
        print("🛑 Press Ctrl+C to stop monitoring")
        print("="*60)

def main():
    """Main function to start file monitoring"""
    
    # Check if scraper.py exists
    if not os.path.exists('scraper.py'):
        print("❌ scraper.py not found!")
        print("📝 Please make sure scraper.py is in the same directory")
        return
    
    print("🎯 WWE AUTO-SCRAPER STARTED!")
    print("="*50)
    print("👀 Monitoring html.html for changes...")
    print("💾 Save html.html to automatically run scraper")
    print("🛑 Press Ctrl+C to stop")
    print("="*50)
    
    # Set up file monitoring
    event_handler = HTMLFileHandler()
    observer = Observer()
    
    # Monitor current directory
    watch_path = "."
    observer.schedule(event_handler, watch_path, recursive=False)
    
    try:
        observer.start()
        
        # Keep the script running
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n\n🛑 STOPPING AUTO-SCRAPER...")
        observer.stop()
        print("✅ Auto-scraper stopped successfully!")
        
    observer.join()

if __name__ == "__main__":
    # Check if watchdog is installed
    try:
        from watchdog.observers import Observer
        from watchdog.events import FileSystemEventHandler
    except ImportError:
        print("❌ watchdog library not installed!")
        print("🔧 Installing watchdog...")
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'watchdog'])
            print("✅ watchdog installed successfully!")
            print("🔄 Please run the script again")
        except Exception as e:
            print(f"❌ Failed to install watchdog: {e}")
            print("💡 Please install manually: pip install watchdog")
        sys.exit(1)
    
    main() 