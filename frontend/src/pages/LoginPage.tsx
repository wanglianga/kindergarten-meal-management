import React from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/api';
import { useUser } from '@/context/UserContext';
import type { User } from '@/types';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await auth.login(values.username, values.password);
      const token = res.access_token || res.accessToken || res.token;
      const userData: User = res.user || res.data?.user || res;
      if (token && userData) {
        login(token, userData);
        navigate('/dashboard');
      } else {
        setError('登录响应数据格式异常');
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 24,
      }}
    >
      <Card
        style={{
          width: 420,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          borderRadius: 12,
        }}
        bordered={false}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            膳食管理系统
          </Title>
          <Text type="secondary">请登录以访问系统</Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          name="login"
          onFinish={onFinish}
          initialValues={{ username: '', password: '' }}
          size="large"
          layout="vertical"
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="请输入用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ height: 44, fontSize: 16 }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <Alert
          type="info"
          showIcon
          message="测试账号"
          description={
            <Space direction="vertical" size={4}>
              <div>
                <Text strong>后勤人员：</Text> logistics / 123456
              </div>
              <div>
                <Text strong>老师：</Text> teacher / 123456
              </div>
              <div>
                <Text strong>家长：</Text> parent / 123456
              </div>
              <div>
                <Text strong>监管人员：</Text> regulator / 123456
              </div>
            </Space>
          }
          style={{ borderRadius: 8 }}
        />
      </Card>
    </div>
  );
};

export default LoginPage;
