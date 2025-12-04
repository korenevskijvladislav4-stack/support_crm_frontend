export interface IPenalty {
  id: number;
  user_id: number;
  user?: {
    id: number;
    name: string;
    surname: string;
    email: string;
  };
  created_by: number;
  creator?: {
    id: number;
    name: string;
    surname: string;
    email: string;
  };
  hours_to_deduct: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface IPenaltyForm {
  user_id: number | null;
  hours_to_deduct: number | null;
  comment: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export type PenaltyStatus = 'pending' | 'approved' | 'rejected' | 'all';

export interface IPenaltiesFilter {
  search?: string;
  user_id?: number;
  group_id?: number;
  created_by?: number;
  created_at?: string;
  status?: PenaltyStatus;
  page?: number;
  per_page?: number;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface PenaltiesResponse {
  data: IPenalty[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

