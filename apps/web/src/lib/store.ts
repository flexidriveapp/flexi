'use client';

// ===========================================================
// Flexi Demo Data Store
// Typed localStorage utilities for users, KYC, and bookings.
// ===========================================================

// ---- Types ----

export interface FlexiUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'guest' | 'host' | 'admin';
  createdAt?: string;
}

export type KYCStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected';

export interface KYCData {
  status: KYCStatus;
  uploads: {
    dl_front: string;
    dl_back: string;
    id_proof: string;
    selfie: string;
  };
  submittedAt: string | null;
  verifiedAt: string | null;
}

export interface Booking {
  id: string;
  carId: string;
  car: {
    make: string;
    model: string;
    year: number;
    img: string;
    city: string;
    host: string;
    fuel: string;
    transmission: string;
    seats: number;
  };
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  days: number;
  plan: 'basic' | 'standard' | 'premium';
  pricing: {
    dailyRate: number;
    tripCost: number;
    platformFee: number;
    protectionCost: number;
    total: number;
  };
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  confirmationCode: string;
}

// ---- Keys ----

const KEYS = {
  USER: 'flexi_user',
  TOKEN: 'flexi_access_token',
  REGISTERED: 'flexi_registered_users',
  KYC: 'flexi_kyc',
  BOOKINGS: 'flexi_bookings',
} as const;

// ---- Helpers ----

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ---- User ----

export function getUser(): FlexiUser | null {
  return read<FlexiUser | null>(KEYS.USER, null);
}

export function setUser(user: FlexiUser): void {
  write(KEYS.USER, user);
}

export function clearUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.USER);
  localStorage.removeItem(KEYS.TOKEN);
}

export function isLoggedIn(): boolean {
  return !!getUser();
}

// ---- KYC ----

const DEFAULT_KYC: KYCData = {
  status: 'not_submitted',
  uploads: { dl_front: '', dl_back: '', id_proof: '', selfie: '' },
  submittedAt: null,
  verifiedAt: null,
};

export function getKYC(): KYCData {
  return read<KYCData>(KEYS.KYC, DEFAULT_KYC);
}

export function setKYC(data: KYCData): void {
  write(KEYS.KYC, data);
}

export function resetKYC(): void {
  write(KEYS.KYC, DEFAULT_KYC);
}

// ---- Bookings ----

export function getBookings(): Booking[] {
  return read<Booking[]>(KEYS.BOOKINGS, []);
}

export function addBooking(booking: Booking): void {
  const bookings = getBookings();
  bookings.unshift(booking); // newest first
  write(KEYS.BOOKINGS, bookings);
}

export function updateBooking(id: string, updates: Partial<Booking>): void {
  const bookings = getBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx !== -1) {
    bookings[idx] = { ...bookings[idx], ...updates };
    write(KEYS.BOOKINGS, bookings);
  }
}

export function getBookingById(id: string): Booking | null {
  return getBookings().find(b => b.id === id) || null;
}

// ---- Utility ----

export function generateId(): string {
  return 'FLX-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function generateConfirmationCode(): string {
  return 'CONF-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();
}
