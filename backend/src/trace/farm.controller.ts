import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { TraceService } from './trace.service';

@Controller('farms')
export class FarmController {
  constructor(private readonly traceService: TraceService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllFarms() {
    return this.traceService.getAllFarms();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getFarmById(@Param('id') id: number) {
    return this.traceService.getFarmById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createFarm(
    @Body()
    body: {
      name: string;
      ownerName?: string;
      contactInfo?: string;
      addressDetail?: string;
      longitude?: number;
      latitude?: number;
      provinceId: number;
    },
  ) {
    return this.traceService.createFarm(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateFarm(
    @Param('id') id: number,
    @Body()
    body: {
      name?: string;
      ownerName?: string;
      contactInfo?: string;
      addressDetail?: string;
      longitude?: number;
      latitude?: number;
      provinceId?: number;
    },
  ) {
    return this.traceService.updateFarm(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteFarm(@Param('id') id: number) {
    return this.traceService.deleteFarm(id);
  }

  // Farm Certifications endpoints
  @Get(':id/certifications')
  @HttpCode(HttpStatus.OK)
  async getFarmCertifications(@Param('id') farmId: number) {
    return this.traceService.getFarmCertifications(farmId);
  }

  @Post(':id/certifications')
  @HttpCode(HttpStatus.CREATED)
  async addFarmCertification(
    @Param('id') farmId: number,
    @Body() body: { certification: string },
  ) {
    return this.traceService.addFarmCertification(farmId, body.certification);
  }

  @Delete(':id/certifications/:certification')
  @HttpCode(HttpStatus.OK)
  async deleteFarmCertification(
    @Param('id') farmId: number,
    @Param('certification') certification: string,
  ) {
    return this.traceService.deleteFarmCertification(farmId, certification);
  }
}
