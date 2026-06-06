import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Sample } from '../../entities/sample.entity';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';

@Injectable()
export class SampleService {
  constructor(
    @InjectRepository(Sample)
    private sampleRepository: Repository<Sample>,
  ) {}

  create(dto: CreateSampleDto) {
    const sample = this.sampleRepository.create({
      ...dto,
      status: dto.status || 'stored',
    });
    return this.sampleRepository.save(sample);
  }

  async findAll(page: number = 1, pageSize: number = 10, date?: string, status?: string) {
    const where: any = {};
    if (date) where.date = date;
    if (status) where.status = status;

    const [items, total] = await this.sampleRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const sample = await this.sampleRepository.findOne({ where: { id } });
    if (!sample) {
      throw new NotFoundException(`留样记录 #${id} 不存在`);
    }
    return sample;
  }

  async update(id: number, dto: UpdateSampleDto) {
    const sample = await this.findOne(id);
    Object.assign(sample, dto);
    return this.sampleRepository.save(sample);
  }

  async remove(id: number) {
    const sample = await this.findOne(id);
    return this.sampleRepository.remove(sample);
  }

  async destroySample(id: number) {
    const sample = await this.findOne(id);
    sample.status = 'destroyed';
    sample.disposeTime = new Date().toISOString();
    return this.sampleRepository.save(sample);
  }

  async checkExpiredSamples() {
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    return this.sampleRepository.find({
      where: {
        status: 'stored',
        createdAt: LessThan(fortyEightHoursAgo),
      },
      order: { createdAt: 'DESC' },
    });
  }
}
