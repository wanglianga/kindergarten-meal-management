import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { MealDistribution } from '../../entities/meal-distribution.entity';
import { AllergyChild } from '../../entities/allergy-child.entity';
import { Recipe } from '../../entities/recipe.entity';
import { CreateMealDistributionDto } from './dto/create-meal-distribution.dto';
import { UpdateMealDistributionDto } from './dto/update-meal-distribution.dto';
import { AlertService } from '../alert/alert.service';

@Injectable()
export class MealDistributionService {
  private readonly logger = new Logger(MealDistributionService.name);

  constructor(
    @InjectRepository(MealDistribution)
    private readonly mealDistributionRepository: Repository<MealDistribution>,
    @InjectRepository(AllergyChild)
    private readonly allergyChildRepository: Repository<AllergyChild>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    private readonly alertService: AlertService,
  ) {}

  async create(dto: CreateMealDistributionDto) {
    const distribution = this.mealDistributionRepository.create({
      ...dto,
      status: dto.status || 'confirmed',
    });
    if (dto.confirmedBy && !distribution.confirmedAt) {
      distribution.confirmedAt = new Date();
    }
    const saved = await this.mealDistributionRepository.save(distribution);

    if (saved.hasRisk) {
      try {
        await this.alertService.create({
          type: 'allergy_mismatch',
          title: '过敏误配风险',
          message: `【${saved.className}】${saved.childName} ${this.getMealTypeLabel(saved.mealType)} 存在过敏误配风险：${saved.riskDescription || '未填写详细描述'}`,
          relatedId: saved.id,
        });
        this.logger.log(`创建过敏误配告警: ${saved.className} ${saved.childName}`);
      } catch (e) {
        this.logger.error('创建过敏误配告警失败', e);
      }
    }

    return saved;
  }

  private getMealTypeLabel(type: string) {
    const map: Record<string, string> = {
      breakfast: '早餐',
      lunch: '午餐',
      dinner: '晚餐',
    };
    return map[type] || type;
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    date?: string,
    className?: string,
    mealType?: string,
    status?: string,
    hasRisk?: string,
  ) {
    const where: any = {};
    if (date) {
      where.date = date;
    }
    if (className) {
      where.className = Like(`%${className}%`);
    }
    if (mealType) {
      where.mealType = mealType;
    }
    if (status) {
      where.status = status;
    }
    if (hasRisk !== undefined) {
      where.hasRisk = hasRisk === 'true';
    }

    const skip = (page - 1) * pageSize;
    const [list, total] = await this.mealDistributionRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    return { list, total, page, pageSize };
  }

  async findOne(id: number) {
    const distribution = await this.mealDistributionRepository.findOne({ where: { id } });
    if (!distribution) {
      throw new NotFoundException('分餐记录不存在');
    }
    return distribution;
  }

  async update(id: number, dto: UpdateMealDistributionDto) {
    const distribution = await this.findOne(id);
    const wasRisk = distribution.hasRisk;
    Object.assign(distribution, dto);
    if (dto.confirmedBy && !distribution.confirmedAt) {
      distribution.confirmedAt = new Date();
    }
    if (dto.status) {
      distribution.status = dto.status;
    }
    const saved = await this.mealDistributionRepository.save(distribution);

    if (!wasRisk && saved.hasRisk) {
      try {
        await this.alertService.create({
          type: 'allergy_mismatch',
          title: '过敏误配风险',
          message: `【${saved.className}】${saved.childName} ${this.getMealTypeLabel(saved.mealType)} 存在过敏误配风险：${saved.riskDescription || '未填写详细描述'}`,
          relatedId: saved.id,
        });
        this.logger.log(`更新时创建过敏误配告警: ${saved.className} ${saved.childName}`);
      } catch (e) {
        this.logger.error('创建过敏误配告警失败', e);
      }
    }

    return saved;
  }

  async remove(id: number) {
    const distribution = await this.findOne(id);
    return await this.mealDistributionRepository.remove(distribution);
  }

  async generateCheckList(date: string, className: string, mealType: string) {
    const allergyChildren = await this.allergyChildRepository.find({
      where: { className, isActive: true },
    });

    const recipes = await this.recipeRepository.find({
      where: { date, mealType },
    });

    const result = [];

    for (const child of allergyChildren) {
      const restrictedDishes: string[] = [];
      const safeDishes: string[] = [];

      for (const recipe of recipes) {
        const hasConflict = recipe.allergens.some(
          (allergen) => child.allergens.includes(allergen),
        );
        if (hasConflict) {
          restrictedDishes.push(recipe.dishName);
        } else {
          safeDishes.push(recipe.dishName);
        }
      }

      result.push({
        childId: child.id,
        childName: child.childName,
        className: child.className,
        childAllergens: child.allergens,
        restrictedDishes,
        safeDishes,
        hasRisk: restrictedDishes.length > 0,
      });
    }

    return {
      date,
      className,
      mealType,
      mealTypeLabel: this.getMealTypeLabel(mealType),
      totalChildren: allergyChildren.length,
      riskChildren: result.filter((r) => r.hasRisk).length,
      dishes: recipes.map((r) => ({
        id: r.id,
        dishName: r.dishName,
        allergens: r.allergens,
      })),
      checklist: result,
    };
  }

  async getRiskStatistics(date?: string) {
    const where: any = { hasRisk: true };
    if (date) {
      where.date = date;
    }
    const riskRecords = await this.mealDistributionRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });

    const classMap: Record<string, MealDistribution[]> = {};
    for (const record of riskRecords) {
      if (!classMap[record.className]) {
        classMap[record.className] = [];
      }
      classMap[record.className].push(record);
    }

    return {
      date: date || '全部',
      totalRiskCount: riskRecords.length,
      byClass: Object.entries(classMap).map(([className, records]) => ({
        className,
        count: records.length,
        records,
      })),
    };
  }

  async confirmDistribution(id: number, confirmedBy: string) {
    const distribution = await this.findOne(id);
    distribution.confirmedBy = confirmedBy;
    distribution.confirmedAt = new Date();
    distribution.status = 'confirmed';
    return await this.mealDistributionRepository.save(distribution);
  }
}
