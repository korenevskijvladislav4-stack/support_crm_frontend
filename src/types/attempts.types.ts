export interface IAttempt{
    id: number;
    name: string;
    surname: string;
    email: string;
    created_at: Date;
    phone: string;
}

export interface IAttemptForm extends Omit<IAttempt, 'id'> {
    phone: string;
    roles: number[];
    team_id: number|null;
    group_id: number|null;
    schedule_type_id: number|null;
    start_date?: string|null;
}

export interface IAttemptsFilter {
  search?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  is_viewed?: boolean | null;
  page?: number;
  per_page?: number;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface AttemptsResponse {
  data: IAttempt[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}