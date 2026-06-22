'use client';
import { type Booking, type FlexiUser, getBookings } from './store';
import { getAllVehicles as getAdminVehicles } from './adminStore';

export interface HostDocument {
  type: 'RC' | 'Insurance' | 'PUC';
  url: string;
  verified: boolean;
}

export interface HostVehicle {
  id: string;
  make: string;
  model: string;
  img: string;
  isAvailable: boolean;
  documents: HostDocument[];
  tripsCompleted: number;
  earnings: number;
}

export interface HostTrip extends Omit<Booking, 'status'> {
  status: 'upcoming' | 'started' | 'completed' | 'cancelled' | 'active';
  startOTP: string;
  endOTP: string;
  damages?: string[];
  earnings: number;
}

// ---- Vehicles ----

const MOCK_HOST_VEHICLES: HostVehicle[] = [
  { id: 'V-H-01', make: 'Hyundai', model: 'Creta 2023', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80', isAvailable: true, documents: [{ type: 'RC', url: 'mock_rc.pdf', verified: true }], tripsCompleted: 47, earnings: 141000 },
  { id: 'V-H-02', make: 'Maruti', model: 'Brezza 2022', img: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=400&q=80', isAvailable: true, documents: [], tripsCompleted: 28, earnings: 55000 },
  { id: 'V-H-03', make: 'Tata', model: 'Nexon EV 2023', img: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?auto=format&fit=crop&w=400&q=80', isAvailable: false, documents: [{ type: 'Insurance', url: 'mock_ins.pdf', verified: false }], tripsCompleted: 12, earnings: 41000 },
];

export function getHostVehicles(): HostVehicle[] {
  if (typeof window === 'undefined') return MOCK_HOST_VEHICLES;
  const stored = JSON.parse(localStorage.getItem('flexi_host_vehicles') || 'null');
  if (stored) return stored;
  
  localStorage.setItem('flexi_host_vehicles', JSON.stringify(MOCK_HOST_VEHICLES));
  return MOCK_HOST_VEHICLES;
}

export function saveHostVehicles(vehicles: HostVehicle[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('flexi_host_vehicles', JSON.stringify(vehicles));
}

export function toggleVehicleAvailability(id: string, isAvailable: boolean) {
  const vehicles = getHostVehicles();
  const updated = vehicles.map(v => v.id === id ? { ...v, isAvailable } : v);
  saveHostVehicles(updated);
}

export function addVehicleDocument(id: string, doc: HostDocument) {
  const vehicles = getHostVehicles();
  const updated = vehicles.map(v => {
    if (v.id === id) {
      const existing = v.documents.filter(d => d.type !== doc.type);
      return { ...v, documents: [...existing, doc] };
    }
    return v;
  });
  saveHostVehicles(updated);
}

// ---- Trips ----

const MOCK_HOST_TRIPS: HostTrip[] = [
  {
    id: 'T-UP-1',
    carId: 'V-H-01',
    car: { make: 'Hyundai', model: 'Creta 2023', year: 2023, img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80', city: 'Mumbai', host: 'You', fuel: 'Petrol', transmission: 'Automatic', seats: 5 },
    startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    startTime: '10:00 AM', endTime: '10:00 AM', days: 2, plan: 'standard',
    pricing: { dailyRate: 3000, tripCost: 6000, platformFee: 600, protectionCost: 0, total: 6600 },
    status: 'upcoming', createdAt: new Date().toISOString(), confirmationCode: 'CONF-UP-1',
    startOTP: '1234', endOTP: '5678', earnings: 5400, damages: []
  },
  {
    id: 'T-ACT-1',
    carId: 'V-H-02',
    car: { make: 'Maruti', model: 'Brezza 2022', year: 2022, img: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=400&q=80', city: 'Mumbai', host: 'You', fuel: 'Petrol', transmission: 'Automatic', seats: 5 },
    startDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 1).toISOString(),
    startTime: '09:00 AM', endTime: '09:00 AM', days: 2, plan: 'basic',
    pricing: { dailyRate: 2000, tripCost: 4000, platformFee: 400, protectionCost: 0, total: 4400 },
    status: 'started', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), confirmationCode: 'CONF-ACT-1',
    startOTP: '1111', endOTP: '2222', earnings: 3600, damages: []
  },
  {
    id: 'T-PAST-1',
    carId: 'V-H-01',
    car: { make: 'Hyundai', model: 'Creta 2023', year: 2023, img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80', city: 'Mumbai', host: 'You', fuel: 'Petrol', transmission: 'Automatic', seats: 5 },
    startDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    endDate: new Date(Date.now() - 86400000 * 8).toISOString(),
    startTime: '11:00 AM', endTime: '11:00 AM', days: 2, plan: 'standard',
    pricing: { dailyRate: 3000, tripCost: 6000, platformFee: 600, protectionCost: 0, total: 6600 },
    status: 'completed', createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), confirmationCode: 'CONF-PAST-1',
    startOTP: '0000', endOTP: '9999', earnings: 5400, damages: ['Minor scratch on front bumper']
  }
];

export function getHostTrips(): HostTrip[] {
  if (typeof window === 'undefined') return MOCK_HOST_TRIPS;
  const stored = JSON.parse(localStorage.getItem('flexi_host_trips') || 'null');
  if (stored) return stored;
  
  localStorage.setItem('flexi_host_trips', JSON.stringify(MOCK_HOST_TRIPS));
  return MOCK_HOST_TRIPS;
}

export function saveHostTrips(trips: HostTrip[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('flexi_host_trips', JSON.stringify(trips));
}

export function startTrip(tripId: string, inputOTP: string): { success: boolean, message: string } {
  const trips = getHostTrips();
  const trip = trips.find(t => t.id === tripId);
  if (!trip) return { success: false, message: 'Trip not found' };
  
  if (trip.startOTP !== inputOTP) {
    return { success: false, message: 'Invalid Start OTP' };
  }
  
  const updated = trips.map(t => t.id === tripId ? { ...t, status: 'started' as const } : t);
  saveHostTrips(updated);
  return { success: true, message: 'Trip started successfully' };
}

export function endTrip(tripId: string, inputOTP: string, damages: string[]): { success: boolean, message: string } {
  const trips = getHostTrips();
  const trip = trips.find(t => t.id === tripId);
  if (!trip) return { success: false, message: 'Trip not found' };
  
  if (trip.endOTP !== inputOTP) {
    return { success: false, message: 'Invalid End OTP' };
  }
  
  const updated = trips.map(t => t.id === tripId ? { ...t, status: 'completed' as const, damages } : t);
  saveHostTrips(updated);
  return { success: true, message: 'Trip ended successfully' };
}

// ---- Earnings Analytics ----
export function getEarningsMetrics() {
  const trips = getHostTrips().filter(t => t.status === 'completed');
  
  const lifetime = trips.reduce((sum, t) => sum + t.earnings, 0) + 237000; // Add baseline mock data
  const monthly = trips.filter(t => new Date(t.endDate).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + t.earnings, 0) + 27800;
  const weekly = trips.filter(t => new Date(t.endDate).getTime() > Date.now() - 86400000 * 7).reduce((sum, t) => sum + t.earnings, 0) + 5400;

  return { lifetime, monthly, weekly };
}
