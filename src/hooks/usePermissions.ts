import { useMemo, useCallback } from 'react';
import { useTypedSelector } from './store';
import type { Permission } from '../constants/permissions';
import { PERMISSIONS } from '../constants/permissions';

/**
 * Хук для работы с permissions пользователя
 */
export const usePermissions = () => {
  const user = useTypedSelector((state) => state.auth.user);

  /**
   * Получить все permissions пользователя
   * Приоритет: user.permissions (от API), затем из ролей
   */
  const userPermissions = useMemo((): string[] => {
    // Если API возвращает permissions напрямую - используем их
    if (user?.permissions && user.permissions.length > 0) {
      return user.permissions;
    }
    
    // Fallback: собираем из ролей
    if (!user?.roles) return [];
    
    const permissions = new Set<string>();
    
    user.roles.forEach((role) => {
      if (role.permissions) {
        role.permissions.forEach((permission) => {
          permissions.add(permission);
        });
      }
    });
    
    return Array.from(permissions);
  }, [user?.permissions, user?.roles]);

  /**
   * Проверить, является ли пользователь Super Admin
   * Проверяем по permission system.admin или по названию роли 'Super Admin'
   */
  const isSuperAdmin = useMemo((): boolean => {
    // Проверяем по permission
    if (userPermissions.includes(PERMISSIONS.SYSTEM_ADMIN)) {
      return true;
    }
    // Проверяем по роли
    if (user?.roles?.some(role => role.name === 'Super Admin')) {
      return true;
    }
    return false;
  }, [userPermissions, user?.roles]);

  /**
   * Проверить наличие конкретного permission
   */
  const hasPermission = useCallback((permission: Permission | string): boolean => {
    // Super Admin имеет все права
    if (isSuperAdmin) {
      return true;
    }
    return userPermissions.includes(permission);
  }, [userPermissions, isSuperAdmin]);

  /**
   * Проверить наличие хотя бы одного permission из списка
   */
  const hasAnyPermission = useCallback((permissions: (Permission | string)[]): boolean => {
    if (isSuperAdmin) {
      return true;
    }
    return permissions.some((permission) => userPermissions.includes(permission));
  }, [userPermissions, isSuperAdmin]);

  /**
   * Проверить наличие всех permissions из списка
   */
  const hasAllPermissions = useCallback((permissions: (Permission | string)[]): boolean => {
    if (isSuperAdmin) {
      return true;
    }
    return permissions.every((permission) => userPermissions.includes(permission));
  }, [userPermissions, isSuperAdmin]);

  /**
   * Проверить, является ли пользователь администратором (алиас для isSuperAdmin)
   */
  const isAdmin = isSuperAdmin;

  /**
   * Проверить наличие роли
   */
  const hasRole = useCallback((roleName: string): boolean => {
    if (!user?.roles) return false;
    return user.roles.some((role) => role.name === roleName);
  }, [user?.roles]);

  /**
   * Получить имена ролей пользователя
   */
  const roleNames = useMemo((): string[] => {
    if (!user?.roles) return [];
    return user.roles.map((role) => role.name);
  }, [user?.roles]);

  return {
    permissions: userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isSuperAdmin,
    hasRole,
    roleNames,
  };
};

export default usePermissions;

