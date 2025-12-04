import React from 'react';
import { FileTextOutlined, PaperClipOutlined } from '@ant-design/icons';

interface FileIconProps {
  fileName: string;
  mimeType?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({ fileName, mimeType }) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  if (mimeType?.startsWith('image/')) {
    return <FileTextOutlined style={{ fontSize: '16px', color: '#52c41a' }} />;
  } else if (ext === 'pdf' || mimeType === 'application/pdf') {
    return <FileTextOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />;
  } else if (['doc', 'docx'].includes(ext || '')) {
    return <FileTextOutlined style={{ fontSize: '16px', color: '#1890ff' }} />;
  } else if (['xls', 'xlsx'].includes(ext || '')) {
    return <FileTextOutlined style={{ fontSize: '16px', color: '#52c41a' }} />;
  } else {
    return <PaperClipOutlined style={{ fontSize: '16px', color: '#faad14' }} />;
  }
};