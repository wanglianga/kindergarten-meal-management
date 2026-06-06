import React, { ReactNode, useMemo, useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useUser } from '../context/UserContext';
import { MENU_ITEMS } from '../menu';
import type { UserRole, AppMenuItem } from '../types';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const ROLE_LABELS: Record<UserRole, string> = {
  logistics: '后勤人员',
  teacher: '老师',
  parent: '家长',
  regulator: '监管人员',
};

interface LayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = useMemo(() => {
    if (!user) return [];
    const filtered = MENU_ITEMS.filter((item: AppMenuItem) =>
      item.roles.includes(user.role)
    );
    const uniquePaths = new Set<string>();
    return filtered
      .filter((item) => {
        if (uniquePaths.has(item.path)) return false;
        uniquePaths.add(item.path);
        return true;
      })
      .map((item) => ({
        key: item.path,
        icon: item.icon,
        label: item.label,
      }));
  }, [user]);

  const selectedKey = useMemo(() => {
    return menuItems.find((item) => location.pathname.startsWith(item.key))?.key || menuItems[0]?.key || '/dashboard';
  }, [menuItems, location.pathname]);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={220}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 16 : 18,
            fontWeight: 600,
            background: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          {collapsed ? '膳食' : '膳食管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          }}
        >
          <div />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }} size={12}>
              <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />}>
                {user?.name?.charAt(0)}
              </Avatar>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{user?.name}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {user?.role ? ROLE_LABELS[user.role] : ''}
                </Text>
              </div>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
