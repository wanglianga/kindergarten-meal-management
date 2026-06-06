import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { IngredientBatch } from '../../entities/ingredient-batch.entity';
import { Supplier } from '../../entities/supplier.entity';
import { CreateIngredientBatchDto } from './dto/create-ingredient-batch.dto';
import { UpdateIngredientBatchDto } from './dto/update-ingredient-batch.dto';

@Injectable()
export class IngredientBatchService {
  constructor(
    @InjectRepository(IngredientBatch)
    private ingredientBatchRepository: Repository<IngredientBatch>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}

  async create(dto: CreateIngredientBatchDto) {
    const supplier = await this.supplierRepository.findOne({ where: { id: dto.supplierId } });
    if (!supplier) {
      throw new BadRequestException(`供应商 #${dto.supplierId} 不存在`);
    }
    const batch = this.ingredientBatchRepository.create(dto);
    return this.ingredientBatchRepository.save(batch);
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    keyword?: string,
    supplierId?: number,
    status?: string,
  ) {
    const where: any = {};
    if (keyword) {
      where.ingredientName = Like(`%${keyword}%`);
    }
    if (supplierId) {
      where.supplierId = supplierId;
    }
    if (status) {
      where.status = status;
    }
    const [items, total] = await this.ingredientBatchRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const batch = await this.ingredientBatchRepository.findOne({ where: { id } });
    if (!batch) {
      throw new NotFoundException(`食材批次 #${id} 不存在`);
    }
    return batch;
  }

  async update(id: number, dto: UpdateIngredientBatchDto) {
    const batch = await this.findOne(id);
    if (dto.supplierId) {
      const supplier = await this.supplierRepository.findOne({ where: { id: dto.supplierId } });
      if (!supplier) {
        throw new BadRequestException(`供应商 #${dto.supplierId} 不存在`);
      }
    }
    Object.assign(batch, dto);
    return this.ingredientBatchRepository.save(batch);
  }

  async remove(id: number) {
    const batch = await this.findOne(id);
    return this.ingredientBatchRepository.remove(batch);
  }

  async checkExpiringBatches() {
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);

    const todayStr = today.toISOString().split('T')[0];
    const sevenDaysLaterStr = sevenDaysLater.toISOString().split('T')[0];

    const expiring = await this.ingredientBatchRepository.find({
      where: {
        expirationDate: Between(todayStr, sevenDaysLaterStr),
      },
      order: { expirationDate: 'ASC' },
    });

    const expired = await this.ingredientBatchRepository.find({
      where: {
        expirationDate: LessThanOrEqual(todayStr),
      },
      order: { expirationDate: 'ASC' },
    });

    return {
      expiring: expiring.map(b => ({ ...b, alertType: 'expiring' })),
      expired: expired.map(b => ({ ...b, alertType: 'expired' })),
    };
  }
}
