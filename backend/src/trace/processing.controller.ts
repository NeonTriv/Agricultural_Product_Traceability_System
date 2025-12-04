import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ProcessingService } from './processing.service';

@Controller('processing')
export class ProcessingController {
  constructor(private readonly processingService: ProcessingService) {}

  // Processing Facilities endpoints
  @Get('facilities')
  @HttpCode(HttpStatus.OK)
  async getAllFacilities() {
    return this.processingService.getAllFacilities();
  }

  @Get('facilities/:id')
  @HttpCode(HttpStatus.OK)
  async getFacility(@Param('id') id: string) {
    return this.processingService.getFacility(parseInt(id));
  }

  @Post('facilities')
  @HttpCode(HttpStatus.CREATED)
  async createFacility(
    @Body()
    body: {
      id: number;
      name: string;
      address: string;
      contactInfo?: string;
      licenseNumber: string;
    },
  ) {
    return this.processingService.createFacility(body);
  }

  @Patch('facilities/:id')
  @HttpCode(HttpStatus.OK)
  async updateFacility(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      address?: string;
      contactInfo?: string;
      licenseNumber?: string;
    },
  ) {
    return this.processingService.updateFacility(parseInt(id), body);
  }

  @Delete('facilities/:id')
  @HttpCode(HttpStatus.OK)
  async deleteFacility(@Param('id') id: string) {
    return this.processingService.deleteFacility(parseInt(id));
  }

  // Processing Operations endpoints
  @Get('operations')
  @HttpCode(HttpStatus.OK)
  async getAllOperations() {
    return this.processingService.getAllOperations();
  }

  @Get('operations/:id')
  @HttpCode(HttpStatus.OK)
  async getOperation(@Param('id') id: string) {
    return this.processingService.getOperation(parseInt(id));
  }

  @Post('operations')
  @HttpCode(HttpStatus.CREATED)
  async createOperation(
    @Body()
    body: {
      id: number;
      packagingDate: string;
      weightPerUnit: number;
      processedBy?: string;
      packagingType?: string;
      processingDate?: string;
      facilityId: number;
      batchId: number;
    },
  ) {
    return this.processingService.createOperation(body);
  }

  @Patch('operations/:id')
  @HttpCode(HttpStatus.OK)
  async updateOperation(
    @Param('id') id: string,
    @Body()
    body: {
      packagingDate?: string;
      weightPerUnit?: number;
      processedBy?: string;
      packagingType?: string;
      processingDate?: string;
      facilityId?: number;
      batchId?: number;
    },
  ) {
    return this.processingService.updateOperation(parseInt(id), body);
  }

  @Delete('operations/:id')
  @HttpCode(HttpStatus.OK)
  async deleteOperation(@Param('id') id: string) {
    return this.processingService.deleteOperation(parseInt(id));
  }
}
