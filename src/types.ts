export type UserRole = 'patient' | 'pharmacist';

export interface UserProfile {
  uid: string;
  name: string;
  role: UserRole;
  pharmacyName?: string;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'delivering' | 'completed';

export interface Order {
  id: string;
  patientId: string;
  patientName: string;
  medicineName?: string;
  prescriptionImage?: string; // base64 for simplicity in prototype
  address: string;
  phone: string;
  status: OrderStatus;
  pharmacistId?: string;
  createdAt: string;
  updatedAt: string;
}
