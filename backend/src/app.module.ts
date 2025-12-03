import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Vegetable } from './vegetable/vegetable.entity';
import { VegetableModule } from './vegetable/vegetable.module';
import { TraceModule } from './trace/trace.module';
import { AgricultureProduct } from './trace/entities/agriculture-product.entity';
import { Batch } from './trace/entities/batch.entity';
import { Farm } from './trace/entities/farm.entity';
import { FarmCertification } from './trace/entities/farm-certification.entity';
import { Type } from './trace/entities/type.entity';
import { Category } from './trace/entities/category.entity';
import { Country } from './trace/entities/country.entity';
import { Province } from './trace/entities/province.entity';
import { Processing } from './trace/entities/processing.entity';
import { ProcessingFacility } from './trace/entities/processing-facility.entity';
import { VendorProduct } from './trace/entities/vendor-product.entity';
import { Vendor } from './trace/entities/vendor.entity';
import { Price } from './trace/entities/price.entity';
import { Discount } from './trace/entities/discount.entity';
import { ProductHasDiscount } from './trace/entities/product-has-discount.entity';
import { Distributor } from './trace/entities/distributor.entity';
import { Retail } from './trace/entities/retail.entity';
import { Warehouse } from './trace/entities/warehouse.entity';
import { StoredIn } from './trace/entities/stored-in.entity';
import { Shipment } from './trace/entities/shipment.entity';
import { ShipBatch } from './trace/entities/ship-batch.entity';
import { TransportLeg } from './trace/entities/transport-leg.entity';
import { CarrierCompany } from './trace/entities/carrier-company.entity';
import { User } from './trace/entities/user.entity';

@Module({
  imports: [
    // Load .env file and make env variables globally available
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '1433', 10),
      username: process.env.DB_USERNAME ?? 'test',
      password: process.env.DB_PASSWORD ?? 'test',
      database: process.env.DB_NAME ?? 'Traceability',
      entities: [
        Vegetable,
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
        Price,
        Discount,
        ProductHasDiscount,
        Distributor,
        Retail,
        Warehouse,
        StoredIn,
        Shipment,
        ShipBatch,
        TransportLeg,
        CarrierCompany,
        User,
      ],
      synchronize: false,
      options: {
      encrypt: false,
      trustServerCertificate: true,
      //instanceName: 'SQLEXPRESS'
    },
      // logging: true,
    }),
    VegetableModule,
    TraceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}