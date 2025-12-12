import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TraceController } from './trace.controller';
import { ProductController } from './product.controller';
import { FarmController } from './farm.controller';
import { VendorController } from './vendor.controller';
import { ProcessingController } from './processing.controller';
import { LogisticsController } from './logistics.controller';
import { StorageController } from './storage.controller';
import { PricingController } from './pricing.controller';
import { TraceabilityController } from './traceability.controller';
import { TraceService } from './trace.service';
import { VendorService } from './vendor.service';
import { ProcessingService } from './processing.service';
import { LogisticsService } from './logistics.service';
import { StorageService } from './storage.service';
import { PricingService } from './pricing.service';
import { TraceabilityService } from './traceability.service';
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
import { ProcessStep } from './entities/process-step.entity';
import { VendorProduct } from './entities/vendor-product.entity';
import { Vendor } from './entities/vendor.entity';
import { Distributor } from './entities/distributor.entity';
import { Retail } from './entities/retail.entity';
import { Price } from './entities/price.entity';
import { Discount } from './entities/discount.entity';
import { ProductHasDiscount } from './entities/product-has-discount.entity';
import { Shipment } from './entities/shipment.entity';
import { TransportLeg } from './entities/transport-leg.entity';
import { CarrierCompany } from './entities/carrier-company.entity';
import { ShipBatch } from './entities/ship-batch.entity';
import { Warehouse } from './entities/warehouse.entity';
import { StoredIn } from './entities/stored-in.entity';

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
      ProcessStep,
      VendorProduct,
      Vendor,
      Distributor,
      Retail,
      Price,
      Discount,
      ProductHasDiscount,
      Shipment,
      TransportLeg,
      CarrierCompany,
      ShipBatch,
      Warehouse,
      StoredIn,
    ]),
  ],
  controllers: [TraceController, ProductController, FarmController, VendorController, ProcessingController, LogisticsController, StorageController, PricingController, TraceabilityController],
  providers: [TraceService, VendorService, ProcessingService, LogisticsService, StorageService, PricingService, TraceabilityService],
  exports: [TraceService, VendorService, ProcessingService, LogisticsService, StorageService, PricingService, TraceabilityService],
})
export class TraceModule {}
