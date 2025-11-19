'use client';

import { Card, Row, Col, Statistic, Typography, Button, Space } from 'antd';
import {
  FileTextOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { batchesApi } from '@/lib/api/batches';
import Link from 'next/link';

const { Title } = Typography;

export default function ProductionDashboard() {
  const { data: batches, isLoading } = useQuery({
    queryKey: ['batches'],
    queryFn: () => batchesApi.getAll(),
  });

  const totalBatches = batches?.length || 0;
  const inProgressBatches = batches?.filter((b) => b.status === 'in_progress').length || 0;
  const completedBatches = batches?.filter((b) => b.status === 'completed').length || 0;
  const pendingBatches = batches?.filter((b) => b.status === 'pending').length || 0;

  return (
    <div>
      <Title level={2}>Dashboard Production</Title>
      <Row gutter={[16, 16]} style={{ marginTop: '2rem' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Batch"
              value={totalBatches}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sedang Diproses"
              value={inProgressBatches}
              prefix={<PrinterOutlined />}
              valueStyle={{ color: '#faad14' }}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Selesai"
              value={completedBatches}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending"
              value={pendingBatches}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: '2rem' }}>
        <Title level={4}>Quick Actions</Title>
        <Space size="middle">
          <Link href="/production/batches">
            <Button type="primary" icon={<PlusOutlined />} size="large">
              Buat Batch Baru
            </Button>
          </Link>
          <Link href="/production/reports">
            <Button type="default" icon={<FileSearchOutlined />} size="large" style={{ background: '#52c41a', borderColor: '#52c41a', color: '#fff' }}>
              Laporan Produksi
            </Button>
          </Link>
          <Link href="/production/print">
            <Button icon={<PrinterOutlined />} size="large">
              Print Kupon
            </Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
}

