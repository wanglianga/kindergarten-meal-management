import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  InputNumber,
  Space,
  message,
  Popconfirm,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useUser } from '../context/UserContext';
import {
  suppliers,
  ingredientBatches,
  Supplier as SupplierType,
  IngredientBatch as IngredientBatchType,
  CreateSupplierDto,
  CreateIngredientBatchDto,
} from '../api';

interface SupplierFormData extends CreateSupplierDto {}
interface BatchFormData extends CreateIngredientBatchDto {}

const SuppliersPage: React.FC = () => {
  const { hasRole } = useUser();
  const isLogistics = hasRole('logistics');
  const isSupervisor = hasRole('supervisor');
  const canEditSupplier = isLogistics;
  const canEditBatch = isLogistics;

  const [supplierList, setSupplierList] = useState<SupplierType[]>([]);
  const [batchList, setBatchList] = useState<IngredientBatchType[]>([]);
  const [expiringList, setExpiringList] = useState<IngredientBatchType[]>([]);
  const [loadingSupplier, setLoadingSupplier] = useState(false);
  const [loadingBatch, setLoadingBatch] = useState(false);

  const [keyword, setKeyword] = useState('');
  const [supplierFilter, setSupplierFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [supplierModalVisible, setSupplierModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [expiringModalVisible, setExpiringModalVisible] = useState(false);

  const [editingSupplier, setEditingSupplier] = useState<SupplierType | null>(null);
  const [editingBatch, setEditingBatch] = useState<IngredientBatchType | null>(null);

  const [supplierForm] = Form.useForm<SupplierFormData>();
  const [batchForm] = Form.useForm<BatchFormData>();

  const fetchSuppliers = async () => {
    try {
      setLoadingSupplier(true);
      const { data } = await suppliers.getAll();
      setSupplierList(data);
    } catch (error) {
      message.error('获取供应商列表失败');
    } finally {
      setLoadingSupplier(false);
    }
  };

  const fetchBatches = async () => {
    try {
      setLoadingBatch(true);
      const params: { keyword?: string; supplierId?: number; status?: string } = {};
      if (keyword) params.keyword = keyword;
      if (supplierFilter) params.supplierId = supplierFilter;
      if (statusFilter) params.status = statusFilter;
      const { data } = await ingredientBatches.getAll(params);
      setBatchList(data);
    } catch (error) {
      message.error('获取食材批次列表失败');
    } finally {
      setLoadingBatch(false);
    }
  };

  const fetchExpiringBatches = async () => {
    try {
      const { data } = await ingredientBatches.getExpiring();
      setExpiringList(data);
    } catch (error) {
      message.error('获取即将过期批次失败');
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchBatches();
  }, []);

  const handleOpenAddSupplier = () => {
    setEditingSupplier(null);
    supplierForm.resetFields();
    supplierForm.setFieldsValue({ isActive: true });
    setSupplierModalVisible(true);
  };

  const handleOpenEditSupplier = (supplier: SupplierType) => {
    setEditingSupplier(supplier);
    supplierForm.setFieldsValue({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      address: supplier.address,
      businessLicense: supplier.businessLicense,
      isActive: supplier.isActive,
    });
    setSupplierModalVisible(true);
  };

  const handleSubmitSupplier = async () => {
    try {
      const values = await supplierForm.validateFields();
      if (editingSupplier) {
        await suppliers.update(editingSupplier.id, values);
        message.success('更新成功');
      } else {
        await suppliers.create(values);
        message.success('添加成功');
      }
      setSupplierModalVisible(false);
      fetchSuppliers();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    try {
      await suppliers.delete(id);
      message.success('删除成功');
      fetchSuppliers();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleOpenAddBatch = () => {
    setEditingBatch(null);
    batchForm.resetFields();
    batchForm.setFieldsValue({ unit: 'kg', status: 'normal' });
    setBatchModalVisible(true);
  };

  const handleOpenEditBatch = (batch: IngredientBatchType) => {
    setEditingBatch(batch);
    batchForm.setFieldsValue({
      batchNumber: batch.batchNumber,
      ingredientName: batch.ingredientName,
      quantity: batch.quantity,
      unit: batch.unit,
      supplierId: batch.supplierId,
      productionDate: dayjs(batch.productionDate),
      expirationDate: dayjs(batch.expirationDate),
      receiveDate: dayjs(batch.receiveDate),
      acceptancePhoto: batch.acceptancePhoto,
      invoicePhoto: batch.invoicePhoto,
      status: batch.status,
      remark: batch.remark,
    });
    setBatchModalVisible(true);
  };

  const handleSubmitBatch = async () => {
    try {
      const values = await batchForm.validateFields();
      const submitData: CreateIngredientBatchDto = {
        ...values,
        productionDate: dayjs(values.productionDate).format('YYYY-MM-DD'),
        expirationDate: dayjs(values.expirationDate).format('YYYY-MM-DD'),
        receiveDate: dayjs(values.receiveDate).format('YYYY-MM-DD'),
      };
      if (editingBatch) {
        await ingredientBatches.update(editingBatch.id, submitData);
        message.success('更新成功');
      } else {
        await ingredientBatches.create(submitData);
        message.success('添加成功');
      }
      setBatchModalVisible(false);
      fetchBatches();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDeleteBatch = async (id: number) => {
    try {
      await ingredientBatches.delete(id);
      message.success('删除成功');
      fetchBatches();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const isExpiringOrExpired = (batch: IngredientBatchType): boolean => {
    const expiry = dayjs(batch.expirationDate);
    const diffDays = expiry.diff(dayjs(), 'day');
    return diffDays <= 7;
  };

  const supplierColumns: ColumnsType<SupplierType> = [
    {
      title: '供应商名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '联系人',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '营业执照',
      dataIndex: 'businessLicense',
      key: 'businessLicense',
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) =>
        isActive ? <Tag color="green">启用</Tag> : <Tag>停用</Tag>,
    },
  ];

  if (canEditSupplier) {
    supplierColumns.push({
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenEditSupplier(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个供应商吗？"
            onConfirm={() => handleDeleteSupplier(record.id)}
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

  const batchColumns: ColumnsType<IngredientBatchType> = [
    {
      title: '批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
    },
    {
      title: '食材名称',
      dataIndex: 'ingredientName',
      key: 'ingredientName',
    },
    {
      title: '供应商',
      dataIndex: ['supplier', 'name'],
      key: 'supplierName',
      render: (_, record) => record.supplier?.name || '-',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (val, record) => `${val}${record.unit || ''}`,
    },
    {
      title: '生产日期',
      dataIndex: 'productionDate',
      key: 'productionDate',
    },
    {
      title: '保质期',
      dataIndex: 'expirationDate',
      key: 'expirationDate',
    },
    {
      title: '验收日期',
      dataIndex: 'receiveDate',
      key: 'receiveDate',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'normal' | 'abnormal') =>
        status === 'normal' ? (
          <Tag color="green">正常</Tag>
        ) : (
          <Tag color="red">异常</Tag>
        ),
    },
  ];

  if (canEditBatch) {
    batchColumns.push({
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenEditBatch(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个食材批次吗？"
            onConfirm={() => handleDeleteBatch(record.id)}
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

  const expiringColumns: ColumnsType<IngredientBatchType> = [
    {
      title: '批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
    },
    {
      title: '食材名称',
      dataIndex: 'ingredientName',
      key: 'ingredientName',
    },
    {
      title: '供应商',
      dataIndex: ['supplier', 'name'],
      key: 'supplierName',
      render: (_, record) => record.supplier?.name || '-',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (val, record) => `${val}${record.unit || ''}`,
    },
    {
      title: '生产日期',
      dataIndex: 'productionDate',
      key: 'productionDate',
    },
    {
      title: '保质期',
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      render: (val: string) => {
        const diff = dayjs(val).diff(dayjs(), 'day');
        let color = '';
        let label = val;
        if (diff < 0) {
          color = 'red';
          label = `${val} (已过期${Math.abs(diff)}天)`;
        } else if (diff <= 7) {
          color = 'orange';
          label = `${val} (剩余${diff}天)`;
        }
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'normal' | 'abnormal') =>
        status === 'normal' ? (
          <Tag color="green">正常</Tag>
        ) : (
          <Tag color="red">异常</Tag>
        ),
    },
  ];

  const supplierTab = (
    <div>
      <Space style={{ marginBottom: 16 }}>
        {canEditSupplier && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddSupplier}>
            新增供应商
          </Button>
        )}
      </Space>
      <Table<SupplierType>
        rowKey="id"
        loading={loadingSupplier}
        dataSource={supplierList}
        columns={supplierColumns}
      />
    </div>
  );

  const batchTab = (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder="关键字搜索"
          allowClear
          style={{ width: 200 }}
          onSearch={(val) => {
            setKeyword(val);
            setTimeout(fetchBatches, 0);
          }}
        />
        <Select
          placeholder="选择供应商"
          allowClear
          style={{ width: 200 }}
          value={supplierFilter}
          onChange={(val) => {
            setSupplierFilter(val);
            setTimeout(fetchBatches, 0);
          }}
          options={supplierList.map((s) => ({ value: s.id, label: s.name }))}
        />
        <Select
          placeholder="状态筛选"
          allowClear
          style={{ width: 150 }}
          value={statusFilter || undefined}
          onChange={(val) => {
            setStatusFilter(val || '');
            setTimeout(fetchBatches, 0);
          }}
          options={[
            { value: 'normal', label: '正常' },
            { value: 'abnormal', label: '异常' },
          ]}
        />
        <Button type="primary" onClick={fetchBatches}>
          查询
        </Button>
        <Button
          icon={<WarningOutlined />}
          onClick={() => {
            fetchExpiringBatches();
            setExpiringModalVisible(true);
          }}
        >
          即将/已过期批次
        </Button>
        {canEditBatch && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddBatch}>
            新增批次
          </Button>
        )}
      </Space>
      <Table<IngredientBatchType>
        rowKey="id"
        loading={loadingBatch}
        dataSource={batchList}
        columns={batchColumns}
        rowClassName={(record) =>
          isExpiringOrExpired(record) ? 'bg-red-50' : ''
        }
      />
    </div>
  );

  return (
    <div>
      <Tabs
        items={[
          {
            key: 'suppliers',
            label: '供应商管理',
            children: supplierTab,
          },
          {
            key: 'batches',
            label: '食材批次管理',
            children: batchTab,
          },
        ]}
      />

      <Modal
        title={editingSupplier ? '编辑供应商' : '新增供应商'}
        open={supplierModalVisible}
        onOk={handleSubmitSupplier}
        onCancel={() => setSupplierModalVisible(false)}
        destroyOnClose
      >
        <Form form={supplierForm} layout="vertical">
          <Form.Item
            name="name"
            label="供应商名称"
            rules={[{ required: true, message: '请输入供应商名称' }]}
          >
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="contactPerson" label="联系人">
            <Input placeholder="请输入联系人" />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input placeholder="请输入地址" />
          </Form.Item>
          <Form.Item name="businessLicense" label="营业执照">
            <Input placeholder="请输入营业执照编号" />
          </Form.Item>
          <Form.Item name="isActive" label="状态" valuePropName="checked">
            <Select
              options={[
                { value: true, label: '启用' },
                { value: false, label: '停用' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingBatch ? '编辑食材批次' : '新增食材批次'}
        open={batchModalVisible}
        onOk={handleSubmitBatch}
        onCancel={() => setBatchModalVisible(false)}
        width={700}
        destroyOnClose
      >
        <Form form={batchForm} layout="vertical">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
            }}
          >
            <Form.Item
              name="batchNumber"
              label="批次号"
              rules={[{ required: true, message: '请输入批次号' }]}
            >
              <Input placeholder="请输入批次号" />
            </Form.Item>
            <Form.Item
              name="ingredientName"
              label="食材名称"
              rules={[{ required: true, message: '请输入食材名称' }]}
            >
              <Input placeholder="请输入食材名称" />
            </Form.Item>
            <Form.Item
              name="supplierId"
              label="供应商"
              rules={[{ required: true, message: '请选择供应商' }]}
            >
              <Select
                placeholder="请选择供应商"
                options={supplierList.map((s) => ({ value: s.id, label: s.name }))}
              />
            </Form.Item>
            <Form.Item
              name="quantity"
              label="数量"
              rules={[{ required: true, message: '请输入数量' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入数量"
                min={0}
              />
            </Form.Item>
            <Form.Item name="unit" label="单位">
              <Input placeholder="例如：kg, g, 个" />
            </Form.Item>
            <Form.Item
              name="productionDate"
              label="生产日期"
              rules={[{ required: true, message: '请选择生产日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="expirationDate"
              label="保质期至"
              rules={[{ required: true, message: '请选择保质期至' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="receiveDate"
              label="验收日期"
              rules={[{ required: true, message: '请选择验收日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select
                placeholder="请选择状态"
                options={[
                  { value: 'normal', label: '正常' },
                  { value: 'abnormal', label: '异常' },
                ]}
              />
            </Form.Item>
          </div>
          <Form.Item name="acceptancePhoto" label="验收照片URL">
            <Input placeholder="请输入验收照片URL" />
          </Form.Item>
          <Form.Item name="invoicePhoto" label="票据照片URL">
            <Input placeholder="请输入票据照片URL" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="即将/已过期批次"
        open={expiringModalVisible}
        onCancel={() => setExpiringModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setExpiringModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={900}
      >
        <Table<IngredientBatchType>
          rowKey="id"
          dataSource={expiringList}
          columns={expiringColumns}
          pagination={false}
        />
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

export default SuppliersPage;
