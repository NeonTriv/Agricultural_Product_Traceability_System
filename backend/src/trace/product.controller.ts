import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { TraceService } from './trace.service';

@Controller('products')
export class ProductController {
  constructor(private readonly traceService: TraceService) {}

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
