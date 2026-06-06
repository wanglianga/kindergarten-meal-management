import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Tag,
  message,
  Typography,
  Divider,
  Alert,
  Statistic,
  Table,
  Switch,
  Image,
  Empty,
  Tabs,
  Popconfirm,
  Descriptions,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
  CheckOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useUser } from '@/context/UserContext';
import {
  mealDistributions,
  type MealDistribution,
  type DistributionChecklist,
  type CreateMealDistributionDto,
  type RiskStatistics,
} from '@/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CLASS_OPTIONS = [
  '小一班', '小二班', '小三班',
  '中一班', '中二班',
  '大一班', '大二班',
];

const MEAL_TYPE_OPTIONS = [
  { value: 'breakfast', label: '早餐' },
  { value: 'lunch', label: '午餐' },
  { value: 'dinner', label: '晚餐' },
];

const getMealTypeLabel = (value: string) => {
  const found = MEAL_TYPE_OPTIONS.find((m) => m.value === value);
  return found ? found.label : value;
};

const MealDistributionsPage: React.FC = () => {
  const { hasRole, user } = useUser();
  const canManage = hasRole(['teacher', 'logistics']);
  const canViewRisk = hasRole(['logistics', 'regulator']);

  const [activeTab, setActiveTab] = useState('checklist');

  const [checkDate, setCheckDate] = useState<Dayjs>(dayjs());
  const [checkClassName, setCheckClassName] = useState<string>(
    user?.className || CLASS_OPTIONS[0]
  );
  const [checkMealType, setCheckMealType] = useState<string>('lunch');
  const [checklist, setChecklist] = useState<DistributionChecklist | null>(null);

  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<any>(null);
  const [form] = Form.useForm<any>();

  const [listLoading, setListLoading] = useState(false);
  const [recordList, setRecordList] = useState<MealDistribution[]>([]);
  const [recordTotal, setRecordTotal] = useState(0);
  const [recordPage, setRecordPage] = useState(1);
  const [recordPageSize, setRecordPageSize] = useState(10);
  const [filterDate, setFilterDate] = useState<Dayjs | null>(null);
  const [filterClass, setFilterClass] = useState<string | undefined>(undefined);
  const [filterHasRisk, setFilterHasRisk] = useState<string | undefined>(undefined);

  const [riskDate, setRiskDate] = useState<Dayjs | null>(null);
  const [riskStats, setRiskStats] = useState<RiskStatistics | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<MealDistribution | null>(null);

  const fetchChecklist = async () => {
    if (!checkDate || !checkClassName || !checkMealType) return;
    try {
      const data = await mealDistributions.getChecklist(
        checkDate.format('YYYY-MM-DD'),
        checkClassName,
        checkMealType
      );
      setChecklist(data);
    } catch (error) {
      message.error('生成分餐核对清单失败');
    }
  };

  const fetchRecordList = async () => {
    setListLoading(true);
    try {
      const params: any = { page: recordPage, pageSize: recordPageSize };
      if (filterDate) params.date = filterDate.format('YYYY-MM-DD');
      if (filterClass) params.className = filterClass;
      if (filterHasRisk !== undefined) params.hasRisk = filterHasRisk;
      const res = await mealDistributions.list(params);
      setRecordList(res.list || res.items || []);
      setRecordTotal(res.total);
    } catch (error) {
      message.error('获取分餐记录失败');
    } finally {
      setListLoading(false);
    }
  };

  const fetchRiskStats = async () => {
    try {
      const date = riskDate ? riskDate.format('YYYY-MM-DD') : undefined;
      const data = await mealDistributions.getRiskStatistics(date);
      setRiskStats(data);
    } catch (error) {
      message.error('获取风险统计失败');
    }
  };

  useEffect(() => {
    fetchChecklist();
  }, [checkDate, checkClassName, checkMealType]);

  useEffect(() => {
    fetchRecordList();
  }, [recordPage, recordPageSize]);

  useEffect(() => {
    if (activeTab === 'risk') {
      fetchRiskStats();
    }
  }, [activeTab, riskDate]);

  const handleSearchRecords = () => {
    setRecordPage(1);
    fetchRecordList();
  };

  const handleResetRecords = () => {
    setFilterDate(null);
    setFilterClass(undefined);
    setFilterHasRisk(undefined);
    setRecordPage(1);
    setTimeout(fetchRecordList, 0);
  };

  const handleOpenRecord = (child: any) => {
    setEditingChild(child);
    form.resetFields();
    form.setFieldsValue({
      substituteMeal: '',
      substitutePhotos: [],
      hasRisk: child.hasRisk,
      riskDescription: child.hasRisk
        ? `需忌口菜品：${child.restrictedDishes.join('、')}`
        : '',
      confirmedBy: user?.realName || user?.username,
    });
    setRecordModalOpen(true);
  };

  const handleSubmitRecord = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreateMealDistributionDto = {
        date: checkDate.format('YYYY-MM-DD'),
        className: checkClassName,
        mealType: checkMealType,
        childName: editingChild.childName,
        childAllergens: editingChild.childAllergens,
        restrictedDishes: editingChild.restrictedDishes,
        substituteMeal: values.substituteMeal,
        substitutePhotos: values.substitutePhotos || [],
        confirmedBy: values.confirmedBy,
        hasRisk: values.hasRisk,
        riskDescription: values.riskDescription,
        status: 'confirmed',
      };
      await mealDistributions.create(payload);
      message.success(
        values.hasRisk
          ? '已记录，误配风险已通知后勤和班级处理'
          : '分餐记录已保存'
      );
      setRecordModalOpen(false);
      fetchChecklist();
      fetchRecordList();
    } catch (error) {
      message.error('保存失败');
    }
  };

  const handleViewDetail = (record: MealDistribution) => {
    setViewRecord(record);
    setDetailModalOpen(true);
  };

  const handleDeleteRecord = async (id: number) => {
    try {
      await mealDistributions.remove(id);
      message.success('删除成功');
      fetchRecordList();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const recordColumns: ColumnsType<MealDistribution> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 110,
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'className',
      width: 90,
    },
    {
      title: '餐次',
      dataIndex: 'mealType',
      key: 'mealType',
      width: 70,
      render: (v: string) => getMealTypeLabel(v),
    },
    {
      title: '幼儿姓名',
      dataIndex: 'childName',
      key: 'childName',
      width: 100,
    },
    {
      title: '过敏原',
      dataIndex: 'childAllergens',
      key: 'childAllergens',
      render: (v: string[]) =>
        v && v.length > 0 ? (
          <Space wrap>
            {v.map((a) => (
              <Tag key={a} color="red">
                {a}
              </Tag>
            ))}
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: '忌口菜品',
      dataIndex: 'restrictedDishes',
      key: 'restrictedDishes',
      render: (v: string[]) =>
        v && v.length > 0 ? (
          <Space wrap>
            {v.map((d) => (
              <Tag key={d} color="orange">
                {d}
              </Tag>
            ))}
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: '替代餐',
      dataIndex: 'substituteMeal',
      key: 'substituteMeal',
      ellipsis: true,
      render: (v: string) => v || '-',
    },
    {
      title: '风险',
      dataIndex: 'hasRisk',
      key: 'hasRisk',
      width: 80,
      render: (v: boolean) =>
        v ? (
          <Tag color="red" icon={<WarningOutlined />}>
            有误配风险
          </Tag>
        ) : (
          <Tag color="green" icon={<CheckOutlined />}>
            正常
          </Tag>
        ),
    },
    {
      title: '确认人',
      dataIndex: 'confirmedBy',
      key: 'confirmedBy',
      width: 90,
      render: (v: string) => v || '-',
    },
    {
      title: '确认时间',
      dataIndex: 'confirmedAt',
      key: 'confirmedAt',
      width: 160,
      render: (v: string) =>
        v ? new Date(v).toLocaleString('zh-CN') : '-',
    },
  ];

  if (canManage) {
    recordColumns.push({
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_: unknown, record: MealDistribution) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {hasRole('logistics') && (
            <Popconfirm
              title="确定删除此记录?"
              onConfirm={() => handleDeleteRecord(record.id)}
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    });
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ marginTop: 0 }}>
        过敏幼儿餐盘核对
      </Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'checklist',
            label: '分餐核对清单',
            children: (
              <div>
                <Card style={{ marginBottom: 16 }}>
                  <Space wrap>
                    <DatePicker
                      value={checkDate}
                      onChange={(d) => d && setCheckDate(d)}
                      style={{ width: 180 }}
                    />
                    <Select
                      value={checkClassName}
                      onChange={setCheckClassName}
                      style={{ width: 140 }}
                      options={CLASS_OPTIONS.map((c) => ({
                        value: c,
                        label: c,
                      }))}
                    />
                    <Select
                      value={checkMealType}
                      onChange={setCheckMealType}
                      style={{ width: 120 }}
                      options={MEAL_TYPE_OPTIONS}
                    />
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      onClick={fetchChecklist}
                    >
                      生成核对清单
                    </Button>
                  </Space>
                </Card>

                {checklist && (
                  <>
                    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                      <Col xs={12} sm={6}>
                        <Card>
                          <Statistic
                            title="过敏幼儿数"
                            value={checklist.totalChildren}
                            prefix={<UserOutlined />}
                          />
                        </Card>
                      </Col>
                      <Col xs={12} sm={6}>
                        <Card>
                          <Statistic
                            title="需注意幼儿"
                            value={checklist.riskChildren}
                            valueStyle={{ color: checklist.riskChildren > 0 ? '#ff4d4f' : undefined }}
                            prefix={<ExclamationCircleOutlined />}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Card title="当日菜品过敏原一览">
                          <Space wrap>
                            {checklist.dishes.map((d) => (
                              <div key={d.id}>
                                <Text strong>{d.dishName}：</Text>
                                {d.allergens && d.allergens.length > 0 ? (
                                  d.allergens.map((a) => (
                                    <Tag key={a} color="orange">
                                      {a}
                                    </Tag>
                                  ))
                                ) : (
                                  <Tag color="green">无</Tag>
                                )}
                              </div>
                            ))}
                            {checklist.dishes.length === 0 && (
                              <Text type="secondary">当日该餐次暂无菜品</Text>
                            )}
                          </Space>
                        </Card>
                      </Col>
                    </Row>

                    {checklist.checklist.length > 0 ? (
                      <Row gutter={[16, 16]}>
                        {checklist.checklist.map((child) => (
                          <Col xs={24} md={12} key={child.childId}>
                            <Card
                              style={{
                                borderColor: child.hasRisk ? '#ff4d4f' : undefined,
                                boxShadow: child.hasRisk
                                  ? '0 0 0 2px rgba(255,77,79,0.1)'
                                  : undefined,
                              }}
                              title={
                                <Space>
                                  <Text strong style={{ fontSize: 16 }}>
                                    {child.childName}
                                  </Text>
                                  {child.hasRisk && (
                                    <Tag color="red" icon={<WarningOutlined />}>
                                      需更换菜品
                                    </Tag>
                                  )}
                                  {!child.hasRisk && (
                                    <Tag color="green" icon={<CheckOutlined />}>
                                      菜品安全
                                    </Tag>
                                  )}
                                </Space>
                              }
                              extra={
                                canManage && (
                                  <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => handleOpenRecord(child)}
                                  >
                                    记录分餐
                                  </Button>
                                )
                              }
                            >
                              <div style={{ marginBottom: 12 }}>
                                <Text type="secondary">
                                  <UserOutlined /> 过敏原：
                                </Text>
                                <Space wrap style={{ marginLeft: 8 }}>
                                  {child.childAllergens.length > 0 ? (
                                    child.childAllergens.map((a) => (
                                      <Tag key={a} color="red">
                                        {a}
                                      </Tag>
                                    ))
                                  ) : (
                                    <Text type="secondary">无</Text>
                                  )}
                                </Space>
                              </div>
                              {child.restrictedDishes.length > 0 && (
                                <div style={{ marginBottom: 12 }}>
                                  <Alert
                                    type="warning"
                                    showIcon
                                    message={
                                      <Text type="warning">
                                        <ExclamationCircleOutlined /> 不能食用：
                                        {child.restrictedDishes.join('、')}
                                      </Text>
                                    }
                                  />
                                </div>
                              )}
                              <div>
                                <Text type="secondary">
                                  <SafetyCertificateOutlined /> 可食用：
                                </Text>
                                <Space wrap style={{ marginLeft: 8 }}>
                                  {child.safeDishes.length > 0 ? (
                                    child.safeDishes.map((d) => (
                                      <Tag key={d} color="green">
                                        {d}
                                      </Tag>
                                    ))
                                  ) : (
                                    <Text type="danger">无可食用菜品！</Text>
                                  )}
                                </Space>
                              </div>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <Empty description={checklist.className + ' 暂无过敏幼儿登记'} />
                    )}
                  </>
                )}
              </div>
            ),
          },
          {
            key: 'records',
            label: '分餐记录',
            children: (
              <div>
                <Card style={{ marginBottom: 16 }}>
                  <Space wrap>
                    <DatePicker
                      placeholder="选择日期"
                      value={filterDate}
                      onChange={(d) => setFilterDate(d)}
                      style={{ width: 180 }}
                    />
                    <Select
                      placeholder="选择班级"
                      allowClear
                      value={filterClass}
                      onChange={(v) => setFilterClass(v)}
                      style={{ width: 140 }}
                      options={CLASS_OPTIONS.map((c) => ({
                        value: c,
                        label: c,
                      }))}
                    />
                    <Select
                      placeholder="是否有误配风险"
                      allowClear
                      value={filterHasRisk}
                      onChange={(v) => setFilterHasRisk(v)}
                      style={{ width: 160 }}
                      options={[
                        { value: 'true', label: '有误配风险' },
                        { value: 'false', label: '正常' },
                      ]}
                    />
                    <Button type="primary" onClick={handleSearchRecords}>
                      查询
                    </Button>
                    <Button onClick={handleResetRecords}>重置</Button>
                  </Space>
                </Card>

                <Card>
                  <Table
                    rowKey="id"
                    loading={listLoading}
                    dataSource={recordList}
                    columns={recordColumns}
                    scroll={{ x: 1400 }}
                    pagination={{
                      current: recordPage,
                      pageSize: recordPageSize,
                      total: recordTotal,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (t) => `共 ${t} 条记录`,
                      onChange: (p, ps) => {
                        setRecordPage(p);
                        setRecordPageSize(ps);
                      },
                    }}
                  />
                </Card>
              </div>
            ),
          },
          ...(canViewRisk
            ? [
                {
                  key: 'risk',
                  label: (
                    <span>
                      <WarningOutlined /> 误配风险监控
                    </span>
                  ),
                  children: (
                    <div>
                      <Card style={{ marginBottom: 16 }}>
                        <Space wrap>
                          <DatePicker
                            placeholder="选择日期（留空为全部）"
                            value={riskDate}
                            onChange={(d) => setRiskDate(d)}
                            style={{ width: 220 }}
                            allowClear
                          />
                          <Button type="primary" onClick={fetchRiskStats}>
                            查询
                          </Button>
                        </Space>
                      </Card>

                      {riskStats && (
                        <div>
                          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                            <Col span={12}>
                              <Card>
                                <Statistic
                                  title={`${riskStats.date} 误配风险总数`}
                                  value={riskStats.totalRiskCount}
                                  valueStyle={{ color: '#ff4d4f' }}
                                  prefix={<ExclamationCircleOutlined />}
                                />
                              </Card>
                            </Col>
                            <Col span={12}>
                              <Card>
                                <Statistic
                                  title="涉及班级数"
                                  value={riskStats.byClass.length}
                                  prefix={<UserOutlined />}
                                />
                              </Card>
                            </Col>
                          </Row>

                          {riskStats.byClass.length > 0 ? (
                            riskStats.byClass.map((item) => (
                              <Card
                                key={item.className}
                                title={
                                  <Space>
                                    <Text strong>{item.className}</Text>
                                    <Tag color="red">{item.count} 条风险</Tag>
                                  </Space>
                                }
                                style={{ marginBottom: 16 }}
                              >
                                <Table
                                  rowKey="id"
                                  size="small"
                                  dataSource={item.records}
                                  pagination={false}
                                  columns={[
                                    {
                                      title: '日期',
                                      dataIndex: 'date',
                                      key: 'date',
                                      width: 110,
                                    },
                                    {
                                      title: '餐次',
                                      dataIndex: 'mealType',
                                      key: 'mealType',
                                      width: 70,
                                      render: (v: string) => getMealTypeLabel(v),
                                    },
                                    {
                                      title: '幼儿',
                                      dataIndex: 'childName',
                                      key: 'childName',
                                      width: 100,
                                    },
                                    {
                                      title: '忌口菜品',
                                      dataIndex: 'restrictedDishes',
                                      key: 'restrictedDishes',
                                      render: (v: string[]) =>
                                        v.map((d) => (
                                          <Tag key={d} color="orange">
                                            {d}
                                          </Tag>
                                        )),
                                    },
                                    {
                                      title: '风险描述',
                                      dataIndex: 'riskDescription',
                                      key: 'riskDescription',
                                      render: (v: string) => v || '-',
                                    },
                                    {
                                      title: '确认人',
                                      dataIndex: 'confirmedBy',
                                      key: 'confirmedBy',
                                      width: 90,
                                    },
                                  ]}
                                />
                              </Card>
                            ))
                          ) : (
                            <Empty description="暂无误配风险记录" />
                          )}
                        </div>
                      )}
                    </div>
                  ),
                },
              ]
            : []),
        ]}
      />

      <Modal
        title={
          <Space>
            <Text strong>分餐记录 - {editingChild?.childName}</Text>
            {editingChild?.hasRisk && (
              <Tag color="red" icon={<WarningOutlined />}>
                存在过敏误配风险
              </Tag>
            )}
          </Space>
        }
        open={recordModalOpen}
        onOk={handleSubmitRecord}
        onCancel={() => setRecordModalOpen(false)}
        width={680}
        destroyOnClose
        okText="确认提交"
      >
        {editingChild && (
          <div>
            <Alert
              type={editingChild.hasRisk ? 'error' : 'info'}
              showIcon
              style={{ marginBottom: 16 }}
              message={
                editingChild.hasRisk
                  ? '该幼儿存在过敏风险，记录后将自动通知后勤和班级处理'
                  : '菜品安全，请确认分餐情况'
              }
            />

            <Descriptions
              bordered
              size="small"
              column={1}
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item label="幼儿姓名">
                {editingChild.childName}
              </Descriptions.Item>
              <Descriptions.Item label="班级">
                {editingChild.className}
              </Descriptions.Item>
              <Descriptions.Item label="过敏原">
                <Space wrap>
                  {editingChild.childAllergens.map((a: string) => (
                    <Tag key={a} color="red">
                      {a}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              {editingChild.restrictedDishes.length > 0 && (
                <Descriptions.Item label="不能食用">
                  <Space wrap>
                    {editingChild.restrictedDishes.map((d: string) => (
                      <Tag key={d} color="orange">
                        {d}
                      </Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}
              {editingChild.safeDishes.length > 0 && (
                <Descriptions.Item label="可食用">
                  <Space wrap>
                    {editingChild.safeDishes.map((d: string) => (
                      <Tag key={d} color="green">
                        {d}
                      </Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Form form={form} layout="vertical">
              <Form.Item
                label="替代餐食说明"
                name="substituteMeal"
                rules={[
                  { required: editingChild.hasRisk, message: '有风险时请填写替代餐食' },
                ]}
                tooltip="请填写为该幼儿准备的替代餐内容"
              >
                <TextArea
                  rows={3}
                  placeholder={
                    editingChild.hasRisk
                      ? '请详细说明替代餐内容，例如：换成米饭+清炒时蔬+蒸蛋'
                      : '如无特殊替代餐，可留空或填写"无"'
                  }
                />
              </Form.Item>
              <Form.Item label="替代餐照片URL（多张用英文逗号分隔）" name="substitutePhotos">
                <Select
                  mode="tags"
                  placeholder="输入图片URL后按回车添加，可添加多张"
                  tokenSeparators={[',', '，']}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item
                label="是否有误配风险"
                name="hasRisk"
                valuePropName="checked"
                tooltip="勾选表示存在误配风险，将通知后勤和班级处理"
              >
                <Switch
                  checkedChildren="是，存在风险"
                  unCheckedChildren="否，正常"
                />
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prev, cur) => prev.hasRisk !== cur.hasRisk}
              >
                {({ getFieldValue }) =>
                  getFieldValue('hasRisk') ? (
                    <Form.Item
                      label="风险描述"
                      name="riskDescription"
                      rules={[{ required: true, message: '请描述风险情况' }]}
                    >
                      <TextArea
                        rows={2}
                        placeholder="请描述误配情况、处理方式等"
                      />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
              <Form.Item
                label="确认人"
                name="confirmedBy"
                rules={[{ required: true, message: '请填写确认人' }]}
              >
                <Input placeholder="请输入当班确认人姓名" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      <Modal
        title="分餐记录详情"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {viewRecord && (
          <div>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="日期">{viewRecord.date}</Descriptions.Item>
              <Descriptions.Item label="班级">{viewRecord.className}</Descriptions.Item>
              <Descriptions.Item label="餐次">
                {getMealTypeLabel(viewRecord.mealType)}
              </Descriptions.Item>
              <Descriptions.Item label="幼儿姓名">{viewRecord.childName}</Descriptions.Item>
              <Descriptions.Item label="过敏原">
                <Space wrap>
                  {viewRecord.childAllergens.map((a) => (
                    <Tag key={a} color="red">
                      {a}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="忌口菜品">
                <Space wrap>
                  {viewRecord.restrictedDishes.map((d) => (
                    <Tag key={d} color="orange">
                      {d}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="替代餐">
                {viewRecord.substituteMeal || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="风险">
                {viewRecord.hasRisk ? (
                  <Tag color="red" icon={<WarningOutlined />}>
                    有误配风险
                  </Tag>
                ) : (
                  <Tag color="green">正常</Tag>
                )}
              </Descriptions.Item>
              {viewRecord.hasRisk && viewRecord.riskDescription && (
                <Descriptions.Item label="风险描述">
                  {viewRecord.riskDescription}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="确认人">
                {viewRecord.confirmedBy || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="确认时间">
                {viewRecord.confirmedAt
                  ? new Date(viewRecord.confirmedAt).toLocaleString('zh-CN')
                  : '-'}
              </Descriptions.Item>
            </Descriptions>
            {viewRecord.substitutePhotos && viewRecord.substitutePhotos.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Divider>替代餐照片</Divider>
                <Row gutter={[8, 8]}>
                  {viewRecord.substitutePhotos.map((url, idx) => (
                    <Col xs={12} sm={8} key={idx}>
                      <Image
                        src={url}
                        alt={`替代餐照片${idx + 1}`}
                        style={{ width: '100%', borderRadius: 4 }}
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MealDistributionsPage;
