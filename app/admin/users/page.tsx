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
  Switch,
  message,
  Popconfirm,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';
import { User } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Option } = Select;

export default function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
    retry: 1,
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof usersApi.create>[0]) =>
      usersApi.create(data),
    onSuccess: () => {
      message.success('User berhasil dibuat');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || 'Gagal membuat user');
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({
      username,
      data,
    }: {
      username: string;
      data: Parameters<typeof usersApi.update>[1];
    }) => usersApi.update(username, data),
    onSuccess: () => {
      message.success('User berhasil diupdate');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      setEditingUser(null);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || 'Gagal mengupdate user');
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (username: string) => usersApi.delete(username),
    onSuccess: () => {
      message.success('User berhasil dinonaktifkan');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || 'Gagal menghapus user');
    },
  });

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (username: string) => {
    deleteMutation.mutate(username);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        updateMutation.mutate({
          username: editingUser.username,
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
    setEditingUser(null);
    form.resetFields();
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Nama Lengkap',
      dataIndex: 'full_name',
      key: 'full_name',
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => (a.email || '').localeCompare(b.email || ''),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const colorMap: Record<string, string> = {
          admin: 'red',
          operator: 'blue',
          qc_staff: 'orange',
        };
        return (
          <Tag color={colorMap[role] || 'default'}>
            {role.toUpperCase()}
          </Tag>
        );
      },
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Operator', value: 'operator' },
        { text: 'QC Staff', value: 'qc_staff' },
      ],
      onFilter: (value, record) => record.role === value,
      sorter: (a, b) => a.role.localeCompare(b.role),
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
            title="Nonaktifkan user ini?"
            description="User akan dinonaktifkan (soft delete)"
            onConfirm={() => handleDelete(record.username)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={!record.is_active}
            >
              Nonaktifkan
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
          <UserOutlined /> Manajemen User
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          Tambah User
        </Button>
      </div>

      {error && (
        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 4 }}>
          <Typography.Text type="danger">
            <strong>Error:</strong> {error instanceof Error ? error.message : 'Gagal memuat data users'}
            <br />
            <small>Pastikan backend berjalan di http://localhost:3000</small>
          </Typography.Text>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={users || []}
        loading={isLoading}
        rowKey="user_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} user`,
          pageSizeOptions: ['10', '20', '50', '100', users ? String(users.length) : undefined].filter(Boolean) as string[],
          showQuickJumper: true,
        }}
        locale={{
          emptyText: error ? 'Error memuat data' : 'Tidak ada data user',
        }}
      />

      <Modal
        title={editingUser ? 'Edit User' : 'Tambah User Baru'}
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
            role: 'operator',
          }}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: 'Username wajib diisi' },
              { min: 3, message: 'Username minimal 3 karakter' },
            ]}
          >
            <Input
              placeholder="Masukkan username"
              disabled={!!editingUser}
            />
          </Form.Item>

          <Form.Item
            label="Nama Lengkap"
            name="full_name"
            rules={[{ required: true, message: 'Nama lengkap wajib diisi' }]}
          >
            <Input placeholder="Masukkan nama lengkap" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { type: 'email', message: 'Email tidak valid' },
            ]}
          >
            <Input placeholder="Masukkan email (opsional)" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Role wajib dipilih' }]}
          >
            <Select placeholder="Pilih role">
              <Option value="admin">Admin</Option>
              <Option value="operator">Operator</Option>
              <Option value="qc_staff">QC Staff</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Status"
            name="is_active"
            valuePropName="checked"
          >
            <Switch checkedChildren="Aktif" unCheckedChildren="Nonaktif" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

