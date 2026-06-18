'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { isAfter, parseISO } from 'date-fns';
import { calculateDueDate, parseDurasiUnit, resolveStatusSewa } from '@/lib/dateUtils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface RoomOccupancy {
  room: any;
  activeRental: any | null;
  activeTenant: any | null;
  nextRental: any | null;     // soonest future BOOKING
  nextTenant: any | null;
  upcomingCount: number;      // total future BOOKINGs beyond activeRental (drives stack depth)
  upcomingBookings: Array<{ rental: any; tenant: any }>;
}

export function useDashboard(kostId: string) {
  const { data: kostsData } = useSWR('/api/data/Master_Kost', fetcher);
  const { data: roomsData } = useSWR('/api/data/Master_Kamar', fetcher);
  const { data: tenantsData } = useSWR('/api/data/Master_Penghuni', fetcher);
  const { data: rentalsData } = useSWR('/api/data/Transaksi_Sewa', fetcher);

  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [selectedOccupancy, setSelectedOccupancy] = useState<RoomOccupancy | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const isLoading = !kostsData || !roomsData || !tenantsData || !rentalsData;

  const kosts = kostsData?.data || [];
  const allRooms = roomsData?.data || [];
  const allTenants = tenantsData?.data || [];
  const allRentals = rentalsData?.data || [];

  const filteredRooms = allRooms.filter((room: any) => room.ID_Kost === kostId);
  const currentKost = kosts.find((kost: any) => kost.ID_Kost === kostId);

  const today = new Date();

  // Single-pass: enrich each room with its current + next rental
  const roomsWithOccupancy: RoomOccupancy[] = filteredRooms.map((room: any) => {
    const roomRentals = allRentals.filter((rental: any) => rental.ID_Kamar === room.ID_Kamar);

    // Priority 1: find AKTIF rental (currently ongoing)
    const aktifRental = roomRentals.find((rental: any) => resolveStatusSewa(rental) === 'AKTIF') ?? null;

    // Priority 2: if no AKTIF, show the soonest BOOKING as the primary card state (amber)
    const earliestBooking = aktifRental
      ? null
      : [...roomRentals]
          .filter((rental: any) => resolveStatusSewa(rental) === 'BOOKING' && rental.Tgl_Masuk)
          .sort((rentalA: any, rentalB: any) => parseISO(rentalA.Tgl_Masuk).getTime() - parseISO(rentalB.Tgl_Masuk).getTime())[0] ?? null;

    const activeRental = aktifRental ?? earliestBooking;

    // Next upcoming: BOOKING with Tgl_Masuk > today, skipping whichever one is already shown as activeRental
    const upcomingRentals = roomRentals.filter((rental: any) => {
      if (resolveStatusSewa(rental) !== 'BOOKING') return false;
      if (!rental.Tgl_Masuk) return false;
      if (activeRental && rental.ID_Sewa === activeRental.ID_Sewa) return false; // already the primary card
      return parseISO(rental.Tgl_Masuk) > today;
    });

    // Pick the soonest upcoming rental
    const nextRental = upcomingRentals.length > 0
      ? upcomingRentals.sort((rentalA: any, rentalB: any) =>
          parseISO(rentalA.Tgl_Masuk).getTime() - parseISO(rentalB.Tgl_Masuk).getTime()
        )[0]
      : null;

    const activeTenant = activeRental
      ? allTenants.find((tenant: any) => tenant.ID_Penghuni === activeRental.ID_Penghuni) ?? null
      : null;

    const nextTenant = nextRental
      ? allTenants.find((tenant: any) => tenant.ID_Penghuni === nextRental.ID_Penghuni) ?? null
      : null;

    const sortedUpcomingRentals = [...upcomingRentals].sort((rentalA: any, rentalB: any) =>
      parseISO(rentalA.Tgl_Masuk).getTime() - parseISO(rentalB.Tgl_Masuk).getTime()
    );

    const upcomingBookings = sortedUpcomingRentals.map((rental: any) => {
      const tenant = allTenants.find((t: any) => t.ID_Penghuni === rental.ID_Penghuni) ?? null;
      return { rental, tenant };
    });

    return { room, activeRental, activeTenant, nextRental, nextTenant, upcomingCount: upcomingRentals.length, upcomingBookings };
  });

  // Stats derived from roomsWithOccupancy
  let occupiedCount = 0;
  let overdueCount = 0;
  let bookingCount = 0;

  roomsWithOccupancy.forEach(({ activeRental }) => {
    if (!activeRental) return;

    const status = resolveStatusSewa(activeRental);

    if (status === 'BOOKING') {
      bookingCount++;
      occupiedCount++;
      return;
    }

    if (status === 'AKTIF') {
      occupiedCount++;
      if (activeRental.Tgl_Masuk) {
        const tglMasuk = parseISO(activeRental.Tgl_Masuk);
        const periode = parseInt(activeRental.Periode_Sewa) || 1;
        const unit = parseDurasiUnit(activeRental.Unit_Durasi);
        const dueDate = calculateDueDate(tglMasuk, periode, unit);
        if (isAfter(today, dueDate)) {
          overdueCount++;
        }
      }
    }
  });

  const stats = {
    totalRooms: filteredRooms.length,
    occupied: occupiedCount,
    vacant: filteredRooms.length - occupiedCount,
    overdue: overdueCount,
    booking: bookingCount,
  };

  const handleRoomClick = (room: any, tenant?: any, rental?: any) => {
    const occupancy = roomsWithOccupancy.find(o => o.room.ID_Kamar === room.ID_Kamar) ?? null;
    setSelectedOccupancy(occupancy);
    setSelectedRoom(room);
    setSelectedTenant(tenant || null);
    setSelectedRental(rental || null);
    setIsSheetOpen(true);
  };

  const closeSheet = () => setIsSheetOpen(false);

  return {
    isLoading,
    stats,
    currentKost,
    filteredRooms,
    roomsWithOccupancy,
    allTenants,
    allRentals,
    selectedRoom,
    selectedTenant,
    selectedRental,
    selectedOccupancy,
    isSheetOpen,
    handleRoomClick,
    closeSheet,
  };
}
