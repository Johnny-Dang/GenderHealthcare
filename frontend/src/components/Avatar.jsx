import React, { useState } from 'react'
import ImageModal from './ImageModal'

const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  className = '', 
  fallbackText = '',
  showFallback = true,
  clickable = false,
  onImageClick
}) => {
  const [imageError, setImageError] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
    '2xl': 'w-28 h-28 text-3xl'
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageClick = () => {
    if (clickable && src && !imageError) {
      if (onImageClick) {
        onImageClick(src)
      } else {
        setIsModalOpen(true)
      }
    }
  }

  const shouldShowFallback = !src || imageError
  const isClickable = clickable && src && !imageError

  return (
    <>
      <div className={`relative ${className}`}>
        {src && !imageError && (
          <img
            src={src}
            alt={alt}
            className={`${sizeClasses[size]} rounded-full object-cover border-4 border-white shadow-md ${
              isClickable ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
            }`}
            onError={handleImageError}
            onClick={handleImageClick}
          />
        )}
        
        {shouldShowFallback && showFallback && (
          <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center text-pink-500 font-bold border-4 border-white shadow-md`}>
            {fallbackText ? fallbackText.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={src}
        alt={alt}
      />
    </>
  )
}

export default Avatar 