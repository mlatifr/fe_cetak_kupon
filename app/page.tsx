'use client';

import { Button, Card, Typography, Space } from 'antd';
import { AppstoreOutlined, PrinterOutlined, CheckCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <div style={{ maxWidth: 1200, width: '100%', padding: '2rem' }}>
        <Title level={1} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          Sistem Cetak Kupon Berhadiah
        </Title>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card
            hoverable
            style={{ cursor: 'pointer' }}
            onClick={() => (window.location.href = '/admin')}
          >
            <Space size="large">
              <AppstoreOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              <div>
                <Title level={3}>Aplikasi Admin</Title>
                <Paragraph>
                  Generate kupon, konfigurasi hadiah, monitoring produksi, dan manajemen user
                </Paragraph>
                <Link href="/admin">
                  <Button type="primary" size="large">
                    Masuk ke Admin
                  </Button>
                </Link>
        </div>
            </Space>
          </Card>

          <Card
            hoverable
            style={{ cursor: 'pointer' }}
            onClick={() => (window.location.href = '/production')}
          >
            <Space size="large">
              <PrinterOutlined style={{ fontSize: 48, color: '#52c41a' }} />
              <div>
                <Title level={3}>Aplikasi Production</Title>
                <Paragraph>
                  Input batch produksi, print kupon, dan logging aktivitas produksi
                </Paragraph>
                <Link href="/production">
                  <Button type="primary" size="large" style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                    Masuk ke Production
                  </Button>
                </Link>
              </div>
            </Space>
          </Card>

          <Card
            hoverable
            style={{ cursor: 'pointer' }}
            onClick={() => (window.location.href = '/qc')}
          >
            <Space size="large">
              <CheckCircleOutlined style={{ fontSize: 48, color: '#faad14' }} />
              <div>
                <Title level={3}>Aplikasi QC</Title>
                <Paragraph>
                  Validasi output produksi, validasi distribusi hadiah, dan laporan QC
                </Paragraph>
                <Link href="/qc">
                  <Button type="primary" size="large" style={{ background: '#faad14', borderColor: '#faad14' }}>
                    Masuk ke QC
                  </Button>
                </Link>
              </div>
            </Space>
          </Card>
        </Space>
        </div>
    </div>
  );
}
