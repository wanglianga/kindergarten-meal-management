import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SampleService } from './sample.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '../../common/roles.enum';

@Controller('samples')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SampleController {
  constructor(private readonly sampleService: SampleService) {}

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('date') date?: string,
    @Query('status') status?: string,
  ) {
    return this.sampleService.findAll(+page, +pageSize, date, status);
  }

  @Get('alert/expired')
  checkExpiredSamples() {
    return this.sampleService.checkExpiredSamples();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sampleService.findOne(+id);
  }

  @Post()
  @Roles(UserRole.LOGISTICS)
  create(@Body() createSampleDto: CreateSampleDto) {
    return this.sampleService.create(createSampleDto);
  }

  @Put(':id')
  @Roles(UserRole.LOGISTICS)
  update(@Param('id') id: string, @Body() updateSampleDto: UpdateSampleDto) {
    return this.sampleService.update(+id, updateSampleDto);
  }

  @Post(':id/destroy')
  @Roles(UserRole.LOGISTICS)
  destroySample(@Param('id') id: string) {
    return this.sampleService.destroySample(+id);
  }

  @Delete(':id')
  @Roles(UserRole.LOGISTICS)
  remove(@Param('id') id: string) {
    return this.sampleService.remove(+id);
  }
}
