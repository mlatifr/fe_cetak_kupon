'use client';

import { Layout, Menu, Typography } from 'antd';
import {
  AppstoreOutlined,
  GiftOutlined,
  FileTextOutlined,
  UserOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import { useState, useEffect } from 'react';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const menuItems = [
  {
    key: '/admin',
    icon: <AppstoreOutlined />,
    label: <Link href="/admin">Dashboard</Link>,
  },
  {
    key: '/admin/coupons',
    icon: <FileTextOutlined />,
    label: <Link href="/admin/coupons">Generate Kupon</Link>,
  },
  {
    key: '/admin/prize-config',
    icon: <GiftOutlined />,
    label: <Link href="/admin/prize-config">Konfigurasi Hadiah</Link>,
  },
  {
    key: '/admin/batches',
    icon: <FileTextOutlined />,
    label: <Link href="/admin/batches">Monitoring Batch</Link>,
  },
  {
    key: '/admin/users',
    icon: <UserOutlined />,
    label: <Link href="/admin/users">Manajemen User</Link>,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Fix hydration mismatch: set selectedKeys after mount
  useEffect(() => {
    setSelectedKeys([pathname]);
  }, [pathname]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={sidebarCollapsed}
        onCollapse={(collapsed) => useUIStore.getState().setSidebarCollapsed(collapsed)}
        theme="light"
        width={250}
      >
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            {sidebarCollapsed ? 'Admin' : 'Aplikasi Admin'}
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
        <div style={{ padding: '1rem', borderTop: '1px solid #f0f0f0' }}>
          <Link href="/">
            <HomeOutlined /> {!sidebarCollapsed && 'Kembali ke Home'}
          </Link>
        </div>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Title level={4} style={{ margin: 0 }}>
            Sistem Cetak Kupon Berhadiah - Admin
          </Title>
        </Header>
        <Content style={{ margin: '2rem', background: '#fff', padding: '2rem', borderRadius: 8 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

