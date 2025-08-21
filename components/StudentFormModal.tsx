
import React, { useState, useEffect } from 'react';
import { Student, NewStudent } from '../types';
import { UploadIcon, ImageIcon } from './Icons';
import { useNotification } from '../contexts/NotificationContext';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: NewStudent | Student) => void;
  student: Student | null;
}

const StudentFormModal: React.FC<StudentFormModalProps> = ({ isOpen, onClose, onSubmit, student }) => {
  const [formData, setFormData] = useState<Omit<Student, 'id'> & { id?: string }>({
    studentId: '',
    name: '',
    class: '',
    homeroomTeacher: '',
    photoUrl: '',
  });
  const { addNotification } = useNotification();

  useEffect(() => {
    if (student) {
      setFormData(student);
    } else {
      setFormData({ studentId: '', name: '', class: '', homeroomTeacher: '', photoUrl: '' });
    }
  }, [student, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addNotification('กรุณาเลือกไฟล์รูปภาพเท่านั้น', 'error');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
        addNotification('อัปโหลดรูปภาพสำเร็จ', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as NewStudent | Student);
  };
  
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-40" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
          <header className="p-6 bg-slate-50 border-b border-slate-200">
             <h2 className="text-2xl font-bold text-gray-800">{student ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่'}</h2>
          </header>
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-2/3 space-y-4">
                    <InputField label="รหัสนักเรียน" name="studentId" value={formData.studentId} onChange={handleChange} required />
                    <InputField label="ชื่อ-นามสกุล" name="name" value={formData.name} onChange={handleChange} required />
                    <InputField label="ชั้นเรียน" name="class" value={formData.class} onChange={handleChange} required />
                    <InputField label="ครูประจำชั้น" name="homeroomTeacher" value={formData.homeroomTeacher} onChange={handleChange} required />
                </div>
                <div className="w-full md:w-1/3 flex flex-col items-center">
                    <p className="text-sm font-medium text-gray-700 mb-2">รูปภาพนักเรียน</p>
                    <div className="w-32 h-32 bg-slate-200 rounded-lg mb-2 overflow-hidden shadow-inner">
                        {formData.photoUrl ? (
                            <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                                <ImageIcon />
                                <p className="text-xs mt-2">ยังไม่มีรูปภาพ</p>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="cursor-pointer flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg transition-colors border border-slate-300" title="อัปโหลดรูปภาพ">
                           <UploadIcon />
                           <span>อัปโหลดรูปภาพ</span>
                           <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        </label>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-200">
              <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-semibold transition-colors">
                ยกเลิก
              </button>
              <button type="submit" className="py-2 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg font-semibold shadow-md transition-all transform hover:scale-105">
                บันทึก
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

interface InputFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, type = 'text', required = false}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input 
            type={type} 
            id={name} 
            name={name} 
            value={value} 
            onChange={onChange}
            required={required}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
    </div>
);

export default StudentFormModal;
