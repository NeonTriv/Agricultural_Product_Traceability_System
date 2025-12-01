import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { TraceService } from './trace.service';
import { TraceResponseDto, ProductDto } from './dto/trace-response.dto';

@Controller('trace')
export class TraceController {
  constructor(private readonly traceService: TraceService) {}

  /**
   * GET /api/trace/:code
   * Fetch product traceability by QR code
   *
   * Example: GET /api/trace/QR_12345_ABC
   *
   * Response: TraceResponseDto with product, batch, farm, processing, distributor, price
   */
  @Get(':code')
  @HttpCode(HttpStatus.OK)
  async getTrace(@Param('code') code: string): Promise<TraceResponseDto> {
    return this.traceService.getTraceByCode(code);
  }

  /**
   * GET /api/trace
   * Get all products (for testing)
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllProducts(): Promise<ProductDto[]> {
    return this.traceService.getAllProducts();
  }
}
