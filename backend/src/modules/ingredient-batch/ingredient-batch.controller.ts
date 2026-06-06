import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { IngredientBatchService } from './ingredient-batch.service';
import { CreateIngredientBatchDto } from './dto/create-ingredient-batch.dto';
import { UpdateIngredientBatchDto } from './dto/update-ingredient-batch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '../../common/roles.enum';

@Controller('ingredient-batches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IngredientBatchController {
  constructor(private readonly ingredientBatchService: IngredientBatchService) {}

  @Post()
  @Roles(UserRole.LOGISTICS, UserRole.REGULATOR)
  create(@Body() createIngredientBatchDto: CreateIngredientBatchDto) {
    return this.ingredientBatchService.create(createIngredientBatchDto);
  }

  @Get()
  @Roles(UserRole.LOGISTICS, UserRole.REGULATOR)
  findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('keyword') keyword?: string,
    @Query('supplierId') supplierId?: string,
    @Query('status') status?: string,
  ) {
    return this.ingredientBatchService.findAll(
      +page,
      +pageSize,
      keyword,
      supplierId ? +supplierId : undefined,
      status,
    );
  }

  @Get('alert/expiring')
  checkExpiringBatches() {
    return this.ingredientBatchService.checkExpiringBatches();
  }

  @Get(':id')
  @Roles(UserRole.LOGISTICS, UserRole.REGULATOR)
  findOne(@Param('id') id: string) {
    return this.ingredientBatchService.findOne(+id);
  }

  @Put(':id')
  @Roles(UserRole.LOGISTICS, UserRole.REGULATOR)
  update(@Param('id') id: string, @Body() updateIngredientBatchDto: UpdateIngredientBatchDto) {
    return this.ingredientBatchService.update(+id, updateIngredientBatchDto);
  }

  @Delete(':id')
  @Roles(UserRole.LOGISTICS, UserRole.REGULATOR)
  remove(@Param('id') id: string) {
    return this.ingredientBatchService.remove(+id);
  }
}
