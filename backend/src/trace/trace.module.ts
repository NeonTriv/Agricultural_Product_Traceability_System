import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TraceController } from './trace.controller';
import { ProductController } from './product.controller';
import { FarmController } from './farm.controller';
import { VendorController } from './vendor.controller';
import { ProcessingController } from './processing.controller';
import { LogisticsController } from './logistics.controller';
import { TraceService } from './trace.service';
import { VendorService } from './vendor.service';
import { ProcessingService } from './processing.service';
import { LogisticsService } from './logistics.service';
import { AgricultureProduct } from './entities/agriculture-product.entity';
import { Batch } from './entities/batch.entity';
import { Farm } from './entities/farm.entity';
import { FarmCertification } from './entities/farm-certification.entity';
import { Type } from './entities/type.entity';
import { Category } from './entities/category.entity';
import { Country } from './entities/country.entity';
import { Province } from './entities/province.entity';
import { Processing } from './entities/processing.entity';
import { ProcessingFacility } from './entities/processing-facility.entity';
import { VendorProduct } from './entities/vendor-product.entity';
import { Vendor } from './entities/vendor.entity';
import { Distributor } from './entities/distributor.entity';
import { Retail } from './entities/retail.entity';
import { Price } from './entities/price.entity';
import { Shipment } from './entities/shipment.entity';
import { TransportLeg } from './entities/transport-leg.entity';
import { CarrierCompany } from './entities/carrier-company.entity';
import { ShipBatch } from './entities/ship-batch.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgricultureProduct,
      Batch,
      Farm,
      FarmCertification,
      Type,
      Category,
      Country,
      Province,
      Processing,
      ProcessingFacility,
      VendorProduct,
      Vendor,
      Distributor,
      Retail,
      Price,
      Shipment,
      TransportLeg,
      CarrierCompany,
      ShipBatch,
    ]),
  ],
  controllers: [TraceController, ProductController, FarmController, VendorController, ProcessingController, LogisticsController],
  providers: [TraceService, VendorService, ProcessingService, LogisticsService],
  exports: [TraceService, VendorService, ProcessingService, LogisticsService],
})
export class TraceModule {}
