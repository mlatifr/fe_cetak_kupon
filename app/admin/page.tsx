'use client';

import { Card, Row, Col, Statistic, Typography } from 'antd';
import {
  FileTextOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { batchesApi } from '@/lib/api/batches';
import { couponsApi } from '@/lib/api/coupons';
import { prizeConfigApi } from '@/lib/api/prizeConfig';

const { Title } = Typography;

export default function AdminDashboard() {
  // Fetch data dengan React Query
  const { data: batches } = useQuery({
    queryKey: ['batches'],
    queryFn: () => batchesApi.getAll(),
  });

  const { data: coupons } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => couponsApi.getAll(),
  });

  const { data: prizeConfigs } = useQuery({
    queryKey: ['prize-configs'],
    queryFn: () => prizeConfigApi.getAll(),
  });

  const totalBatches = batches?.length || 0;
  const totalCoupons = coupons?.length || 0;
  const totalPrizeConfigs = prizeConfigs?.length || 0;
  const completedBatches = batches?.filter((b) => b.status === 'completed').length || 0;

  return (
    <div>
      <Title level={2}>Dashboard Admin</Title>
      <Row gutter={[16, 16]} style={{ marginTop: '2rem' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Batch"
              value={totalBatches}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Kupon"
              value={totalCoupons}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Konfigurasi Hadiah"
              value={totalPrizeConfigs}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Batch Selesai"
              value={completedBatches}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

