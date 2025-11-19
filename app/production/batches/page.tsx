'use client';

import { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Tag,
  Card,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { batchesApi } from '@/lib/api/batches';
import { usersApi } from '@/lib/api/users';
import { Batch } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

export default function ProductionBatchesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch batches
  const { data: batches, isLoading } = useQuery({
    queryKey: ['batches'],
    queryFn: () => batchesApi.getAll(),
  });

  // Fetch users untuk dropdown operator
  const { data: users } = useQuery({
    queryKey: ['users', 'operator'],
    queryFn: () => usersApi.getAll({ role: 'operator' }),
  });

  // Create batch mutation
  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof batchesApi.create>[0]) =>
      batchesApi.create(data),
    onSuccess: () => {
      message.success('Batch berhasil dibuat');
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || 'Gagal membuat batch');
    },
  });

  // Update batch mutation
  const updateMutation = useMutation({
    mutationFn: ({
      batchNumber,
      data,
    }: {
      batchNumber: number;
      data: Parameters<typeof batchesApi.update>[1];
    }) => batchesApi.update(batchNumber, data),
    onSuccess: () => {
      message.success('Batch berhasil diupdate');
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setIsModalOpen(false);
      setEditingBatch(null);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || 'Gagal mengupdate batch');
    },
  });

  const handleAdd = () => {
    setEditingBatch(null);
    form.resetFields();
    form.setFieldsValue({
      total_boxes: 5,
      status: 'pending',
      production_date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    });
    setIsModalOpen(true);
  };

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch);
    form.setFieldsValue({
      batch_number: batch.batch_number,
      operator_name: batch.operator_name,
      location: batch.location,
      production_date: dayjs(batch.production_date).format('YYYY-MM-DD HH:mm:ss'),
      total_boxes: batch.total_boxes,
      status: batch.status,
      operator_id: batch.operator_id,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingBatch) {
        updateMutation.mutate({
          batchNumber: editingBatch.batch_number,
          data: values,
        });
      } else {
        createMutation.mutate(values);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

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
  const pendingBatches = batches?.filter((b) => b.status === 'pending').length || 0;
  const inProgressBatches = batches?.filter((b) => b.status === 'in_progress').length || 0;
  const completedBatches = batches?.filter((b) => b.status === 'completed').length || 0;

  const columns: ColumnsType<Batch> = [
    {
      title: 'No Batch',
      dataIndex: 'batch_number',
      key: 'batch_number',
      render: (batchNumber: number) => <strong>#{batchNumber}</strong>,
      sorter: (a, b) => a.batch_number - b.batch_number,
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
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Link href={`/production/batches/${record.batch_number}/report`}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Title level={2}>
          <FileTextOutlined /> Kelola Batch
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          Buat Batch Baru
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '1.5rem' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Batch"
              value={totalBatches}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Pending"
              value={pendingBatches}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Sedang Diproses"
              value={inProgressBatches}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Selesai"
              value={completedBatches}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

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

      <Modal
        title={editingBatch ? 'Edit Batch' : 'Buat Batch Baru'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingBatch(null);
          form.resetFields();
        }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical">
          {!editingBatch && (
            <Form.Item
              label="No Batch"
              name="batch_number"
              rules={[{ required: true, message: 'No batch wajib diisi' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Masukkan nomor batch"
                min={1}
              />
            </Form.Item>
          )}
          <Form.Item
            label="Nama Operator"
            name="operator_name"
            rules={[{ required: true, message: 'Nama operator wajib diisi' }]}
          >
            <Input placeholder="Masukkan nama operator" />
          </Form.Item>
          <Form.Item
            label="Lokasi"
            name="location"
            rules={[{ required: true, message: 'Lokasi wajib diisi' }]}
          >
            <Input placeholder="Masukkan lokasi produksi" />
          </Form.Item>
          <Form.Item
            label="Tanggal Produksi"
            name="production_date"
            rules={[{ required: true, message: 'Tanggal produksi wajib diisi' }]}
          >
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item
            label="Total Box"
            name="total_boxes"
            rules={[{ required: true, message: 'Total box wajib diisi' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Masukkan total box"
              min={1}
            />
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Status wajib dipilih' }]}
          >
            <Select placeholder="Pilih status">
              <Option value="pending">Pending</Option>
              <Option value="in_progress">Sedang Diproses</Option>
              <Option value="completed">Selesai</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Operator ID (User ID)"
            name="operator_id"
            help="Opsional: ID user operator"
          >
            <Select placeholder="Pilih operator" allowClear>
              {users?.map((user) => (
                <Option key={user.user_id} value={user.user_id}>
                  {user.full_name} ({user.username})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

