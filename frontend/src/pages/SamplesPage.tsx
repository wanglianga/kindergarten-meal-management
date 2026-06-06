import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  DatePicker,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
  Image,
  TimePicker,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { samples } from '@/api';
import type { Sample, CreateSampleDto } from '@/api';
import { useUser } from '@/context/UserContext';

const SamplesPage: React.FC = () => {
  const { hasRole } = useUser();
  const isLogistics = hasRole('logistics');

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Sample[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filterDate, setFilterDate] = useState<Dayjs | null>(null);
  const [filterStatus, setFilterStatus] = useState<'stored' | 'destroyed' | undefined>(undefined);

  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<{
    sampleBoxNumber: string;
    date: Dayjs;
    mealType: string;
    dishName: string;
    sampleTime: Dayjs;
    sampler: string;
    photo: string;
  }>();

  const fetchList = async () => {
    setLoading(true);
    try {
      const params: { page: number; pageSize: number; date?: string; status?: string } = {
        page,
        pageSize,
      };
      if (filterDate) {
        params.date = filterDate.format('YYYY-MM-DD');
      }
      if (filterStatus) {
        params.status = filterStatus;
      }
      const result = await samples.list(params);
      setData(result.list || result.items || result.data || []);
      setTotal(result.total || 0);
    } catch (e: any) {
      message.error(e?.message || '获取留样列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page, pageSize]);

  const handleSearch = () => {
    setPage(1);
    fetchList();
  };

  const handleReset = () => {
    setFilterDate(null);
    setFilterStatus(undefined);
    setPage(1);
    setTimeout(fetchList, 0);
  };

  const handleAdd = () => {
    form.resetFields();
    setModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const submitData: CreateSampleDto = {
        sampleBoxNumber: values.sampleBoxNumber,
        date: values.date.format('YYYY-MM-DD'),
        mealType: values.mealType,
        dishName: values.dishName,
        sampleTime: values.sampleTime.format('HH:mm'),
        sampler: values.sampler,
        photo: values.photo,
      };
      await samples.create(submitData);
      message.success('新增留样成功');
      setModalOpen(false);
      fetchList();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.message || '新增留样失败');
    }
  };

  const handleDestroy = async (id: number) => {
    try {
      await samples.destroy(id);
      message.success('销毁成功');
      fetchList();
    } catch (e: any) {
      message.error(e?.message || '销毁失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await samples.remove(id);
      message.success('删除成功');
      fetchList();
    } catch (e: any) {
      message.error(e?.message || '删除失败');
    }
  };

  const columns: ColumnsType<Sample> = [
    {
      title: '留样盒编号',
      dataIndex: 'sampleBoxNumber',
      key: 'sampleBoxNumber',
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '餐次',
      dataIndex: 'mealType',
      key: 'mealType',
      render: (val: string) => {
        const map: Record<string, string> = {
          breakfast: '早餐',
          lunch: '午餐',
          dinner: '晚餐',
        };
        return map[val] || val;
      },
    },
    {
      title: '菜品名称',
      dataIndex: 'dishName',
      key: 'dishName',
    },
    {
      title: '留样时间',
      dataIndex: 'sampleTime',
      key: 'sampleTime',
    },
    {
      title: '留样人',
      dataIndex: 'sampler',
      key: 'sampler',
    },
    {
      title: '照片',
      dataIndex: 'photo',
      key: 'photo',
      render: (photo: string) =>
        photo ? (
          <Image
            width={50}
            height={50}
            src={photo}
            style={{ objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          '-'
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) =>
        status === 'stored' ? (
          <Tag color="green">已留样</Tag>
        ) : (
          <Tag color="default">已销毁</Tag>
        ),
    },
  ];

  if (isLogistics) {
    columns.push({
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'stored' && (
            <Popconfirm
              title="确认销毁该留样？"
              description="销毁后无法恢复"
              onConfirm={() => handleDestroy(record.id)}
              okText="确认"
              cancelText="取消"
            >
              <Button size="small" danger>
                销毁
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="确认删除该留样记录？"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    });
  }

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Space wrap>
          <DatePicker
            value={filterDate}
            onChange={(val) => setFilterDate(val)}
            placeholder="选择日期"
            allowClear
          />
          <Select
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
            placeholder="选择状态"
            style={{ width: 140 }}
            allowClear
            options={[
              { label: '已留样', value: 'stored' },
              { label: '已销毁', value: 'destroyed' },
            ]}
          />
          <Button type="primary" onClick={handleSearch}>
            查询
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </Space>
        {isLogistics && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增留样
          </Button>
        )}
      </div>

      <Table<Sample>
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={columns}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
        rowClassName={(record) =>
          record.status === 'destroyed' ? 'sample-row-destroyed' : ''
        }
      />

      <style>
        {`
          .sample-row-destroyed > td {
            background-color: #f5f5f5 !important;
          }
          .sample-row-destroyed:hover > td {
            background-color: #eeeeee !important;
          }
        `}
      </style>

      <Modal
        title="新增留样"
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        okText="确认"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            label="留样盒编号"
            name="sampleBoxNumber"
            rules={[{ required: true, message: '请输入留样盒编号' }]}
          >
            <Input placeholder="请输入留样盒编号" />
          </Form.Item>
          <Form.Item
            label="日期"
            name="date"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择日期" />
          </Form.Item>
          <Form.Item
            label="餐次"
            name="mealType"
            rules={[{ required: true, message: '请选择餐次' }]}
          >
            <Select
              placeholder="请选择餐次"
              options={[
                { label: '早餐', value: 'breakfast' },
                { label: '午餐', value: 'lunch' },
                { label: '晚餐', value: 'dinner' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="菜品名称"
            name="dishName"
            rules={[{ required: true, message: '请输入菜品名称' }]}
          >
            <Input placeholder="请输入菜品名称" />
          </Form.Item>
          <Form.Item
            label="留样时间"
            name="sampleTime"
            rules={[{ required: true, message: '请选择留样时间' }]}
          >
            <TimePicker style={{ width: '100%' }} format="HH:mm" placeholder="请选择留样时间" />
          </Form.Item>
          <Form.Item
            label="留样人"
            name="sampler"
            rules={[{ required: true, message: '请输入留样人' }]}
          >
            <Input placeholder="请输入留样人" />
          </Form.Item>
          <Form.Item
            label="照片 URL"
            name="photo"
            rules={[{ required: true, message: '请输入照片 URL' }]}
          >
            <Input placeholder="请输入照片 URL" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SamplesPage;

