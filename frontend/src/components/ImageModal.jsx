import React, { useState, useRef, useEffect } from 'react'
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

const ImageModal = ({ isOpen, onClose, imageUrl, alt = 'Image' }) => {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setScale(1)
      setRotation(0)
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen])

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev * 1.2, 3))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev / 1.2, 0.5))
  }

  const handleReset = () => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale((prev) => Math.max(0.5, Math.min(prev * delta, 3)))
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black bg-opacity-90 backdrop-blur-sm' onClick={onClose} />

      {/* Modal Content */}
      <div className='relative z-10 w-full h-full flex items-center justify-center p-4'>
        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-20 bg-black bg-opacity-50 rounded-full p-2'
        >
          <X className='w-6 h-6' />
        </button>

        {/* Controls */}
        <div className='absolute top-4 left-4 flex gap-2 z-20'>
          <button
            onClick={handleZoomIn}
            className='text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2'
            title='Phóng to'
          >
            <ZoomIn className='w-5 h-5' />
          </button>
          <button
            onClick={handleZoomOut}
            className='text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2'
            title='Thu nhỏ'
          >
            <ZoomOut className='w-5 h-5' />
          </button>
          <button
            onClick={handleReset}
            className='text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2'
            title='Đặt lại'
          >
            <RotateCcw className='w-5 h-5' />
          </button>
        </div>

        {/* Image Container */}
        <div
          className='relative overflow-hidden rounded-lg'
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default' }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt={alt}
            className='max-w-full max-h-[90vh] object-contain transition-transform duration-200'
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
              transformOrigin: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Image Info */}
        <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white bg-black bg-opacity-50 rounded-lg px-4 py-2'>
          <p className='text-sm'>{scale > 1 ? `Zoom: ${Math.round(scale * 100)}%` : 'Click bên ngoài để đóng'}</p>
          <p className='text-xs opacity-80 mt-1'>Sử dụng chuột để di chuyển • Cuộn để zoom</p>
        </div>
      </div>
    </div>
  )
}

export default ImageModal
