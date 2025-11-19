'use client';

import { ConfigProvider } from 'antd';
import idID from 'antd/locale/id_ID';
import { useUIStore } from '@/stores/uiStore';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((state) => state.theme);

  return (
    <ConfigProvider
      locale={idID}
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
        algorithm: theme === 'dark' ? undefined : undefined, // TODO: Add dark mode if needed
      }}
    >
      {children}
    </ConfigProvider>
  );
}

