'use client';

import { useState } from 'react';
import {
  Card,
  Typography,
  Select,
  Button,
  Table,
  Space,
  message,
  Tag,
  Descriptions,
  Row,
  Col,
  Statistic,
  Alert,
} from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PrinterOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { batchesApi } from '@/lib/api/batches';
import { qcApi } from '@/lib/api/qc';
import { QCValidation } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { formatValidationDetails } from '@/lib/utils/formatValidationDetails';

const { Title, Text } = Typography;
const { Option } = Select;

// Format date sesuai soal: "01-Jan-1901 / 14:00"
const formatDate = (date: string) => {
  const d = dayjs(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(d.date()).padStart(2, '0');
  const month = months[d.month()];
  const year = d.year();
  const time = d.format('HH:mm');
  return `${day}-${month}-${year} / ${time}`;
};

export default function QCReportsPage() {
  const [selectedBatch, setSelectedBatch] = useState<number | undefined>(undefined);

  // Fetch batches
  const { data: batches } = useQuery({
    queryKey: ['batches'],
    queryFn: () => batchesApi.getAll(),
  });

  // Fetch batch detail
  const { data: batchDetail, isLoading: isLoadingBatch } = useQuery({
    queryKey: ['batch-detail', selectedBatch],
    queryFn: () => batchesApi.getDetail(selectedBatch!),
    enabled: !!selectedBatch,
  });

  // Fetch QC validations untuk batch
  const { data: validations, isLoading: isLoadingValidations } = useQuery({
    queryKey: ['qc-validations', selectedBatch],
    queryFn: () => qcApi.getByBatch(selectedBatch!),
    enabled: !!selectedBatch,
  });

  // Fetch production report
  const { data: report, isLoading: isLoadingReport } = useQuery({
    queryKey: ['batch-report', selectedBatch],
    queryFn: () => batchesApi.getReport(selectedBatch!),
    enabled: !!selectedBatch,
  });

  // Export tidak diperlukan karena tidak disebutkan di soal

  const getStatusTag = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower === 'pass' || statusLower === 'passed') {
      return (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          LULUS
        </Tag>
      );
    }
    
    if (statusLower === 'fail' || statusLower === 'failed') {
      return (
        <Tag color="red" icon={<CloseCircleOutlined />}>
          GAGAL
        </Tag>
      );
    }
    
    if (statusLower === 'pending') {
      return (
        <Tag color="orange" icon={<ClockCircleOutlined />}>
          PENDING
        </Tag>
      );
    }
    
    // Default untuk status yang tidak dikenal
    return (
      <Tag color="default">
        {status || 'UNKNOWN'}
      </Tag>
    );
  };

  const validationColumns: ColumnsType<QCValidation> = [
    {
      title: 'Tipe Validasi',
      dataIndex: 'validation_type',
      key: 'validation_type',
      render: (type: string) => <Tag color="purple">{type}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'validation_status',
      key: 'validation_status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Deskripsi',
      dataIndex: 'validation_details',
      key: 'validation_details',
      render: (desc: string) => {
        const formatted = formatValidationDetails(desc);
        return (
          <div style={{ whiteSpace: 'pre-wrap', maxWidth: '400px' }}>
            {formatted}
          </div>
        );
      },
    },
    {
      title: 'Validated By',
      dataIndex: 'validated_by',
      key: 'validated_by',
    },
    {
      title: 'Tanggal',
      dataIndex: 'validated_at',
      key: 'validated_at',
      render: (date: string) => dayjs(date).format('DD-MM-YYYY HH:mm:ss'),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Title level={2}>
          <FileTextOutlined /> Laporan QC
        </Title>
      </div>

      <Card style={{ marginBottom: '1.5rem' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Pilih Batch:
            </label>
            <Select
              placeholder="Pilih batch untuk melihat laporan QC"
              style={{ width: '100%' }}
              onChange={setSelectedBatch}
              value={selectedBatch}
              showSearch
              optionFilterProp="children"
            >
              {batches?.map((batch) => (
                <Option key={batch.batch_id} value={batch.batch_id}>
                  Batch #{batch.batch_number} - {batch.operator_name} ({batch.location})
                </Option>
              ))}
            </Select>
          </div>
        </Space>
      </Card>

      {!selectedBatch && (
        <Alert
          message="Pilih Batch"
          description="Silakan pilih batch terlebih dahulu untuk melihat laporan QC"
          type="info"
          showIcon
        />
      )}

      {selectedBatch && batchDetail && (
        <>
          {/* Batch Info */}
          <Card title="Informasi Batch" style={{ marginBottom: '1.5rem' }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="No Batch">
                #{batchDetail.batch.batch_number}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color="blue">{batchDetail.batch.status}</Tag>
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
            </Descriptions>
          </Card>

          {/* Statistics */}
          <Row gutter={[16, 16]} style={{ marginBottom: '1.5rem' }}>
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
                  title="Total Validasi QC"
                  value={validations?.length || 0}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* QC Validations */}
          <Card title="Validasi QC" style={{ marginBottom: '1.5rem' }}>
            {isLoadingValidations ? (
              <div>Loading...</div>
            ) : validations && validations.length > 0 ? (
              <Table
                columns={validationColumns}
                dataSource={validations}
                rowKey="qc_id"
                pagination={false}
              />
            ) : (
              <Alert
                message="Belum Ada Validasi"
                description="Batch ini belum memiliki validasi QC"
                type="info"
                showIcon
              />
            )}
          </Card>

          {/* Production Report Table */}
          {report && report.data && (
            <Card 
              title="Laporan Produksi Per Batch"
              extra={
                <Button
                  type="primary"
                  icon={<PrinterOutlined />}
                  onClick={() => window.print()}
                >
                  Print
                </Button>
              }
            >
              {/* Header */}
              <Descriptions bordered column={2} size="small" style={{ marginBottom: '1rem' }}>
                <Descriptions.Item label="No Batch">
                  <strong>{report.data.batch_number}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Nama Operator">
                  {report.data.operator_name}
                </Descriptions.Item>
                <Descriptions.Item label="Lokasi">
                  {report.data.location}
                </Descriptions.Item>
                <Descriptions.Item label="Tanggal / Jam">
                  {formatDate(report.data.production_date)}
                </Descriptions.Item>
              </Descriptions>

              {/* Table */}
              <Table
                columns={[
                  {
                    title: 'No Box',
                    dataIndex: 'box_number',
                    key: 'box_number',
                    width: 100,
                    align: 'center',
                    sorter: (a: any, b: any) => a.box_number - b.box_number,
                  },
                  {
                    title: 'No Kupon',
                    dataIndex: 'coupon_number',
                    key: 'coupon_number',
                    width: 120,
                    align: 'center',
                    render: (number: string) => <strong>{number}</strong>,
                    sorter: (a: any, b: any) => a.coupon_number.localeCompare(b.coupon_number),
                    defaultSortOrder: 'ascend' as const,
                  },
                  {
                    title: 'Nominal',
                    dataIndex: 'prize_amount',
                    key: 'prize_amount',
                    width: 150,
                    align: 'right',
                    render: (amount: number) => {
                      if (amount === 0) return <Text type="secondary">0</Text>;
                      return (
                        <Text strong style={{ color: '#52c41a' }}>
                          {amount.toLocaleString('id-ID').replace(/,/g, '.')}
                        </Text>
                      );
                    },
                    sorter: (a: any, b: any) => a.prize_amount - b.prize_amount,
                  },
                  {
                    title: 'Keterangan',
                    dataIndex: 'prize_description',
                    key: 'prize_description',
                    render: (desc: string, record: any) => {
                      if (record.prize_amount === 0) {
                        return <Text type="secondary">{desc || 'Anda Belum Beruntung'}</Text>;
                      }
                      return <Text>-</Text>;
                    },
                    sorter: (a: any, b: any) => (a.prize_description || '').localeCompare(b.prize_description || ''),
                  },
                ]}
                dataSource={report.data.coupons?.map((coupon: any, index: number) => ({
                  key: index,
                  ...coupon,
                })) || []}
                pagination={{
                  pageSize: 50,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} kupon`,
                  pageSizeOptions: ['20', '50', '100', '200', '500', '1000', report.data.coupons ? String(report.data.coupons.length) : undefined].filter(Boolean) as string[],
                  showQuickJumper: true,
                }}
                size="small"
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
}

