'use client';

import { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Typography,
  Modal,
  Form,
  Select,
  Input,
  message,
  Tag,
  Card,
  Statistic,
  Row,
  Col,
  Descriptions,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qcApi } from '@/lib/api/qc';
import { batchesApi } from '@/lib/api/batches';
import { usersApi } from '@/lib/api/users';
import { QCValidation } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { formatValidationDetails } from '@/lib/utils/formatValidationDetails';

const { Title } = Typography;
const { Option } = Select;

export default function QCValidationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingValidation, setViewingValidation] = useState<QCValidation | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch batches
  const { data: batches } = useQuery({
    queryKey: ['batches'],
    queryFn: () => batchesApi.getAll({ status: 'completed' }),
  });

  // Fetch users untuk dropdown validated_by
  // Note: Backend mungkin tidak menerima boolean, jadi ambil semua users dan filter di frontend
  const { data: allUsers, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['users', 'for-validator'],
    queryFn: () => usersApi.getAll(),
    retry: 1,
  });
  
  // Filter hanya user aktif di frontend
  const users = allUsers?.filter((user) => user.is_active) || [];

  // Fetch QC validations
  const { data: validations, isLoading } = useQuery({
    queryKey: ['qc-validations'],
    queryFn: () => qcApi.getAll(),
  });

  // Create validation mutation
  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof qcApi.create>[0]) =>
      qcApi.create(data),
    onSuccess: () => {
      message.success('Validasi QC berhasil dibuat');
      queryClient.invalidateQueries({ queryKey: ['qc-validations'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || 'Gagal membuat validasi QC');
    },
  });

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({
      validation_status: 'pass',
    });
    setIsModalOpen(true);
  };

  const handleView = (validation: QCValidation) => {
    setViewingValidation(validation);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      createMutation.mutate(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };


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

  // Statistics
  const totalValidations = validations?.length || 0;
  const passedValidations = validations?.filter((v) => {
    const status = v.validation_status?.toLowerCase() || '';
    return status === 'pass' || status === 'passed';
  }).length || 0;
  const failedValidations = validations?.filter((v) => {
    const status = v.validation_status?.toLowerCase() || '';
    return status === 'fail' || status === 'failed';
  }).length || 0;
  const pendingValidations = validations?.filter((v) => {
    const status = v.validation_status?.toLowerCase() || '';
    return status === 'pending';
  }).length || 0;

  const columns: ColumnsType<QCValidation> = [
    {
      title: 'Batch ID',
      dataIndex: 'batch_id',
      key: 'batch_id',
      render: (batchId: number) => (
        <Tag color="blue">#{batchId}</Tag>
      ),
    },
    {
      title: 'Tipe Validasi',
      dataIndex: 'validation_type',
      key: 'validation_type',
      render: (type: string) => (
        <Tag color="purple">{type}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'validation_status',
      key: 'validation_status',
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: 'Lulus', value: 'pass' },
        { text: 'Gagal', value: 'fail' },
        { text: 'Pending', value: 'pending' },
      ],
      onFilter: (value, record) => {
        const recordStatus = record.validation_status?.toLowerCase() || '';
        const filterValue = String(value).toLowerCase();
        return recordStatus === filterValue;
      },
    },
    {
      title: 'Deskripsi',
      dataIndex: 'validation_details',
      key: 'validation_details',
      render: (details: string) => {
        const formatted = formatValidationDetails(details);
        return (
          <div style={{ whiteSpace: 'pre-wrap', maxWidth: '300px' }}>
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
      title: 'Tanggal Validasi',
      dataIndex: 'validated_at',
      key: 'validated_at',
      render: (date: string) => dayjs(date).format('DD-MM-YYYY HH:mm:ss'),
      sorter: (a, b) =>
        new Date(a.validated_at).getTime() - new Date(b.validated_at).getTime(),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
        >
          Detail
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Title level={2}>
          <CheckCircleOutlined /> Validasi QC
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          Tambah Validasi
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '1.5rem' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Validasi"
              value={totalValidations}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Lulus"
              value={passedValidations}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Gagal"
              value={failedValidations}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Pending"
              value={pendingValidations}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={validations}
        loading={isLoading}
        rowKey="qc_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} validasi`,
        }}
      />

      {/* Create Modal */}
      <Modal
        title="Tambah Validasi QC"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={createMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Pilih Batch"
            name="batch_id"
            rules={[{ required: true, message: 'Batch wajib dipilih' }]}
          >
            <Select placeholder="Pilih batch" showSearch optionFilterProp="children">
              {batches?.map((batch) => (
                <Option key={batch.batch_id} value={batch.batch_id}>
                  Batch #{batch.batch_number} - {batch.operator_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Tipe Validasi"
            name="validation_type"
            rules={[{ required: true, message: 'Tipe validasi wajib dipilih' }]}
          >
            <Select placeholder="Pilih tipe validasi">
              <Option value="distribution_check">Distribution Check</Option>
              <Option value="box_composition">Box Composition</Option>
              <Option value="consecutive_check">Consecutive Check</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Status"
            name="validation_status"
            rules={[{ required: true, message: 'Status wajib dipilih' }]}
          >
            <Select placeholder="Pilih status">
              <Option value="pass">Lulus</Option>
              <Option value="fail">Gagal</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Deskripsi Validasi"
            name="validation_details"
          >
            <Input.TextArea
              rows={4}
              placeholder="Masukkan detail validasi (opsional)"
            />
          </Form.Item>
          <Form.Item
            label="Validated By"
            name="validated_by"
            rules={[{ required: true, message: 'Validated by wajib dipilih' }]}
            help={usersError ? 'Gagal memuat data users. Pastikan backend berjalan.' : undefined}
          >
            <Select 
              placeholder={usersLoading ? 'Loading...' : 'Pilih validator'} 
              showSearch
              optionFilterProp="children"
              loading={usersLoading}
              notFoundContent={
                usersLoading 
                  ? 'Loading...' 
                  : usersError 
                    ? 'Error memuat data' 
                    : users && users.length === 0
                      ? 'Tidak ada data user aktif'
                      : 'Tidak ada data'
              }
              disabled={usersLoading || !!usersError}
            >
              {users?.map((user) => (
                <Option key={user.user_id} value={user.full_name || user.username}>
                  {user.full_name || user.username} ({user.username}) - {user.role}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        title={`Detail Validasi QC #${viewingValidation?.qc_id}`}
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setViewingValidation(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setIsViewModalOpen(false);
            setViewingValidation(null);
          }}>
            Tutup
          </Button>,
        ]}
        width={700}
      >
        {viewingValidation && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Batch ID">
              #{viewingValidation.batch_id}
            </Descriptions.Item>
            <Descriptions.Item label="Tipe Validasi">
              <Tag color="purple">{viewingValidation.validation_type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {getStatusTag(viewingValidation.validation_status)}
            </Descriptions.Item>
            <Descriptions.Item label="Deskripsi Validasi">
              <div style={{ whiteSpace: 'pre-wrap', maxWidth: '600px' }}>
                {formatValidationDetails(viewingValidation.validation_details)}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Validated By">
              {viewingValidation.validated_by}
            </Descriptions.Item>
            <Descriptions.Item label="Tanggal Validasi">
              {dayjs(viewingValidation.validated_at).format('DD-MM-YYYY HH:mm:ss')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

