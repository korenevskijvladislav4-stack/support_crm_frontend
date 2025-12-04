export interface IShift{
    id: number;
    user_shift_id?: number; // ID записи в user_shifts для операций
    date: Date;
    duration: number;
    status?: 'approved' | 'pending' | 'rejected';
    is_active?: boolean;
}

export interface IShiftRequest {
    id: number;
    user_id: number;
    shift_id: number;
    duration: number;
    status: 'approved' | 'pending' | 'rejected';
    is_active: boolean;
    shift?: {
        id: number;
        date: string;
    };
    user?: {
        id: number;
        name: string;
    };
}

export interface ICreateShiftRequest {
    shift_id?: number;
    date?: string; // Можно передать дату вместо shift_id
    duration: number;
    user_id?: number;
}

export interface ICreateDirectShiftRequest {
    shift_id?: number;
    date?: string;
    duration: number;
    user_id: number;
}