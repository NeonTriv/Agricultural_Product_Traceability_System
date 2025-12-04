import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { PricingService } from './pricing.service';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

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
