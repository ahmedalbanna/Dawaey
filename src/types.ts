export type UserRole = 'patient' | 'pharmacist';

export interface UserProfile {
  uid: string;
  name: string;
  role: UserRole;
  pharmacyName?: string;
  createdAt: string;
  addresses?: string[];
  location?: string;
  workingHours?: string;
  ratingSum?: number;
  ratingCount?: number;
}

export type OrderStatus = 'pending' | 'delivering' | 'completed';

export interface ChatMessage {
  senderId: string;
  text: string;
  timestamp: string;
}

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
  isReviewed?: boolean;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}

export interface Review {
  id: string;
  orderId: string;
  pharmacistId: string;
  patientId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}
