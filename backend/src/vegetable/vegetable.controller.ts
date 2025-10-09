import { Body, Controller, Get, Param, Post, Patch, ParseIntPipe } from '@nestjs/common';
import { VegetableService } from './vegetable.service';
import { Vegetable } from './vegetable.entity';
import type { EditPayload } from './vegetable.enum';

@Controller(['vegetable','vegetables'])
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

  @Patch(':ID')
  updateByType(
    @Param('ID', ParseIntPipe) ID: number,
    @Body() body: EditPayload
  ): Promise<Vegetable> {
    return this.service.updateByType(ID, body);
  }

  
}