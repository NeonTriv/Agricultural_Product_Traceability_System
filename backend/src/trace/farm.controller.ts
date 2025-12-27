import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductService } from './product.service';
import { Roles } from '../common/auth/roles.decorator';

@Controller('farms')
export class FarmController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllFarms() {
    return this.productService.getAllFarms();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getFarmById(@Param('id') id: number) {
    return this.productService.getFarmById(id);
  }

  @Roles('admin')
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
    return this.productService.createFarm(body);
  }

  @Roles('admin')
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
    return this.productService.updateFarm(id, body);
  }

  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteFarm(@Param('id') id: number) {
    return this.productService.deleteFarm(id);
  }

  @Get(':id/certifications')
  @HttpCode(HttpStatus.OK)
  async getFarmCertifications(@Param('id') farmId: number) {
    return this.productService.getFarmCertifications(farmId);
  }

  @Roles('admin')
  @Post(':id/certifications')
  @HttpCode(HttpStatus.CREATED)
  async addFarmCertification(
    @Param('id') farmId: number,
    @Body() body: { certification: string },
  ) {
    return this.productService.addFarmCertification(farmId, body.certification);
  }

  @Delete(':id/certifications/:certification')
  @HttpCode(HttpStatus.OK)
  async deleteFarmCertification(
    @Param('id') farmId: number,
    @Param('certification') certification: string,
  ) {
    return this.productService.deleteFarmCertification(farmId, certification);
  }
}
