// Domain models matching Google Sheets schemas

export interface Kost {
    ID_Kost: string;
    Nama_Kost: string;
    Alamat?: string;
}

export interface Room {
    ID_Kamar: string;
    ID_Kost: string;
    No_Kamar: string;
    Lantai: string;
    Harga_Sewa?: string;
}

export interface Tenant {
    ID_Penghuni: string;
    ID_Kost?: string;
    Nama: string;
    No_HP: string;
    Bawa_Mobil: "Ya" | "Tidak";
    Kontak_Darurat?: string;
}

export interface Rental {
    ID_Sewa: string;
    ID_Kamar: string;
    ID_Penghuni: string;
    ID_Kost?: string;
    Tgl_Masuk: string;
    Tgl_DP?: string;
    Tgl_Deposit?: string;
    Nominal_Deposit?: string;
    Periode_Sewa: string;
    Unit_Durasi: "Hari" | "Minggu" | "Bulan";
    Status_Sewa: "AKTIF" | "BOOKING" | "SELESAI";
    Status_Aktif?: string;
    Monthly_Rent?: string;
    DP_Amount?: string;
    DP_Status?: string;
    Deposit_Status?: string;
    Deposit_Refunded_At?: string;
}

export interface Expense {
    ID_Expense: string;
    ID_Kost?: string;
    Date: string;
    Category: string;
    Amount: string;
    Notes: string;
    Created_At: string;
}

// API response envelopes

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    RecordCount: number;
}

export interface ApiErrorResponse {
    success: boolean;
    message: string;
    error?: string;
    failedRows?: number[];
}
