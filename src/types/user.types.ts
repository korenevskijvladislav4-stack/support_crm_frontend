import type { IRole } from "./role.types";
import type { IShift } from "./shifts.types";

export interface IUserModel{
    id: number;
    name: string;
    surname: string;
    role_id: number;
    roles: IRole[];
    team_id: number;
    schedule_type_id: number;
    group_id: number;
    email: string;
    phone?: string;
    created_at?:string;
    updated_at?: Date;
    deleted_at?: Date
}

export interface IUserForm{
    name: string;
    surname: string;
    roles: number[]|[]
    team_id: number|null;
    schedule_type_id: number|null;
    group_id: number|null;
    email: string;
    phone?: string;
}

export interface IUser{
    id: number;
    name: string;
    email: string;
    surname: string;
    phone?: string;
    roles: string[];
    team: string;
    team_id?: number;
    schedule_type:string;
    group: string;
    created_at: string;
}

export interface IUserFilters{
    full_name?: string|null;
    group?: number[]|[];
    team?: number[]|[];
    roles?: number[]|[];
    schedule_type?: string|null;
    phone?: string|null;
    email?: string|null;
    status?: 'active' | 'deactivated';
    page?: number;
    per_page?: number;
}

export interface UsersResponse {
  data: IUser[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}



export interface IUserWithShifts extends IUser{
    shifts: IShift[];
}
