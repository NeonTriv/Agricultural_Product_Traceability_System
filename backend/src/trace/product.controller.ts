import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductService } from './product.service';
import { Roles } from '../common/auth/roles.decorator';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('farms')
  @HttpCode(HttpStatus.OK)
  async getAllFarms() {
    return this.productService.getAllFarms();
  }

  @Get('agriculture-products')
  @HttpCode(HttpStatus.OK)
  async getAllAgricultureProducts() {
    return this.productService.getAllAgricultureProducts();
  }

  @Get('categories')
  @HttpCode(HttpStatus.OK)
  async getAllCategories() {
    return this.productService.getAllCategories();
  }

  @Roles('admin')
  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() body: { name: string }) {
    return this.productService.createCategory(body.name);
  }

  @Roles('admin')
  @Post('types')
  @HttpCode(HttpStatus.CREATED)
  async createType(@Body() body: { variety: string; categoryId: number }) {
    return this.productService.createType(body.variety, body.categoryId);
  }

  @Roles('admin')
  @Post('agriculture-products')
  @HttpCode(HttpStatus.CREATED)
  async createAgricultureProduct(@Body() body: { name: string; typeId: number }) {
    return this.productService.createAgricultureProduct(body.name, body.typeId);
  }
  @Roles('admin')
  @Patch('agriculture-products/:id')
  @HttpCode(HttpStatus.OK)
  async updateAgricultureProduct(
    @Param('id') id: string,
    @Body() body: { name?: string; typeId?: number; imageUrl?: string },
  ) {
    return this.productService.updateAgricultureProduct(parseInt(id), body);
  }
  @Roles('admin')
  @Delete('agriculture-products/:id')
  @HttpCode(HttpStatus.OK)
  async deleteAgricultureProduct(@Param('id') id: string) {
    return this.productService.deleteAgricultureProduct(parseInt(id));
  }

  @Get('provinces')
  @HttpCode(HttpStatus.OK)
  async getAllProvinces() {
    return this.productService.getAllProvinces();
  }

  @Get('countries')
  @HttpCode(HttpStatus.OK)
  async getAllCountries() {
    return this.productService.getAllCountries();
  }

  @Roles('admin')
  @Post('countries')
  @HttpCode(HttpStatus.CREATED)
  async createCountry(
    @Body()
    body: {
      name: string;
    },
  ) {
    return this.productService.createCountry(body);
  }

  @Roles('admin')
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
    return this.productService.createProvince(body);
  }

  @Roles('admin')
  @Delete('provinces/:id')
  @HttpCode(HttpStatus.OK)
  async deleteProvince(@Param('id') id: string) {
    return this.productService.deleteProvince(parseInt(id));
  }

  @Roles('admin')
  @Delete('countries/:id')
  @HttpCode(HttpStatus.OK)
  async deleteCountry(@Param('id') id: string) {
    return this.productService.deleteCountry(parseInt(id));
  }

  @Get('types')
  @HttpCode(HttpStatus.OK)
  async getAllTypes() {
    return this.productService.getAllTypes();
  }

  @Get('batches')
  @HttpCode(HttpStatus.OK)
  async getAllBatches() {
    return this.productService.getAllBatches();
  }
  @Roles('admin')
  @Patch('batches/:id')
  @HttpCode(HttpStatus.OK)
  async updateBatch(
    @Param('id') id: string,
    @Body() body: { harvestDate?: string | Date; grade?: string; vendorProductId?: number | null; qrCodeUrl?: string },
  ) {
    return this.productService.updateBatch(parseInt(id), body);
  }
  @Roles('admin')
  @Delete('batches/:id')
  @HttpCode(HttpStatus.OK)
  async deleteBatch(@Param('id') id: string) {
    return this.productService.deleteBatch(parseInt(id));
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllProducts() {
    return this.productService.getAllProducts();
  }

  @Roles('admin')
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
    return this.productService.createProduct(body);
  }

  @Roles('admin')
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
    return this.productService.createFullBatch(body);
  }

  @Roles('admin')
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
    return this.productService.updateProduct(parseInt(id), body);
  }

  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(parseInt(id));
  }
}
