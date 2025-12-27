import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { StorageService } from './storage.service';
import { Roles } from '../common/auth/roles.decorator';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  // Warehouse endpoints
  @Get('warehouses')
  @HttpCode(HttpStatus.OK)
  async getAllWarehouses() {
    return this.storageService.getAllWarehouses();
  }

  @Get('warehouses/:id')
  @HttpCode(HttpStatus.OK)
  async getWarehouse(@Param('id') id: string) {
    return this.storageService.getWarehouse(parseInt(id));
  }

  @Roles('admin')
  @Post('warehouses')
  @HttpCode(HttpStatus.CREATED)
  async createWarehouse(
    @Body()
    body: {
      id: number;
      capacity?: number;
      storeCondition?: string;
      addressDetail: string;
      longitude?: number;
      latitude?: number;
      provinceId: number;
    },
  ) {
    return this.storageService.createWarehouse(body);
  }

  @Roles('admin')
  @Patch('warehouses/:id')
  @HttpCode(HttpStatus.OK)
  async updateWarehouse(
    @Param('id') id: string,
    @Body()
    body: {
      capacity?: number;
      storeCondition?: string;
      addressDetail?: string;
      longitude?: number;
      latitude?: number;
      provinceId?: number;
    },
  ) {
    return this.storageService.updateWarehouse(parseInt(id), body);
  }

  @Roles('admin')
  @Delete('warehouses/:id')
  @HttpCode(HttpStatus.OK)
  async deleteWarehouse(@Param('id') id: string) {
    return this.storageService.deleteWarehouse(parseInt(id));
  }

  // Stored In endpoints
  @Get('stored-in')
  @HttpCode(HttpStatus.OK)
  async getAllStoredIn() {
    return this.storageService.getAllStoredIn();
  }

  @Get('stored-in/:batchId/:warehouseId')
  @HttpCode(HttpStatus.OK)
  async getStoredIn(
    @Param('batchId') batchId: string,
    @Param('warehouseId') warehouseId: string,
  ) {
    return this.storageService.getStoredIn(parseInt(batchId), parseInt(warehouseId));
  }

  @Roles('admin')
  @Post('stored-in')
  @HttpCode(HttpStatus.CREATED)
  async createStoredIn(
    @Body()
    body: {
      batchId: number;
      warehouseId: number;
      quantity: number;
      startDate?: string;
      endDate?: string;
    },
  ) {
    return this.storageService.createStoredIn(body);
  }

  @Roles('admin')
  @Patch('stored-in/:batchId/:warehouseId')
  @HttpCode(HttpStatus.OK)
  async updateStoredIn(
    @Param('batchId') batchId: string,
    @Param('warehouseId') warehouseId: string,
    @Body()
    body: {
      quantity?: number;
      startDate?: string;
      endDate?: string;
    },
  ) {
    return this.storageService.updateStoredIn(
      parseInt(batchId),
      parseInt(warehouseId),
      body,
    );
  }

  @Roles('admin')
  @Delete('stored-in/:batchId/:warehouseId')
  @HttpCode(HttpStatus.OK)
  async deleteStoredIn(
    @Param('batchId') batchId: string,
    @Param('warehouseId') warehouseId: string,
  ) {
    return this.storageService.deleteStoredIn(parseInt(batchId), parseInt(warehouseId));
  }
}
