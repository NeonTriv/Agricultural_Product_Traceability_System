import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Vegetable } from './vegetable/vegetable.entity';
import { VegetableModule } from './vegetable/vegetable.module';

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
      database: process.env.DB_NAME ?? 'Vegetable',
      // autoLoadEntities: true,
      entities: [Vegetable],
      synchronize: false,
      options: {
      encrypt: false,
      trustServerCertificate: true,
      //instanceName: 'SQLEXPRESS' 
    },
      // logging: true,
    }),
    VegetableModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}