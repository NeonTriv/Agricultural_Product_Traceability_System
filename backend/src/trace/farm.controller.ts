import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { TraceService } from './trace.service';

@Controller('farms')
export class FarmController {
  constructor(private readonly traceService: TraceService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllFarms() {
    return this.traceService.getAllFarms();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createFarm(
    @Body()
    body: {
      name: string;
      ownerName?: string;
      contactInfo?: string;
      longitude?: number;
      latitude?: number;
      provinceId: number;
    },
  ) {
    return this.traceService.createFarm(body);
  }
}
