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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
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

interface RecipeFormData extends Omit<CreateRecipeDto, 'date' | 'ingredientBatchIds'> {
  date: Dayjs;
  ingredientBatchIds?: number[];
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

const RecipesPage: React.FC = () => {
  const { hasRole } = useUser();
  const isLogistics = hasRole('logistics');
  const canEdit = isLogistics;

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [recipeByDate, setRecipeByDate] = useState<{
    breakfast: Recipe[];
    lunch: Recipe[];
    dinner: Recipe[];
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
      const data = await recipes.findByDate(dateStr);
      setRecipeByDate({
        breakfast: data.breakfast || [],
        lunch: data.lunch || [],
        dinner: data.dinner || [],
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
  }, [selectedDate]);

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

  const renderRecipeCard = (recipe: Recipe) => (
    <Col xs={24} sm={12} md={8} lg={6} key={recipe.id}>
      <Card
        hoverable
        style={{ height: '100%' }}
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
              <Tag color={recipe.status === 'published' ? 'green' : 'default'}>
                {recipe.status === 'published' ? '已发布' : '草稿'}
              </Tag>
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
              {recipe.ingredientBatches && recipe.ingredientBatches.length > 0 && (
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
            </div>
          }
        />
      </Card>
    </Col>
  );

  const renderMealSection = (mealType: MealType, recipesList: Recipe[]) => (
    <div key={mealType} style={{ marginBottom: 32 }}>
      <Space align="center" style={{ marginBottom: 16 }}>
        <Tag color={mealTypeColors[mealType]} style={{ fontSize: 16, padding: '4px 12px' }}>
          {mealTypeLabels[mealType]}
        </Tag>
        <Title level={4} style={{ margin: 0 }}>
          {mealTypeLabels[mealType]}
          <Text type="secondary" style={{ marginLeft: 8, fontSize: 14 }}>
            ({recipesList.length} 道菜)
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
            菜谱管理
          </Title>
        </Space>
        <div style={{ flex: 1 }} />
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
          <Form.Item name="description" label="菜品描述">
            <TextArea rows={3} placeholder="请输入菜品描述" />
          </Form.Item>
          <Form.Item
            name="ingredientBatchIds"
            label="关联食材批次"
          >
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
