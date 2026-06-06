import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ClassroomMealService } from './classroom-meal.service';
import { CreateClassroomMealDto } from './dto/create-classroom-meal.dto';
import { UpdateClassroomMealDto } from './dto/update-classroom-meal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '../../common/roles.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classroom-meals')
export class ClassroomMealController {
  constructor(private readonly classroomMealService: ClassroomMealService) {}

  @Get()
  @Roles(UserRole.TEACHER, UserRole.LOGISTICS, UserRole.REGULATOR)
  findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('date') date?: string,
    @Query('className') className?: string,
  ) {
    return this.classroomMealService.findAll(Number(page), Number(pageSize), date, className);
  }

  @Get('alert/allergies/:date')
  @Roles(UserRole.LOGISTICS, UserRole.REGULATOR)
  checkAllergyRisks(@Param('date') date: string) {
    return this.classroomMealService.checkAllergyRisks(date);
  }

  @Get(':id')
  @Roles(UserRole.TEACHER, UserRole.LOGISTICS, UserRole.REGULATOR)
  findOne(@Param('id') id: string) {
    return this.classroomMealService.findOne(Number(id));
  }

  @Post()
  @Roles(UserRole.TEACHER, UserRole.LOGISTICS)
  create(@Body() dto: CreateClassroomMealDto) {
    return this.classroomMealService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.TEACHER, UserRole.LOGISTICS)
  update(@Param('id') id: string, @Body() dto: UpdateClassroomMealDto) {
    return this.classroomMealService.update(Number(id), dto);
  }

  @Delete(':id')
  @Roles(UserRole.LOGISTICS)
  remove(@Param('id') id: string) {
    return this.classroomMealService.remove(Number(id));
  }
}
