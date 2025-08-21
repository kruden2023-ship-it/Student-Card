import React, { useState, useEffect } from 'react';
import { CardSettings } from '../types';
import { ImageIcon, SignatureIcon, UploadIcon } from './Icons';
import { useNotification } from '../contexts/NotificationContext';

interface SettingsPanelProps {
  settings: CardSettings;
  onSettingsChange: (newSettings: Partial<CardSettings>) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange }) => {
  const { addNotification } = useNotification();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'signatureUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addNotification('กรุณาเลือกไฟล์รูปภาพเท่านั้น', 'error');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        onSettingsChange({ [field]: reader.result as string });
        const message = field === 'logoUrl' ? 'อัปโหลดโลโก้โรงเรียนสำเร็จ' : 'อัปโหลดลายเซ็นผู้อำนวยการสำเร็จ';
        addNotification(message, 'success');
      };
      reader.onerror = () => {
        addNotification('เกิดข้อผิดพลาดในการอ่านไฟล์', 'error');
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    onSettingsChange({ [e.target.name]: e.target.value });
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">ตั้งค่าบัตรนักเรียน</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อโรงเรียน</label>
          <input 
            type="text" 
            name="schoolName"
            value={settings.schoolName}
            onChange={handleTextChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
          <textarea
            name="address"
            value={settings.address}
            onChange={handleTextChange}
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleTextChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เว็บไซต์</label>
              <input
                type="text"
                name="website"
                value={settings.website}
                onChange={handleTextChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FileUploadButton 
              label="โลโก้โรงเรียน" 
              icon={<ImageIcon />} 
              field="logoUrl" 
              onChange={handleFileChange} 
              imageUrl={settings.logoUrl}
              placeholderText="ยังไม่มีภาพโลโก้"
            />
            <FileUploadButton 
              label="ลายเซ็นผู้อำนวยการ" 
              icon={<SignatureIcon />} 
              field="signatureUrl" 
              onChange={handleFileChange} 
              imageUrl={settings.signatureUrl}
              placeholderText="ยังไม่มีภาพลายเซ็น"
            />
        </div>
      </div>
    </div>
  );
};

interface FileUploadButtonProps {
    label: string;
    icon: React.ReactNode;
    field: 'logoUrl' | 'signatureUrl';
    imageUrl?: string;
    placeholderText: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'signatureUrl') => void;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ label, icon, field, imageUrl, placeholderText, onChange }) => {
    const inputId = `file-upload-${field}`;
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [imageUrl]);

    const handleImageError = () => {
        setHasError(true);
    };

    const showImage = imageUrl && !hasError;

    return (
        <div>
            <label htmlFor={inputId} className="cursor-pointer group">
                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl group-hover:border-blue-500 group-hover:bg-slate-50 transition-colors h-40">
                    {showImage ? (
                        <img 
                            src={imageUrl} 
                            alt={label} 
                            className="max-h-20 object-contain" 
                            onError={handleImageError}
                        />
                    ) : (
                        <div className="text-center text-slate-500 group-hover:text-blue-500 transition-colors">
                            {icon}
                            <p className="text-sm mt-1">{placeholderText}</p>
                        </div>
                    )}
                    <span className="mt-2 text-sm text-gray-600 text-center font-semibold">{label}</span>
                    <span className="mt-1 text-xs text-blue-600 font-semibold flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <UploadIcon /> {imageUrl ? 'เปลี่ยนรูปภาพ' : 'เลือกไฟล์'}
                    </span>
                </div>
            </label>
            <input id={inputId} type="file" className="hidden" accept="image/png, image/jpeg" onChange={(e) => onChange(e, field)} />
        </div>
    );
};

export default SettingsPanel;