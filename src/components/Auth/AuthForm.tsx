import React from 'react';
import { Form, Input, Button, Space, Alert, Divider, Typography, theme } from 'antd';
import { MailOutlined, LockOutlined, ArrowRightOutlined, UserOutlined } from '@ant-design/icons';
import { Link as RouterLink } from 'react-router-dom';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { IAuth } from '../../types/auth.types';
import styles from '../../styles/auth/auth-page.module.css';

const { Text } = Typography;

interface AuthFormProps {
  form: IAuth;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: unknown;
  isValid: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({
  form,
  onFormChange,
  onSubmit,
  isLoading,
  error,
  isValid
}) => {
  const { token } = theme.useToken();
  const isDark = token.colorBgBase === '#0d1117';

  return (
    <>
      {error && (
        <Alert
          message="Ошибка входа"
          description={
            error && typeof error === 'object' && 'status' in error
              ? ((error as FetchBaseQueryError).data as { message?: string })?.message || 'Неверный email или пароль'
              : (error as Error)?.message || 'Произошла ошибка при входе'
          }
          type="error"
          showIcon
          className={styles.errorAlert}
          closable
        />
      )}

      <Form layout="vertical" size="large">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Form.Item style={{ margin: 0 }}>
            <Input 
              name="email"
              onChange={onFormChange}
              value={form.email}
              placeholder="Введите ваш email"
              prefix={<MailOutlined style={{ color: token.colorTextTertiary }} />}
              className={styles.input}
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ margin: 0 }}>
            <Input.Password 
              name="password"
              onChange={onFormChange}
              value={form.password}
              placeholder="Введите ваш пароль"
              prefix={<LockOutlined style={{ color: token.colorTextTertiary }} />}
              className={styles.input}
              size="large"
              onPressEnter={onSubmit}
            />
          </Form.Item>

          <Button 
            type="primary" 
            size="large"
            loading={isLoading}
            onClick={onSubmit}
            disabled={!isValid}
            icon={<ArrowRightOutlined />}
            className={styles.submitButton}
            block
          >
            {isLoading ? 'Вход...' : 'Войти в систему'}
          </Button>
        </Space>
      </Form>

      <Divider style={{ margin: '24px 0' }}>или</Divider>

      <div className={styles.linkContainer}>
        <Text type="secondary" className={styles.linkText}>
          Еще нет аккаунта?{' '}
          <RouterLink to="/registration" className={styles.link}>
            Зарегистрироваться
          </RouterLink>
        </Text>
      </div>

      <div 
        className={styles.infoBox}
        style={{
          backgroundColor: isDark ? token.colorFillTertiary : '#f0f8ff',
          borderColor: isDark ? token.colorBorder : '#91d5ff'
        }}
      >
        <div className={styles.infoHeader}>
          <UserOutlined style={{ color: token.colorPrimary }} />
          <Text strong className={styles.infoTitle}>Демо доступ</Text>
        </div>
        <Text type="secondary" className={styles.infoText}>
          Для тестирования используйте данные, предоставленные администратором
        </Text>
      </div>

      <div className={styles.securityText}>
        <Text type="secondary">
          Ваши данные защищены и передаются по безопасному соединению
        </Text>
      </div>
    </>
  );
};

export default AuthForm;

