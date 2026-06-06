import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RectificationService } from './rectification.service';
import { CreateRectificationDto } from './dto/create-rectification.dto';
import { UpdateRectificationDto } from './dto/update-rectification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '../../common/roles.enum';

@Controller('rectifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RectificationController {
  constructor(private readonly rectificationService: RectificationService) {}

  @Get()
  @Roles(UserRole.LOGISTICS, UserRole.REGULATOR)
  findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('status') status?: string,
    @Query('alertType') alertType?: string,
  ) {
    return this.rectificationService.findAll(Number(page), Number(pageSize), status, alertType);
  }

  @Get('pending-count')
  @Roles(UserRole.LOGISTICS, UserRole.REGULATOR)
  getPendingCount() {
    return this.rectificationService.getPendingCount();
  }

  @Get(':id')
  @Roles(UserRole.LOGISTICS, UserRole.REGULATOR)
  findOne(@Param('id') id: string) {
    return this.rectificationService.findOne(Number(id));
  }

  @Post()
  @Roles(UserRole.LOGISTICS, UserRole.REGULATOR)
  create(@Body() createRectificationDto: CreateRectificationDto) {
    return this.rectificationService.create(createRectificationDto);
  }

  @Put(':id')
  @Roles(UserRole.LOGISTICS, UserRole.REGULATOR)
  update(
    @Param('id') id: string,
    @Body() updateRectificationDto: UpdateRectificationDto,
  ) {
    return this.rectificationService.update(Number(id), updateRectificationDto);
  }

  @Delete(':id')
  @Roles(UserRole.LOGISTICS)
  remove(@Param('id') id: string) {
    return this.rectificationService.remove(Number(id));
  }
}
