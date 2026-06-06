import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '../../common/roles.enum';

@Controller('recipes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('date') date?: string,
    @Query('mealType') mealType?: string,
  ) {
    return this.recipeService.findAll(+page, +pageSize, date, mealType);
  }

  @Get('by-date/:date')
  findByDate(@Param('date') date: string, @Query('className') className?: string) {
    return this.recipeService.findByDate(date, className);
  }

  @Post()
  @Roles(UserRole.LOGISTICS)
  create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipeService.create(createRecipeDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recipeService.findOne(+id);
  }

  @Put(':id')
  @Roles(UserRole.LOGISTICS)
  update(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto) {
    return this.recipeService.update(+id, updateRecipeDto);
  }

  @Delete(':id')
  @Roles(UserRole.LOGISTICS)
  remove(@Param('id') id: string) {
    return this.recipeService.remove(+id);
  }
}
