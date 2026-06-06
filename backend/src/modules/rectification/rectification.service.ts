import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRectificationDto } from './dto/create-rectification.dto';
import { UpdateRectificationDto } from './dto/update-rectification.dto';
import { Rectification } from '../../entities/rectification.entity';
import { Alert } from '../../entities/alert.entity';

@Injectable()
export class RectificationService {
  constructor(
    @InjectRepository(Rectification)
    private rectificationRepository: Repository<Rectification>,
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
  ) {}

  async create(createRectificationDto: CreateRectificationDto) {
    const rectification = this.rectificationRepository.create(createRectificationDto);
    const saved = await this.rectificationRepository.save(rectification);

    if (createRectificationDto.relatedId) {
      await this.alertRepository.update(
        { id: createRectificationDto.relatedId },
        { hasRectification: true },
      );
    }

    return saved;
  }

  async findAll(page: number = 1, pageSize: number = 10, status?: string, alertType?: string) {
    const query = this.rectificationRepository.createQueryBuilder('rectification');

    if (status) {
      query.andWhere('rectification.status = :status', { status });
    }
    if (alertType) {
      query.andWhere('rectification.alertType = :alertType', { alertType });
    }

    query.orderBy('rectification.createdAt', 'DESC');
    query.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    const rectification = await this.rectificationRepository.findOne({ where: { id } });
    if (!rectification) {
      throw new NotFoundException('整改单不存在');
    }
    return rectification;
  }

  async update(id: number, updateRectificationDto: UpdateRectificationDto) {
    const rectification = await this.findOne(id);

    if (updateRectificationDto.status === 'completed' && !rectification.completedDate) {
      updateRectificationDto.completedDate = new Date().toISOString().split('T')[0];
    }

    await this.rectificationRepository.update(id, updateRectificationDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.rectificationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('整改单不存在');
    }
    return { message: '删除成功' };
  }

  async getPendingCount() {
    const count = await this.rectificationRepository.count({ where: { status: 'pending' } });
    return { count };
  }
}
