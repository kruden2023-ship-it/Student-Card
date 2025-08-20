
export interface Student {
  id: string;
  studentId: string;
  name: string;
  class: string;
  homeroomTeacher: string;
  photoUrl: string;
}

export interface CardSettings {
  schoolName: string;
  logoUrl: string;
  signatureUrl: string;
  backgroundUrl: string;
  address: string;
  phone: string;
  website: string;
}

export type NewStudent = Omit<Student, 'id'>;