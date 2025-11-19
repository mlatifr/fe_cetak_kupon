'use client';

import { Layout, Menu, Typography } from 'antd';
import {
  AppstoreOutlined,
  FileTextOutlined,
  PrinterOutlined,
  HistoryOutlined,
  HomeOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import { useState, useEffect } from 'react';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const menuItems = [
  {
    key: '/production',
    icon: <AppstoreOutlined />,
    label: <Link href="/production">Dashboard</Link>,
  },
  {
    key: '/production/batches',
    icon: <FileTextOutlined />,
    label: <Link href="/production/batches">Kelola Batch</Link>,
  },
  {
    key: '/production/reports',
    icon: <FileSearchOutlined />,
    label: <Link href="/production/reports">Laporan Produksi</Link>,
  },
  {
    key: '/production/print',
    icon: <PrinterOutlined />,
    label: <Link href="/production/print">Print Kupon</Link>,
  },
  {
    key: '/production/logs',
    icon: <HistoryOutlined />,
    label: <Link href="/production/logs">Production Logs</Link>,
  },
];

export default function ProductionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Fix hydration mismatch: set selectedKeys after mount
  // Handle nested routes by finding the best matching menu item
  useEffect(() => {
    // Find the menu item that best matches the current pathname
    let selectedKey = '/production'; // default
    
    // Sort by key length (longer first) to match more specific paths first
    const sortedMenuItems = [...menuItems].sort((a, b) => b.key.length - a.key.length);
    
    for (const item of sortedMenuItems) {
      if (pathname.startsWith(item.key)) {
        selectedKey = item.key;
        break;
      }
    }
    
    setSelectedKeys([selectedKey]);
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
          <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
            {sidebarCollapsed ? 'Prod' : 'Aplikasi Production'}
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
            Sistem Cetak Kupon Berhadiah - Production
          </Title>
        </Header>
        <Content style={{ margin: '2rem', background: '#fff', padding: '2rem', borderRadius: 8 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

