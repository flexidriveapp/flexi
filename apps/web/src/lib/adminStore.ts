'use client';
import { type FlexiUser, type Booking, type KYCData, getBookings } from './store';

// We use the primary store for current user state, but for admin, 
// we generate deterministic mock data combined with real localStorage data.

export interface AdminUser extends FlexiUser {
  status: 'active' | 'suspended';
  kycStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected';
}

const MOCK_USERS: AdminUser[] = [
  { id: 'U-1001', name: 'Arjun Kapoor', email: 'arjun.k@example.com', phone: '+91 9876543210', role: 'guest', createdAt: '2025-11-10T10:00:00Z', status: 'active', kycStatus: 'pending' },
  { id: 'U-1002', name: 'Priya Sharma', email: 'priya.s@example.com', phone: '+91 9123456789', role: 'guest', createdAt: '2025-12-05T14:30:00Z', status: 'active', kycStatus: 'verified' },
  { id: 'U-1003', name: 'Rohan Bhatia', email: 'rohan.b@example.com', phone: '+91 9988776655', role: 'host', createdAt: '2026-01-20T09:15:00Z', status: 'active', kycStatus: 'verified' },
  { id: 'U-1004', name: 'Sneha Reddy', email: 'sneha.r@example.com', phone: '+91 9876501234', role: 'guest', createdAt: '2026-03-12T16:45:00Z', status: 'suspended', kycStatus: 'rejected' },
  { id: 'U-1005', name: 'Vikram Patel', email: 'vikram.p@example.com', phone: '+91 9001122334', role: 'guest', createdAt: '2026-05-01T11:20:00Z', status: 'active', kycStatus: 'pending' },
];

export function getAllUsers(): AdminUser[] {
  if (typeof window === 'undefined') return MOCK_USERS;
  
  // Combine mock users with real registered users if we had them.
  // For demo, we just return mock users + the current logged in user.
  const users = [...MOCK_USERS];
  const currentUserStr = localStorage.getItem('flexi_user');
  if (currentUserStr) {
    try {
      const u = JSON.parse(currentUserStr) as FlexiUser;
      const kycStr = localStorage.getItem('flexi_kyc');
      const kyc = kycStr ? JSON.parse(kycStr) as KYCData : { status: 'not_submitted' };
      if (!users.find(x => x.email === u.email)) {
        users.unshift({
          ...u,
          status: 'active',
          kycStatus: kyc.status as any,
          createdAt: new Date().toISOString()
        });
      }
    } catch {}
  }
  return users;
}

export function updateUserKYC(userId: string, newStatus: 'verified' | 'rejected') {
  if (typeof window === 'undefined') return;
  // If it's the current user, update their actual store
  const currentUserStr = localStorage.getItem('flexi_user');
  if (currentUserStr) {
    const u = JSON.parse(currentUserStr);
    if (u.id === userId || u.email === userId) {
      const kycStr = localStorage.getItem('flexi_kyc');
      if (kycStr) {
        const kyc = JSON.parse(kycStr);
        kyc.status = newStatus;
        kyc.verifiedAt = new Date().toISOString();
        localStorage.setItem('flexi_kyc', JSON.stringify(kyc));
      }
    }
  }
  
  // Also persist an admin override in localStorage for the mock users
  const overrides = JSON.parse(localStorage.getItem('flexi_admin_kyc_overrides') || '{}');
  overrides[userId] = newStatus;
  localStorage.setItem('flexi_admin_kyc_overrides', JSON.stringify(overrides));
}

export function getPendingKYC() {
  const users = getAllUsers();
  const overrides = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('flexi_admin_kyc_overrides') || '{}') : {};
  
  return users.filter(u => {
    const status = overrides[u.id] || overrides[u.email] || u.kycStatus;
    return status === 'pending';
  }).map(u => ({
    userId: u.id || u.email,
    name: u.name,
    email: u.email,
    submittedAt: u.createdAt, // mock date
  }));
}

export function getAllBookings(): Booking[] {
  // Get real bookings
  const realBookings = getBookings();
  
  // Return real ones + some static mock ones for the dashboard to look populated
  const mockBookings: Booking[] = [
    {
      id: 'B-MOCK-1',
      carId: '2',
      car: { make: 'Mahindra', model: 'Thar', year: 2023, img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', city: 'Goa', host: 'Rohan B.', fuel: 'Diesel', transmission: 'Manual', seats: 4 },
      startDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      startTime: '10:00 AM', endTime: '10:00 AM', days: 4, plan: 'standard',
      pricing: { dailyRate: 3500, tripCost: 14000, platformFee: 1400, protectionCost: 800, total: 16200 },
      status: 'active', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), confirmationCode: 'CONF-THAR-123'
    },
    {
      id: 'B-MOCK-2',
      carId: '4',
      car: { make: 'Maruti', model: 'Brezza', year: 2023, img: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80', city: 'Mumbai', host: 'Sneha R.', fuel: 'Petrol', transmission: 'Automatic', seats: 5 },
      startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 8).toISOString(),
      startTime: '09:00 AM', endTime: '09:00 AM', days: 3, plan: 'basic',
      pricing: { dailyRate: 2000, tripCost: 6000, platformFee: 600, protectionCost: 0, total: 6600 },
      status: 'confirmed', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), confirmationCode: 'CONF-BRZ-456'
    }
  ];
  
  return [...realBookings, ...mockBookings];
}

// ---- Vehicles Mock ----
export interface AdminVehicle {
  id: string;
  make: string;
  model: string;
  fuelType?: string;
  transmission?: string;
  carType?: string;
  host: string;
  hostEmail: string;
  city: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

const MOCK_VEHICLES: AdminVehicle[] = [
  { id: 'V-101', make: 'Kia', model: 'Carens', fuelType: 'Diesel', transmission: 'Automatic', carType: 'SUV', host: 'Rohan B.', hostEmail: 'rohan.b@example.com', city: 'Pune', status: 'pending', submittedAt: new Date(Date.now() - 86400000 * 0.2).toISOString() },
  { id: 'V-102', make: 'Skoda', model: 'Octavia', fuelType: 'Petrol', transmission: 'Automatic', carType: 'Sedan', host: 'Arjun K.', hostEmail: 'arjun.k@example.com', city: 'Mumbai', status: 'pending', submittedAt: new Date(Date.now() - 86400000 * 0.5).toISOString() },
  { id: 'V-103', make: 'Hyundai', model: 'Creta', fuelType: 'Petrol', transmission: 'Manual', carType: 'SUV', host: 'Rahul S.', hostEmail: 'rahul.s@example.com', city: 'Mumbai', status: 'approved', submittedAt: new Date(Date.now() - 86400000 * 10).toISOString() },
];

export function getAllVehicles(): AdminVehicle[] {
  if (typeof window === 'undefined') return MOCK_VEHICLES;
  const overrides = JSON.parse(localStorage.getItem('flexi_admin_vehicle_overrides') || '{}');
  const added = JSON.parse(localStorage.getItem('flexi_admin_added_vehicles') || '[]');
  
  const allVehicles = [...MOCK_VEHICLES, ...added];
  
  return allVehicles.map(v => ({
    ...v,
    status: overrides[v.id] || v.status
  }));
}

export function addNewAdminVehicle(vehicle: Omit<AdminVehicle, 'id' | 'submittedAt' | 'status'>) {
  if (typeof window === 'undefined') return;
  const added = JSON.parse(localStorage.getItem('flexi_admin_added_vehicles') || '[]');
  const newVehicle: AdminVehicle = {
    ...vehicle,
    id: `V-${1000 + Math.floor(Math.random() * 9000)}`,
    status: 'approved', // Admin adds are automatically approved
    submittedAt: new Date().toISOString()
  };
  added.push(newVehicle);
  localStorage.setItem('flexi_admin_added_vehicles', JSON.stringify(added));
}

export function updateVehicleStatus(vehicleId: string, newStatus: 'approved' | 'rejected') {
  if (typeof window === 'undefined') return;
  const overrides = JSON.parse(localStorage.getItem('flexi_admin_vehicle_overrides') || '{}');
  overrides[vehicleId] = newStatus;
  localStorage.setItem('flexi_admin_vehicle_overrides', JSON.stringify(overrides));
}

// ---- Categories Mock ----
export interface VehicleCategories {
  makes: string[];
  models: string[];
  fuelTypes: string[];
  transmissions: string[];
  carTypes: string[];
}

const DEFAULT_CATEGORIES: VehicleCategories = {
  makes: ['Toyota', 'Honda', 'Hyundai', 'Kia', 'Skoda', 'Volkswagen', 'Tata', 'Mahindra'],
  models: ['Innova', 'Fortuner', 'City', 'Civic', 'Creta', 'i20', 'Carens', 'Seltos', 'Octavia', 'Slavia', 'Polo', 'Virtus', 'Nexon', 'Harrier', 'XUV700', 'Thar'],
  fuelTypes: ['Petrol', 'Diesel', 'CNG', 'EV', 'Hybrid'],
  transmissions: ['Automatic', 'Manual'],
  carTypes: ['Hatchback', 'Sedan', 'SUV', 'MUV', 'Luxury'],
};

export function getCategories(): VehicleCategories {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  const stored = localStorage.getItem('flexi_admin_categories');
  if (stored) return JSON.parse(stored);
  return DEFAULT_CATEGORIES;
}

export function saveCategories(categories: VehicleCategories) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('flexi_admin_categories', JSON.stringify(categories));
}

// ---- Cities Mock ----
export interface AdminCity {
  id: string;
  name: string;
  image: string;
  isActive: boolean;
}

const DEFAULT_CITIES: AdminCity[] = [
  { id: 'C-01', name: 'Mumbai, MH', image: 'https://images.unsplash.com/photo-1522206090680-d668fcbf05c6?auto=format&fit=crop&w=400&q=80', isActive: true },
  { id: 'C-02', name: 'Bangalore, KA', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80', isActive: true },
  { id: 'C-03', name: 'Delhi, DL', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80', isActive: true },
  { id: 'C-04', name: 'Pune, MH', image: 'https://images.unsplash.com/photo-1571508602263-ce582236d80d?auto=format&fit=crop&w=400&q=80', isActive: true },
  { id: 'C-05', name: 'Hyderabad, TS', image: 'https://images.unsplash.com/photo-1587621415412-f0490710606e?auto=format&fit=crop&w=400&q=80', isActive: false },
];

export function getAllCities(): AdminCity[] {
  if (typeof window === 'undefined') return DEFAULT_CITIES;
  const overrides = JSON.parse(localStorage.getItem('flexi_admin_cities_overrides') || '{}');
  const added = JSON.parse(localStorage.getItem('flexi_admin_added_cities') || '[]');
  
  const allCities = [...DEFAULT_CITIES, ...added];
  
  return allCities.map(c => ({
    ...c,
    isActive: overrides[c.id] !== undefined ? overrides[c.id] : c.isActive
  }));
}

export function addNewAdminCity(city: Omit<AdminCity, 'id' | 'isActive'>) {
  if (typeof window === 'undefined') return;
  const added = JSON.parse(localStorage.getItem('flexi_admin_added_cities') || '[]');
  const newCity: AdminCity = {
    ...city,
    id: `C-${100 + Math.floor(Math.random() * 900)}`,
    isActive: true
  };
  added.push(newCity);
  localStorage.setItem('flexi_admin_added_cities', JSON.stringify(added));
}

export function toggleCityStatus(cityId: string, isActive: boolean) {
  if (typeof window === 'undefined') return;
  const overrides = JSON.parse(localStorage.getItem('flexi_admin_cities_overrides') || '{}');
  overrides[cityId] = isActive;
  localStorage.setItem('flexi_admin_cities_overrides', JSON.stringify(overrides));
}
