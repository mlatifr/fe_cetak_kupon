'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Select,
  Button,
  Table,
  Space,
  message,
  Tag,
  Alert,
  Row,
  Col,
  Statistic,
  Descriptions,
  Divider,
} from 'antd';
import {
  PrinterOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  GiftOutlined,
  BoxPlotOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { batchesApi } from '@/lib/api/batches';
import { couponsApi } from '@/lib/api/coupons';
import { Coupon } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

export default function PrintPage() {
  const [selectedBatch, setSelectedBatch] = useState<number | undefined>(undefined);
  const [selectedBox, setSelectedBox] = useState<number | undefined>(undefined);

  // Fetch batches - tampilkan semua batch
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

  // Filter batch yang sudah punya kupon (prioritas utama)
  // Atau batch dengan status yang relevan untuk produksi
  const batches = allBatches?.filter(
    (batch) => 
      batchesWithCoupons.has(batch.batch_id) || // Batch yang sudah punya kupon
      (batch.status === 'pending' || 
       batch.status === 'in_progress' || 
       batch.status === 'completed' ||
       batch.status === 'qc_passed')
  );

  // Fetch coupons untuk batch dan box yang dipilih
  const { data: coupons, isLoading, error: couponsError } = useQuery({
    queryKey: ['coupons', selectedBatch, selectedBox],
    queryFn: () => {
      console.log('Fetching coupons for batch_id:', selectedBatch, 'box_number:', selectedBox);
      return couponsApi.getAll({
        batch_id: selectedBatch,
        box_number: selectedBox,
      });
    },
    enabled: !!selectedBatch && !!selectedBox,
  });

  // Debug logging
  useEffect(() => {
    if (selectedBatch && selectedBox) {
      console.log('Selected batch_id:', selectedBatch, 'box_number:', selectedBox);
    }
    if (coupons) {
      console.log('Coupons fetched:', coupons.length, 'coupons');
    }
    if (couponsError) {
      console.error('Error fetching coupons:', couponsError);
    }
  }, [selectedBatch, selectedBox, coupons, couponsError]);

  // Get batch info
  const selectedBatchInfo = batches?.find((b) => b.batch_id === selectedBatch);

  const handlePrint = () => {
    if (!selectedBatch || !selectedBox) {
      message.warning('Pilih batch dan box terlebih dahulu');
      return;
    }
    // Trigger browser print
    window.print();
    message.success(`Mencetak kupon Box ${selectedBox} untuk Batch ${selectedBatchInfo?.batch_number}`);
  };

  // Cek apakah batch ini punya kupon di box manapun
  const batchHasCoupons = allCoupons?.some((c) => c.batch_id === selectedBatch) || false;
  
  // Dapatkan box yang tersedia untuk batch yang dipilih
  const availableBoxes = selectedBatch
    ? Array.from(
        new Set(
          allCoupons
            ?.filter((c) => c.batch_id === selectedBatch)
            .map((c) => c.box_number)
            .sort((a, b) => a - b) || []
        )
      )
    : [];
  
  // Calculate statistics untuk box yang dipilih
  const totalCoupons = coupons?.length || 0;
  const winningCoupons = coupons?.filter((c: Coupon) => c.is_winner).length || 0;
  const totalPrizeValue = coupons?.reduce((sum: number, c: Coupon) => sum + (c.prize_amount || 0), 0) || 0;
  
  // Group by prize amount
  const prizeDistribution = coupons?.reduce((acc: Record<number, number>, coupon: Coupon) => {
    const amount = coupon.prize_amount;
    if (amount > 0) {
      acc[amount] = (acc[amount] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>) || {};

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
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Title level={2}>
          <PrinterOutlined /> Print Kupon
        </Title>
        <Text type="secondary">
          Pilih batch dan box untuk mencetak kupon. Setiap box berisi 1.000 kupon.
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '0.5rem' }}>
          <strong>Catatan:</strong> Pastikan kupon sudah di-generate terlebih dahulu di halaman{' '}
          <Link href="/admin/coupons" style={{ color: '#1890ff' }}>
            Admin → Generate Kupon
          </Link>
        </Text>
      </div>

      {/* Selection Card */}
      <Card title="Pilih Batch dan Box" style={{ marginBottom: '1.5rem' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Pilih Batch:
            </label>
            <Select
              placeholder="Pilih batch yang sudah di-generate kuponnya"
              style={{ width: '100%' }}
              onChange={(value) => {
                setSelectedBatch(value);
                setSelectedBox(undefined);
              }}
              value={selectedBatch}
              showSearch
              optionFilterProp="children"
              size="large"
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
          </div>

          {selectedBatch && selectedBatchInfo && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Pilih Box:
                {availableBoxes.length > 0 && (
                  <span style={{ fontSize: '12px', color: '#666', marginLeft: '0.5rem' }}>
                    (Tersedia: Box {availableBoxes.join(', ')})
                  </span>
                )}
              </label>
              <Select
                placeholder={
                  availableBoxes.length > 0
                    ? `Pilih box yang akan di-print (Box ${availableBoxes.join(', ')})`
                    : 'Tidak ada box tersedia untuk batch ini'
                }
                style={{ width: '100%' }}
                onChange={setSelectedBox}
                value={selectedBox}
                size="large"
                disabled={availableBoxes.length === 0}
              >
                {availableBoxes.length > 0 ? (
                  availableBoxes.map((boxNum) => {
                    const boxCoupons = allCoupons?.filter(
                      (c) => c.batch_id === selectedBatch && c.box_number === boxNum
                    ).length || 0;
                    return (
                      <Option key={boxNum} value={boxNum}>
                        Box {boxNum} (Kupon {((boxNum - 1) * 1000 + 1).toString().padStart(5, '0')} - {(boxNum * 1000).toString().padStart(5, '0')})
                        {boxCoupons > 0 && ` - ${boxCoupons} kupon`}
                      </Option>
                    );
                  })
                ) : (
                  <Option disabled value={0}>
                    Tidak ada box tersedia
                  </Option>
                )}
              </Select>
              {availableBoxes.length === 0 && batchHasCoupons && (
                <div style={{ marginTop: '0.5rem', fontSize: '12px', color: '#faad14' }}>
                  ⚠️ Batch ini sudah punya kupon, tapi tidak ada box yang tersedia. Cek data kupon di halaman Admin.
                </div>
              )}
            </div>
          )}

          {selectedBatch && selectedBox && (
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              size="large"
              block
              style={{ marginTop: '1rem' }}
            >
              Print Kupon Box {selectedBox}
            </Button>
          )}
        </Space>
      </Card>

      {!selectedBatch && (
        <Alert
          message="Pilih Batch"
          description="Silakan pilih batch terlebih dahulu"
          type="info"
          showIcon
          style={{ marginBottom: '1rem' }}
        />
      )}

      {selectedBatch && !selectedBox && (
        <Alert
          message="Pilih Box"
          description="Silakan pilih box yang akan di-print"
          type="info"
          showIcon
          style={{ marginBottom: '1rem' }}
        />
      )}

      {selectedBatch && selectedBatchInfo && (
        <Card title="Informasi Batch" style={{ marginBottom: '1.5rem' }}>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="No Batch">
              <strong>#{selectedBatchInfo.batch_number}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Operator">
              {selectedBatchInfo.operator_name}
            </Descriptions.Item>
            <Descriptions.Item label="Lokasi">
              {selectedBatchInfo.location}
            </Descriptions.Item>
            <Descriptions.Item label="Tanggal Produksi">
              {dayjs(selectedBatchInfo.production_date).format('DD-MM-YYYY HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Alert jika kupon belum di-generate untuk batch */}
      {selectedBatch && selectedBox && !batchHasCoupons && totalCoupons === 0 && !isLoading && (
        <Alert
          message="Kupon Belum Di-generate"
          description={
            <div>
              <p>Kupon untuk batch ini belum di-generate. Silakan generate kupon terlebih dahulu di halaman Admin.</p>
              <Link href="/admin/coupons">
                <Button type="link" icon={<PlusOutlined />} style={{ padding: 0, marginTop: '0.5rem' }}>
                  Generate Kupon di Halaman Admin
                </Button>
              </Link>
            </div>
          }
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          style={{ marginBottom: '1.5rem' }}
        />
      )}

      {/* Alert jika tidak ada kupon untuk box yang dipilih (tapi batch sudah punya kupon) */}
      {selectedBatch && selectedBox && batchHasCoupons && totalCoupons === 0 && !isLoading && (
        <Alert
          message="Tidak Ada Kupon untuk Box Ini"
          description={
            <div>
              <p>
                Batch ini sudah memiliki kupon, tetapi tidak ada kupon untuk Box {selectedBox}. 
                Silakan pilih box lain yang memiliki kupon.
              </p>
              <p style={{ fontSize: '12px', marginTop: '0.5rem', color: '#666' }}>
                Tip: Cek box lain (1-10) untuk melihat kupon yang tersedia.
              </p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: '1.5rem' }}
        />
      )}

      {/* Error message */}
      {couponsError && (
        <Alert
          message="Error"
          description={
            <div>
              <p>Gagal memuat data kupon: {couponsError instanceof Error ? couponsError.message : 'Unknown error'}</p>
              <p style={{ fontSize: '12px', marginTop: '0.5rem', color: '#666' }}>
                Pastikan backend berjalan dan kupon sudah di-generate untuk batch ini.
              </p>
            </div>
          }
          type="error"
          showIcon
          style={{ marginBottom: '1.5rem' }}
        />
      )}

      {selectedBatch && selectedBox && (
        <>
          {/* Statistics */}
          <Row gutter={[16, 16]} style={{ marginBottom: '1.5rem' }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Total Kupon"
                  value={totalCoupons}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                  loading={isLoading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Kupon Berhadiah"
                  value={winningCoupons}
                  prefix={<GiftOutlined />}
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

          {/* Prize Distribution */}
          {Object.keys(prizeDistribution).length > 0 && (
            <Card title="Distribusi Hadiah di Box Ini" style={{ marginBottom: '1.5rem' }}>
              <Row gutter={[16, 16]}>
                {Object.entries(prizeDistribution)
                  .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                  .map(([amount, count]) => (
                    <Col xs={12} sm={8} md={6} key={amount}>
                      <Card size="small">
                        <Statistic
                          title={`Rp ${parseInt(amount).toLocaleString('id-ID')}`}
                          value={count as number}
                          prefix={<GiftOutlined />}
                          valueStyle={{ fontSize: '18px' }}
                        />
                      </Card>
                    </Col>
                  ))}
              </Row>
            </Card>
          )}

          {/* Preview Table */}
          <Card
            title={
              <Space>
                <BoxPlotOutlined />
                <span>Preview Kupon Box {selectedBox}</span>
                <Tag color="blue">Total: {totalCoupons} kupon</Tag>
                <Tag color="green">Berhadiah: {winningCoupons} kupon</Tag>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={coupons || []}
              loading={isLoading}
              rowKey="coupon_id"
              pagination={{
                pageSize: 50,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} kupon`,
                pageSizeOptions: ['20', '50', '100', '200', '500', '1000'],
                showQuickJumper: true,
              }}
              size="small"
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .ant-btn,
          .ant-space:has(.ant-btn),
          .ant-select,
          .ant-alert {
            display: none !important;
          }
          .ant-card {
            box-shadow: none !important;
            border: 1px solid #d9d9d9 !important;
            page-break-inside: avoid;
          }
          .ant-table {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}

