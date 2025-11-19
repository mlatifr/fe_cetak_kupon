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
  message,
  Card,
  Statistic,
  Row,
  Col,
  Input,
  Tag,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponsApi } from '@/lib/api/coupons';
import { batchesApi } from '@/lib/api/batches';
import { Coupon } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

export default function CouponsPage() {
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [batchFilter, setBatchFilter] = useState<number | undefined>(undefined);
  const [searchText, setSearchText] = useState<string>('');

  // Fetch semua batches untuk dropdown (tidak hanya pending, karena batch yang sudah di-generate mungkin statusnya sudah berubah)
  const { data: allBatches } = useQuery({
    queryKey: ['batches'],
    queryFn: () => batchesApi.getAll(),
  });

  // Fetch semua kupon untuk mengetahui batch mana yang sudah punya kupon
  const { data: allCoupons } = useQuery({
    queryKey: ['coupons', 'all'],
    queryFn: () => couponsApi.getAll(), // Fetch semua kupon tanpa filter
  });

  // Dapatkan batch_id yang sudah punya kupon
  const batchesWithCoupons = new Set(
    allCoupons?.map((coupon) => coupon.batch_id).filter((id) => id != null) || []
  );

  // Filter batch yang sudah punya kupon atau status pending (untuk generate baru)
  const batches = allBatches?.filter(
    (batch) => batchesWithCoupons.has(batch.batch_id) || batch.status === 'pending'
  );

  // Fetch coupons untuk batch yang dipilih
  const { data: coupons, isLoading, error } = useQuery({
    queryKey: ['coupons', batchFilter],
    queryFn: async () => {
      try {
        const result = await couponsApi.getAll({ batch_id: batchFilter });
        console.log('Coupons fetched for batch', batchFilter, ':', result);
        // Pastikan result adalah array, bukan null atau undefined
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error('Error fetching coupons:', err);
        throw err;
      }
    },
    enabled: !!batchFilter,
  });

  // Generate coupons mutation
  const generateMutation = useMutation({
    mutationFn: (data: { batch_id: number; generated_by?: number }) =>
      couponsApi.generate(data),
    onSuccess: (data) => {
      message.success(`Berhasil generate ${data.totalCoupons} kupon untuk batch ${data.batch_id}`);
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      setIsGenerateModalOpen(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || 'Gagal generate kupon');
    },
  });

  const handleGenerate = async () => {
    try {
      const values = await form.validateFields();
      generateMutation.mutate({
        batch_id: values.batch_id,
        generated_by: values.generated_by,
      });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // Filter coupons berdasarkan search text
  const filteredCoupons = coupons?.filter((coupon) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      coupon.coupon_number?.toLowerCase().includes(searchLower) ||
      coupon.prize_description?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Statistics
  const totalCoupons = coupons?.length || 0;
  const winningCoupons = coupons?.filter((c) => c.is_winner).length || 0;
  const totalPrizeValue = coupons?.reduce((sum, c) => sum + (c.prize_amount || 0), 0) || 0;

  const columns: ColumnsType<Coupon> = [
    {
      title: 'No Kupon',
      dataIndex: 'coupon_number',
      key: 'coupon_number',
      render: (number: string) => <strong>{number}</strong>,
      sorter: (a, b) => a.coupon_number.localeCompare(b.coupon_number),
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: 'Box',
      dataIndex: 'box_number',
      key: 'box_number',
      align: 'center',
      sorter: (a, b) => a.box_number - b.box_number,
    },
    {
      title: 'Nominal Hadiah',
      dataIndex: 'prize_amount',
      key: 'prize_amount',
      render: (amount: number) => {
        if (amount === 0) {
          return <Tag color="default">Tidak Beruntung</Tag>;
        }
        return (
          <strong style={{ color: '#52c41a' }}>
            Rp {amount.toLocaleString('id-ID')}
          </strong>
        );
      },
      sorter: (a, b) => a.prize_amount - b.prize_amount,
    },
    {
      title: 'Keterangan',
      dataIndex: 'prize_description',
      key: 'prize_description',
      render: (desc: string) => desc || '-',
      sorter: (a, b) => (a.prize_description || '').localeCompare(b.prize_description || ''),
    },
    {
      title: 'Status',
      dataIndex: 'is_winner',
      key: 'is_winner',
      render: (isWinner: boolean) => (
        <Tag color={isWinner ? 'green' : 'default'}>
          {isWinner ? 'Berhadiah' : 'Tidak Beruntung'}
        </Tag>
      ),
      filters: [
        { text: 'Berhadiah', value: true },
        { text: 'Tidak Beruntung', value: false },
      ],
      onFilter: (value, record) => record.is_winner === value,
      sorter: (a, b) => (a.is_winner ? 1 : 0) - (b.is_winner ? 1 : 0),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Title level={2}>
          <FileTextOutlined /> Generate Kupon
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsGenerateModalOpen(true)}
          size="large"
        >
          Generate Kupon
        </Button>
      </div>

      {/* Statistics */}
      {batchFilter && coupons && (
        <Row gutter={[16, 16]} style={{ marginBottom: '1.5rem' }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Kupon"
                value={totalCoupons}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Kupon Berhadiah"
                value={winningCoupons}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
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
        </Row>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: '1rem' }}>
        <Space size="middle" wrap>
          <Select
            placeholder="Pilih Batch"
            allowClear
            style={{ width: 300 }}
            onChange={(value) => setBatchFilter(value)}
            value={batchFilter}
            showSearch
            optionFilterProp="children"
          >
            {batches?.map((batch) => {
              const hasCoupons = batchesWithCoupons.has(batch.batch_id);
              const couponCount = allCoupons?.filter((c) => c.batch_id === batch.batch_id).length || 0;
              return (
                <Option key={batch.batch_id} value={batch.batch_id}>
                  Batch #{batch.batch_number} - {batch.operator_name} ({batch.location})
                  {hasCoupons && ` - ${couponCount.toLocaleString('id-ID')} kupon`}
                </Option>
              );
            })}
          </Select>
          {batchFilter && (
            <>
              <Search
                placeholder="Cari nomor kupon atau keterangan"
                allowClear
                style={{ width: 300 }}
                onSearch={setSearchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={() => queryClient.invalidateQueries({ queryKey: ['coupons'] })}
              >
                Refresh
              </Button>
            </>
          )}
        </Space>
      </Card>

      {/* Alert jika belum pilih batch */}
      {!batchFilter && (
        <Alert
          message="Pilih Batch"
          description="Silakan pilih batch terlebih dahulu untuk melihat kupon"
          type="info"
          showIcon
          style={{ marginBottom: '1rem' }}
        />
      )}

      {/* Error message */}
      {error && (
        <Alert
          message="Error"
          description={error instanceof Error ? error.message : 'Gagal memuat data kupon'}
          type="error"
          showIcon
          style={{ marginBottom: '1rem' }}
        />
      )}

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredCoupons}
        loading={isLoading}
        rowKey="coupon_id"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} kupon`,
          pageSizeOptions: ['20', '50', '100', '200', '500', '1000'],
          showQuickJumper: true,
        }}
        locale={{
          emptyText: batchFilter
            ? error
              ? `Error memuat data: ${error instanceof Error ? error.message : 'Unknown error'}`
              : coupons === null || coupons === undefined
              ? 'Data kupon null - cek console untuk detail'
              : coupons.length === 0
              ? 'Tidak ada data kupon untuk batch ini'
              : 'Tidak ada data kupon'
            : 'Pilih batch untuk melihat kupon',
        }}
      />

      {/* Generate Modal */}
      <Modal
        title="Generate Kupon untuk Batch"
        open={isGenerateModalOpen}
        onOk={handleGenerate}
        onCancel={() => {
          setIsGenerateModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={generateMutation.isPending}
        width={600}
      >
        <Alert
          message="Perhatian"
          description="Generate kupon akan membuat 10.000 kupon dengan distribusi hadiah sesuai konfigurasi. Pastikan batch sudah dibuat terlebih dahulu."
          type="warning"
          showIcon
          style={{ marginBottom: '1rem' }}
        />
        <Form form={form} layout="vertical">
          <Form.Item
            label="Pilih Batch"
            name="batch_id"
            rules={[{ required: true, message: 'Batch wajib dipilih' }]}
          >
            <Select
              placeholder="Pilih batch"
              showSearch
              optionFilterProp="children"
            >
              {batches?.map((batch) => (
                <Option key={batch.batch_id} value={batch.batch_id}>
                  Batch #{batch.batch_number} - {batch.operator_name} ({batch.location})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Generated By (User ID)"
            name="generated_by"
            help="Opsional: ID user yang melakukan generate"
          >
            <Select placeholder="Pilih user (opsional)" allowClear>
              {/* TODO: Fetch users jika diperlukan */}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

