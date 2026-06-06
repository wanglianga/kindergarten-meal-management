import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  DatePicker,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Popconfirm,
  message,
  Empty,
  Spin,
  Image,
  Typography,
  Alert,
  Badge,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  WarningOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useUser } from '@/context/UserContext';
import {
  recipes,
  ingredientBatches,
  type Recipe,
  type IngredientBatch,
  type CreateRecipeDto,
} from '@/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface RecipeFormData extends Omit<CreateRecipeDto, 'date' | 'ingredientBatchIds' | 'allergens'> {
  date: Dayjs;
  ingredientBatchIds?: number[];
  allergens?: string[];
}

type MealType = 'breakfast' | 'lunch' | 'dinner';

const mealTypeLabels: Record<MealType, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
};

const mealTypeColors: Record<MealType, string> = {
  breakfast: 'gold',
  lunch: 'green',
  dinner: 'blue',
};

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

const RecipesPage: React.FC = () => {
  const { hasRole, user } = useUser();
  const isLogistics = hasRole('logistics');
  const isTeacher = hasRole('teacher');
  const canEdit = isLogistics;

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [filterClassName, setFilterClassName] = useState<string | undefined>(
    isTeacher ? user?.className : undefined
  );
  const [recipeByDate, setRecipeByDate] = useState<{
    breakfast: Recipe[];
    lunch: Recipe[];
    dinner: Recipe[];
    className?: string;
    allergyChildren?: any[];
    allClassAllergens?: string[];
  }>({
    breakfast: [],
    lunch: [],
    dinner: [],
  });
  const [batchList, setBatchList] = useState<IngredientBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const [form] = Form.useForm<RecipeFormData>();

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const data = await recipes.findByDate(dateStr, filterClassName);
      setRecipeByDate({
        breakfast: data.breakfast || [],
        lunch: data.lunch || [],
        dinner: data.dinner || [],
        className: data.className,
        allergyChildren: data.allergyChildren,
        allClassAllergens: data.allClassAllergens,
      });
    } catch (error) {
      message.error('获取菜谱列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      setBatchLoading(true);
      const result = await ingredientBatches.list();
      setBatchList(result.items || result.list || []);
    } catch (error) {
      message.error('获取食材批次列表失败');
    } finally {
      setBatchLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [selectedDate, filterClassName]);

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleOpenAdd = () => {
    setEditingRecipe(null);
    form.resetFields();
    form.setFieldsValue({
      date: selectedDate,
      mealType: 'breakfast',
      status: 'draft',
      allergens: [],
    });
    setModalVisible(true);
  };

  const handleOpenEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    form.setFieldsValue({
      date: dayjs(recipe.date),
      mealType: recipe.mealType as MealType,
      dishName: recipe.dishName,
      description: recipe.description,
      ingredientBatchIds: recipe.ingredientBatches?.map((b) => b.id) || [],
      allergens: recipe.allergens || [],
      photo: recipe.photo,
      status: recipe.status,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData: CreateRecipeDto = {
        ...values,
        date: dayjs(values.date).format('YYYY-MM-DD'),
        ingredientBatchIds: values.ingredientBatchIds || [],
        allergens: values.allergens || [],
      };
      if (editingRecipe) {
        await recipes.update(editingRecipe.id, submitData);
        message.success('更新成功');
      } else {
        await recipes.create(submitData);
        message.success('添加成功');
      }
      setModalVisible(false);
      fetchRecipes();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await recipes.remove(id);
      message.success('删除成功');
      fetchRecipes();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const getBatchLabel = (batch: IngredientBatch) =>
    `${batch.ingredientName}-${batch.batchNumber}`;

  const renderRecipeCard = (recipe: Recipe) => {
    const hasRisk = recipe.hasAllergyRisk;
    return (
      <Col xs={24} sm={12} md={8} lg={6} key={recipe.id}>
        <Badge
          count={hasRisk ? <WarningOutlined style={{ color: '#fff' }} /> : 0}
          offset={[-4, 4]}
          color="#ff4d4f"
        >
          <Card
            hoverable
            style={{
              height: '100%',
              borderColor: hasRisk ? '#ff4d4f' : undefined,
              boxShadow: hasRisk ? '0 0 0 2px rgba(255,77,79,0.2)' : undefined,
            }}
            cover={
              recipe.photo ? (
                <div style={{ height: 160, overflow: 'hidden' }}>
                  <Image
                    src={recipe.photo}
                    alt={recipe.dishName}
                    style={{ width: '100%', height: 160, objectFit: 'cover' }}
                    preview
                  />
                </div>
              ) : (
                <div
                  style={{
                    height: 160,
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text type="secondary">暂无图片</Text>
                </div>
              )
            }
            actions={
              canEdit
                ? [
                    <EditOutlined
                      key="edit"
                      onClick={() => handleOpenEdit(recipe)}
                    />,
                    <Popconfirm
                      key="delete"
                      title="确认删除"
                      description="确定要删除这个菜谱吗？"
                      onConfirm={() => handleDelete(recipe.id)}
                      okText="确认"
                      cancelText="取消"
                    >
                      <DeleteOutlined style={{ color: '#ff4d4f' }} />
                    </Popconfirm>,
                  ]
                : undefined
            }
          >
            <Card.Meta
              title={
                <Space>
                  <Text strong style={{ fontSize: 16 }}>
                    {recipe.dishName}
                  </Text>
                  <Tag
                    color={recipe.status === 'published' ? 'green' : 'default'}
                  >
                    {recipe.status === 'published' ? '已发布' : '草稿'}
                  </Tag>
                  {hasRisk && (
                    <Tooltip
                      title={`受影响幼儿：${(recipe.affectedChildren || []).join('、')}`}
                    >
                      <Tag color="red" icon={<WarningOutlined />}>
                        含过敏原
                      </Tag>
                    </Tooltip>
                  )}
                </Space>
              }
              description={
                <div style={{ marginTop: 8 }}>
                  <Paragraph
                    ellipsis={{ rows: 2 }}
                    style={{ marginBottom: 8, minHeight: 44 }}
                  >
                    {recipe.description || '暂无描述'}
                  </Paragraph>
                  {recipe.allergens && recipe.allergens.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        菜品过敏原：
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        {recipe.allergens.map((a) => (
                          <Tag
                            key={a}
                            color={
                              recipe.matchedAllergens?.includes(a) ? 'red' : 'orange'
                            }
                            style={{ marginBottom: 4 }}
                          >
                            {a}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}
                  {recipe.ingredientBatches &&
                    recipe.ingredientBatches.length > 0 && (
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          食材批次：
                        </Text>
                        <div style={{ marginTop: 4 }}>
                          {recipe.ingredientBatches.map((batch) => (
                            <Tag
                              key={batch.id}
                              color="blue"
                              style={{ marginBottom: 4 }}
                            >
                              {getBatchLabel(batch)}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )}
                  {hasRisk && recipe.affectedChildren && (
                    <div style={{ marginTop: 8, padding: 8, background: '#fff1f0', borderRadius: 4 }}>
                      <Text type="danger" style={{ fontSize: 12 }}>
                        <TeamOutlined /> 受影响幼儿：
                        {recipe.affectedChildren.join('、')}
                      </Text>
                    </div>
                  )}
                </div>
              }
            />
          </Card>
        </Badge>
      </Col>
    );
  };

  const renderMealSection = (mealType: MealType, recipesList: Recipe[]) => (
    <div key={mealType} style={{ marginBottom: 32 }}>
      <Space align="center" style={{ marginBottom: 16 }}>
        <Tag
          color={mealTypeColors[mealType]}
          style={{ fontSize: 16, padding: '4px 12px' }}
        >
          {mealTypeLabels[mealType]}
        </Tag>
        <Title level={4} style={{ margin: 0 }}>
          {mealTypeLabels[mealType]}
          <Text type="secondary" style={{ marginLeft: 8, fontSize: 14 }}>
            ({recipesList.length} 道菜
            {filterClassName && recipesList.some(r => r.hasAllergyRisk) && (
              <Text type="danger">
                ，其中 {recipesList.filter(r => r.hasAllergyRisk).length} 道含过敏原
              </Text>
            )}
            )
          </Text>
        </Title>
      </Space>
      {recipesList.length > 0 ? (
        <Row gutter={[16, 16]}>
          {recipesList.map(renderRecipeCard)}
        </Row>
      ) : (
        <Empty description={`暂无${mealTypeLabels[mealType]}菜谱`} />
      )}
    </div>
  );

  const allergyChildren = recipeByDate.allergyChildren || [];
  const allClassAllergens = recipeByDate.allClassAllergens || [];

  return (
    <div>
      <Space
        style={{ marginBottom: 24, width: '100%' }}
        align="center"
        wrap
      >
        <Space align="center">
          <CalendarOutlined style={{ fontSize: 20, color: '#1677ff' }} />
          <Title level={3} style={{ margin: 0 }}>
            菜谱{canEdit ? '管理' : '查看'}
          </Title>
        </Space>
        <div style={{ flex: 1 }} />
        <Select
          placeholder="查看班级过敏标记"
          allowClear
          value={filterClassName}
          onChange={(value) => setFilterClassName(value)}
          style={{ width: 180 }}
          options={CLASS_OPTIONS.map((c) => ({ value: c, label: c + ' 过敏视图' }))}
        />
        <DatePicker
          value={selectedDate}
          onChange={(date) => date && setSelectedDate(date)}
          style={{ width: 200 }}
          format="YYYY-MM-DD"
        />
        {canEdit && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd}>
            新增菜谱
          </Button>
        )}
      </Space>

      {filterClassName && (
        <Alert
          type={allergyChildren.length > 0 ? 'warning' : 'info'}
          showIcon
          style={{ marginBottom: 16 }}
          message={
            <Space>
              <Text strong>
                {filterClassName} 过敏幼儿共 {allergyChildren.length} 人
              </Text>
              {allClassAllergens.length > 0 && (
                <>
                  <Text type="secondary">班级涉及过敏原：</Text>
                  <Space wrap>
                    {allClassAllergens.map((a) => (
                      <Tag key={a} color="red">
                        {a}
                      </Tag>
                    ))}
                  </Space>
                </>
              )}
            </Space>
          }
          description={
            allergyChildren.length > 0 ? (
              <Space wrap>
                {allergyChildren.map((c: any) => (
                  <Tag key={c.id} color="orange">
                    {c.childName}：{(c.allergens || []).join('、')}
                  </Tag>
                ))}
              </Space>
            ) : (
              '该班级暂无过敏幼儿登记'
            )
          }
        />
      )}

      <Spin spinning={loading}>
        {renderMealSection('breakfast', recipeByDate.breakfast)}
        {renderMealSection('lunch', recipeByDate.lunch)}
        {renderMealSection('dinner', recipeByDate.dinner)}
      </Spin>

      <Modal
        title={editingRecipe ? '编辑菜谱' : '新增菜谱'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
            }}
          >
            <Form.Item
              name="date"
              label="日期"
              rules={[{ required: true, message: '请选择日期' }]}
            >
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item
              name="mealType"
              label="餐次"
              rules={[{ required: true, message: '请选择餐次' }]}
            >
              <Select
                placeholder="请选择餐次"
                options={[
                  { value: 'breakfast', label: '早餐' },
                  { value: 'lunch', label: '午餐' },
                  { value: 'dinner', label: '晚餐' },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="dishName"
              label="菜品名称"
              rules={[{ required: true, message: '请输入菜品名称' }]}
            >
              <Input placeholder="请输入菜品名称" />
            </Form.Item>
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select
                placeholder="请选择状态"
                options={[
                  { value: 'published', label: '已发布' },
                  { value: 'draft', label: '草稿' },
                ]}
              />
            </Form.Item>
          </div>
          <Form.Item
            name="allergens"
            label="菜品过敏原"
            tooltip="请选择或输入该菜品含有的过敏原，用于过敏幼儿标记"
          >
            <Select
              mode="tags"
              placeholder="请选择或输入过敏原（支持自定义输入）"
              style={{ width: '100%' }}
              loading={batchLoading}
              options={COMMON_ALLERGENS.map((a) => ({ value: a, label: a }))}
              tokenSeparators={[',', '，', ' ']}
            />
          </Form.Item>
          <Form.Item name="description" label="菜品描述">
            <TextArea rows={3} placeholder="请输入菜品描述" />
          </Form.Item>
          <Form.Item name="ingredientBatchIds" label="关联食材批次">
            <Select
              mode="multiple"
              placeholder="请选择关联的食材批次"
              loading={batchLoading}
              optionFilterProp="label"
              showSearch
              options={batchList.map((b) => ({
                value: b.id,
                label: getBatchLabel(b),
              }))}
            />
          </Form.Item>
          <Form.Item name="photo" label="菜品图片URL">
            <Input placeholder="请输入菜品图片URL" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RecipesPage;
