import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { Roles } from '../common/auth/roles.decorator';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('vendor-products')
  @HttpCode(HttpStatus.OK)
  async getAllVendorProducts() {
    return this.pricingService.getAllVendorProducts();
  }

  @Roles('admin')
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

  @Roles('admin')
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

  @Roles('admin')
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

  @Roles('admin')
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

  @Roles('admin')
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

  @Roles('admin')
  @Delete('prices/:vendorProductId')
  @HttpCode(HttpStatus.OK)
  async deletePrice(@Param('vendorProductId') vendorProductId: string) {
    return this.pricingService.deletePrice(parseInt(vendorProductId));
  }

  // Discounts CRUD
  @Get('discounts')
  @HttpCode(HttpStatus.OK)
  async getAllDiscounts() {
    return this.pricingService.getAllDiscounts();
  }

  @Roles('admin')
  @Post('discounts')
  @HttpCode(HttpStatus.CREATED)
  async createDiscount(
    @Body()
    body: {
      name: string;
      percentage?: number;
      minValue?: number;
      maxDiscountAmount?: number;
      startDate: string;
      expiredDate: string;
    },
  ) {
    return this.pricingService.createDiscount({
      name: body.name,
      percentage: body.percentage,
      minValue: body.minValue,
      maxDiscountAmount: body.maxDiscountAmount,
      startDate: new Date(body.startDate),
      expiredDate: new Date(body.expiredDate),
    });
  }

  @Roles('admin')
  @Patch('discounts/:id')
  @HttpCode(HttpStatus.OK)
  async updateDiscount(
    @Param('id') id: string,
    @Body()
    body: {
      percentage?: number;
      minValue?: number;
      maxDiscountAmount?: number;
      priority?: number;
      isStackable?: boolean;
      startDate?: string;
      expiredDate?: string;
    },
  ) {
    return this.pricingService.updateDiscount(parseInt(id), {
      percentage: body.percentage,
      minValue: body.minValue,
      maxDiscountAmount: body.maxDiscountAmount,
      priority: body.priority,
      isStackable: body.isStackable,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      expiredDate: body.expiredDate ? new Date(body.expiredDate) : undefined,
    });
  }

  @Roles('admin')
  @Delete('discounts/:id')
  @HttpCode(HttpStatus.OK)
  async deleteDiscount(@Param('id') id: string) {
    return this.pricingService.deleteDiscount(parseInt(id));
  }

  // Link Product-Has-Discount
  @Roles('admin')
  @Post('product-has-discount')
  @HttpCode(HttpStatus.CREATED)
  async linkProductHasDiscount(
    @Body()
    body: {
      vendorProductId: number;
      discountId: number;
    },
  ) {
    return this.pricingService.linkProductHasDiscount(body.vendorProductId, body.discountId);
  }

  // Alias endpoint to match frontend call
  @Roles('admin')
  @Post('link-discount')
  @HttpCode(HttpStatus.CREATED)
  async linkDiscountAlias(
    @Body()
    body: {
      vendorProductId: number;
      discountId: number;
    },
  ) {
    return this.pricingService.linkProductHasDiscount(body.vendorProductId, body.discountId);
  }

    @Get('discounts/:id/products')
    async getDiscountProducts(@Param('id') id: number) {
      return this.pricingService.getProductsByDiscount(id);
    }

    @Roles('admin')
    @Delete('discounts/:id/products/:vpId')
    async unlinkProduct(
      @Param('id') discountId: number,
      @Param('vpId') vpId: number,
    ) {
      return this.pricingService.unlinkProductHasDiscount(vpId, discountId);
    }

  // Orchestration: Create Vendor Product with Price and Discounts
  @Roles('admin')
  @Post('setup')
  @HttpCode(HttpStatus.CREATED)
  async createVendorProductWithPricingAndDiscounts(
    @Body()
    body: {
      vendorTin: string;
      agricultureProductId: number;
      unit: string;
      valuePerUnit?: number;
      priceValue?: number;
      priceCurrency?: string;
      discounts?: Array<{
        percentage: number;
        minValue?: number;
        maxDiscountAmount?: number;
        priority?: number;
        isStackable?: boolean;
        startDate?: string;
        expiredDate?: string;
      }>;
    },
  ) {
    // Convert date strings to Date objects
    const normalizedDiscounts = body.discounts?.map((d) => ({
      ...d,
      startDate: d.startDate ? new Date(d.startDate) : undefined,
      expiredDate: d.expiredDate ? new Date(d.expiredDate) : undefined,
    }));

    return this.pricingService.createVendorProductWithPricingAndDiscounts({
      vendorTin: body.vendorTin,
      agricultureProductId: body.agricultureProductId,
      unit: body.unit,
      valuePerUnit: body.valuePerUnit,
      priceValue: body.priceValue,
      priceCurrency: body.priceCurrency,
      discounts: normalizedDiscounts,
    });
  }
}
