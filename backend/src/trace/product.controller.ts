import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { TraceService } from './trace.service';

@Controller('products')
export class ProductController {
  constructor(private readonly traceService: TraceService) {}

  @Get('farms')
  @HttpCode(HttpStatus.OK)
  async getAllFarms() {
    return this.traceService.getAllFarms();
  }

  @Get('agriculture-products')
  @HttpCode(HttpStatus.OK)
  async getAllAgricultureProducts() {
    return this.traceService.getAllAgricultureProducts();
  }

  @Get('categories')
  @HttpCode(HttpStatus.OK)
  async getAllCategories() {
    return this.traceService.getAllCategories();
  }

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() body: { name: string }) {
    return this.traceService.createCategory(body.name);
  }

  @Post('types')
  @HttpCode(HttpStatus.CREATED)
  async createType(@Body() body: { variety: string; categoryId: number }) {
    return this.traceService.createType(body.variety, body.categoryId);
  }

  @Post('agriculture-products')
  @HttpCode(HttpStatus.CREATED)
  async createAgricultureProduct(@Body() body: { name: string; typeId: number }) {
    return this.traceService.createAgricultureProduct(body.name, body.typeId);
  }
  @Patch('agriculture-products/:id')
  @HttpCode(HttpStatus.OK)
  async updateAgricultureProduct(
    @Param('id') id: string,
    @Body() body: { name?: string; typeId?: number; imageUrl?: string },
  ) {
    return this.traceService.updateAgricultureProduct(parseInt(id), body);
  }
  @Delete('agriculture-products/:id')
  @HttpCode(HttpStatus.OK)
  async deleteAgricultureProduct(@Param('id') id: string) {
    return this.traceService.deleteAgricultureProduct(parseInt(id));
  }

  @Get('provinces')
  @HttpCode(HttpStatus.OK)
  async getAllProvinces() {
    return this.traceService.getAllProvinces();
  }

  @Get('countries')
  @HttpCode(HttpStatus.OK)
  async getAllCountries() {
    return this.traceService.getAllCountries();
  }

  @Post('countries')
  @HttpCode(HttpStatus.CREATED)
  async createCountry(
    @Body()
    body: {
      name: string;
    },
  ) {
    return this.traceService.createCountry(body);
  }

  @Post('provinces')
  @HttpCode(HttpStatus.CREATED)
  async createProvince(
    @Body()
    body: {
      name: string;
      countryId?: number;
      countryName?: string;
    },
  ) {
    return this.traceService.createProvince(body);
  }

  @Delete('provinces/:id')
  @HttpCode(HttpStatus.OK)
  async deleteProvince(@Param('id') id: string) {
    return this.traceService.deleteProvince(parseInt(id));
  }

  @Delete('countries/:id')
  @HttpCode(HttpStatus.OK)
  async deleteCountry(@Param('id') id: string) {
    return this.traceService.deleteCountry(parseInt(id));
  }

  @Get('types')
  @HttpCode(HttpStatus.OK)
  async getAllTypes() {
    return this.traceService.getAllTypes();
  }

  @Get('batches')
  @HttpCode(HttpStatus.OK)
  async getAllBatches() {
    return this.traceService.getAllBatches();
  }
  @Patch('batches/:id')
  @HttpCode(HttpStatus.OK)
  async updateBatch(
    @Param('id') id: string,
    @Body() body: { harvestDate?: string | Date; grade?: string; vendorProductId?: number | null; qrCodeUrl?: string },
  ) {
    return this.traceService.updateBatch(parseInt(id), body);
  }
  @Delete('batches/:id')
  @HttpCode(HttpStatus.OK)
  async deleteBatch(@Param('id') id: string) {
    return this.traceService.deleteBatch(parseInt(id));
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllProducts() {
    return this.traceService.getAllProducts();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProduct(
    @Body()
    body: {
      qrCodeUrl: string;
      farmId: number;
      agricultureProductId: number;
      harvestDate: Date;
      grade?: string;
    },
  ) {
    return this.traceService.createProduct(body);
  }

  @Post('create-full-batch')
  @HttpCode(HttpStatus.CREATED)
  async createFullBatch(
    @Body()
    body: {
      farmId: number;
      harvestDate: string;
      grade?: string;
      seedBatch?: string;
      createdBy?: string;
      isNewProduct: boolean;
      productId?: number | null;
      newProductName?: string | null;
      newProductTypeId?: number | null;
      vendorConfig?: any;
    },
  ) {
    return this.traceService.createFullBatch(body);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateProduct(
    @Param('id') id: string,
    @Body()
    body: {
      qrCodeUrl?: string;
      farmId?: number;
      agricultureProductId?: number;
      harvestDate?: Date;
      grade?: string;
      seedBatch?: string;
    },
  ) {
    return this.traceService.updateProduct(parseInt(id), body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteProduct(@Param('id') id: string) {
    return this.traceService.deleteProduct(parseInt(id));
  }
}
