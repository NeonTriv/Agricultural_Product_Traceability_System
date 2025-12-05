import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { PricingService } from './pricing.service';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('vendor-products')
  @HttpCode(HttpStatus.OK)
  async getAllVendorProducts() {
    return this.pricingService.getAllVendorProducts();
  }

  @Post('vendor-products')
  @HttpCode(HttpStatus.CREATED)
  async createVendorProduct(
    @Body()
    body: {
      unit: string;
      vendorTin: string;
      agricultureProductId: number;
    },
  ) {
    return this.pricingService.createVendorProduct(body);
  }

  @Patch('vendor-products/:id')
  @HttpCode(HttpStatus.OK)
  async updateVendorProduct(
    @Param('id') id: string,
    @Body()
    body: {
      unit?: string;
    },
  ) {
    return this.pricingService.updateVendorProduct(parseInt(id), body);
  }

  @Delete('vendor-products/:id')
  @HttpCode(HttpStatus.OK)
  async deleteVendorProduct(@Param('id') id: string) {
    return this.pricingService.deleteVendorProduct(parseInt(id));
  }

  @Get('prices')
  @HttpCode(HttpStatus.OK)
  async getAllPrices() {
    return this.pricingService.getAllPrices();
  }

  @Get('prices/:vendorProductId')
  @HttpCode(HttpStatus.OK)
  async getPrice(@Param('vendorProductId') vendorProductId: string) {
    return this.pricingService.getPrice(parseInt(vendorProductId));
  }

  @Post('prices')
  @HttpCode(HttpStatus.CREATED)
  async createPrice(
    @Body()
    body: {
      vendorProductId: number;
      value: number;
      currency: string;
    },
  ) {
    return this.pricingService.createPrice(body);
  }

  @Patch('prices/:vendorProductId')
  @HttpCode(HttpStatus.OK)
  async updatePrice(
    @Param('vendorProductId') vendorProductId: string,
    @Body()
    body: {
      value?: number;
      currency?: string;
    },
  ) {
    return this.pricingService.updatePrice(parseInt(vendorProductId), body);
  }

  @Delete('prices/:vendorProductId')
  @HttpCode(HttpStatus.OK)
  async deletePrice(@Param('vendorProductId') vendorProductId: string) {
    return this.pricingService.deletePrice(parseInt(vendorProductId));
  }
}
