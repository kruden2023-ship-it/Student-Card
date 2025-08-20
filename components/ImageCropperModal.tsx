import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, type PixelCrop } from 'react-image-crop';
import { CropIcon } from './Icons';

/**
 * Creates a cropped image from a source image and a crop object.
 * @param image The source HTMLImageElement.
 * @param crop The PixelCrop object from react-image-crop.
 * @param targetWidth The desired width of the output image.
 * @param targetHeight The desired height of the output image.
 * @returns A base64 data URL of the cropped image in JPEG format.
 */
function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop,
  targetWidth = 256,
  targetHeight = 256
): string {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  const sourceX = crop.x * scaleX;
  const sourceY = crop.y * scaleY;
  const sourceWidth = crop.width * scaleX;
  const sourceHeight = crop.height * scaleY;

  // Set high-quality rendering options
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return canvas.toDataURL('image/jpeg');
}

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImageUrl: string) => void;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ isOpen, onClose, imageSrc, onCropComplete }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: 'px', // Use pixels for consistency
          width: Math.min(width, height) * 0.9, // Start with a 90% crop
        },
        1, // 1:1 aspect ratio
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
  }

  const handleConfirmCrop = () => {
    if (imgRef.current && crop?.width && crop?.height) {
      const croppedImageUrl = getCroppedImg(imgRef.current, crop as PixelCrop);
      onCropComplete(croppedImageUrl);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 flex flex-col items-center animate-fade-in-up">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">ปรับขนาดรูปภาพ</h2>
        <div className="w-full max-w-md bg-slate-200 rounded-lg overflow-hidden shadow-inner">
          <ReactCrop
            crop={crop}
            onChange={(pixelCrop) => setCrop(pixelCrop)}
            aspect={1}
            minWidth={100}
            aria-label="Image crop area"
          >
            <img ref={imgRef} src={imageSrc} onLoad={onImageLoad} alt="Crop Preview" style={{ maxHeight: '70vh' }} />
          </ReactCrop>
        </div>
        <div className="mt-6 flex gap-4">
          <button onClick={onClose} className="py-2 px-4 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-semibold transition-colors">
            ยกเลิก
          </button>
          <button onClick={handleConfirmCrop} className="flex items-center gap-2 py-2 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105">
            <CropIcon />
            <span>ยืนยัน</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;