'use client';

import { useState } from 'react';
import {
  Table,
  Typography,
  Select,
  Card,
  Space,
  Tag,
  Input,
} from 'antd';
import {
  HistoryOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { productionLogsApi } from '@/lib/api/productionLogs';
import { batchesApi } from '@/lib/api/batches';
import { ProductionLog } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

export default function ProductionLogsPage() {
  const [batchFilter, setBatchFilter] = useState<number | undefined>(undefined);
  const [actionTypeFilter, setActionTypeFilter] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string>('');

  // Fetch batches untuk filter
  const { data: batches } = useQuery({
    queryKey: ['batches'],
    queryFn: () => batchesApi.getAll(),
  });

  // Fetch production logs
  const { data: logs, isLoading } = useQuery({
    queryKey: ['production-logs', batchFilter, actionTypeFilter],
    queryFn: () =>
      productionLogsApi.getAll({
        batch_id: batchFilter,
        action_type: actionTypeFilter,
      }),
  });

  // Filter logs berdasarkan search text
  const filteredLogs = logs?.filter((log) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      log.operator_name.toLowerCase().includes(searchLower) ||
      log.location.toLowerCase().includes(searchLower) ||
      log.action_type.toLowerCase().includes(searchLower) ||
      (log.action_description || '').toLowerCase().includes(searchLower)
    );
  });

  const columns: ColumnsType<ProductionLog> = [
    {
      title: 'Waktu',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date: string) => dayjs(date).format('DD-MM-YYYY HH:mm:ss'),
      sorter: (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Batch ID',
      dataIndex: 'batch_id',
      key: 'batch_id',
      render: (batchId: number) => (
        <Tag color="blue">#{batchId}</Tag>
      ),
    },
    {
      title: 'Action Type',
      dataIndex: 'action_type',
      key: 'action_type',
      render: (type: string) => (
        <Tag color="purple">{type}</Tag>
      ),
    },
    {
      title: 'Deskripsi',
      dataIndex: 'action_description',
      key: 'action_description',
      render: (desc: string) => desc || '-',
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
  ];

  return (
    <div>
      <Title level={2}>
        <HistoryOutlined /> Production Logs
      </Title>

      {/* Filters */}
      <Card style={{ marginBottom: '1rem' }}>
        <Space size="middle" wrap>
          <Select
            placeholder="Filter Batch"
            allowClear
            style={{ width: 250 }}
            onChange={setBatchFilter}
            value={batchFilter}
            showSearch
            optionFilterProp="children"
          >
            {batches?.map((batch) => (
              <Option key={batch.batch_id} value={batch.batch_id}>
                Batch #{batch.batch_number} - {batch.operator_name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Filter Action Type"
            allowClear
            style={{ width: 200 }}
            onChange={setActionTypeFilter}
            value={actionTypeFilter}
          >
            <Option value="GENERATE">GENERATE</Option>
            <Option value="PRINT">PRINT</Option>
            <Option value="QC_CHECK">QC_CHECK</Option>
            <Option value="UPDATE">UPDATE</Option>
          </Select>
          <Search
            placeholder="Cari operator, lokasi, atau action"
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Space>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredLogs || []}
        loading={isLoading}
        rowKey="log_id"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} log`,
        }}
      />
    </div>
  );
}

