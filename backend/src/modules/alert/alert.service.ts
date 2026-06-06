import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { Alert } from '../../entities/alert.entity';
import { Sample } from '../../entities/sample.entity';
import { IngredientBatch } from '../../entities/ingredient-batch.entity';
import { ClassroomMeal } from '../../entities/classroom-meal.entity';
import { EscortReview } from '../../entities/escort-review.entity';

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);

  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    @InjectRepository(Sample)
    private sampleRepository: Repository<Sample>,
    @InjectRepository(IngredientBatch)
    private ingredientBatchRepository: Repository<IngredientBatch>,
    @InjectRepository(ClassroomMeal)
    private classroomMealRepository: Repository<ClassroomMeal>,
    @InjectRepository(EscortReview)
    private escortReviewRepository: Repository<EscortReview>,
  ) {}

  async create(createAlertDto: CreateAlertDto) {
    if (!createAlertDto.alertDate) {
      createAlertDto.alertDate = new Date().toISOString().split('T')[0];
    }
    const alert = this.alertRepository.create(createAlertDto);
    return this.alertRepository.save(alert);
  }

  async findAll(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    return this.alertRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const alert = await this.alertRepository.findOne({ where: { id } });
    if (!alert) {
      throw new NotFoundException('告警不存在');
    }
    return alert;
  }

  async update(id: number, updateAlertDto: UpdateAlertDto) {
    await this.findOne(id);
    await this.alertRepository.update(id, updateAlertDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.alertRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('告警不存在');
    }
    return { message: '删除成功' };
  }

  async resolveAlert(id: number) {
    await this.findOne(id);
    await this.alertRepository.update(id, { status: 'resolved' });
    return this.findOne(id);
  }

  async getActiveCount() {
    const count = await this.alertRepository.count({ where: { status: 'active' } });
    return { count };
  }

  private async alertExistsToday(type: string, relatedId?: number): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const where: any = { type, alertDate: today };
    if (relatedId !== undefined && relatedId !== null) {
      where.relatedId = relatedId;
    }
    const count = await this.alertRepository.count({ where });
    return count > 0;
  }

  @Cron('0 */30 * * * *')
  async scanAlerts() {
    this.logger.log('开始扫描告警...');

    try {
      await this.checkSampleExpired();
    } catch (e) {
      this.logger.error('检查留样过期失败', e);
    }

    try {
      await this.checkBatchExpired();
    } catch (e) {
      this.logger.error('检查食材批次过期失败', e);
    }

    try {
      await this.checkAllergy();
    } catch (e) {
      this.logger.error('检查过敏记录失败', e);
    }

    try {
      await this.checkNegativeReview();
    } catch (e) {
      this.logger.error('检查差评失败', e);
    }

    this.logger.log('告警扫描完成');
  }

  private async checkSampleExpired() {
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const threshold = fortyEightHoursAgo.toISOString().split('T')[0];

    const samples = await this.sampleRepository.find({
      where: { status: 'stored' },
    });

    for (const sample of samples) {
      if (sample.date <= threshold) {
        const exists = await this.alertExistsToday('sample_expired', sample.id);
        if (!exists) {
          await this.create({
            type: 'sample_expired',
            message: `留样【${sample.sampleBoxNumber} - ${sample.dishName}】已超过48小时未销毁`,
            relatedId: sample.id,
          });
          this.logger.log(`创建留样过期告警: ${sample.sampleBoxNumber}`);
        }
      }
    }
  }

  private async checkBatchExpired() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in7DaysStr = in7Days.toISOString().split('T')[0];

    const batches = await this.ingredientBatchRepository.find({
      where: { status: 'normal' },
    });

    for (const batch of batches) {
      if (batch.expirationDate <= today) {
        const exists = await this.alertExistsToday('batch_expired', batch.id);
        if (!exists) {
          await this.create({
            type: 'batch_expired',
            message: `食材批次【${batch.batchNumber} - ${batch.ingredientName}】已过期`,
            relatedId: batch.id,
          });
          this.logger.log(`创建食材过期告警: ${batch.batchNumber}`);
        }
      } else if (batch.expirationDate <= in7DaysStr) {
        const exists = await this.alertExistsToday('batch_expired', batch.id);
        if (!exists) {
          await this.create({
            type: 'batch_expired',
            message: `食材批次【${batch.batchNumber} - ${batch.ingredientName}】将在7天内过期`,
            relatedId: batch.id,
          });
          this.logger.log(`创建食材即将过期告警: ${batch.batchNumber}`);
        }
      }
    }
  }

  private async checkAllergy() {
    const today = new Date().toISOString().split('T')[0];

    const meals = await this.classroomMealRepository.find({
      where: { date: today },
    });

    for (const meal of meals) {
      if (meal.allergies && meal.allergies.trim() !== '') {
        const exists = await this.alertExistsToday('allergy', meal.id);
        if (!exists) {
          await this.create({
            type: 'allergy',
            message: `${meal.className} ${meal.mealType} 存在过敏记录：${meal.allergies}`,
            relatedId: meal.id,
          });
          this.logger.log(`创建过敏告警: ${meal.className} ${meal.mealType}`);
        }
      }
    }
  }

  private async checkNegativeReview() {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];

    const reviews = await this.escortReviewRepository.find({
      where: { isNegative: false },
    });

    for (const review of reviews) {
      if (review.date >= yesterdayStr && review.date <= todayStr && review.rating <= 2) {
        const exists = await this.alertExistsToday('negative_review', review.id);
        if (!exists) {
          await this.create({
            type: 'negative_review',
            message: `家长【${review.parentName}】对${review.className || ''}的陪餐给出差评：${review.rating}星`,
            relatedId: review.id,
          });
          await this.escortReviewRepository.update(review.id, { isNegative: true });
          this.logger.log(`创建差评告警: ${review.parentName} ${review.rating}星`);
        }
      }
    }
  }
}
