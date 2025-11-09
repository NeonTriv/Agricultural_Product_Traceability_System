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
import { Garden } from './trace/entities/garden.entity';
import { Type } from './trace/entities/type.entity';
import { Processing } from './trace/entities/processing.entity';
import { ProcessingFacility } from './trace/entities/processing-facility.entity';
import { VendorProduct } from './trace/entities/vendor-product.entity';
import { Vendor } from './trace/entities/vendor.entity';
import { Price } from './trace/entities/price.entity';

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
      database: process.env.DB_NAME ?? 'Traceability_DB',
      entities: [
        Vegetable,
        AgricultureProduct,
        Batch,
        Garden,
        Type,
        Processing,
        ProcessingFacility,
        VendorProduct,
        Vendor,
        Price,
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