'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { addMonths, isAfter, parseISO } from 'date-fns';

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

  const filteredRooms = allRooms.filter((r: any) => r.ID_Kost === kostId);
  const currentKost = kosts.find((k: any) => k.ID_Kost === kostId);

  let occupiedCount = 0;
  let overdueCount = 0;

  filteredRooms.forEach((room: any) => {
    const rental = allRentals.find((rent: any) => rent.ID_Kamar === room.ID_Kamar && rent.Status_Aktif === 'TRUE');
    if (rental) {
      occupiedCount++;
      if (rental.Tgl_Masuk) {
        const tglMasuk = parseISO(rental.Tgl_Masuk);
        const periode = parseInt(rental.Periode_Sewa) || 1;
        if (isAfter(new Date(), addMonths(tglMasuk, periode))) {
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
    closeSheet
  };
}
