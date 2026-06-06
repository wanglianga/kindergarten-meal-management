import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Space,
  Button,
  Select,
  Modal,
  Form,
  Input,
  DatePicker,
  Popconfirm,
  message,
  Typography,
} from 'antd';
import {
  WarningOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useUser } from '@/context/UserContext';
import { alerts, rectifications } from '@/api';
import type { Alert, CreateRectificationDto } from '@/api';

const { Title } = Typography;
const { TextArea } = Input;

type AlertType = 'allergy' | 'sample_expired' | 'batch_expired' | 'negative_review';

const ALERT_TYPE_LABEL: Record<AlertType, string> = {
  allergy: '过敏风险',
  sample_expired: '留样过期',
  batch_expired: '食材批次过期',
  negative_review: '负面评价',
};

const ALERT_TYPE_COLOR: Record<AlertType, string> = {
  allergy: 'red',
  sample_expired: 'orange',
  batch_expired: 'gold',
  negative_review: 'purple',
};

const ALERT_TYPE_ICON: Record<AlertType, React.ReactNode> = {
  allergy: <ExclamationCircleOutlined />,
  sample_expired: <WarningOutlined />,
  batch_expired: <WarningOutlined />,
  negative_review: <AlertOutlined />,
};

const STATUS_LABEL: Record<string, string> = {
  active: '待处理',
  resolved: '已解决',
};

const STATUS_COLOR: Record<string, string> = {
  active: 'red',
  resolved: 'green',
};

interface RectificationFormData extends Omit<CreateRectificationDto, 'deadline'> {
  deadline?: Dayjs;
}

const AlertsPage: React.FC = () => {
  const { hasRole } = useUser();
  const canOperate = hasRole('logistics');

  const [alertList, setAlertList] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCount, setActiveCount] = useState(0);

  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);

  const [rectModalVisible, setRectModalVisible] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);
  const [rectLoading, setRectLoading] = useState(false);
  const [rectForm] = Form.useForm<RectificationFormData>();

  const fetchActiveCount = async () => {
    try {
      const res = await alerts.getActiveCount();
      setActiveCount(res?.count ?? 0);
    } catch (e) {
      console.error('获取 active 告警数失败', e);
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await alerts.list(statusFilter);
      let list = Array.isArray(data) ? data : [];
      if (typeFilter) {
        list = list.filter((a) => a.type === typeFilter);
      }
      setAlertList(list);
    } catch (e) {
      console.error('获取告警列表失败', e);
      message.error('获取告警列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveCount();
    fetchAlerts();
  }, []);

  const handleSearch = () => {
    fetchAlerts();
    fetchActiveCount();
  };

  const handleResolve = async (id: number) => {
    try {
      await alerts.resolve(id);
      message.success('已标记为已解决');
      fetchAlerts();
      fetchActiveCount();
    } catch (e) {
      console.error('解决告警失败', e);
      message.error('操作失败');
    }
  };

  const handleOpenRectModal = (alert: Alert) => {
    setCurrentAlert(alert);
    rectForm.resetFields();
    setRectModalVisible(true);
  };

  const handleSubmitRectification = async () => {
    if (!currentAlert) return;
    try {
      const values = await rectForm.validateFields();
      setRectLoading(true);
      const dto: CreateRectificationDto = {
        alertType: currentAlert.type,
        relatedId: currentAlert.relatedId,
        problemType: values.problemType,
        description: values.description,
        measures: values.measures,
        deadline: values.deadline ? dayjs(values.deadline).format('YYYY-MM-DD') : undefined,
        handler: values.handler,
        status: 'pending',
      };
      await rectifications.create(dto);
      message.success('整改单创建成功');
      setRectModalVisible(false);
      fetchAlerts();
    } catch (e) {
      console.error('创建整改单失败', e);
      message.error('创建整改单失败');
    } finally {
      setRectLoading(false);
    }
  };

  const typeCounts = alertList.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {});

  const columns: ColumnsType<Alert> = [
    {
      title: '告警类型',
      dataIndex: 'type',
      key: 'type',
      width: 160,
      render: (type: string) => {
        const t = type as AlertType;
        return (
          <Tag
            color={ALERT_TYPE_COLOR[t] || 'default'}
            icon={ALERT_TYPE_ICON[t]}
          >
            {ALERT_TYPE_LABEL[t] || type}
          </Tag>
        );
      },
    },
    {
      title: '告警消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={STATUS_COLOR[status] || 'default'}>
          {STATUS_LABEL[status] || status}
        </Tag>
      ),
    },
    {
      title: '告警日期',
      dataIndex: 'alertDate',
      key: 'alertDate',
      width: 120,
      render: (val?: string) => (val ? dayjs(val).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '整改单',
      dataIndex: 'hasRectification',
      key: 'hasRectification',
      width: 120,
      render: (has: boolean) =>
        has ? (
          <Tag color="blue" icon={<FileTextOutlined />}>
            已创建
          </Tag>
        ) : (
          <Tag color="default">未创建</Tag>
        ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (val?: string) => (val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'),
    },
  ];

  if (canOperate) {
    columns.push({
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {record.status === 'active' && (
            <Popconfirm
              title="确认标记解决"
              description="确定要将此告警标记为已解决吗？"
              onConfirm={() => handleResolve(record.id)}
              okText="确认"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
              >
                标记解决
              </Button>
            </Popconfirm>
          )}
          {!record.hasRectification && (
            <Button
              type="link"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => handleOpenRectModal(record)}
            >
              创建整改单
            </Button>
          )}
        </Space>
      ),
    });
  }

  const alertTypeOptions: AlertType[] = [
    'allergy',
    'sample_expired',
    'batch_expired',
    'negative_review',
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>
        告警中心
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="待处理告警"
              value={activeCount}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Card>
        </Col>
        {alertTypeOptions.map((t) => (
          <Col xs={24} sm={12} md={4} key={t}>
            <Card>
              <Statistic
                title={ALERT_TYPE_LABEL[t]}
                value={typeCounts[t] || 0}
                valueStyle={{
                  color:
                    ALERT_TYPE_COLOR[t] === 'red'
                      ? '#ff4d4f'
                      : ALERT_TYPE_COLOR[t] === 'orange'
                        ? '#fa8c16'
                        : ALERT_TYPE_COLOR[t] === 'gold'
                          ? '#faad14'
                          : '#722ed1',
                }}
                prefix={ALERT_TYPE_ICON[t]}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 160 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'active', label: '待处理' },
              { value: 'resolved', label: '已解决' },
            ]}
          />
          <Select
            placeholder="告警类型"
            allowClear
            style={{ width: 180 }}
            value={typeFilter}
            onChange={setTypeFilter}
            options={alertTypeOptions.map((t) => ({
              value: t,
              label: ALERT_TYPE_LABEL[t],
            }))}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            查询
          </Button>
        </Space>
      </Card>

      <Table<Alert>
        rowKey="id"
        loading={loading}
        dataSource={alertList}
        columns={columns}
        scroll={{ x: 1100 }}
      />

      <Modal
        title="创建整改单"
        open={rectModalVisible}
        onOk={handleSubmitRectification}
        onCancel={() => setRectModalVisible(false)}
        confirmLoading={rectLoading}
        width={600}
        destroyOnClose
        okText="提交"
        cancelText="取消"
      >
        {currentAlert && (
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Tag color={ALERT_TYPE_COLOR[currentAlert.type as AlertType]}>
                关联告警：{ALERT_TYPE_LABEL[currentAlert.type as AlertType]}
              </Tag>
              {currentAlert.relatedId && (
                <Tag color="blue">关联ID：{currentAlert.relatedId}</Tag>
              )}
            </Space>
          </div>
        )}
        <Form form={rectForm} layout="vertical">
          <Form.Item
            name="problemType"
            label="问题类型"
            rules={[{ required: true, message: '请输入问题类型' }]}
          >
            <Input placeholder="请输入问题类型，如：食材过期、留样不规范等" />
          </Form.Item>
          <Form.Item
            name="description"
            label="问题描述"
            rules={[{ required: true, message: '请输入问题描述' }]}
          >
            <TextArea rows={3} placeholder="请详细描述存在的问题" />
          </Form.Item>
          <Form.Item
            name="measures"
            label="整改措施"
            rules={[{ required: true, message: '请输入整改措施' }]}
          >
            <TextArea rows={3} placeholder="请描述具体的整改措施" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="deadline"
                label="整改期限"
                rules={[{ required: true, message: '请选择整改期限' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="handler"
                label="整改负责人"
                rules={[{ required: true, message: '请输入整改负责人' }]}
              >
                <Input placeholder="请输入负责人姓名" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default AlertsPage;
