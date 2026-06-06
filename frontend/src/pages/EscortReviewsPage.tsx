import React, { useState, useEffect } from 'react';
import {
  Table,
  Form,
  Modal,
  DatePicker,
  Select,
  Input,
  Button,
  Space,
  message,
  Tag,
  Card,
  Row,
  Col,
  Rate,
  Image,
  Statistic,
  Divider,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { useUser } from '@/context/UserContext';
import {
  escortReviews,
  type EscortReview,
  type CreateEscortReviewDto,
  type EscortReviewStatistics,
} from '@/api';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const CLASS_OPTIONS = [
  '小一班', '小二班', '小三班',
  '中一班', '中二班',
  '大一班', '大二班',
];

const EscortReviewsPage: React.FC = () => {
  const { hasRole } = useUser();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<EscortReview[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filterDateRange, setFilterDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [filterIsNegative, setFilterIsNegative] = useState<boolean | undefined>(undefined);

  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<CreateEscortReviewDto>();

  const [showStatistics, setShowStatistics] = useState(false);
  const [statisticsData, setStatisticsData] = useState<EscortReviewStatistics | null>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [statisticsDate, setStatisticsDate] = useState<Dayjs | null>(null);

  const canCreate = hasRole(['parent', 'logistics']);
  const canViewStatistics = hasRole(['logistics', 'regulator']);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: { page: number; pageSize: number; date?: string; isNegative?: boolean } = {
        page,
        pageSize,
      };
      if (filterDateRange && filterDateRange[0] && filterDateRange[1]) {
        params.date = filterDateRange[0].format('YYYY-MM-DD');
      }
      if (filterIsNegative !== undefined) {
        params.isNegative = filterIsNegative;
      }
      const res = await escortReviews.list(params);
      setDataSource(res.list);
      setTotal(res.total);
    } catch (error) {
      message.error('获取陪餐评价列表失败');
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
    setFilterDateRange(null);
    setFilterIsNegative(undefined);
    setPage(1);
    setTimeout(fetchData, 0);
  };

  const handleAdd = () => {
    form.resetFields();
    setModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreateEscortReviewDto = {
        ...values,
        date: values.date ? (values.date as unknown as Dayjs).format('YYYY-MM-DD') : '',
      };
      await escortReviews.create(payload);
      message.success('提交陪餐评价成功');
      setModalOpen(false);
      fetchData();
      if (showStatistics) {
        fetchStatistics();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStatistics = async () => {
    setStatisticsLoading(true);
    try {
      const date = statisticsDate ? statisticsDate.format('YYYY-MM-DD') : undefined;
      const res = await escortReviews.getStatistics(date);
      setStatisticsData(res);
    } catch (error) {
      message.error('获取统计数据失败');
    } finally {
      setStatisticsLoading(false);
    }
  };

  const handleToggleStatistics = () => {
    if (!showStatistics) {
      setShowStatistics(true);
      fetchStatistics();
    } else {
      setShowStatistics(false);
    }
  };

  const columns: ColumnsType<EscortReview> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
    },
    {
      title: '家长姓名',
      dataIndex: 'parentName',
      key: 'parentName',
      width: 120,
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'className',
      width: 100,
      render: (value: string) => value || <span style={{ color: '#999' }}>-</span>,
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 160,
      render: (value: number) => <Rate disabled value={value} />,
    },
    {
      title: '照片',
      dataIndex: 'photo',
      key: 'photo',
      width: 100,
      render: (value: string) =>
        value ? (
          <Image
            width={60}
            height={60}
            src={value}
            style={{ objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
          />
        ) : (
          <span style={{ color: '#999' }}>-</span>
        ),
    },
    {
      title: '建议',
      dataIndex: 'suggestion',
      key: 'suggestion',
      ellipsis: true,
      render: (value: string) => value || <span style={{ color: '#999' }}>-</span>,
    },
    {
      title: '是否差评',
      dataIndex: 'isNegative',
      key: 'isNegative',
      width: 100,
      render: (value: boolean) =>
        value ? <Tag color="red">差评</Tag> : <Tag color="green">正常</Tag>,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space style={{ marginBottom: 16, width: '100%' }} wrap>
          <RangePicker
            value={filterDateRange}
            onChange={(dates) => setFilterDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
            style={{ width: 280 }}
          />
          <Select
            placeholder="是否差评"
            allowClear
            value={filterIsNegative !== undefined ? String(filterIsNegative) : undefined}
            onChange={(value) => {
              if (value === undefined) {
                setFilterIsNegative(undefined);
              } else {
                setFilterIsNegative(value === 'true');
              }
            }}
            style={{ width: 140 }}
            options={[
              { value: 'true', label: '仅看差评' },
              { value: 'false', label: '仅看非差评' },
            ]}
          />
          <Button type="primary" onClick={handleSearch}>
            查询
          </Button>
          <Button onClick={handleReset}>重置</Button>
          {canCreate && (
            <Button type="primary" onClick={handleAdd}>
              提交陪餐评价
            </Button>
          )}
          {canViewStatistics && (
            <>
              <DatePicker
                placeholder="统计日期(可选)"
                value={statisticsDate}
                onChange={(date) => setStatisticsDate(date)}
                style={{ width: 200 }}
                allowClear
              />
              <Button onClick={handleToggleStatistics}>
                {showStatistics ? '收起统计' : '查看统计'}
              </Button>
            </>
          )}
        </Space>

        {showStatistics && canViewStatistics && (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card loading={statisticsLoading}>
                  <Statistic title="总评价数" value={statisticsData?.totalCount ?? 0} />
                </Card>
              </Col>
              <Col span={6}>
                <Card loading={statisticsLoading}>
                  <Statistic
                    title="平均评分"
                    precision={2}
                    value={statisticsData?.averageRating ?? 0}
                    suffix={<Rate disabled value={statisticsData?.averageRating ?? 0} />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card loading={statisticsLoading}>
                  <Statistic
                    title="差评数量"
                    value={statisticsData?.negativeCount ?? 0}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card loading={statisticsLoading}>
                  <Statistic
                    title="差评率"
                    precision={2}
                    value={
                      statisticsData && statisticsData.totalCount > 0
                        ? (statisticsData.negativeCount / statisticsData.totalCount) * 100
                        : 0
                    }
                    suffix="%"
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
            </Row>

            {statisticsData && statisticsData.negativeList.length > 0 && (
              <>
                <Divider orientation="left">差评列表</Divider>
                <Table
                  rowKey="id"
                  dataSource={statisticsData.negativeList}
                  pagination={false}
                  size="small"
                  rowClassName={() => 'negative-row'}
                  columns={[
                    { title: '日期', dataIndex: 'date', key: 'date' },
                    { title: '家长姓名', dataIndex: 'parentName', key: 'parentName' },
                    { title: '班级', dataIndex: 'className', key: 'className' },
                    {
                      title: '评分',
                      dataIndex: 'rating',
                      key: 'rating',
                      render: (v: number) => <Rate disabled value={v} />,
                    },
                    { title: '建议', dataIndex: 'suggestion', key: 'suggestion', ellipsis: true },
                  ]}
                />
                <Divider />
              </>
            )}
          </>
        )}

        <Table
          rowKey="id"
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          scroll={{ x: 1100 }}
          rowClassName={(record) => (record.isNegative ? 'negative-row' : '')}
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

      <style>{`
        .negative-row > td {
          background-color: #fff1f0 !important;
        }
      `}</style>

      <Modal
        title="提交陪餐评价"
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        width={560}
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
                label="家长姓名"
                name="parentName"
                rules={[{ required: true, message: '请输入家长姓名' }]}
              >
                <Input placeholder="请输入家长姓名" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="班级" name="className">
                <Select
                  placeholder="请选择班级"
                  allowClear
                  options={CLASS_OPTIONS.map((c) => ({ value: c, label: c }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="评分"
                name="rating"
                rules={[{ required: true, message: '请选择评分' }]}
              >
                <Rate />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="照片URL" name="photo">
            <Input placeholder="请输入照片URL" />
          </Form.Item>
          <Form.Item label="建议" name="suggestion">
            <TextArea rows={4} placeholder="请输入您的建议" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EscortReviewsPage;
