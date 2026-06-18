export interface FinanceSummary {
  totalRentIncome: number;
  totalDpReceived: number;
  totalDpForfeited: number;
  totalExpenses: number;
  totalDepositRefunded: number;
  netCashflow: number;
  month: number;
  year: number;
}

export interface DepositReminder {
  bookingId: string;
  tenantName: string;
  roomNumber: string;
  endDate: string;
  depositAmount: number;
  daysUntilEnd: number;
}
