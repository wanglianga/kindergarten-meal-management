import React, { useState, useEffect } from 'react';
import {
  Table,
  Form,
  Modal,
  Select,
  Input,
  Button,
  Space,
  message,
  Popconfirm,
  Tag,
  Card,
  Switch,
  Row,
  Col,
  Statistic,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useUser } from '@/context/UserContext';
import {
  allergyChildren,
  type AllergyChild,
  type CreateAllergyChildDto,
  type AllergenSummary,
} from '@/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CLASS_OPTIONS = [
  '小一班', '小二班', '小三班',
  '中一班', '中二班',
  '大一班', '大二班',
];

const COMMON_ALLERGENS = [
  '牛奶', '鸡蛋', '花生', '坚果', '小麦',
  '大豆', '海鲜', '虾', '蟹', '芒果',
  '桃子', '猕猴桃', '番茄', '巧克力',
];

const AllergyChildrenPage: React.FC = () => {
  const { hasRole, user } = useUser();
  const canManage = hasRole(['teacher', 'logistics']);
  const canDelete = hasRole('logistics');

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<AllergyChild[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filterClassName, setFilterClassName] = useState<string | undefined>(
    user?.className || undefined
  );
  const [filterChildName, setFilterChildName] = useState<string | undefined>(undefined);
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);

  const [summary, setSummary] = useState<AllergenSummary | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AllergyChild | null>(null);
  const [form] = Form.useForm<any>();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize };
      if (filterClassName) params.className = filterClassName;
      if (filterChildName) params.childName = filterChildName;
      if (filterActive !== undefined) params.isActive = filterActive;
      const res = await allergyChildren.list(params);
      setDataSource(res.list || res.items || []);
      setTotal(res.total);
    } catch (error) {
      message.error('获取过敏名单失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await allergyChildren.getSummary(user?.className);
      setSummary(res);
    } catch (error) {
      console.error('获取汇总失败', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  useEffect(() => {
    fetchSummary();
  }, [filterClassName]);

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleReset = () => {
    setFilterClassName(user?.className || undefined);
    setFilterChildName(undefined);
    setFilterActive(undefined);
    setPage(1);
    setTimeout(fetchData, 0);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      className: user?.className,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleEdit = (record: AllergyChild) => {
    setEditingRecord(record);
    form.setFieldsValue({
      childName: record.childName,
      className: record.className,
      allergens: record.allergens,
      remark: record.remark,
      isActive: record.isActive,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await allergyChildren.remove(id);
      message.success('删除成功');
      fetchData();
      fetchSummary();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreateAllergyChildDto = {
        ...values,
      };

      if (editingRecord) {
        await allergyChildren.update(editingRecord.id, payload);
        message.success('更新成功');
      } else {
        await allergyChildren.create(payload);
        message.success('添加成功');
      }
      setModalOpen(false);
      fetchData();
      fetchSummary();
    } catch (error) {
      console.error(error);
    }
  };

  const columns: ColumnsType<AllergyChild> = [
    {
      title: '幼儿姓名',
      dataIndex: 'childName',
      key: 'childName',
      width: 120,
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'className',
      width: 100,
    },
    {
      title: '过敏原',
      dataIndex: 'allergens',
      key: 'allergens',
      render: (value: string[]) =>
        value && value.length > 0 ? (
          <Space wrap>
            {value.map((a) => (
              <Tag key={a} color="red">
                {a}
              </Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: (value: string) => value || <Text type="secondary">-</Text>,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (value: boolean) =>
        value ? <Tag color="green">有效</Tag> : <Tag color="default">已停用</Tag>,
    },
    {
      title: '录入时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (value: string) =>
        value ? new Date(value).toLocaleString('zh-CN') : '-',
    },
  ];

  if (canManage) {
    columns.push({
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_: unknown, record: AllergyChild) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {canDelete && (
            <Popconfirm
              title="确定删除此记录?"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
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
      {summary && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="过敏幼儿总数"
                value={summary.totalChildren}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="过敏原种类"
                value={summary.allergenList.length}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="主要过敏原分布">
              <Space wrap>
                {summary.allergenList.slice(0, 8).map((item) => (
                  <Tag
                    key={item.allergen}
                    color="red"
                    style={{ padding: '4px 12px', fontSize: 14 }}
                  >
                    <ExclamationCircleOutlined /> {item.allergen} ({item.count}人)
                  </Tag>
                ))}
                {summary.allergenList.length === 0 && (
                  <Text type="secondary">暂无数据</Text>
                )}
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <Space
          style={{ marginBottom: 16, width: '100%' }}
          wrap
          align="center"
        >
          <Title level={4} style={{ margin: 0 }}>
            过敏幼儿名单
          </Title>
          <div style={{ flex: 1 }} />
          <Select
            placeholder="选择班级"
            allowClear
            value={filterClassName}
            onChange={(value) => setFilterClassName(value)}
            style={{ width: 140 }}
            options={CLASS_OPTIONS.map((c) => ({ value: c, label: c }))}
          />
          <Input
            placeholder="幼儿姓名"
            value={filterChildName}
            onChange={(e) => setFilterChildName(e.target.value)}
            style={{ width: 140 }}
            allowClear
          />
          <Select
            placeholder="状态"
            allowClear
            value={filterActive}
            onChange={(value) => setFilterActive(value)}
            style={{ width: 120 }}
            options={[
              { value: true, label: '有效' },
              { value: false, label: '已停用' },
            ]}
          />
          <Button type="primary" onClick={handleSearch}>
            查询
          </Button>
          <Button onClick={handleReset}>重置</Button>
          {canManage && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增过敏幼儿
            </Button>
          )}
        </Space>

        <Table
          rowKey="id"
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          scroll={{ x: 1000 }}
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
        title={editingRecord ? '编辑过敏幼儿' : '新增过敏幼儿'}
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
                label="幼儿姓名"
                name="childName"
                rules={[{ required: true, message: '请输入幼儿姓名' }]}
              >
                <Input placeholder="请输入幼儿姓名" />
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
          <Form.Item
            label="过敏原"
            name="allergens"
            rules={[{ required: true, message: '请选择或输入过敏原' }]}
          >
            <Select
              mode="tags"
              placeholder="请选择或输入过敏原（支持自定义输入）"
              style={{ width: '100%' }}
              options={COMMON_ALLERGENS.map((a) => ({ value: a, label: a }))}
              tokenSeparators={[',', '，', ' ']}
            />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <TextArea rows={3} placeholder="请输入备注信息，例如过敏反应、特殊说明等" />
          </Form.Item>
          <Form.Item
            label="状态"
            name="isActive"
            valuePropName="checked"
          >
            <Switch checkedChildren="有效" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AllergyChildrenPage;
