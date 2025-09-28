import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vegetable } from './vegetable.entity';
import { VegetableService } from './vegetable.service';
import { VegetableController } from './vegetable.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Vegetable])],
  providers: [VegetableService],
  controllers: [VegetableController]
})
export class VegetableModule {}
