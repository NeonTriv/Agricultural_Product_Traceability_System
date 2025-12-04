import { Controller, Get, Query, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { TraceabilityService } from './traceability.service';

@Controller('traceability')
export class TraceabilityController {
  constructor(private readonly traceabilityService: TraceabilityService) {}

  @Get('full')
  @HttpCode(HttpStatus.OK)
  async getFullTraceability(@Query('qrCode') qrCode: string) {
    if (!qrCode) {
      throw new BadRequestException('QR code is required');
    }
    
    return this.traceabilityService.getFullTraceability(qrCode);
  }
}
