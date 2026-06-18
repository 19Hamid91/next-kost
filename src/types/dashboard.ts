import { Room, Rental, Tenant } from './index';

export interface RoomOccupancy {
  room: Room;
  activeRental: Rental | null;
  activeTenant: Tenant | null;
  nextRental: Rental | null;
  nextTenant: Tenant | null;
  upcomingCount: number;
  upcomingBookings: Array<{ rental: Rental; tenant: Tenant | null }>;
}
