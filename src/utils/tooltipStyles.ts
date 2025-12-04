import { theme } from 'antd';

/**
 * Получить стили для Tooltip, которые работают в обеих темах
 */
export const getTooltipStyles = () => {
  const { token } = theme.useToken();
  
  return {
    overlayInnerStyle: {
      backgroundColor: token.colorBgElevated,
      color: token.colorText,
      border: `1px solid ${token.colorBorder}`,
    } as React.CSSProperties,
  };
};


