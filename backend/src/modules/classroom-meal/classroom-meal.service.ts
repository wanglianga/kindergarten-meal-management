import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, And } from 'typeorm';
import { ClassroomMeal } from '../../entities/classroom-meal.entity';
import { CreateClassroomMealDto } from './dto/create-classroom-meal.dto';
import { UpdateClassroomMealDto } from './dto/update-classroom-meal.dto';

@Injectable()
export class ClassroomMealService {
  constructor(
    @InjectRepository(ClassroomMeal)
    private readonly classroomMealRepository: Repository<ClassroomMeal>,
  ) {}

  async create(dto: CreateClassroomMealDto) {
    const meal = this.classroomMealRepository.create(dto);
    return await this.classroomMealRepository.save(meal);
  }

  async findAll(page: number = 1, pageSize: number = 10, date?: string, className?: string) {
    const where: any = {};
    if (date) {
      where.date = date;
    }
    if (className) {
      where.className = Like(`%${className}%`);
    }

    const skip = (page - 1) * pageSize;
    const [list, total] = await this.classroomMealRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    const meal = await this.classroomMealRepository.findOne({ where: { id } });
    if (!meal) {
      throw new NotFoundException('班级用餐记录不存在');
    }
    return meal;
  }

  async update(id: number, dto: UpdateClassroomMealDto) {
    const meal = await this.findOne(id);
    Object.assign(meal, dto);
    return await this.classroomMealRepository.save(meal);
  }

  async remove(id: number) {
    const meal = await this.findOne(id);
    return await this.classroomMealRepository.remove(meal);
  }

  async checkAllergyRisks(date: string) {
    const records = await this.classroomMealRepository.find({
      where: {
        date,
      },
    });

    const allergyRecords = records.filter((r) => r.allergies && r.allergies.trim() !== '');

    return {
      date,
      totalCount: records.length,
      allergyCount: allergyRecords.length,
      allergyList: allergyRecords,
    };
  }
}
