import type { FC, ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import type { Permission } from '../constants/permissions';

interface PermissionGuardProps {
  /**
   * Требуемый permission (или массив для hasAny/hasAll)
   */
  permission?: Permission | string;
  
  /**
   * Требуется хотя бы один из permissions
   */
  anyOf?: (Permission | string)[];
  
  /**
   * Требуются все permissions
   */
  allOf?: (Permission | string)[];
  
  /**
   * Контент для отображения при наличии прав
   */
  children: ReactNode;
  
  /**
   * Fallback при отсутствии прав
   */
  fallback?: ReactNode;
  
  /**
   * Пропустить проверку (для условного отключения)
   */
  skip?: boolean;
}

/**
 * Компонент для условного рендеринга на основе permissions
 * 
 * @example
 * // Один permission
 * <PermissionGuard permission="users.create">
 *   <Button>Создать пользователя</Button>
 * </PermissionGuard>
 * 
 * @example
 * // Хотя бы один из permissions
 * <PermissionGuard anyOf={['users.create', 'users.update']}>
 *   <EditForm />
 * </PermissionGuard>
 * 
 * @example
 * // Все permissions
 * <PermissionGuard allOf={['users.view', 'users.update']}>
 *   <AdminPanel />
 * </PermissionGuard>
 * 
 * @example
 * // С fallback
 * <PermissionGuard permission="admin.full-access" fallback={<AccessDenied />}>
 *   <AdminDashboard />
 * </PermissionGuard>
 */
export const PermissionGuard: FC<PermissionGuardProps> = ({
  permission,
  anyOf,
  allOf,
  children,
  fallback = null,
  skip = false,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Пропуск проверки
  if (skip) {
    return <>{children}</>;
  }

  // Проверка одного permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Проверка хотя бы одного permission
  if (anyOf && !hasAnyPermission(anyOf)) {
    return <>{fallback}</>;
  }

  // Проверка всех permissions
  if (allOf && !hasAllPermissions(allOf)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * HOC для защиты компонентов по permission
 */
export function withPermission<P extends object>(
  WrappedComponent: FC<P>,
  permission: Permission | string,
  FallbackComponent?: FC
) {
  const WithPermissionComponent: FC<P> = (props) => {
    const { hasPermission } = usePermissions();
    
    if (!hasPermission(permission)) {
      return FallbackComponent ? <FallbackComponent /> : null;
    }
    
    return <WrappedComponent {...props} />;
  };
  
  WithPermissionComponent.displayName = `WithPermission(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithPermissionComponent;
}

export default PermissionGuard;

