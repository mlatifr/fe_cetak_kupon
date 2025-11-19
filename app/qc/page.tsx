'use client';

import { Card, Row, Col, Statistic, Typography } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { qcApi } from '@/lib/api/qc';
import { batchesApi } from '@/lib/api/batches';

const { Title } = Typography;

export default function QCDashboard() {
  const { data: qcValidations, isLoading: qcLoading } = useQuery({
    queryKey: ['qc-validations'],
    queryFn: () => qcApi.getAll(),
  });

  const { data: batches, isLoading: batchesLoading } = useQuery({
    queryKey: ['batches'],
    queryFn: () => batchesApi.getAll(),
  });

  const totalValidations = qcValidations?.length || 0;
  const passedValidations = qcValidations?.filter((v) => {
    const status = v.validation_status?.toLowerCase() || '';
    return status === 'pass' || status === 'passed';
  }).length || 0;
  const failedValidations = qcValidations?.filter((v) => {
    const status = v.validation_status?.toLowerCase() || '';
    return status === 'fail' || status === 'failed';
  }).length || 0;
  const pendingValidations = qcValidations?.filter((v) => {
    const status = v.validation_status?.toLowerCase() || '';
    return status === 'pending';
  }).length || 0;
  const pendingBatches = batches?.filter((b) => b.status === 'completed' && !qcValidations?.some((qc) => qc.batch_id === b.batch_id)).length || 0;

  return (
    <div>
      <Title level={2}>Dashboard QC</Title>
      <Row gutter={[16, 16]} style={{ marginTop: '2rem' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Validasi"
              value={totalValidations}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
              loading={qcLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Validasi Lulus"
              value={passedValidations}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              loading={qcLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Validasi Gagal"
              value={failedValidations}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
              loading={qcLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Batch Pending QC"
              value={pendingBatches}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
              loading={batchesLoading || qcLoading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

