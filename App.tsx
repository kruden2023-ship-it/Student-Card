
import React, { useState, useCallback, useMemo } from 'react';
import { Student, CardSettings, NewStudent } from './types';
import SettingsPanel from './components/SettingsPanel';
import StudentManagementPanel from './components/StudentManagementPanel';
import StudentIdCard from './components/StudentIdCard';
import StudentFormModal from './components/StudentFormModal';
import ConfirmationModal from './components/ConfirmationModal';
import { generatePdf } from './services/pdfGenerator';
import { parseCsv } from './services/csvParser';
import { DownloadIcon, UserGroupIcon, IdCardIcon, CogIcon } from './components/Icons';
import { useNotification } from './contexts/NotificationContext';

const DEFAULT_BG = 'https://images.pexels.com/photos/7130473/pexels-photo-7130473.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
const FALLBACK_LOGO_URL = `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-full h-full text-gray-400'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z' /%3e%3c/svg%3e`;


type ActiveTab = 'manage' | 'preview' | 'settings';

interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  notificationCount?: number;
}

const TabButton: React.FC<TabButtonProps> = ({ label, icon, isActive, onClick, notificationCount = 0 }) => (
    <button
        onClick={onClick}
        className={`relative flex items-center gap-2 px-4 md:px-6 py-2.5 font-semibold text-base transition-colors duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isActive
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700'
        }`}
    >
        {icon}
        <span className="hidden md:inline">{label}</span>
        {notificationCount > 0 && (
             <span className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white">
                {notificationCount}
            </span>
        )}
    </button>
);

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [cardSettings, setCardSettings] = useState<CardSettings>({
    schoolName: "โรงเรียนบ้านลำดวน สพป.บุรีรัมย์ เขต 2",
    logoUrl: "",
    signatureUrl: "",
    backgroundUrl: DEFAULT_BG,
    address: "โรงเรียนบ้านลำดวน หมู่ 11 ต.ลำดวน อ.กระสัง จ.บุรีรัมย์ 31160",
    phone: "093-1979539",
    website: ""
  });
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPreparingPdf, setIsPreparingPdf] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Student; direction: 'asc' | 'desc' } | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('manage');
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalContent, setConfirmModalContent] = useState({ title: '', message: '', onConfirm: () => {} });
  const { addNotification } = useNotification();
  
  const studentToPreview = selectedStudents.length > 0 ? selectedStudents[selectedStudents.length - 1] : (students.length > 0 ? students[0] : null);

  const displayedStudents = useMemo(() => {
    let sortableStudents = [...students];

    if (sortConfig !== null) {
      sortableStudents.sort((a, b) => {
        if (sortConfig.key === 'class') {
          const getClassSortValues = (classStr: string): [number, number, number] => {
            const s = classStr.trim();
            let level: number;

            if (s.includes('อนุบาล') || s.startsWith('อ.')) {
                level = 1;
            } else if (s.includes('ประถม') || s.startsWith('ป.')) {
                level = 2;
            } else if (s.includes('มัธยม') || s.startsWith('ม.')) {
                level = 3;
            } else {
                level = 99;
            }

            const numbers = s.match(/\d+/g)?.map(Number);
            const grade = numbers?.[0] || 0;
            const room = numbers?.[1] || 0;

            return [level, grade, room];
          };

          const [levelA, gradeA, roomA] = getClassSortValues(a.class);
          const [levelB, gradeB, roomB] = getClassSortValues(b.class);

          let comparison = 0;
          if (levelA !== levelB) {
            comparison = levelA - levelB;
          } else if (gradeA !== gradeB) {
            comparison = gradeA - gradeB;
          } else {
            comparison = roomA - roomB;
          }
          
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        }
        
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        const comparison = String(valA).localeCompare(String(valB), 'th');
        if (comparison !== 0) {
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        }
        return 0;
      });
    }

    if (!searchQuery) {
      return sortableStudents;
    }

    return sortableStudents.filter(student => {
      const query = searchQuery.toLowerCase();
      return (
        student.studentId.toLowerCase().includes(query) ||
        student.name.toLowerCase().includes(query) ||
        student.class.toLowerCase().includes(query)
      );
    });
  }, [students, searchQuery, sortConfig]);

  const handleSettingsChange = useCallback((newSettings: Partial<CardSettings>) => {
    setCardSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const handleToggleStudentSelection = useCallback((student: Student) => {
    setSelectedStudents(prevSelected => {
      const isSelected = prevSelected.some(s => s.id === student.id);
      if (isSelected) {
        return prevSelected.filter(s => s.id !== student.id);
      } else {
        return [...prevSelected, student];
      }
    });
  }, []);
  
  const handleSelectAll = useCallback((checked: boolean) => {
    const visibleStudentIds = new Set(displayedStudents.map(s => s.id));
    if (checked) {
        const newSelectedStudents = [...selectedStudents];
        const currentSelectedIds = new Set(selectedStudents.map(s => s.id));
        
        displayedStudents.forEach(student => {
            if (!currentSelectedIds.has(student.id)) {
                newSelectedStudents.push(student);
            }
        });
        setSelectedStudents(newSelectedStudents);
    } else {
        setSelectedStudents(prev => prev.filter(s => !visibleStudentIds.has(s.id)));
    }
  }, [selectedStudents, displayedStudents]);

  const handleSort = useCallback((key: keyof Student) => {
      let direction: 'asc' | 'desc' = 'asc';
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
          direction = 'desc';
      }
      setSortConfig({ key, direction });
  }, [sortConfig]);

  const handleOpenAddModal = useCallback(() => {
    setEditingStudent(null);
    setFormModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((student: Student) => {
    setEditingStudent(student);
    setFormModalOpen(true);
  }, []);
  
  const handleFormSubmit = useCallback((studentData: NewStudent | Student) => {
    setFormModalOpen(false);
    if ('id' in studentData && studentData.id) {
      const updatedStudent = studentData as Student;
      setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
      setSelectedStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
      addNotification(`อัปเดตข้อมูล '${updatedStudent.name}' สำเร็จ`, 'success');
    } else {
      const newStudent: Student = { ...studentData, id: crypto.randomUUID() };
      setStudents(prev => [...prev, newStudent]);
      setSelectedStudents([newStudent]);
      addNotification(`เพิ่มนักเรียน '${newStudent.name}' สำเร็จ`, 'success');
    }
    setEditingStudent(null);
  }, [addNotification]);

  const handleImportCsv = async (file: File) => {
    try {
        const rawData = await parseCsv<Record<string, string>>(file);
        
        const headerMapping: Record<string, keyof NewStudent> = {
            'รหัสนักเรียน': 'studentId', 'เลขประจำตัว': 'studentId', 'studentid': 'studentId',
            'ชื่อ-นามสกุล': 'name', 'ชื่อ-สกุล': 'name', 'ชื่อ': 'name', 'name': 'name',
            'ชั้นเรียน': 'class', 'ชั้น': 'class', 'ห้อง': 'class', 'class': 'class',
            'ครูประจำชั้น': 'homeroomTeacher', 'homeroomteacher': 'homeroomTeacher',
            'รูปภาพ': 'photoUrl', 'รูป': 'photoUrl', 'photourl': 'photoUrl'
        };

        let skippedCount = 0;

        const newStudents: Student[] = rawData.map((rawRow): Student | null => {
            const mappedStudent: Partial<NewStudent> = {};
            for (const rawHeader in rawRow) {
                // Normalize header for broader matching
                const lowerRawHeader = Object.keys(headerMapping).find(
                  key => key.toLowerCase() === rawHeader.trim().toLowerCase()
                );
                const mappedKey = lowerRawHeader ? headerMapping[lowerRawHeader] : undefined;

                if (mappedKey) {
                    mappedStudent[mappedKey] = rawRow[rawHeader];
                }
            }

            // Validate essential fields
            if (!mappedStudent.studentId || !mappedStudent.name) {
                skippedCount++;
                return null;
            }
            
            return {
                id: crypto.randomUUID(),
                studentId: mappedStudent.studentId.trim(),
                name: mappedStudent.name.trim(),
                class: mappedStudent.class?.trim() || '',
                homeroomTeacher: mappedStudent.homeroomTeacher?.trim() || '',
                photoUrl: mappedStudent.photoUrl?.trim() || '',
            };
        }).filter((s): s is Student => s !== null);

        if (newStudents.length > 0) {
            const allStudents = [...students, ...newStudents];
            setStudents(allStudents);
            if (selectedStudents.length === 0) {
                setSelectedStudents([newStudents[0]]);
            }
        }
        
        let notificationMessage: string;
        let notificationType: 'success' | 'info' | 'error' = 'info';

        if (newStudents.length > 0 && skippedCount === 0) {
            notificationMessage = `นำเข้าข้อมูลนักเรียน ${newStudents.length} คนสำเร็จ!`;
            notificationType = 'success';
        } else if (newStudents.length > 0 && skippedCount > 0) {
            notificationMessage = `นำเข้าสำเร็จ ${newStudents.length} คน (ข้าม ${skippedCount} แถวเนื่องจากข้อมูลไม่ครบถ้วน)`;
            notificationType = 'info';
        } else if (newStudents.length === 0 && skippedCount > 0) {
            notificationMessage = `ไม่สามารถนำเข้าข้อมูลได้ ${skippedCount} แถว เนื่องจากข้อมูลไม่ครบถ้วน`;
            notificationType = 'error';
        } else if (newStudents.length === 0 && rawData.length > 0) {
            notificationMessage = 'ไม่พบข้อมูลที่ถูกต้องในไฟล์ CSV กรุณาตรวจสอบหัวข้อคอลัมน์';
            notificationType = 'error';
        } else {
            notificationMessage = 'ไฟล์ CSV ว่างเปล่า ไม่มีข้อมูลให้นำเข้า';
            notificationType = 'info';
        }

        addNotification(notificationMessage, notificationType);

    } catch (error) {
        console.error("Error parsing CSV:", error);
        addNotification("เกิดข้อผิดพลาดในการอ่านไฟล์ CSV", 'error');
    }
  };
  
  const handleDeleteStudent = useCallback((studentId: string) => {
    const studentToDelete = students.find(s => s.id === studentId);
    if (!studentToDelete) return;

    setConfirmModalContent({
        title: 'ยืนยันการลบ',
        message: `คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ '${studentToDelete.name}'?`,
        onConfirm: () => {
            setStudents(prev => prev.filter(s => s.id !== studentId));
            setSelectedStudents(prev => prev.filter(s => s.id !== studentId));
            addNotification(`ลบนักเรียน '${studentToDelete.name}' สำเร็จ`, 'success');
            setConfirmModalOpen(false);
        }
    });
    setConfirmModalOpen(true);
  }, [students, addNotification]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedStudents.length === 0) {
      addNotification("กรุณาเลือกนักเรียนที่ต้องการลบ", 'error');
      return;
    }

    setConfirmModalContent({
        title: 'ยืนยันการลบ',
        message: `คุณแน่ใจหรือไม่ว่าต้องการลบนักเรียนที่เลือก ${selectedStudents.length} คน? การกระทำนี้ไม่สามารถย้อนกลับได้`,
        onConfirm: () => {
            const selectedIds = new Set(selectedStudents.map(s => s.id));
            setStudents(prev => prev.filter(s => !selectedIds.has(s.id)));
            setSelectedStudents([]);
            addNotification(`ลบนักเรียน ${selectedStudents.length} คนสำเร็จ`, 'success');
            setConfirmModalOpen(false);
        }
    });
    setConfirmModalOpen(true);
  }, [selectedStudents, addNotification]);

  const handlePrintStudent = useCallback(async (student: Student) => {
    const originalSelection = [...selectedStudents];
    setSelectedStudents([student]);
    
    addNotification(`กำลังเตรียมพิมพ์บัตรสำหรับ ${student.name}...`, 'info');
    setIsPreparingPdf(true);
    setIsGeneratingPdf(true);

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        const studentIds = [student.id];
        const fileName = `student-id-${student.studentId}.pdf`;
        await generatePdf(studentIds, fileName);
        addNotification(`สร้าง PDF สำหรับ ${student.name} สำเร็จ`, 'success');
    } catch (error) {
        console.error("PDF generation for single student failed:", error);
        addNotification(`เกิดข้อผิดพลาดในการพิมพ์บัตรสำหรับ ${student.name}`, 'error');
    } finally {
        setIsPreparingPdf(false);
        setIsGeneratingPdf(false);
        setSelectedStudents(originalSelection);
    }
  }, [selectedStudents, addNotification]);

  const handleExportPdf = useCallback(async () => {
    if (selectedStudents.length === 0) {
      addNotification("กรุณาเลือกนักเรียนอย่างน้อยหนึ่งคนเพื่อส่งออก PDF", 'error');
      return;
    }
    
    addNotification(`กำลังสร้าง PDF สำหรับ ${selectedStudents.length} คน...`, 'info');
    setIsPreparingPdf(true);
    setIsGeneratingPdf(true);

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        const studentIds = selectedStudents.map(s => s.id);
        const fileName = selectedStudents.length === 1 
            ? `student-id-${selectedStudents[0].studentId}.pdf` 
            : 'student-id-cards.pdf';
        await generatePdf(studentIds, fileName);
        addNotification(`สร้าง PDF สำหรับ ${selectedStudents.length} คนสำเร็จ`, 'success');
    } catch (error) {
        console.error("PDF generation failed:", error);
        addNotification("เกิดข้อผิดพลาดในการสร้างไฟล์ PDF", 'error');
    } finally {
        setIsPreparingPdf(false);
        setIsGeneratingPdf(false);
    }
  }, [selectedStudents, addNotification]);

  return (
    <div className="bg-slate-50 min-h-screen text-gray-800 flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg p-6 flex items-center gap-4">
        <img
          src={cardSettings.logoUrl || FALLBACK_LOGO_URL}
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK_LOGO_URL) {
              e.currentTarget.src = FALLBACK_LOGO_URL;
            }
          }}
          alt="School System Logo"
          className="object-contain flex-shrink-0 bg-white p-1 rounded-full"
          style={{ height: '70px', width: '70px' }}
        />
        <div className="text-left">
          <h1 className="text-3xl font-bold tracking-tight">ระบบจัดการบัตรนักเรียน</h1>
          <p className="text-base text-blue-100 mt-1">โรงเรียนบ้านลำดวน สำนักงานเขตพื้นที่การศึกษาประถมศึกษาบุรีรัมมย์ เขต 2</p>
        </div>
      </header>
      
      <main className="p-4 sm:p-6 lg:p-8 flex-grow w-full">
        <div className="max-w-7xl mx-auto">
            <div className="mb-8 p-2 bg-white/60 backdrop-blur-sm rounded-full shadow-md flex justify-center items-center gap-2 border border-gray-200">
                <TabButton
                    label="จัดการนักเรียน"
                    icon={<UserGroupIcon />}
                    isActive={activeTab === 'manage'}
                    onClick={() => setActiveTab('manage')}
                />
                <TabButton
                    label="ตัวอย่างบัตร"
                    icon={<IdCardIcon />}
                    isActive={activeTab === 'preview'}
                    onClick={() => setActiveTab('preview')}
                    notificationCount={selectedStudents.length}
                />
                <TabButton
                    label="ตั้งค่า"
                    icon={<CogIcon />}
                    isActive={activeTab === 'settings'}
                    onClick={() => setActiveTab('settings')}
                />
            </div>

            {activeTab === 'manage' && (
                <StudentManagementPanel 
                    students={displayedStudents} 
                    onToggleStudentSelection={handleToggleStudentSelection}
                    onSelectAll={handleSelectAll}
                    onAddStudentClick={handleOpenAddModal}
                    onImportCsv={handleImportCsv}
                    onDeleteStudent={handleDeleteStudent}
                    onEditStudent={handleOpenEditModal}
                    onPrintStudent={handlePrintStudent}
                    selectedStudentIds={selectedStudents.map(s => s.id)}
                    onPrintSelected={handleExportPdf}
                    onDeleteSelected={handleDeleteSelected}
                    isPrinting={isGeneratingPdf}
                    selectedStudentCount={selectedStudents.length}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                />
            )}

            {activeTab === 'preview' && (
                <div className="flex flex-col items-center animate-fade-in-right">
                    <h2 className="text-3xl font-bold mb-2 text-gray-700">ตัวอย่างบัตร</h2>
                    <p className="text-gray-600 mb-6 text-lg">
                        {studentToPreview ? `แสดงตัวอย่างสำหรับ: ${studentToPreview.name}` : 'ยังไม่มีนักเรียนให้แสดงตัวอย่าง'}
                    </p>
                    <div className="w-full max-w-4xl flex flex-col md:flex-row justify-center items-start gap-8">
                        <div className="w-full flex flex-col items-center">
                            <StudentIdCard elementId="card-front" student={studentToPreview} settings={cardSettings} side="front" />
                            <p className="mt-4 text-gray-600 font-semibold text-lg">ด้านหน้า</p>
                        </div>
                        <div className="w-full flex flex-col items-center">
                            <StudentIdCard elementId="card-back" student={studentToPreview} settings={cardSettings} side="back" />
                            <p className="mt-4 text-gray-600 font-semibold text-lg">ด้านหลัง</p>
                        </div>
                    </div>
                    <div className="mt-8">
                        <button
                            onClick={handleExportPdf}
                            disabled={selectedStudents.length === 0 || isGeneratingPdf}
                            className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                        >
                            <DownloadIcon />
                            <span>{isGeneratingPdf ? 'กำลังสร้าง PDF...' : `ส่งออก PDF (${selectedStudents.length} คน)`}</span>
                        </button>
                    </div>
                </div>
            )}
            
            {activeTab === 'settings' && (
                <div className="max-w-3xl mx-auto animate-fade-in-right">
                    <SettingsPanel settings={cardSettings} onSettingsChange={handleSettingsChange} />
                </div>
            )}
        </div>
      </main>

      <footer className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center py-4 shadow-inner mt-auto">
        <p>พัฒนาโดย : นายศิริชัย จันทะขาล</p>
        <p>ตำแหน่ง รองผู้อำนวยการสถานศึกษา โรงเรียนบ้านลำดวน สพป.บุรีรัมย์ เขต 2</p>
      </footer>

      {isFormModalOpen && (
        <StudentFormModal 
            isOpen={isFormModalOpen}
            onClose={() => setFormModalOpen(false)}
            onSubmit={handleFormSubmit}
            student={editingStudent}
        />
      )}

      {isConfirmModalOpen && (
        <ConfirmationModal 
            isOpen={isConfirmModalOpen}
            onClose={() => setConfirmModalOpen(false)}
            onConfirm={confirmModalContent.onConfirm}
            title={confirmModalContent.title}
            message={confirmModalContent.message}
        />
      )}

      {isPreparingPdf && (
        <div 
            id="pdf-render-container" 
            className="absolute -left-[9999px] -top-[9999px] space-y-4"
        >
            {selectedStudents.map(student => (
                <div key={student.id}>
                    <StudentIdCard 
                        elementId={`pdf-front-${student.id}`} 
                        student={student} 
                        settings={cardSettings} 
                        side="front" 
                    />
                    <StudentIdCard 
                        elementId={`pdf-back-${student.id}`} 
                        student={student} 
                        settings={cardSettings} 
                        side="back" 
                    />
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default App;
