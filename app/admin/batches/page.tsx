'use client';

import { useState } from 'react';
import {
  Table,
  Typography,
  Tag,
  Space,
  Button,
  Modal,
  Descriptions,
  Card,
  Statistic,
  Row,
  Col,
  Select,
  Input,
} from 'antd';
import {
  FileTextOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { batchesApi } from '@/lib/api/batches';
import { Batch } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Search } = Input;

export default function BatchesPage() {
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string>('');

  // Fetch batches
  const { data: batches, isLoading, refetch } = useQuery({
    queryKey: ['batches', statusFilter],
    queryFn: () => batchesApi.getAll({ status: statusFilter }),
  });

  // Fetch batch detail
  const { data: batchDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['batch-detail', selectedBatch?.batch_number],
    queryFn: () => batchesApi.getDetail(selectedBatch!.batch_number),
    enabled: !!selectedBatch && isDetailModalOpen,
  });

  const handleViewDetail = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedBatch(null);
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
      pending: {
        color: 'default',
        icon: <ClockCircleOutlined />,
        text: 'Pending',
      },
      in_progress: {
        color: 'processing',
        icon: <ReloadOutlined spin />,
        text: 'Sedang Diproses',
      },
      completed: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: 'Selesai',
      },
      qc_passed: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: 'QC Lulus',
      },
      qc_failed: {
        color: 'error',
        icon: <CloseCircleOutlined />,
        text: 'QC Gagal',
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // Filter batches berdasarkan search text
  const filteredBatches = batches?.filter((batch) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      batch.batch_number.toString().includes(searchLower) ||
      batch.operator_name.toLowerCase().includes(searchLower) ||
      batch.location.toLowerCase().includes(searchLower)
    );
  });

  // Statistics
  const totalBatches = batches?.length || 0;
  const pendingBatches = batches?.filter((b) => b.status === 'pending').length || 0;
  const inProgressBatches = batches?.filter((b) => b.status === 'in_progress').length || 0;
  const completedBatches = batches?.filter((b) => b.status === 'completed').length || 0;
  const qcPassedBatches = batches?.filter((b) => b.status === 'qc_passed').length || 0;
  const qcFailedBatches = batches?.filter((b) => b.status === 'qc_failed').length || 0;

  const columns: ColumnsType<Batch> = [
    {
      title: 'No Batch',
      dataIndex: 'batch_number',
      key: 'batch_number',
      sorter: (a, b) => a.batch_number - b.batch_number,
      render: (batchNumber: number) => (
        <strong>#{batchNumber}</strong>
      ),
    },
    {
      title: 'Operator',
      dataIndex: 'operator_name',
      key: 'operator_name',
      sorter: (a, b) => a.operator_name.localeCompare(b.operator_name),
    },
    {
      title: 'Lokasi',
      dataIndex: 'location',
      key: 'location',
      sorter: (a, b) => a.location.localeCompare(b.location),
    },
    {
      title: 'Tanggal Produksi',
      dataIndex: 'production_date',
      key: 'production_date',
      render: (date: string) => dayjs(date).format('DD-MM-YYYY HH:mm'),
      sorter: (a, b) =>
        new Date(a.production_date).getTime() - new Date(b.production_date).getTime(),
    },
    {
      title: 'Total Box',
      dataIndex: 'total_boxes',
      key: 'total_boxes',
      align: 'center',
      sorter: (a, b) => a.total_boxes - b.total_boxes,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Sedang Diproses', value: 'in_progress' },
        { text: 'Selesai', value: 'completed' },
        { text: 'QC Lulus', value: 'qc_passed' },
        { text: 'QC Gagal', value: 'qc_failed' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Detail
          </Button>
          <Link href={`/admin/batches/${record.batch_number}/report`}>
            <Button
              type="link"
              icon={<FileSearchOutlined />}
            >
              Report
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Title level={2}>
          <FileTextOutlined /> Monitoring Batch
        </Title>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '1.5rem' }}>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Total Batch"
              value={totalBatches}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Pending"
              value={pendingBatches}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Sedang Diproses"
              value={inProgressBatches}
              prefix={<ReloadOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="Selesai"
              value={completedBatches}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="QC Lulus"
              value={qcPassedBatches}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card>
            <Statistic
              title="QC Gagal"
              value={qcFailedBatches}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '1rem' }}>
        <Space size="middle" wrap>
          <Select
            placeholder="Filter Status"
            allowClear
            style={{ width: 200 }}
            onChange={(value) => setStatusFilter(value)}
            value={statusFilter}
          >
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="in_progress">Sedang Diproses</Select.Option>
            <Select.Option value="completed">Selesai</Select.Option>
            <Select.Option value="qc_passed">QC Lulus</Select.Option>
            <Select.Option value="qc_failed">QC Gagal</Select.Option>
          </Select>
          <Search
            placeholder="Cari batch, operator, atau lokasi"
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Refresh
          </Button>
        </Space>
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredBatches}
        loading={isLoading}
        rowKey="batch_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} batch`,
          pageSizeOptions: ['10', '20', '50', '100', filteredBatches ? String(filteredBatches.length) : undefined].filter(Boolean) as string[],
          showQuickJumper: true,
        }}
      />

      {/* Detail Modal */}
      <Modal
        title={`Detail Batch #${selectedBatch?.batch_number}`}
        open={isDetailModalOpen}
        onCancel={handleCloseDetail}
        footer={[
          <Button key="close" onClick={handleCloseDetail}>
            Tutup
          </Button>,
        ]}
        width={800}
      >
        {isLoadingDetail ? (
          <div>Loading...</div>
        ) : batchDetail ? (
          <div>
            <Descriptions title="Informasi Batch" bordered column={2} style={{ marginBottom: '1.5rem' }}>
              <Descriptions.Item label="No Batch">
                #{batchDetail.batch.batch_number}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {getStatusTag(batchDetail.batch.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Operator">
                {batchDetail.batch.operator_name}
              </Descriptions.Item>
              <Descriptions.Item label="Lokasi">
                {batchDetail.batch.location}
              </Descriptions.Item>
              <Descriptions.Item label="Tanggal Produksi">
                {dayjs(batchDetail.batch.production_date).format('DD-MM-YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Total Box">
                {batchDetail.batch.total_boxes}
              </Descriptions.Item>
              <Descriptions.Item label="Dibuat Oleh">
                {batchDetail.batch.created_by_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Operator ID">
                {batchDetail.batch.operator_name_full || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Total Kupon"
                    value={batchDetail.coupons?.length || 0}
                    prefix={<FileTextOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Kupon Berhadiah"
                    value={batchDetail.coupons?.filter((c) => c.is_winner).length || 0}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Validasi QC"
                    value={batchDetail.qc_validations?.length || 0}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            {batchDetail.production_logs && batchDetail.production_logs.length > 0 && (
              <Card title="Production Logs" style={{ marginTop: '1.5rem' }}>
                <Table
                  dataSource={batchDetail.production_logs}
                  rowKey="log_id"
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: 'Waktu',
                      dataIndex: 'timestamp',
                      key: 'timestamp',
                      render: (date: string) => dayjs(date).format('DD-MM-YYYY HH:mm:ss'),
                    },
                    {
                      title: 'Action',
                      dataIndex: 'action_type',
                      key: 'action_type',
                    },
                    {
                      title: 'Deskripsi',
                      dataIndex: 'action_description',
                      key: 'action_description',
                    },
                    {
                      title: 'Operator',
                      dataIndex: 'operator_name',
                      key: 'operator_name',
                    },
                  ]}
                />
              </Card>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

