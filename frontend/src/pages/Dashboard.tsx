import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  List,
  Tag,
  Spin,
  Empty,
  Space,
} from 'antd';
import {
  BookOutlined,
  ExperimentOutlined,
  WarningOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useUser } from '@/context/UserContext';
import { recipes, samples, rectifications, alerts } from '@/api';
import type { Alert as AlertType, UserRole, RecipeByDate } from '@/api';

const { Title, Text } = Typography;

const ROLE_WELCOME: Record<UserRole, string> = {
  logistics: '欢迎回来，后勤管理员！今天也要保障膳食安全哦。',
  teacher: '欢迎回来，老师！请记录好班级用餐情况。',
  parent: '欢迎回来，家长！感谢您对膳食工作的监督。',
  regulator: '欢迎回来，监管人员！请查看各项告警和整改情况。',
};

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [recipeCount, setRecipeCount] = useState(0);
  const [sampleCount, setSampleCount] = useState(0);
  const [pendingRectCount, setPendingRectCount] = useState(0);
  const [activeAlertCount, setActiveAlertCount] = useState(0);
  const [todayRecipe, setTodayRecipe] = useState<RecipeByDate | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<AlertType[]>([]);

  const today = dayjs().format('YYYY-MM-DD');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recipeRes, sampleRes, rectCountRes, alertCountRes, todayRecipeRes, alertsRes] =
        await Promise.all([
          recipes.list({ date: today }).catch(() => ({ list: [], items: [], data: [], total: 0, page: 1, pageSize: 10 })),
          samples.list({ date: today }).catch(() => ({ list: [], items: [], data: [], total: 0, page: 1, pageSize: 10 })),
          rectifications.getPendingCount().catch(() => ({ count: 0 })),
          alerts.getActiveCount().catch(() => ({ count: 0 })),
          recipes.getByDate(today).catch(() => null),
          alerts.list('active').catch(() => []),
        ]);

      const recipesData = recipeRes?.list || recipeRes?.items || recipeRes?.data || [];
      const samplesData = sampleRes?.list || sampleRes?.items || sampleRes?.data || [];

      setRecipeCount(Array.isArray(recipesData) ? recipesData.length : 0);
      setSampleCount(Array.isArray(samplesData) ? samplesData.length : 0);
      setPendingRectCount(rectCountRes?.count ?? 0);
      setActiveAlertCount(alertCountRes?.count ?? 0);
      setTodayRecipe(todayRecipeRes || null);
      setActiveAlerts(Array.isArray(alertsRes) ? alertsRes : []);
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  const renderMealSection = (title: string, dishes: any[]) => {
    if (!dishes || dishes.length === 0) return null;
    return (
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 14 }}>
          {title}
        </Text>
        <div style={{ marginTop: 8 }}>
          {dishes.map((dish, idx) => (
            <Tag key={idx} color="blue" style={{ marginBottom: 4 }}>
              {dish.name}
            </Tag>
          ))}
        </div>
      </div>
    );
  };

  const getAlertTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      sample_expiry: '留样过期',
      ingredient_expiry: '食材过期',
      allergy_risk: '过敏风险',
      rectification_overdue: '整改超期',
    };
    return map[type] || type;
  };

  const getAlertTypeColor = (type: string) => {
    const map: Record<string, string> = {
      sample_expiry: 'orange',
      ingredient_expiry: 'gold',
      allergy_risk: 'red',
      rectification_overdue: 'magenta',
    };
    return map[type] || 'default';
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>
          仪表盘
        </Title>
        <Text type="secondary">
          {user?.role ? ROLE_WELCOME[user.role] : '欢迎使用膳食管理系统'}
        </Text>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="今日菜谱数量"
                value={recipeCount}
                prefix={<BookOutlined style={{ color: '#1677ff' }} />}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="今日留样数量"
                value={sampleCount}
                prefix={<ExperimentOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="待处理整改数"
                value={pendingRectCount}
                prefix={<WarningOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="活跃告警数"
                value={activeAlertCount}
                prefix={<AlertOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={14}>
            <Card title={`今日菜谱 (${today})`} style={{ height: '100%' }}>
              {todayRecipe ? (
                <>
                  {renderMealSection('早餐', todayRecipe.breakfast)}
                  {renderMealSection('午餐', todayRecipe.lunch)}
                  {renderMealSection('晚餐', todayRecipe.dinner)}
                  {(!todayRecipe.breakfast?.length &&
                    !todayRecipe.lunch?.length &&
                    !todayRecipe.dinner?.length) && <Empty description="今日暂无菜谱" />}
                </>
              ) : (
                <Empty description="今日暂无菜谱" />
              )}
            </Card>
          </Col>
          <Col xs={24} md={10}>
            <Card title="最近告警" style={{ height: '100%' }}>
              {activeAlerts && activeAlerts.length > 0 ? (
                <List
                  dataSource={activeAlerts.slice(0, 5)}
                  renderItem={(item) => (
                    <List.Item key={item.id}>
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <Space>
                          <Tag color={getAlertTypeColor(item.type)}>
                            {getAlertTypeLabel(item.type)}
                          </Tag>
                          <Text strong>{item.title}</Text>
                        </Space>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.message}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
                        </Text>
                      </Space>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无活跃告警" />
              )}
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Dashboard;
