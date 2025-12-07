/**
 * Типы для авторизации
 */

import type { IUserModel } from './user.types';

/**
 * Форма авторизации
 */
export interface IAuth {
  email: string;
  password: string;
}

/**
 * Форма регистрации
 */
export interface IRegistrationForm extends IAuth {
  name: string;
  surname: string;
  phone?: string;
}

/**
 * Состояние авторизации в store
 */
export interface IAuthStore {
  token: string | null;
  user: IUserModel | null;
  isLoading: boolean;
}
