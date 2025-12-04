export const PRIORITY_CONFIG = {
  low: { color: '#52c41a', text: 'Низкий', icon: '🟢', gradient: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)' },
  medium: { color: '#faad14', text: 'Средний', icon: '🟡', gradient: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)' },
  high: { color: '#ff4d4f', text: 'Высокий', icon: '🔴', gradient: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)' },
  urgent: { color: '#eb2f96', text: 'Срочный', icon: '💥', gradient: 'linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)' }
};

export const AVATAR_COLORS = [
  '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
  '#fa541c', '#13c2c2', '#eb2f96', '#a0d911', '#2f54eb'
];

export const getPriorityConfig = (priority: string) => {
  return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
};

export const getAvatarColor = (userId: number) => {
  return AVATAR_COLORS[userId % AVATAR_COLORS.length];
};

export const getInitials = (name?: string, surname?: string) => {
  return `${name?.[0] || ''}${surname?.[0] || ''}`.toUpperCase();
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isImageFile = (file: File | { mime_type: string }) => {
  const mimeType = file instanceof File ? file.type : file.mime_type;
  return mimeType.startsWith('image/');
};

export const isPdfFile = (file: File | { mime_type: string }) => {
  const mimeType = file instanceof File ? file.type : file.mime_type;
  return mimeType === 'application/pdf';
};