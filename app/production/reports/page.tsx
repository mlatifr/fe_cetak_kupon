'use client';

import {
  Table,
  Typography,
  Tag,
  Space,
  Button,
  Card,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  FileTextOutlined,
  FileSearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { batchesApi } from '@/lib/api/batches';
import { Batch } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function ProductionReportsPage() {
  // Fetch batches
  const { data: batches, isLoading } = useQuery({
    queryKey: ['batches'],
    queryFn: () => batchesApi.getAll(),
  });

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'default', text: 'Pending' },
      in_progress: { color: 'processing', text: 'Sedang Diproses' },
      completed: { color: 'success', text: 'Selesai' },
      qc_passed: { color: 'success', text: 'QC Lulus' },
      qc_failed: { color: 'error', text: 'QC Gagal' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Statistics
  const totalBatches = batches?.length || 0;
  const completedBatches = batches?.filter((b) => b.status === 'completed' || b.status === 'qc_passed').length || 0;

  const columns: ColumnsType<Batch> = [
    {
      title: 'No Batch',
      dataIndex: 'batch_number',
      key: 'batch_number',
      render: (batchNumber: number) => <strong>#{batchNumber}</strong>,
      sorter: (a, b) => a.batch_number - b.batch_number,
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Operator',
      dataIndex: 'operator_name',
      key: 'operator_name',
    },
    {
      title: 'Lokasi',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Tanggal Produksi',
      dataIndex: 'production_date',
      key: 'production_date',
      render: (date: string) => dayjs(date).format('DD-MM-YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.production_date).unix() - dayjs(b.production_date).unix(),
    },
    {
      title: 'Total Box',
      dataIndex: 'total_boxes',
      key: 'total_boxes',
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Link href={`/production/batches/${record.batch_number}/report`}>
          <Button
            type="primary"
            icon={<FileSearchOutlined />}
          >
            Lihat Laporan
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Title level={2}>
          <FileTextOutlined /> Laporan Produksi
        </Title>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '1.5rem' }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Batch"
              value={totalBatches}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Batch Selesai"
              value={completedBatches}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Laporan Tersedia"
              value={completedBatches}
              prefix={<PrinterOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={batches}
          loading={isLoading}
          rowKey="batch_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} batch`,
          }}
        />
      </Card>
    </div>
  );
}

