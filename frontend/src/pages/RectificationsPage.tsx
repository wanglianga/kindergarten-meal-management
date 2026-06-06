import React, { useEffect, useState } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Select,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Modal,
  Popconfirm,
  message,
  Typography,
  Card,
  Statistic,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useUser } from '@/context/UserContext';
import { rectifications } from '@/api';
import type { Rectification, CreateRectificationDto } from '@/api';

const { Title } = Typography;
const { TextArea } = Input;

type AlertType = 'allergy' | 'sample_expired' | 'batch_expired' | 'negative_review';
type RectStatus = 'pending' | 'processing' | 'completed';

const ALERT_TYPE_OPTIONS: { value: AlertType; label: string }[] = [
  { value: 'allergy', label: '过敏风险' },
  { value: 'sample_expired', label: '留样过期' },
  { value: 'batch_expired', label: '食材过期' },
  { value: 'negative_review', label: '负面评价' },
];

const STATUS_OPTIONS: { value: RectStatus; label: string }[] = [
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'completed', label: '已完成' },
];

const getAlertTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    allergy: '过敏风险',
    sample_expired: '留样过期',
    batch_expired: '食材过期',
    negative_review: '负面评价',
  };
  return map[type] || type;
};

const getAlertTypeColor = (type: string): string => {
  const map: Record<string, string> = {
    allergy: 'red',
    sample_expired: 'orange',
    batch_expired: 'gold',
    negative_review: 'magenta',
  };
  return map[type] || 'default';
};

const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
  };
  return map[status] || status;
};

const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    pending: 'orange',
    processing: 'blue',
    completed: 'green',
  };
  return map[status] || 'default';
};

interface FormData extends Omit<CreateRectificationDto, 'deadline' | 'completedDate'> {
  deadline?: Dayjs;
  completedDate?: Dayjs;
}

const RectificationsPage: React.FC = () => {
  const { hasRole } = useUser();
  const canEdit = hasRole('logistics');

  const [list, setList] = useState<Rectification[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [alertTypeFilter, setAlertTypeFilter] = useState<string | undefined>(undefined);
  const [appliedStatus, setAppliedStatus] = useState<string | undefined>(undefined);
  const [appliedAlertType, setAppliedAlertType] = useState<string | undefined>(undefined);

  const [pendingCount, setPendingCount] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Rectification | null>(null);
  const [form] = Form.useForm<FormData>();
  const [formStatus, setFormStatus] = useState<RectStatus>('pending');

  const fetchList = async () => {
    try {
      setLoading(true);
      const params: { page: number; pageSize: number; status?: string; alertType?: string } = {
        page,
        pageSize,
      };
      if (appliedStatus) params.status = appliedStatus;
      if (appliedAlertType) params.alertType = appliedAlertType;
      const result = await rectifications.list(params);
      const data = result.list || result.items || result.data || [];
      setList(Array.isArray(data) ? data : []);
      setTotal(result.total || 0);
    } catch (error) {
      message.error('获取整改单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const result = await rectifications.getPendingCount();
      setPendingCount(result.count ?? 0);
    } catch (error) {
      console.error('获取待处理整改数失败', error);
    }
  };

  useEffect(() => {
    fetchList();
    fetchPendingCount();
  }, [page, pageSize]);

  const handleSearch = () => {
    setAppliedStatus(statusFilter);
    setAppliedAlertType(alertTypeFilter);
    setPage(1);
  };

  const handleReset = () => {
    setStatusFilter(undefined);
    setAlertTypeFilter(undefined);
    setAppliedStatus(undefined);
    setAppliedAlertType(undefined);
    setPage(1);
  };

  useEffect(() => {
    if (page === 1) {
      fetchList();
    }
  }, [appliedStatus, appliedAlertType]);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ status: 'pending' });
    setFormStatus('pending');
    setModalVisible(true);
  };

  const handleOpenEdit = (record: Rectification) => {
    setEditingRecord(record);
    form.setFieldsValue({
      alertType: record.alertType as AlertType,
      relatedId: record.relatedId,
      problemType: record.problemType,
      description: record.description,
      measures: record.measures,
      status: record.status as RectStatus,
      deadline: record.deadline ? dayjs(record.deadline) : undefined,
      completedDate: record.completedDate ? dayjs(record.completedDate) : undefined,
      handler: record.handler,
      resultPhoto: record.resultPhoto,
    });
    setFormStatus(record.status as RectStatus);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData: CreateRectificationDto = {
        alertType: values.alertType,
        relatedId: values.relatedId,
        problemType: values.problemType,
        description: values.description,
        measures: values.measures,
        status: values.status,
        deadline: values.deadline ? dayjs(values.deadline).format('YYYY-MM-DD') : undefined,
        completedDate: values.completedDate ? dayjs(values.completedDate).format('YYYY-MM-DD') : undefined,
        handler: values.handler,
        resultPhoto: values.resultPhoto,
      };
      if (editingRecord) {
        await rectifications.update(editingRecord.id, submitData);
        message.success('更新成功');
      } else {
        await rectifications.create(submitData);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchList();
      fetchPendingCount();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await rectifications.remove(id);
      message.success('删除成功');
      fetchList();
      fetchPendingCount();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleMarkComplete = async (record: Rectification) => {
    try {
      await rectifications.update(record.id, {
        status: 'completed',
        completedDate: dayjs().format('YYYY-MM-DD'),
      });
      message.success('已标记为完成');
      fetchList();
      fetchPendingCount();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const isOverdue = (record: Rectification): boolean => {
    if (!record.deadline || record.status === 'completed') return false;
    return dayjs(record.deadline).isBefore(dayjs(), 'day');
  };

  const columns: ColumnsType<Rectification> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: '告警类型',
      dataIndex: 'alertType',
      key: 'alertType',
      width: 110,
      render: (val: string) => (
        <Tag color={getAlertTypeColor(val)}>{getAlertTypeLabel(val)}</Tag>
      ),
    },
    {
      title: '问题类型',
      dataIndex: 'problemType',
      key: 'problemType',
      width: 140,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: { showTitle: false },
      render: (val: string) => (
        <Tooltip title={val} placement="topLeft">
          {val}
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (val: string) => (
        <Tag color={getStatusColor(val)}>{getStatusLabel(val)}</Tag>
      ),
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 120,
      render: (val?: string) => val || '-',
    },
    {
      title: '完成日期',
      dataIndex: 'completedDate',
      key: 'completedDate',
      width: 120,
      render: (val?: string) => val || '-',
    },
    {
      title: '处理人',
      dataIndex: 'handler',
      key: 'handler',
      width: 100,
      render: (val?: string) => val || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (val?: string) => (val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'),
    },
  ];

  if (canEdit) {
    columns.push({
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenEdit(record)}
          >
            编辑
          </Button>
          {record.status === 'processing' && (
            <Popconfirm
              title="确认完成"
              description="确定要将此整改单标记为已完成吗？"
              onConfirm={() => handleMarkComplete(record)}
              okText="确认"
              cancelText="取消"
            >
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                style={{ color: '#52c41a' }}
              >
                完成
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="确认删除"
            description="确定要删除此整改单吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    });
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 16 }}>
          整改管理
        </Title>
        <Card style={{ marginBottom: 16, maxWidth: 280 }}>
          <Statistic
            title="待处理整改数"
            value={pendingCount}
            prefix={<WarningOutlined style={{ color: '#fa8c16' }} />}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Card>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          placeholder="状态筛选"
          allowClear
          style={{ width: 150 }}
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />
        <Select
          placeholder="告警类型"
          allowClear
          style={{ width: 160 }}
          value={alertTypeFilter}
          onChange={setAlertTypeFilter}
          options={ALERT_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          查询
        </Button>
        <Button icon={<ReloadOutlined />} onClick={handleReset}>
          重置
        </Button>
        {canEdit && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd}>
            新建整改单
          </Button>
        )}
      </Space>

      <Table<Rectification>
        rowKey="id"
        loading={loading}
        dataSource={list}
        columns={columns}
        scroll={{ x: 1300 }}
        rowClassName={(record) => (isOverdue(record) ? 'bg-red-50' : '')}
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
      />

      <Modal
        title={editingRecord ? '编辑整改单' : '新建整改单'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
        destroyOnClose
        okText="确认"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={(changed) => {
            if (changed.status) {
              setFormStatus(changed.status as RectStatus);
            }
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
            }}
          >
            <Form.Item
              name="alertType"
              label="告警类型"
              rules={[{ required: true, message: '请选择告警类型' }]}
            >
              <Select
                placeholder="请选择告警类型"
                options={ALERT_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              />
            </Form.Item>
            <Form.Item name="relatedId" label="关联ID">
              <InputNumber style={{ width: '100%' }} placeholder="请输入关联ID" min={1} />
            </Form.Item>
            <Form.Item
              name="problemType"
              label="问题类型"
              rules={[{ required: true, message: '请输入问题类型' }]}
            >
              <Input placeholder="请输入问题类型" />
            </Form.Item>
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select
                placeholder="请选择状态"
                options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              />
            </Form.Item>
            <Form.Item name="deadline" label="截止日期">
              <DatePicker style={{ width: '100%' }} placeholder="请选择截止日期" />
            </Form.Item>
            <Form.Item
              name="completedDate"
              label="完成日期"
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="请选择完成日期"
                disabled={formStatus !== 'completed'}
              />
            </Form.Item>
            <Form.Item name="handler" label="处理人">
              <Input placeholder="请输入处理人" />
            </Form.Item>
            <Form.Item name="resultPhoto" label="结果照片URL">
              <Input placeholder="请输入结果照片URL" />
            </Form.Item>
          </div>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="measures" label="整改措施">
            <TextArea rows={3} placeholder="请输入整改措施" />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .bg-red-50 {
          background-color: #fef2f2 !important;
        }
        .bg-red-50:hover > td {
          background-color: #fee2e2 !important;
        }
      `}</style>
    </div>
  );
};

export default RectificationsPage;
