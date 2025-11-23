'use client';

import {
  Card,
  Typography,
  Table,
  Button,
  Space,
  Tag,
  Descriptions,
  Divider,
  message,
} from 'antd';
import {
  FileTextOutlined,
  ArrowLeftOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { batchesApi } from '@/lib/api/batches';
import { useRouter, useParams } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function BatchReportPage() {
  const params = useParams();
  const batchNumber = parseInt(params.batchNumber as string);
  const router = useRouter();

  // Fetch production report
  const { data: report, isLoading } = useQuery({
    queryKey: ['batch-report', batchNumber],
    queryFn: () => batchesApi.getReport(batchNumber),
    enabled: !!batchNumber,
  });

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

  // Format nominal dengan dot sebagai separator (sesuai soal)
  const formatNominal = (amount: number) => {
    if (amount === 0) return '0';
    return amount.toLocaleString('id-ID').replace(/,/g, '.');
  };

  // Prepare table data
  const tableData = report?.data?.coupons?.map((coupon, index) => ({
    key: index,
    box_number: coupon.box_number,
    coupon_number: coupon.coupon_number,
    prize_amount: coupon.prize_amount,
    prize_description: coupon.prize_description || '',
  })) || [];

  const columns: ColumnsType<any> = [
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
        if (amount === 0) {
          return <Text type="secondary">0</Text>;
        }
        return (
          <Text strong style={{ color: '#52c41a' }}>
            {formatNominal(amount)}
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
  ];

  const handlePrint = () => {
    window.print();
  };

  // Export tidak diperlukan karena tidak disebutkan di soal

  if (isLoading) {
    return (
      <div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          style={{ marginBottom: '1rem' }}
        >
          Kembali
        </Button>
        <Card>
          <div>Loading...</div>
        </Card>
      </div>
    );
  }

  if (!report || !report.data) {
    return (
      <div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          style={{ marginBottom: '1rem' }}
        >
          Kembali
        </Button>
        <Card>
          <div>Report tidak ditemukan</div>
        </Card>
      </div>
    );
  }

  const batchData = report.data;

  return (
    <div>
      <Space style={{ marginBottom: '1.5rem' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
        >
          Kembali
        </Button>
        <Button
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
        >
          Print
        </Button>
      </Space>

      <Card>
        {/* Header sesuai format soal */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Title level={3} style={{ marginBottom: '0.5rem' }}>
            <FileTextOutlined /> Laporan Produksi Per Batch
          </Title>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="No Batch">
              <strong>{batchData.batch_number}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Nama Operator">
              {batchData.operator_name}
            </Descriptions.Item>
            <Descriptions.Item label="Lokasi">
              {batchData.location}
            </Descriptions.Item>
            <Descriptions.Item label="Tanggal / Jam">
              {formatDate(batchData.production_date)}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />

        {/* Table sesuai format soal */}
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={{
            pageSize: 50,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} kupon`,
            pageSizeOptions: ['20', '50', '100', '200', '500', '1000', tableData ? String(tableData.length) : undefined].filter(Boolean) as string[],
            showQuickJumper: true,
          }}
          scroll={{ x: 'max-content' }}
          size="small"
        />


      </Card>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .ant-btn,
          .ant-space {
            display: none !important;
          }
          .ant-card {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}

