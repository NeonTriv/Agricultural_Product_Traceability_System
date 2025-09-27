import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { ContactService } from './student.service';
import { ContactController } from './student.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Student])],
  providers: [ContactService],
  controllers: [ContactController]
})
export class ContactModule {}
