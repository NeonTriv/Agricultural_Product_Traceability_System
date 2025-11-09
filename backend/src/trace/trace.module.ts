import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TraceController } from './trace.controller';
import { ProductController } from './product.controller';
import { TraceService } from './trace.service';
import { AgricultureProduct } from './entities/agriculture-product.entity';
import { Batch } from './entities/batch.entity';
import { Garden } from './entities/garden.entity';
import { Type } from './entities/type.entity';
import { Processing } from './entities/processing.entity';
import { ProcessingFacility } from './entities/processing-facility.entity';
import { VendorProduct } from './entities/vendor-product.entity';
import { Vendor } from './entities/vendor.entity';
import { Price } from './entities/price.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgricultureProduct,
      Batch,
      Garden,
      Type,
      Processing,
      ProcessingFacility,
      VendorProduct,
      Vendor,
      Price,
    ]),
  ],
  controllers: [TraceController, ProductController],
  providers: [TraceService],
  exports: [TraceService],
})
export class TraceModule {}
