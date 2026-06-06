import React, { useState, useEffect } from 'react';
import {
  Table,
  Form,
  Modal,
  DatePicker,
  Select,
  Input,
  InputNumber,
  Button,
  Space,
  message,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useUser } from '@/context/UserContext';
import {
  classroomMeals,
  type ClassroomMeal,
  type AllergyRiskResult,
} from '@/api';

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

const ClassroomMealsPage: React.FC = () => {
  const { hasRole } = useUser();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<ClassroomMeal[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filterDate, setFilterDate] = useState<Dayjs | null>(null);
  const [filterClassName, setFilterClassName] = useState<string | undefined>(undefined);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ClassroomMeal | null>(null);
  const [form] = Form.useForm<any>();

  const [allergyModalOpen, setAllergyModalOpen] = useState(false);
  const [allergyCheckDate, setAllergyCheckDate] = useState<Dayjs | null>(null);
  const [allergyRiskData, setAllergyRiskData] = useState<AllergyRiskResult | null>(null);
  const [allergyLoading, setAllergyLoading] = useState(false);

  const canManage = hasRole(['teacher', 'logistics']);
  const canCheckAllergy = hasRole(['logistics', 'regulator']);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: { page: number; pageSize: number; date?: string; className?: string } = {
        page,
        pageSize,
      };
      if (filterDate) {
        params.date = filterDate.format('YYYY-MM-DD');
      }
      if (filterClassName) {
        params.className = filterClassName;
      }
      const res = await classroomMeals.list(params);
      setDataSource(res.list);
      setTotal(res.total);
    } catch (error) {
      message.error('获取用餐记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleReset = () => {
    setFilterDate(null);
    setFilterClassName(undefined);
    setPage(1);
    setTimeout(fetchData, 0);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: ClassroomMeal) => {
    setEditingRecord(record);
    form.setFieldsValue({
      date: record.date ? dayjs(record.date) : undefined,
      className: record.className,
      mealType: record.mealType,
      allergies: record.allergies,
      tempRestrictions: record.tempRestrictions,
      leftovers: record.leftovers,
      leftoverCount: record.leftoverCount,
      recorder: record.recorder,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await classroomMeals.remove(id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload: any = {
        ...values,
        date: values.date ? (values.date as unknown as Dayjs).format('YYYY-MM-DD') : '',
      };

      if (editingRecord) {
        await classroomMeals.update(editingRecord.id, payload);
        message.success('更新成功');
      } else {
        await classroomMeals.create(payload);
        message.success('创建成功');
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAllergyCheck = async () => {
    if (!allergyCheckDate) {
      message.warning('请选择日期');
      return;
    }
    setAllergyLoading(true);
    try {
      const res = await classroomMeals.getAllergyRisks(allergyCheckDate.format('YYYY-MM-DD'));
      setAllergyRiskData(res);
      setAllergyModalOpen(true);
    } catch (error) {
      message.error('获取过敏风险记录失败');
    } finally {
      setAllergyLoading(false);
    }
  };

  const columns: ColumnsType<ClassroomMeal> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'className',
      width: 100,
    },
    {
      title: '餐次',
      dataIndex: 'mealType',
      key: 'mealType',
      width: 80,
      render: (value: string) => getMealTypeLabel(value),
    },
    {
      title: '过敏记录',
      dataIndex: 'allergies',
      key: 'allergies',
      ellipsis: true,
      render: (value: string) =>
        value ? <Tag color="red">{value}</Tag> : <span style={{ color: '#999' }}>-</span>,
    },
    {
      title: '临时忌口',
      dataIndex: 'tempRestrictions',
      key: 'tempRestrictions',
      ellipsis: true,
      render: (value: string) => value || <span style={{ color: '#999' }}>-</span>,
    },
    {
      title: '剩餐情况',
      dataIndex: 'leftovers',
      key: 'leftovers',
      ellipsis: true,
      render: (value: string) => value || <span style={{ color: '#999' }}>-</span>,
    },
    {
      title: '剩餐人数',
      dataIndex: 'leftoverCount',
      key: 'leftoverCount',
      width: 100,
      render: (value: number) => (value ?? 0),
    },
    {
      title: '记录人',
      dataIndex: 'recorder',
      key: 'recorder',
      width: 100,
      render: (value: string) => value || <span style={{ color: '#999' }}>-</span>,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: (value: string) => value || <span style={{ color: '#999' }}>-</span>,
    },
  ];

  if (canManage) {
    columns.push({
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_: unknown, record: ClassroomMeal) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除此记录?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    });
  }

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space style={{ marginBottom: 16, width: '100%' }} wrap>
          <DatePicker
            placeholder="选择日期"
            value={filterDate}
            onChange={(date) => setFilterDate(date)}
            style={{ width: 200 }}
          />
          <Select
            placeholder="选择班级"
            allowClear
            value={filterClassName}
            onChange={(value) => setFilterClassName(value)}
            style={{ width: 160 }}
            options={CLASS_OPTIONS.map((c) => ({ value: c, label: c }))}
          />
          <Button type="primary" onClick={handleSearch}>
            查询
          </Button>
          <Button onClick={handleReset}>重置</Button>
          {canManage && (
            <Button type="primary" onClick={handleAdd}>
              登记用餐记录
            </Button>
          )}
          {canCheckAllergy && (
            <>
              <DatePicker
                placeholder="过敏风险检查日期"
                value={allergyCheckDate}
                onChange={(date) => setAllergyCheckDate(date)}
                style={{ width: 200 }}
              />
              <Button onClick={handleAllergyCheck} loading={allergyLoading}>
                过敏风险检查
              </Button>
            </>
          )}
        </Space>

        <Table
          rowKey="id"
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条记录`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑用餐记录' : '登记用餐记录'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="日期"
                name="date"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="班级"
                name="className"
                rules={[{ required: true, message: '请选择班级' }]}
              >
                <Select
                  placeholder="请选择班级"
                  options={CLASS_OPTIONS.map((c) => ({ value: c, label: c }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="餐次"
                name="mealType"
                rules={[{ required: true, message: '请选择餐次' }]}
              >
                <Select placeholder="请选择餐次" options={MEAL_TYPE_OPTIONS} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="记录人" name="recorder">
                <Input placeholder="请输入记录人" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="过敏记录" name="allergies">
            <TextArea rows={2} placeholder="请填写对哪些食材过敏的幼儿" />
          </Form.Item>
          <Form.Item label="临时忌口" name="tempRestrictions">
            <TextArea rows={2} placeholder="请输入临时忌口" />
          </Form.Item>
          <Form.Item label="剩餐情况" name="leftovers">
            <TextArea rows={2} placeholder="请输入剩餐情况" />
          </Form.Item>
          <Form.Item label="剩餐人数" name="leftoverCount">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入剩餐人数" />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="过敏风险检查结果"
        open={allergyModalOpen}
        onCancel={() => setAllergyModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setAllergyModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {allergyRiskData && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Card>
                  <div style={{ fontSize: 14, color: '#666' }}>总记录数</div>
                  <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                    {allergyRiskData.totalCount}
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <div style={{ fontSize: 14, color: '#666' }}>过敏风险记录数</div>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>
                    {allergyRiskData.allergyCount}
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <div style={{ fontSize: 14, color: '#666' }}>检查日期</div>
                  <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                    {allergyRiskData.date}
                  </div>
                </Card>
              </Col>
            </Row>

            {allergyRiskData.allergyList.length > 0 ? (
              <Table
                rowKey="id"
                dataSource={allergyRiskData.allergyList}
                pagination={false}
                size="small"
                columns={[
                  { title: '班级', dataIndex: 'className', key: 'className' },
                  {
                    title: '餐次',
                    dataIndex: 'mealType',
                    key: 'mealType',
                    render: (v: string) => getMealTypeLabel(v),
                  },
                  { title: '过敏记录', dataIndex: 'allergies', key: 'allergies' },
                  { title: '记录人', dataIndex: 'recorder', key: 'recorder' },
                ]}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
                该日期暂无过敏风险记录
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClassroomMealsPage;
