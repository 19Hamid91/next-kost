'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { isAfter, parseISO } from 'date-fns';
import { calculateDueDate, parseDurasiUnit, resolveStatusSewa } from '@/lib/dateUtils';
import { fetcher } from '@/lib/fetcher';
import { Kost, Room, Tenant, Rental, ApiResponse } from '@/types';
import { RoomOccupancy } from '@/types/dashboard';

export type { RoomOccupancy };

export function useDashboard(kostId: string) {
  const { data: kostsData } = useSWR<ApiResponse<Kost[]>>('/api/data/Master_Kost', fetcher);
  const { data: roomsData } = useSWR<ApiResponse<Room[]>>('/api/data/Master_Kamar', fetcher);
  const { data: tenantsData } = useSWR<ApiResponse<Tenant[]>>('/api/data/Master_Penghuni', fetcher);
  const { data: rentalsData } = useSWR<ApiResponse<Rental[]>>('/api/data/Transaksi_Sewa', fetcher);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [selectedOccupancy, setSelectedOccupancy] = useState<RoomOccupancy | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const isLoading = !kostsData || !roomsData || !tenantsData || !rentalsData;

  const kosts = kostsData?.data || [];
  const allRooms = roomsData?.data || [];
  const allTenants = tenantsData?.data || [];
  const allRentals = rentalsData?.data || [];

  const filteredRooms = allRooms.filter((room) => room.ID_Kost === kostId);
  const currentKost = kosts.find((kost) => kost.ID_Kost === kostId);

  const today = new Date();

  const roomsWithOccupancy: RoomOccupancy[] = filteredRooms.map((room) => {
    const roomRentals = allRentals.filter((rental) => rental.ID_Kamar === room.ID_Kamar);

    const aktifRental = roomRentals.find((rental) => resolveStatusSewa(rental) === 'AKTIF') ?? null;

    const earliestBooking = aktifRental
      ? null
      : [...roomRentals]
          .filter((rental) => resolveStatusSewa(rental) === 'BOOKING' && rental.Tgl_Masuk)
          .sort((rentalA, rentalB) => parseISO(rentalA.Tgl_Masuk).getTime() - parseISO(rentalB.Tgl_Masuk).getTime())[0] ?? null;

    const activeRental = aktifRental ?? earliestBooking;

    const upcomingRentals = roomRentals.filter((rental) => {
      if (resolveStatusSewa(rental) !== 'BOOKING') return false;
      if (!rental.Tgl_Masuk) return false;
      if (activeRental && rental.ID_Sewa === activeRental.ID_Sewa) return false;
      return parseISO(rental.Tgl_Masuk) > today;
    });

    const nextRental = upcomingRentals.length > 0
      ? upcomingRentals.sort((rentalA, rentalB) =>
          parseISO(rentalA.Tgl_Masuk).getTime() - parseISO(rentalB.Tgl_Masuk).getTime()
        )[0]
      : null;

    const activeTenant = activeRental
      ? allTenants.find((tenant) => tenant.ID_Penghuni === activeRental.ID_Penghuni) ?? null
      : null;

    const nextTenant = nextRental
      ? allTenants.find((tenant) => tenant.ID_Penghuni === nextRental.ID_Penghuni) ?? null
      : null;

    const sortedUpcomingRentals = [...upcomingRentals].sort((rentalA, rentalB) =>
      parseISO(rentalA.Tgl_Masuk).getTime() - parseISO(rentalB.Tgl_Masuk).getTime()
    );

    const upcomingBookings = sortedUpcomingRentals.map((rental) => {
      const tenant = allTenants.find((t) => t.ID_Penghuni === rental.ID_Penghuni) ?? null;
      return { rental, tenant };
    });

    return { room, activeRental, activeTenant, nextRental, nextTenant, upcomingCount: upcomingRentals.length, upcomingBookings };
  });

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

  const handleRoomClick = (room: Room, tenant?: Tenant | null, rental?: Rental | null) => {
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
