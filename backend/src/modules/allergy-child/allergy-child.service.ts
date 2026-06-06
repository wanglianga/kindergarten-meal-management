import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { AllergyChild } from '../../entities/allergy-child.entity';
import { CreateAllergyChildDto } from './dto/create-allergy-child.dto';
import { UpdateAllergyChildDto } from './dto/update-allergy-child.dto';

@Injectable()
export class AllergyChildService {
  constructor(
    @InjectRepository(AllergyChild)
    private readonly allergyChildRepository: Repository<AllergyChild>,
  ) {}

  async create(dto: CreateAllergyChildDto) {
    const child = this.allergyChildRepository.create({
      ...dto,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });
    return await this.allergyChildRepository.save(child);
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    className?: string,
    childName?: string,
    isActive?: boolean,
  ) {
    const where: any = {};
    if (className) {
      where.className = Like(`%${className}%`);
    }
    if (childName) {
      where.childName = Like(`%${childName}%`);
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const skip = (page - 1) * pageSize;
    const [list, total] = await this.allergyChildRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    return { list, total, page, pageSize };
  }

  async findByClassName(className: string) {
    return await this.allergyChildRepository.find({
      where: { className, isActive: true },
      order: { childName: 'ASC' },
    });
  }

  async findOne(id: number) {
    const child = await this.allergyChildRepository.findOne({ where: { id } });
    if (!child) {
      throw new NotFoundException('过敏幼儿记录不存在');
    }
    return child;
  }

  async update(id: number, dto: UpdateAllergyChildDto) {
    const child = await this.findOne(id);
    Object.assign(child, dto);
    return await this.allergyChildRepository.save(child);
  }

  async remove(id: number) {
    const child = await this.findOne(id);
    return await this.allergyChildRepository.remove(child);
  }

  async getActiveAllergensSummary(className?: string) {
    const where: any = { isActive: true };
    if (className) {
      where.className = className;
    }
    const children = await this.allergyChildRepository.find({ where });
    
    const allergenMap: Record<string, { allergen: string; children: string[]; count: number }> = {};
    
    for (const child of children) {
      for (const allergen of child.allergens) {
        if (!allergen) continue;
        if (!allergenMap[allergen]) {
          allergenMap[allergen] = { allergen, children: [], count: 0 };
        }
        allergenMap[allergen].children.push(`${child.className}-${child.childName}`);
        allergenMap[allergen].count++;
      }
    }

    return {
      totalChildren: children.length,
      allergenList: Object.values(allergenMap).sort((a, b) => b.count - a.count),
      children,
    };
  }
}
