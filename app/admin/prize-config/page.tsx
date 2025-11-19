'use client';

import { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Typography,
  Modal,
  Form,
  InputNumber,
  Switch,
  message,
  Popconfirm,
  Tag,
  Card,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prizeConfigApi } from '@/lib/api/prizeConfig';
import { PrizeConfig } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

export default function PrizeConfigPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PrizeConfig | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch prize configs
  const { data: prizeConfigs, isLoading } = useQuery({
    queryKey: ['prize-configs'],
    queryFn: () => prizeConfigApi.getAll(),
  });

  // Create prize config mutation
  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof prizeConfigApi.create>[0]) =>
      prizeConfigApi.create(data),
    onSuccess: () => {
      message.success('Konfigurasi hadiah berhasil dibuat');
      queryClient.invalidateQueries({ queryKey: ['prize-configs'] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || 'Gagal membuat konfigurasi hadiah');
    },
  });

  // Update prize config mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Parameters<typeof prizeConfigApi.update>[1];
    }) => prizeConfigApi.update(id, data),
    onSuccess: () => {
      message.success('Konfigurasi hadiah berhasil diupdate');
      queryClient.invalidateQueries({ queryKey: ['prize-configs'] });
      setIsModalOpen(false);
      setEditingConfig(null);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || 'Gagal mengupdate konfigurasi hadiah');
    },
  });

  // Delete prize config mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => prizeConfigApi.delete(id),
    onSuccess: () => {
      message.success('Konfigurasi hadiah berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['prize-configs'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || 'Gagal menghapus konfigurasi hadiah');
    },
  });

  const handleAdd = () => {
    setEditingConfig(null);
    form.resetFields();
    form.setFieldsValue({
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (config: PrizeConfig) => {
    setEditingConfig(config);
    form.setFieldsValue({
      prize_amount: config.prize_amount,
      total_coupons: config.total_coupons,
      coupons_per_box: config.coupons_per_box,
      is_active: config.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingConfig) {
        updateMutation.mutate({
          id: editingConfig.config_id,
          data: values,
        });
      } else {
        createMutation.mutate(values);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingConfig(null);
    form.resetFields();
  };

  // Calculate statistics
  const activeConfigs = prizeConfigs?.filter((c) => c.is_active) || [];
  const totalCoupons = activeConfigs.reduce((sum, c) => sum + c.total_coupons, 0);
  const totalPrizeValue = activeConfigs.reduce(
    (sum, c) => sum + c.prize_amount * c.total_coupons,
    0
  );
  const totalWinners = activeConfigs.reduce((sum, c) => sum + c.total_coupons, 0);

  const columns: ColumnsType<PrizeConfig> = [
    {
      title: 'Nominal Hadiah',
      dataIndex: 'prize_amount',
      key: 'prize_amount',
      render: (amount: number) => (
        <strong style={{ color: '#52c41a' }}>
          Rp {amount.toLocaleString('id-ID')}
        </strong>
      ),
      sorter: (a, b) => a.prize_amount - b.prize_amount,
    },
    {
      title: 'Total Kupon',
      dataIndex: 'total_coupons',
      key: 'total_coupons',
      align: 'center',
      render: (total: number) => total.toLocaleString('id-ID'),
      sorter: (a, b) => a.total_coupons - b.total_coupons,
    },
    {
      title: 'Kupon per Box',
      dataIndex: 'coupons_per_box',
      key: 'coupons_per_box',
      align: 'center',
      render: (perBox: number) => perBox.toLocaleString('id-ID'),
      sorter: (a, b) => a.coupons_per_box - b.coupons_per_box,
    },
    {
      title: 'Total Nilai Hadiah',
      key: 'total_value',
      render: (_, record) => {
        const totalValue = record.prize_amount * record.total_coupons;
        return (
          <strong style={{ color: '#1890ff' }}>
            Rp {totalValue.toLocaleString('id-ID')}
          </strong>
        );
      },
      sorter: (a, b) =>
        a.prize_amount * a.total_coupons - b.prize_amount * b.total_coupons,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Aktif' : 'Nonaktif'}
        </Tag>
      ),
      filters: [
        { text: 'Aktif', value: true },
        { text: 'Nonaktif', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
      sorter: (a, b) => (a.is_active ? 1 : 0) - (b.is_active ? 1 : 0),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Hapus konfigurasi hadiah ini?"
            description="Konfigurasi hadiah akan dihapus permanen"
            onConfirm={() => handleDelete(record.config_id)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Title level={2}>
          <GiftOutlined /> Konfigurasi Hadiah
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          Tambah Konfigurasi
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '1.5rem' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Konfigurasi Aktif"
              value={activeConfigs.length}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Kupon Berhadiah"
              value={totalCoupons}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Nilai Hadiah"
              value={totalPrizeValue}
              prefix="Rp"
              precision={0}
              valueStyle={{ color: '#faad14' }}
              formatter={(value) => {
                if (typeof value === 'number') {
                  return value.toLocaleString('id-ID');
                }
                return value;
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Pemenang"
              value={totalWinners}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={prizeConfigs}
        loading={isLoading}
        rowKey="config_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} konfigurasi`,
          pageSizeOptions: ['10', '20', '50', '100', prizeConfigs ? String(prizeConfigs.length) : undefined].filter(Boolean) as string[],
          showQuickJumper: true,
        }}
      />

      <Modal
        title={editingConfig ? 'Edit Konfigurasi Hadiah' : 'Tambah Konfigurasi Hadiah Baru'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            is_active: true,
          }}
        >
          <Form.Item
            label="Nominal Hadiah (Rp)"
            name="prize_amount"
            rules={[
              { required: true, message: 'Nominal hadiah wajib diisi' },
              { type: 'number', min: 0, message: 'Nominal harus lebih dari 0' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Masukkan nominal hadiah"
              formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={(value) => value!.replace(/Rp\s?|(\.*)/g, '')}
              min={0}
              step={1000}
            />
          </Form.Item>

          <Form.Item
            label="Total Kupon"
            name="total_coupons"
            rules={[
              { required: true, message: 'Total kupon wajib diisi' },
              { type: 'number', min: 1, message: 'Total kupon minimal 1' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Masukkan total kupon"
              min={1}
            />
          </Form.Item>

          <Form.Item
            label="Kupon per Box"
            name="coupons_per_box"
            rules={[
              { required: true, message: 'Kupon per box wajib diisi' },
              { type: 'number', min: 1, message: 'Kupon per box minimal 1' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Masukkan jumlah kupon per box"
              min={1}
            />
          </Form.Item>

          <Form.Item
            label="Status"
            name="is_active"
            valuePropName="checked"
          >
            <Switch checkedChildren="Aktif" unCheckedChildren="Nonaktif" />
          </Form.Item>

          {editingConfig && (
            <Form.Item
              label="Info"
              help="Pastikan total_coupons habis dibagi dengan coupons_per_box untuk konsistensi distribusi per box"
            >
              <div style={{ padding: '0.5rem', background: '#f0f0f0', borderRadius: 4 }}>
                {form.getFieldValue('total_coupons') &&
                  form.getFieldValue('coupons_per_box') && (
                    <div>
                      <strong>Jumlah Box:</strong>{' '}
                      {Math.floor(
                        form.getFieldValue('total_coupons') /
                          form.getFieldValue('coupons_per_box')
                      )}{' '}
                      box
                      {form.getFieldValue('total_coupons') %
                        form.getFieldValue('coupons_per_box') !==
                        0 && (
                        <span style={{ color: '#ff4d4f', marginLeft: '0.5rem' }}>
                          (Sisa:{' '}
                          {form.getFieldValue('total_coupons') %
                            form.getFieldValue('coupons_per_box')}
                          )
                        </span>
                      )}
                    </div>
                  )}
              </div>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}

