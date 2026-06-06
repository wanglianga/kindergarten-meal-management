import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MealDistributionService } from './meal-distribution.service';
import { CreateMealDistributionDto } from './dto/create-meal-distribution.dto';
import { UpdateMealDistributionDto } from './dto/update-meal-distribution.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '../../common/roles.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('meal-distributions')
export class MealDistributionController {
  constructor(private readonly mealDistributionService: MealDistributionService) {}

  @Post()
  @Roles(UserRole.TEACHER, UserRole.LOGISTICS)
  create(@Body() dto: CreateMealDistributionDto) {
    return this.mealDistributionService.create(dto);
  }

  @Get()
  @Roles(UserRole.TEACHER, UserRole.LOGISTICS, UserRole.REGULATOR)
  findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('date') date?: string,
    @Query('className') className?: string,
    @Query('mealType') mealType?: string,
    @Query('status') status?: string,
    @Query('hasRisk') hasRisk?: string,
  ) {
    return this.mealDistributionService.findAll(
      Number(page),
      Number(pageSize),
      date,
      className,
      mealType,
      status,
      hasRisk,
    );
  }

  @Get('checklist')
  @Roles(UserRole.TEACHER, UserRole.LOGISTICS, UserRole.REGULATOR)
  getChecklist(
    @Query('date') date: string,
    @Query('className') className: string,
    @Query('mealType') mealType: string,
  ) {
    return this.mealDistributionService.generateCheckList(date, className, mealType);
  }

  @Get('risk-statistics')
  @Roles(UserRole.LOGISTICS, UserRole.REGULATOR)
  getRiskStatistics(@Query('date') date?: string) {
    return this.mealDistributionService.getRiskStatistics(date);
  }

  @Get(':id')
  @Roles(UserRole.TEACHER, UserRole.LOGISTICS, UserRole.REGULATOR)
  findOne(@Param('id') id: string) {
    return this.mealDistributionService.findOne(Number(id));
  }

  @Put(':id')
  @Roles(UserRole.TEACHER, UserRole.LOGISTICS)
  update(@Param('id') id: string, @Body() dto: UpdateMealDistributionDto) {
    return this.mealDistributionService.update(Number(id), dto);
  }

  @Post(':id/confirm')
  @Roles(UserRole.TEACHER, UserRole.LOGISTICS)
  confirm(@Param('id') id: string, @Body('confirmedBy') confirmedBy: string) {
    return this.mealDistributionService.confirmDistribution(Number(id), confirmedBy);
  }

  @Delete(':id')
  @Roles(UserRole.LOGISTICS)
  remove(@Param('id') id: string) {
    return this.mealDistributionService.remove(Number(id));
  }
}
