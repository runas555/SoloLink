export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  business_name: string;
  timezone: string;
  created_at?: string;
}

export interface Service {
  id: string;
  user_id: string;
  name: string;
  duration_minutes: number;
  price: number;
  description: string;
  created_at?: string;
}

export interface Schedule {
  id: string;
  user_id: string;
  day_of_week: number; // 0 = Воскресенье, 1 = Понедельник ... 6 = Суббота
  start_time: string;  // "HH:MM"
  end_time: string;    // "HH:MM"
  is_active: number;   // 1 или 0
}

export interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  start_time: string;  // ISO UTC
  end_time: string;    // ISO UTC
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at?: string;
}