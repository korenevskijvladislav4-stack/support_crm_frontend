import type { ThemeConfig } from 'antd';

/**
 * Базовые цвета приложения
 */
export const colors = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1890ff',
} as const;

/**
 * Токены для светлой темы
 */
export const lightTokens: ThemeConfig['token'] = {
  colorPrimary: colors.primary,
  colorSuccess: colors.success,
  colorWarning: colors.warning,
  colorError: colors.error,
  colorInfo: colors.info,
  colorBgBase: '#ffffff',
  colorBgContainer: '#ffffff',
  colorBgElevated: '#ffffff',
  colorBgLayout: '#f0f2f5',
  colorTextBase: '#000000',
  colorText: '#000000',
  colorTextSecondary: '#595959',
  colorBorder: '#d9d9d9',
  colorBorderSecondary: '#f0f0f0',
  borderRadius: 6,
  wireframe: false,
  fontSize: 14,
  sizeStep: 4,
  sizeUnit: 4,
  boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
};

/**
 * Токены для тёмной темы
 */
export const darkTokens: ThemeConfig['token'] = {
  colorPrimary: colors.primary,
  colorSuccess: colors.success,
  colorWarning: colors.warning,
  colorError: colors.error,
  colorInfo: colors.info,
  colorBgBase: '#0d1117',
  colorBgContainer: '#161b22',
  colorBgElevated: '#1c2128',
  colorBgLayout: '#0d1117',
  colorTextBase: '#c9d1d9',
  colorText: '#c9d1d9',
  colorTextSecondary: '#8b949e',
  colorBorder: '#30363d',
  colorBorderSecondary: '#21262d',
  borderRadius: 6,
  wireframe: false,
  fontSize: 14,
  sizeStep: 4,
  sizeUnit: 4,
  boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.48), 0 6px 16px 0 rgba(0, 0, 0, 0.32), 0 9px 28px 8px rgba(0, 0, 0, 0.2)',
};

