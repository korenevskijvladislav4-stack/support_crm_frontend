import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Result, Button, Typography } from 'antd';

const { Paragraph, Text } = Typography;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Компонент для перехвата ошибок React
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Здесь можно добавить отправку ошибки в сервис аналитики
    // например: Sentry.captureException(error, { extra: errorInfo });
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '24px',
          }}
        >
          <Result
            status="error"
            title="Что-то пошло не так"
            subTitle="Произошла непредвиденная ошибка. Попробуйте обновить страницу."
            extra={[
              <Button type="primary" key="reload" onClick={this.handleReload}>
                Обновить страницу
              </Button>,
              <Button key="home" onClick={this.handleGoHome}>
                На главную
              </Button>,
            ]}
          >
            {import.meta.env.DEV && this.state.error && (
              <div style={{ textAlign: 'left', marginTop: 24 }}>
                <Paragraph>
                  <Text strong style={{ fontSize: 16 }}>
                    Информация об ошибке (только в режиме разработки):
                  </Text>
                </Paragraph>
                <Paragraph>
                  <Text code>{this.state.error.toString()}</Text>
                </Paragraph>
                {this.state.errorInfo && (
                  <Paragraph>
                    <pre style={{ fontSize: 12, overflow: 'auto', maxHeight: 200 }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </Paragraph>
                )}
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

