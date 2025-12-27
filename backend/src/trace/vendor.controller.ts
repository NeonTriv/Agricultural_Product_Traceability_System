import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { Roles } from '../common/auth/roles.decorator';

@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllVendors() {
    return this.vendorService.getAllVendors();
  }

  @Get(':tin')
  @HttpCode(HttpStatus.OK)
  async getVendor(@Param('tin') tin: string) {
    return this.vendorService.getVendor(tin);
  }

  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createVendor(
    @Body()
    body: {
      tin: string;
      name: string;
      address: string;
      contactInfo?: string;
      vendorType?: 'distributor' | 'retail' | 'both';
      distributorType?: string;
      retailFormat?: string;
    },
  ) {
    return this.vendorService.createVendor(body);
  }

  @Roles('admin')
  @Patch(':tin')
  @HttpCode(HttpStatus.OK)
  async updateVendor(
    @Param('tin') tin: string,
    @Body()
    body: {
      name?: string;
      address?: string;
      contactInfo?: string;
      vendorType?: 'distributor' | 'retail' | 'both';
      distributorType?: string;
      retailFormat?: string;
    },
  ) {
    return this.vendorService.updateVendor(tin, body);
  }

  @Roles('admin')
  @Delete(':tin')
  @HttpCode(HttpStatus.OK)
  async deleteVendor(@Param('tin') tin: string) {
    return this.vendorService.deleteVendor(tin);
  }
}
