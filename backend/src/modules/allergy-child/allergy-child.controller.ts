import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AllergyChildService } from './allergy-child.service';
import { CreateAllergyChildDto } from './dto/create-allergy-child.dto';
import { UpdateAllergyChildDto } from './dto/update-allergy-child.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '../../common/roles.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('allergy-children')
export class AllergyChildController {
  constructor(private readonly allergyChildService: AllergyChildService) {}

  @Post()
  @Roles(UserRole.TEACHER, UserRole.LOGISTICS)
  create(@Body() dto: CreateAllergyChildDto) {
    return this.allergyChildService.create(dto);
  }

  @Get()
  @Roles(UserRole.TEACHER, UserRole.LOGISTICS, UserRole.REGULATOR)
  findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('className') className?: string,
    @Query('childName') childName?: string,
    @Query('isActive') isActive?: string,
  ) {
    const active = isActive === undefined ? undefined : isActive === 'true';
    return this.allergyChildService.findAll(Number(page), Number(pageSize), className, childName, active);
  }

  @Get('by-class/:className')
  @Roles(UserRole.TEACHER, UserRole.LOGISTICS, UserRole.REGULATOR)
  findByClassName(@Param('className') className: string) {
    return this.allergyChildService.findByClassName(className);
  }

  @Get('summary')
  @Roles(UserRole.TEACHER, UserRole.LOGISTICS, UserRole.REGULATOR)
  getSummary(@Query('className') className?: string) {
    return this.allergyChildService.getActiveAllergensSummary(className);
  }

  @Get(':id')
  @Roles(UserRole.TEACHER, UserRole.LOGISTICS, UserRole.REGULATOR)
  findOne(@Param('id') id: string) {
    return this.allergyChildService.findOne(Number(id));
  }

  @Put(':id')
  @Roles(UserRole.TEACHER, UserRole.LOGISTICS)
  update(@Param('id') id: string, @Body() dto: UpdateAllergyChildDto) {
    return this.allergyChildService.update(Number(id), dto);
  }

  @Delete(':id')
  @Roles(UserRole.LOGISTICS)
  remove(@Param('id') id: string) {
    return this.allergyChildService.remove(Number(id));
  }
}
