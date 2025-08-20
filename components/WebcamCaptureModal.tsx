
import React, { useRef, useEffect, useCallback } from 'react';
import { CameraIcon } from './Icons';
import { useNotification } from '../contexts/NotificationContext';

interface WebcamCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

const WebcamCaptureModal: React.FC<WebcamCaptureModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { addNotification } = useNotification();

  const startCamera = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error("Error accessing webcam: ", err);
        addNotification("ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบการอนุญาต", 'error');
        onClose();
      }
    }
  }, [onClose, addNotification]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);
  
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
        stopCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 flex flex-col items-center animate-fade-in-up">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">ถ่ายภาพจากเว็บแคม</h2>
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
          <video ref={videoRef} className="w-full h-full object-cover"></video>
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
        <div className="mt-6 flex gap-4">
          <button onClick={onClose} className="py-2 px-4 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-semibold transition-colors">
            ยกเลิก
          </button>
          <button onClick={handleCapture} className="flex items-center gap-2 py-2 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105">
            <CameraIcon />
            <span>ถ่ายภาพ</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebcamCaptureModal;