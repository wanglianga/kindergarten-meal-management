import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { join } from 'path';
import * as fs from 'fs';
import * as initSqlJs from 'sql.js';
import { User } from './entities/user.entity';
import { Supplier } from './entities/supplier.entity';
import { IngredientBatch } from './entities/ingredient-batch.entity';
import { Recipe } from './entities/recipe.entity';
import { Sample } from './entities/sample.entity';
import { ClassroomMeal } from './entities/classroom-meal.entity';
import { EscortReview } from './entities/escort-review.entity';
import { Rectification } from './entities/rectification.entity';
import { Alert } from './entities/alert.entity';
import { UserRole } from './common/roles.enum';

const dataDir = join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function createDataSource(): Promise<DataSource> {
  const SQL = await initSqlJs();
  return new DataSource({
    type: 'sqljs',
    driver: SQL,
    location: join(dataDir, 'meal.db'),
    autoSave: true,
    entities: [
      User,
      Supplier,
      IngredientBatch,
      Recipe,
      Sample,
      ClassroomMeal,
      EscortReview,
      Rectification,
      Alert,
    ],
    synchronize: true,
    logging: false,
  });
}

async function seed() {
  const AppDataSource = await createDataSource();
  await AppDataSource.initialize();
  console.log('数据库连接成功');

  const userRepository = AppDataSource.getRepository(User);
  const supplierRepository = AppDataSource.getRepository(Supplier);
  const ingredientBatchRepository = AppDataSource.getRepository(IngredientBatch);
  const recipeRepository = AppDataSource.getRepository(Recipe);
  const sampleRepository = AppDataSource.getRepository(Sample);
  const classroomMealRepository = AppDataSource.getRepository(ClassroomMeal);
  const escortReviewRepository = AppDataSource.getRepository(EscortReview);

  const existingUsers = await userRepository.find();
  if (existingUsers.length > 0) {
    console.log('已存在用户数据，跳过用户创建');
  } else {
    const hashedPassword = await bcrypt.hash('123456', 10);

    const users = [
      {
        username: 'logistics',
        password: hashedPassword,
        realName: '张后勤',
        role: UserRole.LOGISTICS,
        phone: '13800138001',
      },
      {
        username: 'teacher',
        password: hashedPassword,
        realName: '李老师',
        role: UserRole.TEACHER,
        phone: '13800138002',
        className: '小一班',
      },
      {
        username: 'parent',
        password: hashedPassword,
        realName: '王家长',
        role: UserRole.PARENT,
        phone: '13800138003',
        className: '小一班',
      },
      {
        username: 'regulator',
        password: hashedPassword,
        realName: '赵监管',
        role: UserRole.REGULATOR,
        phone: '13800138004',
      },
    ];

    await userRepository.save(users.map(u => userRepository.create(u)));
    console.log('用户创建完成');
  }

  const existingSuppliers = await supplierRepository.find();
  if (existingSuppliers.length > 0) {
    console.log('已存在供应商数据，跳过供应商创建');
  } else {
    const suppliers = [
      {
        name: '绿源蔬菜配送',
        contactPerson: '陈经理',
        phone: '13900139001',
        address: 'XX市蔬菜批发市场A区',
        businessLicense: '91310000MA1FL00001',
      },
      {
        name: '鲜品肉业',
        contactPerson: '刘总',
        phone: '13900139002',
        address: 'XX市肉联厂',
        businessLicense: '91310000MA1FL00002',
      },
      {
        name: '米粮油批发',
        contactPerson: '周老板',
        phone: '13900139003',
        address: 'XX市粮油批发市场',
        businessLicense: '91310000MA1FL00003',
      },
    ];

    const savedSuppliers = await supplierRepository.save(
      suppliers.map(s => supplierRepository.create(s)),
    );
    console.log('供应商创建完成');

    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nearExpiryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const batches = [
      {
        batchNumber: 'BATCH20260601001',
        ingredientName: '大白菜',
        quantity: 50,
        unit: 'kg',
        supplierId: savedSuppliers[0].id,
        productionDate: pastDate,
        expirationDate: futureDate,
        receiveDate: today,
        status: 'normal',
      },
      {
        batchNumber: 'BATCH20260601002',
        ingredientName: '西红柿',
        quantity: 30,
        unit: 'kg',
        supplierId: savedSuppliers[0].id,
        productionDate: pastDate,
        expirationDate: nearExpiryDate,
        receiveDate: today,
        status: 'normal',
      },
      {
        batchNumber: 'BATCH20260601003',
        ingredientName: '猪瘦肉',
        quantity: 40,
        unit: 'kg',
        supplierId: savedSuppliers[1].id,
        productionDate: pastDate,
        expirationDate: futureDate,
        receiveDate: today,
        status: 'normal',
      },
      {
        batchNumber: 'BATCH20260601004',
        ingredientName: '东北大米',
        quantity: 100,
        unit: 'kg',
        supplierId: savedSuppliers[2].id,
        productionDate: pastDate,
        expirationDate: futureDate,
        receiveDate: today,
        status: 'normal',
      },
    ];

    const savedBatches = await ingredientBatchRepository.save(
      batches.map(b => ingredientBatchRepository.create(b)),
    );
    console.log('食材批次创建完成');

    const recipes = [
      {
        date: today,
        mealType: '午餐',
        dishName: '白菜炒肉片',
        description: '新鲜大白菜搭配优质猪瘦肉',
        ingredientBatches: [savedBatches[0], savedBatches[2]],
        status: 'published',
      },
      {
        date: today,
        mealType: '午餐',
        dishName: '番茄鸡蛋汤',
        description: '酸甜可口的营养汤品',
        ingredientBatches: [savedBatches[1]],
        status: 'published',
      },
      {
        date: today,
        mealType: '午餐',
        dishName: '白米饭',
        description: '东北优质大米蒸制',
        ingredientBatches: [savedBatches[3]],
        status: 'published',
      },
    ];

    await recipeRepository.save(recipes.map(r => recipeRepository.create(r)));
    console.log('菜谱创建完成');

    const samples = [
      {
        sampleBoxNumber: 'SAMPLE20260601001',
        date: today,
        mealType: '午餐',
        dishName: '白菜炒肉片',
        sampleTime: '11:30',
        sampler: '李老师',
        status: 'stored',
      },
      {
        sampleBoxNumber: 'SAMPLE20260601002',
        date: today,
        mealType: '午餐',
        dishName: '番茄鸡蛋汤',
        sampleTime: '11:30',
        sampler: '李老师',
        status: 'stored',
      },
      {
        sampleBoxNumber: 'SAMPLE20260601003',
        date: today,
        mealType: '午餐',
        dishName: '白米饭',
        sampleTime: '11:30',
        sampler: '李老师',
        status: 'stored',
      },
    ];

    await sampleRepository.save(samples.map(s => sampleRepository.create(s)));
    console.log('留样创建完成');

    const classroomMeals = [
      {
        date: today,
        className: '小一班',
        mealType: '午餐',
        allergies: '小明对花生过敏，小红对海鲜过敏',
        tempRestrictions: '',
        leftovers: '少量剩余',
        leftoverCount: 3,
        recorder: '李老师',
      },
      {
        date: today,
        className: '小二班',
        mealType: '午餐',
        allergies: '',
        tempRestrictions: '',
        leftovers: '无剩余',
        leftoverCount: 0,
        recorder: '王老师',
      },
    ];

    await classroomMealRepository.save(
      classroomMeals.map(m => classroomMealRepository.create(m)),
    );
    console.log('班级用餐记录创建完成');

    const reviews = [
      {
        date: today,
        parentName: '王家长',
        className: '小一班',
        rating: 5,
        suggestion: '饭菜味道很好，孩子吃得很开心',
        isNegative: false,
      },
      {
        date: today,
        parentName: '刘家长',
        className: '小一班',
        rating: 2,
        suggestion: '今天的菜有点咸，希望注意',
        isNegative: false,
      },
    ];

    await escortReviewRepository.save(
      reviews.map(r => escortReviewRepository.create(r)),
    );
    console.log('陪餐评价创建完成');
  }

  await AppDataSource.destroy();
  console.log('种子数据初始化完成');
}

seed().catch(err => {
  console.error('种子数据初始化失败:', err);
  process.exit(1);
});
