import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Recipe } from '../../entities/recipe.entity';
import { IngredientBatch } from '../../entities/ingredient-batch.entity';
import { AllergyChild } from '../../entities/allergy-child.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipeService {
  constructor(
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,
    @InjectRepository(IngredientBatch)
    private ingredientBatchRepository: Repository<IngredientBatch>,
    @InjectRepository(AllergyChild)
    private allergyChildRepository: Repository<AllergyChild>,
  ) {}

  async create(dto: CreateRecipeDto) {
    const { ingredientBatchIds, ...recipeData } = dto;
    const recipe = this.recipeRepository.create({
      ...recipeData,
      status: recipeData.status || 'published',
      allergens: recipeData.allergens || [],
    });

    if (ingredientBatchIds && ingredientBatchIds.length > 0) {
      const batches = await this.ingredientBatchRepository.find({
        where: { id: In(ingredientBatchIds) },
      });
      recipe.ingredientBatches = batches;
    }

    return this.recipeRepository.save(recipe);
  }

  async findAll(page: number = 1, pageSize: number = 10, date?: string, mealType?: string) {
    const where: any = {};
    if (date) where.date = date;
    if (mealType) where.mealType = mealType;

    const [items, total] = await this.recipeRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page, pageSize };
  }

  async findByDate(date: string, className?: string) {
    const recipes = await this.recipeRepository.find({
      where: { date },
      order: { createdAt: 'DESC' },
    });

    if (!className) {
      return {
        breakfast: recipes.filter(r => r.mealType === 'breakfast'),
        lunch: recipes.filter(r => r.mealType === 'lunch'),
        dinner: recipes.filter(r => r.mealType === 'dinner'),
      };
    }

    const allergyChildren = await this.allergyChildRepository.find({
      where: { className, isActive: true },
    });

    const allClassAllergens = new Set<string>();
    for (const child of allergyChildren) {
      for (const allergen of child.allergens) {
        if (allergen) allClassAllergens.add(allergen);
      }
    }

    const markRecipe = (recipe: Recipe) => {
      const matchedAllergens = recipe.allergens.filter(a => allClassAllergens.has(a));
      const affectedChildren = allergyChildren.filter(child =>
        recipe.allergens.some(a => child.allergens.includes(a)),
      ).map(child => child.childName);

      return {
        ...recipe,
        hasAllergyRisk: matchedAllergens.length > 0,
        matchedAllergens,
        affectedChildren,
      };
    };

    return {
      className,
      allergyChildren,
      allClassAllergens: Array.from(allClassAllergens),
      breakfast: recipes.filter(r => r.mealType === 'breakfast').map(markRecipe),
      lunch: recipes.filter(r => r.mealType === 'lunch').map(markRecipe),
      dinner: recipes.filter(r => r.mealType === 'dinner').map(markRecipe),
    };
  }

  async findOne(id: number) {
    const recipe = await this.recipeRepository.findOne({ where: { id } });
    if (!recipe) {
      throw new NotFoundException(`菜谱 #${id} 不存在`);
    }
    return recipe;
  }

  async update(id: number, dto: UpdateRecipeDto) {
    const { ingredientBatchIds, ...recipeData } = dto;
    const recipe = await this.findOne(id);
    Object.assign(recipe, recipeData);
    if (recipeData.allergens !== undefined) {
      recipe.allergens = recipeData.allergens;
    }

    if (ingredientBatchIds) {
      const batches = await this.ingredientBatchRepository.find({
        where: { id: In(ingredientBatchIds) },
      });
      recipe.ingredientBatches = batches;
    }

    return this.recipeRepository.save(recipe);
  }

  async remove(id: number) {
    const recipe = await this.findOne(id);
    return this.recipeRepository.remove(recipe);
  }
}
