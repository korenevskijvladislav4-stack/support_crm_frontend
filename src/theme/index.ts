import { theme, type ThemeConfig } from 'antd';
import { lightTokens, darkTokens } from './tokens';
import { getLightComponentTokens, getDarkComponentTokens } from './components';

const { defaultAlgorithm, darkAlgorithm } = theme;

/**
 * Получить конфигурацию темы Ant Design
 */
export const getThemeConfig = (isDarkMode: boolean): ThemeConfig => ({
  algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
  token: isDarkMode ? darkTokens : lightTokens,
  components: isDarkMode ? getDarkComponentTokens() : getLightComponentTokens(),
});

/**
 * Получить цвет фона для загрузочного экрана
 */
export const getLoadingBgColor = (isDarkMode: boolean): string => 
  isDarkMode ? '#0d1117' : '#f0f2f5';

export { lightTokens, darkTokens } from './tokens';
export { getLightComponentTokens, getDarkComponentTokens } from './components';

