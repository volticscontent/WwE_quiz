"use client"

import { useState, useEffect } from "react"
import { CheckCircle } from "lucide-react"
import Image from "next/image"

interface PriceItem {
  id: number
  text: string
  originalValue: string
  currentValue: string
  emoji: string
}

const bonusItems: PriceItem[] = [
  { id: 1, text: "Badge Officiel Édition Limitée", originalValue: "30€", currentValue: "0€", emoji: "🏆" },
  { id: 2, text: "Nom + Numéro Personnalisé", originalValue: "30€", currentValue: "0€", emoji: "🇫🇷" },
  {
    id: 3,
    text: "Autographe Officiel du Vainqueur",
    originalValue: "100€", 
    currentValue: "0€",
    emoji: "✍️",
  },
]

// Product images for carousel
const productImages = [
  {
    src: "/tdf/product_images/main_product.jpg",
    alt: "Maillot Tour de France - Vue Principale"
  },
  {
    src: "/tdf/product_images_2/angle_2_product.jpg",
    alt: "Maillot Tour de France - Angle 2"
  },
  {
    src: "/tdf/product_images_3/angle_3_product.jpg",
    alt: "Maillot Tour de France - Angle 3"
  },
  {
    src: "/tdf/product_images_4/og_image_product.jpg",
    alt: "Maillot Tour de France - Image Officielle"
  }
]

interface PriceAnchoringProps {
  correctAnswers: number
}

export default function PriceAnchoring({ correctAnswers }: PriceAnchoringProps) {
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const [showBonusItems, setShowBonusItems] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    // Show bonus items after a short delay
    const timer = setTimeout(() => {
      setShowBonusItems(true)

      // Then show each item with 1 second delay
      const showItems = async () => {
        for (let i = 0; i < bonusItems.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1000)) // Changed to 1 second
          setVisibleItems((prev) => [...prev, i])
        }
      }

      showItems()
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Carousel auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % productImages.length)
    }, 3000) // Change image every 3 seconds

    return () => clearInterval(interval)
  }, [])

  const discount = correctAnswers * 25
  const finalPrice = 47

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index)
  }

  return (
    <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Product Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-50 relative">
            {/* Main carousel image */}
            <Image
              src={productImages[currentImageIndex].src}
              alt={productImages[currentImageIndex].alt}
              width={96}
              height={96}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Maillot Légendaire</h3>
            <p className="text-sm text-gray-500">Tour de France 2025</p>
            <div className="flex items-center mt-1">
              <span className="text-xs text-gray-400">
                Image {currentImageIndex + 1} de {productImages.length}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Prix Original</p>
          <p className="text-2xl font-light line-through text-gray-400">147,00€</p>
        </div>
      </div>

      {/* Thumbnail gallery */}
      <div className="mb-6">
        <div className="flex space-x-2 justify-center">
          {productImages.map((image, index) => (
            <button
              key={index}
              onClick={() => handleImageClick(index)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentImageIndex 
                  ? 'border-yellow-400 scale-105 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:scale-102'
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-4 mb-8">
        <div className="h-px bg-gray-100" /> {/* Divider */}
        
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-gray-600 uppercase tracking-wide">Réduction Gagnée</span>
          <span className="text-lg font-medium text-green-600">{discount}€</span>
        </div>

        <div className="h-px bg-gray-100" /> {/* Divider */}

        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-gray-900 uppercase tracking-wide font-medium">PRIX FINAL</span>
          <div className="text-right">
            <span className="block text-3xl font-semibold text-gray-900">47,00€</span>
            <span className="text-sm text-green-600">Vous économisez {discount}€</span>
          </div>
        </div>
      </div>

      {/* Bonus Items */}
      {showBonusItems && (
        <div className="border-t-2 border-yellow-400 pt-6">
          <h3 className="text-2xl font-bold text-yellow-600 mb-6 text-center">Qu'est-ce qui est inclus dans votre maillot ? 🚴⚡</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg transition-all duration-500 opacity-100 transform translate-x-0 bg-white border border-yellow-200 shadow-sm">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 animate-pulse" />
                <span className="text-lg">🏆</span>
                <span className="font-medium text-gray-800">Badge Officiel Édition Limitée</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-400 line-through text-sm">30€</span>
                <span className="font-bold text-green-600 text-lg ml-2">0€</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg transition-all duration-500 opacity-100 transform translate-x-0 bg-white border border-yellow-200 shadow-sm">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 animate-pulse" />
                <div className="w-8 h-8 rounded overflow-hidden">
                  <img alt="Maillot Tour de France" src={productImages[currentImageIndex].src} width={32} height={32} className="w-full h-full object-cover" />
                </div>
                <span className="font-medium text-gray-800">Nom + Numéro Personnalisé</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-400 line-through text-sm">30€</span>
                <span className="font-bold text-green-600 text-lg ml-2">0€</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg transition-all duration-500 opacity-100 transform translate-x-0 bg-white border border-yellow-200 shadow-sm">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 animate-pulse" />
                <span className="text-lg">✍️</span>
                <span className="font-medium text-gray-800">Autographe Officiel du Vainqueur</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-400 line-through text-sm">100€</span>
                <span className="font-bold text-green-600 text-lg ml-2">0€</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
