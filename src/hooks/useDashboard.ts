'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { isAfter, parseISO } from 'date-fns';
import { calculateDueDate, parseDurasiUnit, resolveStatusSewa } from '@/lib/dateUtils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useDashboard(kostId: string) {
  const { data: kostsData } = useSWR('/api/data/Master_Kost', fetcher);
  const { data: roomsData } = useSWR('/api/data/Master_Kamar', fetcher);
  const { data: tenantsData } = useSWR('/api/data/Master_Penghuni', fetcher);
  const { data: rentalsData } = useSWR('/api/data/Transaksi_Sewa', fetcher);

  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const isLoading = !kostsData || !roomsData || !tenantsData || !rentalsData;

  const kosts = kostsData?.data || [];
  const allRooms = roomsData?.data || [];
  const allTenants = tenantsData?.data || [];
  const allRentals = rentalsData?.data || [];

  const filteredRooms = allRooms.filter((room: any) => room.ID_Kost === kostId);
  const currentKost = kosts.find((kost: any) => kost.ID_Kost === kostId);

  // Count stats using Status_Sewa (with legacy fallback via resolveStatusSewa)
  let occupiedCount = 0;
  let overdueCount = 0;
  let bookingCount = 0;

  filteredRooms.forEach((room: any) => {
    const activeRental = allRentals.find((rental: any) => {
      const status = resolveStatusSewa(rental);
      return rental.ID_Kamar === room.ID_Kamar && (status === 'AKTIF' || status === 'BOOKING');
    });

    if (!activeRental) return;

    const status = resolveStatusSewa(activeRental);

    if (status === 'BOOKING') {
      bookingCount++;
      occupiedCount++; // bookings count as occupied
      return;
    }

    if (status === 'AKTIF') {
      occupiedCount++;
      if (activeRental.Tgl_Masuk) {
        const tglMasuk = parseISO(activeRental.Tgl_Masuk);
        const periode = parseInt(activeRental.Periode_Sewa) || 1;
        const unit = parseDurasiUnit(activeRental.Unit_Durasi);
        const dueDate = calculateDueDate(tglMasuk, periode, unit);
        if (isAfter(new Date(), dueDate)) {
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
    allTenants,
    allRentals,
    selectedRoom,
    selectedTenant,
    selectedRental,
    isSheetOpen,
    handleRoomClick,
    closeSheet,
  };
}
