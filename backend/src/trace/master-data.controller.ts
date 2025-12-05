import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { MasterDataService } from './master-data.service';

@Controller('master-data')
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  // ==================== CATEGORIES ====================
  @Get('categories')
  @HttpCode(HttpStatus.OK)
  async getAllCategories() {
    return this.masterDataService.getAllCategories();
  }

  @Get('categories/:id')
  @HttpCode(HttpStatus.OK)
  async getCategory(@Param('id') id: string) {
    return this.masterDataService.getCategory(parseInt(id));
  }

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() body: { name: string }) {
    return this.masterDataService.createCategory(body);
  }

  @Patch('categories/:id')
  @HttpCode(HttpStatus.OK)
  async updateCategory(@Param('id') id: string, @Body() body: { name?: string }) {
    return this.masterDataService.updateCategory(parseInt(id), body);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.OK)
  async deleteCategory(@Param('id') id: string) {
    return this.masterDataService.deleteCategory(parseInt(id));
  }

  // ==================== TYPES ====================
  @Get('types')
  @HttpCode(HttpStatus.OK)
  async getAllTypes() {
    return this.masterDataService.getAllTypes();
  }

  @Get('types/:id')
  @HttpCode(HttpStatus.OK)
  async getType(@Param('id') id: string) {
    return this.masterDataService.getType(parseInt(id));
  }

  @Post('types')
  @HttpCode(HttpStatus.CREATED)
  async createType(
    @Body()
    body: {
      variety: string;
      categoryId: number;
    },
  ) {
    return this.masterDataService.createType(body);
  }

  @Patch('types/:id')
  @HttpCode(HttpStatus.OK)
  async updateType(
    @Param('id') id: string,
    @Body()
    body: {
      variety?: string;
      categoryId?: number;
    },
  ) {
    return this.masterDataService.updateType(parseInt(id), body);
  }

  @Delete('types/:id')
  @HttpCode(HttpStatus.OK)
  async deleteType(@Param('id') id: string) {
    return this.masterDataService.deleteType(parseInt(id));
  }

  // ==================== AGRICULTURE PRODUCTS ====================
  @Get('agriculture-products')
  @HttpCode(HttpStatus.OK)
  async getAllAgricultureProducts() {
    return this.masterDataService.getAllAgricultureProducts();
  }

  @Get('agriculture-products/:id')
  @HttpCode(HttpStatus.OK)
  async getAgricultureProduct(@Param('id') id: string) {
    return this.masterDataService.getAgricultureProduct(parseInt(id));
  }

  @Post('agriculture-products')
  @HttpCode(HttpStatus.CREATED)
  async createAgricultureProduct(
    @Body()
    body: {
      name: string;
      imageUrl?: string;
      typeId: number;
    },
  ) {
    return this.masterDataService.createAgricultureProduct(body);
  }

  @Patch('agriculture-products/:id')
  @HttpCode(HttpStatus.OK)
  async updateAgricultureProduct(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      imageUrl?: string;
      typeId?: number;
    },
  ) {
    return this.masterDataService.updateAgricultureProduct(parseInt(id), body);
  }

  @Delete('agriculture-products/:id')
  @HttpCode(HttpStatus.OK)
  async deleteAgricultureProduct(@Param('id') id: string) {
    return this.masterDataService.deleteAgricultureProduct(parseInt(id));
  }

  // ==================== FARM CERTIFICATIONS ====================
  @Get('farm-certifications')
  @HttpCode(HttpStatus.OK)
  async getAllFarmCertifications() {
    return this.masterDataService.getAllFarmCertifications();
  }

  @Get('farm-certifications/:farmId/:certificationName')
  @HttpCode(HttpStatus.OK)
  async getFarmCertification(
    @Param('farmId') farmId: string,
    @Param('certificationName') certificationName: string,
  ) {
    return this.masterDataService.getFarmCertification(
      parseInt(farmId),
      certificationName,
    );
  }

  @Post('farm-certifications')
  @HttpCode(HttpStatus.CREATED)
  async createFarmCertification(
    @Body()
    body: {
      farmId: number;
      farmCertifications: string;
    },
  ) {
    return this.masterDataService.createFarmCertification(body);
  }

  @Patch('farm-certifications/:farmId/:certificationName')
  @HttpCode(HttpStatus.OK)
  async updateFarmCertification(
    @Param('farmId') farmId: string,
    @Param('certificationName') certificationName: string,
    @Body()
    body: {
      newFarmId?: number;
      newFarmCertifications?: string;
    },
  ) {
    return this.masterDataService.updateFarmCertification(
      parseInt(farmId),
      certificationName,
      body,
    );
  }

  @Delete('farm-certifications/:farmId/:certificationName')
  @HttpCode(HttpStatus.OK)
  async deleteFarmCertification(
    @Param('farmId') farmId: string,
    @Param('certificationName') certificationName: string,
  ) {
    return this.masterDataService.deleteFarmCertification(
      parseInt(farmId),
      certificationName,
    );
  }
}
