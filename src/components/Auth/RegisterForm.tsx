import React from 'react';
import { Form, Input, Button, Space, Alert, Divider, Typography, theme } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link as RouterLink } from 'react-router-dom';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { IRegistrationForm } from '../../types/auth.types';
import styles from '../../styles/auth/auth-page.module.css';

const { Text } = Typography;

interface RegisterFormProps {
  form: IRegistrationForm;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: unknown;
  isSuccess: boolean;
  isValid: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  form,
  onFormChange,
  onSubmit,
  isLoading,
  error,
  isSuccess,
  isValid
}) => {
  const { token } = theme.useToken();
  const isDark = token.colorBgBase === '#0d1117';

  return (
    <>
      {error && (
        <Alert
          message={
            error && typeof error === 'object' && 'status' in error
              ? ((error as FetchBaseQueryError).data as { message?: string })?.message || 'Ошибка сервера'
              : (error as Error)?.message || 'Неизвестная ошибка'
          }
          type="error"
          showIcon
          className={styles.errorAlert}
          closable
        />
      )}
      
      {isSuccess && (
        <Alert
          message="Заявка на регистрацию успешно создана"
          description="Ожидайте подтверждения администратором системы"
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          className={styles.successAlert}
        />
      )}

      <Form layout="vertical" size="large">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div className={styles.nameRow}>
            <Form.Item style={{ flex: 1, margin: 0 }}>
              <Input 
                name="name"
                onChange={onFormChange}
                value={form.name}
                placeholder="Имя"
                prefix={<UserOutlined style={{ color: token.colorTextTertiary }} />}
                className={styles.input}
              />
            </Form.Item>
            
            <Form.Item style={{ flex: 1, margin: 0 }}>
              <Input 
                name="surname"
                onChange={onFormChange}
                value={form.surname}
                placeholder="Фамилия"
                prefix={<UserOutlined style={{ color: token.colorTextTertiary }} />}
                className={styles.input}
              />
            </Form.Item>
          </div>

          <Form.Item style={{ margin: 0 }}>
            <Input 
              name="email"
              onChange={onFormChange}
              value={form.email}
              placeholder="Рабочая почта"
              prefix={<MailOutlined style={{ color: token.colorTextTertiary }} />}
              className={styles.input}
            />
          </Form.Item>

          <Form.Item style={{ margin: 0 }}>
            <Input 
              name="phone"
              onChange={onFormChange}
              value={form.phone}
              placeholder="Номер телефона"
              prefix={<PhoneOutlined style={{ color: token.colorTextTertiary }} />}
              className={styles.input}
            />
          </Form.Item>

          <Form.Item style={{ margin: 0 }}>
            <Input.Password 
              name="password"
              onChange={onFormChange}
              value={form.password}
              placeholder="Пароль"
              prefix={<LockOutlined style={{ color: token.colorTextTertiary }} />}
              className={styles.input}
            />
          </Form.Item>

          <Button 
            type="primary" 
            size="large"
            loading={isLoading}
            onClick={onSubmit}
            disabled={!isValid}
            className={styles.submitButton}
            block
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </Space>
      </Form>

      <Divider style={{ margin: '24px 0' }}>или</Divider>

      <div className={styles.linkContainer}>
        <Text type="secondary" className={styles.linkText}>
          Уже есть аккаунт?{' '}
          <RouterLink to="/login" className={styles.link}>
            Войти в систему
          </RouterLink>
        </Text>
      </div>

      <div 
        className={styles.infoBoxSuccess}
        style={{
          backgroundColor: isDark ? token.colorFillTertiary : '#f6ffed',
          borderColor: isDark ? token.colorBorder : '#b7eb8f'
        }}
      >
        <Text type="secondary" className={styles.infoText}>
          После регистрации ваша заявка будет отправлена на подтверждение администратору
        </Text>
      </div>
    </>
  );
};

export default RegisterForm;

