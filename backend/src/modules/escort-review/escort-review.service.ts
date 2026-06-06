import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EscortReview } from '../../entities/escort-review.entity';
import { CreateEscortReviewDto } from './dto/create-escort-review.dto';
import { UpdateEscortReviewDto } from './dto/update-escort-review.dto';

@Injectable()
export class EscortReviewService {
  constructor(
    @InjectRepository(EscortReview)
    private readonly escortReviewRepository: Repository<EscortReview>,
  ) {}

  async create(dto: CreateEscortReviewDto) {
    const isNegative = dto.isNegative !== undefined ? dto.isNegative : dto.rating <= 2;
    const review = this.escortReviewRepository.create({
      ...dto,
      isNegative,
    });
    return await this.escortReviewRepository.save(review);
  }

  async findAll(page: number = 1, pageSize: number = 10, date?: string, isNegative?: boolean) {
    const where: any = {};
    if (date) {
      where.date = date;
    }
    if (isNegative !== undefined) {
      where.isNegative = isNegative;
    }

    const skip = (page - 1) * pageSize;
    const [list, total] = await this.escortReviewRepository.findAndCount({
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
    const review = await this.escortReviewRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException('陪餐评价不存在');
    }
    return review;
  }

  async update(id: number, dto: UpdateEscortReviewDto) {
    const review = await this.findOne(id);
    const updateData: any = { ...dto };
    if (dto.rating !== undefined && dto.isNegative === undefined) {
      updateData.isNegative = dto.rating <= 2;
    }
    Object.assign(review, updateData);
    return await this.escortReviewRepository.save(review);
  }

  async remove(id: number) {
    const review = await this.findOne(id);
    return await this.escortReviewRepository.remove(review);
  }

  async getStatistics(date?: string) {
    const where: any = {};
    if (date) {
      where.date = date;
    }

    const list = await this.escortReviewRepository.find({ where });
    const totalCount = list.length;
    const negativeList = list.filter((r) => r.isNegative);
    const negativeCount = negativeList.length;
    const averageRating = totalCount > 0
      ? list.reduce((sum, r) => sum + r.rating, 0) / totalCount
      : 0;

    return {
      date,
      totalCount,
      averageRating,
      negativeCount,
      negativeList,
    };
  }
}
