import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VegetableModule } from './vegetable/vegetable.module';
import { Vegetable } from './vegetable/vegetable.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '1433', 10),
      username: process.env.DB_USERNAME ?? 'test',
      password: process.env.DB_PASSWORD ?? 'test',
      database: process.env.DB_NAME ?? 'Vegetable',
      // autoLoadEntities: true,
      entities: [Vegetable],
      synchronize: true,
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