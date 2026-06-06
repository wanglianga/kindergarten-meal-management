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
import { AlertService } from './alert.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '../../common/roles.enum';

@Controller('alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get()
  @Roles(UserRole.LOGISTICS, UserRole.REGULATOR)
  findAll(@Query('status') status?: string) {
    return this.alertService.findAll(status);
  }

  @Get('active-count')
  @Roles(UserRole.LOGISTICS, UserRole.REGULATOR)
  getActiveCount() {
    return this.alertService.getActiveCount();
  }

  @Get(':id')
  @Roles(UserRole.LOGISTICS, UserRole.REGULATOR)
  findOne(@Param('id') id: string) {
    return this.alertService.findOne(Number(id));
  }

  @Post()
  @Roles(UserRole.LOGISTICS)
  create(@Body() createAlertDto: CreateAlertDto) {
    return this.alertService.create(createAlertDto);
  }

  @Put(':id')
  @Roles(UserRole.LOGISTICS)
  update(@Param('id') id: string, @Body() updateAlertDto: UpdateAlertDto) {
    return this.alertService.update(Number(id), updateAlertDto);
  }

  @Post(':id/resolve')
  @Roles(UserRole.LOGISTICS, UserRole.REGULATOR)
  resolveAlert(@Param('id') id: string) {
    return this.alertService.resolveAlert(Number(id));
  }

  @Delete(':id')
  @Roles(UserRole.LOGISTICS)
  remove(@Param('id') id: string) {
    return this.alertService.remove(Number(id));
  }
}
