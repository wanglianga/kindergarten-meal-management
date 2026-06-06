import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { EscortReviewService } from './escort-review.service';
import { CreateEscortReviewDto } from './dto/create-escort-review.dto';
import { UpdateEscortReviewDto } from './dto/update-escort-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '../../common/roles.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('escort-reviews')
export class EscortReviewController {
  constructor(private readonly escortReviewService: EscortReviewService) {}

  @Get()
  @Roles(UserRole.LOGISTICS, UserRole.REGULATOR, UserRole.TEACHER, UserRole.PARENT)
  findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('date') date?: string,
    @Query('isNegative') isNegative?: string,
  ) {
    const isNegativeBool = isNegative !== undefined ? isNegative === 'true' : undefined;
    return this.escortReviewService.findAll(Number(page), Number(pageSize), date, isNegativeBool);
  }

  @Get('statistics')
  @Roles(UserRole.LOGISTICS, UserRole.REGULATOR)
  getStatistics(@Query('date') date?: string) {
    return this.escortReviewService.getStatistics(date);
  }

  @Get(':id')
  @Roles(UserRole.LOGISTICS, UserRole.REGULATOR, UserRole.TEACHER, UserRole.PARENT)
  findOne(@Param('id') id: string) {
    return this.escortReviewService.findOne(Number(id));
  }

  @Post()
  @Roles(UserRole.PARENT, UserRole.LOGISTICS)
  create(@Body() dto: CreateEscortReviewDto) {
    return this.escortReviewService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.LOGISTICS)
  update(@Param('id') id: string, @Body() dto: UpdateEscortReviewDto) {
    return this.escortReviewService.update(Number(id), dto);
  }

  @Delete(':id')
  @Roles(UserRole.LOGISTICS)
  remove(@Param('id') id: string) {
    return this.escortReviewService.remove(Number(id));
  }
}
