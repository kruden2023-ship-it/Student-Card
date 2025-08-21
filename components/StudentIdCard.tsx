
import React, { useState, useEffect } from 'react';
import { Student, CardSettings } from '../types';

interface StudentIdCardProps {
  student: Student | null;
  settings: CardSettings;
  side: 'front' | 'back';
  elementId: string;
}

const FALLBACK_LOGO_URL = `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-full h-full text-gray-400'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z' /%3e%3c/svg%3e`;
const FALLBACK_USER_PHOTO_URL = `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%239ca3af'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z' /%3e%3c/svg%3e`;


const StudentIdCard: React.FC<StudentIdCardProps> = ({ student, settings, side, elementId }) => {
  const [signatureError, setSignatureError] = useState(false);

  useEffect(() => {
    setSignatureError(false);
  }, [settings.signatureUrl]);

  const placeholderStudent: Student = {
    id: '0',
    studentId: '12345',
    name: 'ชื่อ-นามสกุล',
    class: 'ม.6/1',
    homeroomTeacher: 'ชื่อครูประจำชั้น',
    photoUrl: FALLBACK_USER_PHOTO_URL
  };

  const displayStudent = student || placeholderStudent;
  
  const rules = [
    'บัตรนี้เป็นกรรมสิทธิ์ของโรงเรียน',
    'กรุณาแสดงบัตรนี้ทุกครั้งเมื่อติดต่อกับโรงเรียน',
    'หากเก็บบัตรนี้ได้ กรุณาส่งคืนโรงเรียน',
  ];

  /**
   * Renders a full name with special wrapping for the last name.
   * It prevents the last name from breaking in the middle. The entire
   * last name will wrap to a new line if needed.
   */
  const renderNameWithSmartWrap = (fullName: string) => {
    if (!fullName || typeof fullName !== 'string') return fullName;
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 1) {
      // For single names, allow breaking if it's too long
      return <span className="break-words">{fullName}</span>;
    }
    const lastName = parts.pop();
    const firstName = parts.join(' ');
    
    return (
      <>
        {firstName}&nbsp;<span className="inline-block">{lastName}</span>
      </>
    );
  };

  return (
    <div 
      id={elementId} 
      className="w-full max-w-sm aspect-[85.6/54] rounded-2xl shadow-xl overflow-hidden relative text-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      style={{ fontFamily: "'Sarabun', sans-serif" }}
    >
      {/* Background Image */}
      <img src={settings.backgroundUrl} alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="absolute inset-0 bg-white bg-opacity-70 z-10"></div>
      
      {/* Card Content */}
      <div className="relative z-20 h-full p-4 flex flex-col">
        {side === 'front' ? (
          <>
            <header className="flex items-center gap-2 pb-2 border-b-2 border-blue-800">
              <img 
                src={settings.logoUrl || FALLBACK_LOGO_URL} 
                onError={(e) => {
                  if (e.currentTarget.src !== FALLBACK_LOGO_URL) {
                    e.currentTarget.src = FALLBACK_LOGO_URL;
                  }
                }}
                alt="School Logo" 
                className="w-10 h-10 object-contain flex-shrink-0" />
              <div className="text-blue-900 flex-1 flex flex-col justify-center min-w-0">
                <h2 className="font-bold text-base leading-tight">บัตรประจำตัวนักเรียน</h2>
                <p className="text-xs leading-snug break-words">{settings.schoolName}</p>
              </div>
            </header>
            <main className="flex-grow flex items-center gap-4 mt-3">
              <div className="w-1/3">
                 <img 
                    src={displayStudent.photoUrl || FALLBACK_USER_PHOTO_URL} 
                    onError={(e) => {
                        if (e.currentTarget.src !== FALLBACK_USER_PHOTO_URL) {
                          e.currentTarget.src = FALLBACK_USER_PHOTO_URL;
                        }
                    }}
                    alt="Student" 
                    className="w-full aspect-square object-cover border-4 border-blue-800 rounded-lg shadow-md bg-slate-200" 
                  />
              </div>
              <div className="w-2/3 text-gray-800 font-semibold space-y-1 min-w-0">
                <p className="font-bold text-sm" title={displayStudent.name}>{renderNameWithSmartWrap(displayStudent.name)}</p>
                <p><strong>รหัสนักเรียน:</strong> {displayStudent.studentId}</p>
                <p><strong>ชั้นเรียน:</strong> {displayStudent.class}</p>
                <p><strong>ครูประจำชั้น:</strong> {renderNameWithSmartWrap(displayStudent.homeroomTeacher)}</p>
              </div>
            </main>
          </>
        ) : (
          <div className="flex flex-col justify-between h-full text-gray-800 text-xs">
            <div>
              <p className="font-bold text-center">ข้อปฏิบัติสำหรับผู้ถือบัตร</p>
               <div className="text-left text-[10px] mt-3 space-y-0.5">
                    {rules.map((rule, index) => (
                        <div key={index} className="flex items-start">
                            <span className="font-bold text-blue-900 w-4 flex-shrink-0">{`${index + 1}.`}</span>
                            <span>{rule}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="text-center break-words">
              <p>{settings.address}</p>
              {(settings.phone || settings.website) && (
                <p>
                  {settings.phone && `โทร. ${settings.phone}`}
                  {settings.phone && settings.website && ' | '}
                  {settings.website}
                </p>
              )}
            </div>
            <div className="flex justify-end items-end">
              <div className="text-center">
                {settings.signatureUrl && !signatureError && (
                  <img 
                    src={settings.signatureUrl} 
                    alt="Director's Signature" 
                    className="h-10 mx-auto" 
                    onError={() => setSignatureError(true)}
                  />
                )}
                <p className="border-t border-gray-500 pt-1 mt-1 break-words">(นายมงคล นิพรรัมย์)</p>
                <p>ผู้อำนวยการโรงเรียน</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentIdCard;