
import React, { useRef } from 'react';
import { Student } from '../types';
import { UserPlusIcon, FileCsvIcon, TrashIcon, PencilIcon, PrinterIcon, SearchIcon, SortIcon, SortUpIcon, SortDownIcon, UserGroupIcon } from './Icons';

interface StudentManagementPanelProps {
  students: Student[];
  selectedStudentIds: string[];
  onToggleStudentSelection: (student: Student) => void;
  onSelectAll: (checked: boolean) => void;
  onAddStudentClick: () => void;
  onImportCsv: (file: File) => void;
  onEditStudent: (student: Student) => void;
  onPrintStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onPrintSelected: () => void;
  onDeleteSelected: () => void;
  isPrinting: boolean;
  selectedStudentCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortConfig: { key: keyof Student; direction: 'asc' | 'desc' } | null;
  onSort: (key: keyof Student) => void;
}

const FALLBACK_USER_PHOTO_URL = `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%239ca3af'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z' /%3e%3c/svg%3e`;

const SelectedActions: React.FC<{
  count: number;
  onPrint: () => void;
  isPrinting: boolean;
}> = ({ count, onPrint, isPrinting }) => {
  if (count === 0) {
    return null;
  }

  return (
    <button
      onClick={onPrint}
      disabled={isPrinting}
      className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105"
      aria-label={`พิมพ์บัตรนักเรียนที่เลือก ${count} คน`}
    >
      <PrinterIcon /> <span>{isPrinting ? 'กำลังพิมพ์...' : `พิมพ์ที่เลือก (${count})`}</span>
    </button>
  );
};


const StudentManagementPanel: React.FC<StudentManagementPanelProps> = ({ 
  students, 
  selectedStudentIds, 
  onToggleStudentSelection,
  onSelectAll,
  onAddStudentClick, 
  onImportCsv, 
  onEditStudent,
  onPrintStudent,
  onDeleteStudent,
  onPrintSelected,
  onDeleteSelected,
  isPrinting,
  selectedStudentCount,
  searchQuery,
  onSearchChange,
  sortConfig,
  onSort
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportCsv(file);
    }
  };

  const areAllVisibleSelected = students.length > 0 && students.every(s => selectedStudentIds.includes(s.id));
  
  const csvTooltipText = `นำเข้าไฟล์ CSV

โปรแกรมรองรับหัวข้อคอลัมน์ต่อไปนี้ (ทั้งภาษาไทยและอังกฤษ):
- รหัสนักเรียน: studentId, เลขประจำตัว
- ชื่อ-นามสกุล: name, ชื่อ-สกุล
- ชั้นเรียน: class, ชั้น
- ครูประจำชั้น: homeroomTeacher
- รูปภาพ: photoUrl, รูป

*หมายเหตุ: คอลัมน์ 'รหัสนักเรียน' และ 'ชื่อ-นามสกุล' จำเป็นต้องมีข้อมูล`;


  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">รายชื่อนักเรียน</h2>
        <div className="flex gap-2 flex-wrap">
           <SelectedActions
            count={selectedStudentCount}
            onPrint={onPrintSelected}
            isPrinting={isPrinting}
          />
          {selectedStudentCount > 0 && (
            <button
              onClick={onDeleteSelected}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105"
              aria-label={`ลบนักเรียนที่เลือก ${selectedStudentCount} คน`}
            >
              <TrashIcon /> <span>ลบที่เลือก ({selectedStudentCount})</span>
            </button>
          )}
          <button onClick={onAddStudentClick} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105">
            <UserPlusIcon /> <span>เพิ่มนักเรียน</span>
          </button>
          <button 
            onClick={handleImportClick} 
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            title={csvTooltipText}
          >
            <FileCsvIcon /> <span>นำเข้า CSV</span>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileSelected} />
        </div>
      </div>

      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
            <SearchIcon />
        </div>
        <input 
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหาจากรหัส, ชื่อ-นามสกุล, หรือระดับชั้น..."
            className="w-full px-4 py-2.5 pl-12 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-slate-100">
                <tr>
                    <th scope="col" className="p-4 w-4">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        checked={areAllVisibleSelected}
                        onChange={(e) => onSelectAll(e.target.checked)}
                        aria-label="Select all visible students"
                      />
                    </th>
                    <th scope="col" className="px-4 py-3">รูป</th>
                    <th scope="col" className="px-4 py-3">รหัสนักเรียน</th>
                    <th scope="col" className="px-4 py-3">ชื่อ-นามสกุล</th>
                    <th scope="col" className="px-4 py-3">
                        <button
                            onClick={() => onSort('class')}
                            className="flex items-center gap-1 group focus:outline-none"
                            aria-label="Sort by class"
                        >
                            <span>ระดับชั้น</span>
                            {sortConfig?.key === 'class' ? (
                                sortConfig.direction === 'asc' ? <SortUpIcon /> : <SortDownIcon />
                            ) : (
                                <SortIcon />
                            )}
                        </button>
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">จัดการ</th>
                </tr>
            </thead>
            <tbody>
            {students.length > 0 ? (
                students.map((student) => (
                    <tr 
                        key={student.id} 
                        className={`border-b border-slate-200 transition-colors ${selectedStudentIds.includes(student.id) ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-slate-50'}`}
                    >
                        <td className="p-4 w-4">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            checked={selectedStudentIds.includes(student.id)}
                            onChange={() => onToggleStudentSelection(student)}
                            aria-label={`Select student ${student.name}`}
                          />
                        </td>
                        <td className="px-4 py-2">
                            <img 
                                src={student.photoUrl || FALLBACK_USER_PHOTO_URL} 
                                onError={(e) => {
                                    if (e.currentTarget.src !== FALLBACK_USER_PHOTO_URL) {
                                      e.currentTarget.src = FALLBACK_USER_PHOTO_URL;
                                    }
                                }}
                                alt={student.name} 
                                className="w-10 h-10 rounded-full object-cover shadow-sm bg-slate-200" 
                            />
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-700">{student.studentId}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{student.name}</td>
                        <td className="px-4 py-3">{student.class}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button 
                              onClick={() => onEditStudent(student)}
                              className="text-gray-400 hover:text-blue-600 p-2 rounded-full transition-colors hover:bg-blue-100"
                              aria-label={`Edit student ${student.name}`}
                            >
                              <PencilIcon />
                            </button>
                             <button 
                              onClick={() => onPrintStudent(student)}
                              className="text-gray-400 hover:text-green-600 p-2 rounded-full transition-colors hover:bg-green-100"
                              aria-label={`Print card for ${student.name}`}
                            >
                              <PrinterIcon />
                            </button>
                            <button 
                              onClick={() => onDeleteStudent(student.id)}
                              className="text-gray-400 hover:text-red-600 p-2 rounded-full transition-colors hover:bg-red-100"
                              aria-label={`Delete student ${student.name}`}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                           <UserGroupIcon large />
                            <p className="font-semibold text-lg">
                            {searchQuery
                                ? `ไม่พบผลการค้นหาสำหรับ "${searchQuery}"`
                                : 'ยังไม่มีข้อมูลนักเรียน'
                            }
                            </p>
                            {!searchQuery && (
                                <p>
                                    เริ่มต้นโดยการเพิ่มนักเรียนหรือนำเข้าจากไฟล์ CSV
                                </p>
                            )}
                        </div>
                    </td>
                </tr>
            )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentManagementPanel;
