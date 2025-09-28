import { Body, Controller, Get, Param, Post, ParseIntPipe } from '@nestjs/common';
import { VegetableService } from './vegetable.service';
import { Vegetable } from './vegetable.entity';

@Controller('vegetables')
export class VegetableController {
  constructor(private readonly service: VegetableService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() body: { Name: string; Quantity: number }) { 
    return this.service.create(body.Name, body.Quantity); 
  }
  @Get(':ID')
  findOne(@Param('ID', ParseIntPipe) ID: number) : Promise<Vegetable> {
    return this.service.findOne(ID);
  }
}