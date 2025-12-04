import type { IUserModel } from "./user.types";
export interface IAuth{
    email: string;
    password: string;
}

export interface IRegistrationForm extends IAuth{
    name: string;
    surname: string;
    phone?: string;
}

export interface IAuthStore{
    token:string | null;
    user: IUserModel | null;
    isLoading: boolean;
}