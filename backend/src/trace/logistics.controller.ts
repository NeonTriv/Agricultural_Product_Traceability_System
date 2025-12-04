import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { LogisticsService } from './logistics.service';

@Controller('logistics')
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  // Carrier Companies endpoints
  @Get('carriers')
  @HttpCode(HttpStatus.OK)
  async getAllCarriers() {
    return this.logisticsService.getAllCarriers();
  }

  @Get('carriers/:tin')
  @HttpCode(HttpStatus.OK)
  async getCarrier(@Param('tin') tin: string) {
    return this.logisticsService.getCarrier(tin);
  }

  @Post('carriers')
  @HttpCode(HttpStatus.CREATED)
  async createCarrier(
    @Body()
    body: {
      vTin: string;
      name: string;
      address?: string;
      contactInfo?: string;
    },
  ) {
    return this.logisticsService.createCarrier(body);
  }

  @Patch('carriers/:tin')
  @HttpCode(HttpStatus.OK)
  async updateCarrier(
    @Param('tin') tin: string,
    @Body()
    body: {
      name?: string;
      address?: string;
      contactInfo?: string;
    },
  ) {
    return this.logisticsService.updateCarrier(tin, body);
  }

  @Delete('carriers/:tin')
  @HttpCode(HttpStatus.OK)
  async deleteCarrier(@Param('tin') tin: string) {
    return this.logisticsService.deleteCarrier(tin);
  }

  // Shipments endpoints
  @Get('shipments')
  @HttpCode(HttpStatus.OK)
  async getAllShipments() {
    return this.logisticsService.getAllShipments();
  }

  @Get('shipments/:id')
  @HttpCode(HttpStatus.OK)
  async getShipment(@Param('id') id: string) {
    return this.logisticsService.getShipment(parseInt(id));
  }

  @Post('shipments')
  @HttpCode(HttpStatus.CREATED)
  async createShipment(
    @Body()
    body: {
      id: number;
      status: string;
      departuredTime?: string;
      arrivalTime?: string;
      destination?: string;
      distributorTin: string;
    },
  ) {
    return this.logisticsService.createShipment(body);
  }

  @Patch('shipments/:id')
  @HttpCode(HttpStatus.OK)
  async updateShipment(
    @Param('id') id: string,
    @Body()
    body: {
      status?: string;
      departuredTime?: string;
      arrivalTime?: string;
      destination?: string;
      distributorTin?: string;
    },
  ) {
    return this.logisticsService.updateShipment(parseInt(id), body);
  }

  @Delete('shipments/:id')
  @HttpCode(HttpStatus.OK)
  async deleteShipment(@Param('id') id: string) {
    return this.logisticsService.deleteShipment(parseInt(id));
  }

  // Transport Legs endpoints
  @Get('transport-legs')
  @HttpCode(HttpStatus.OK)
  async getAllTransportLegs() {
    return this.logisticsService.getAllTransportLegs();
  }

  @Get('transport-legs/:id')
  @HttpCode(HttpStatus.OK)
  async getTransportLeg(@Param('id') id: string) {
    return this.logisticsService.getTransportLeg(parseInt(id));
  }

  @Post('transport-legs')
  @HttpCode(HttpStatus.CREATED)
  async createTransportLeg(
    @Body()
    body: {
      id: number;
      shipmentId: number;
      driverName?: string;
      temperatureProfile?: string;
      startLocation: string;
      toLocation: string;
      carrierCompanyTin: string;
    },
  ) {
    return this.logisticsService.createTransportLeg(body);
  }

  @Patch('transport-legs/:id')
  @HttpCode(HttpStatus.OK)
  async updateTransportLeg(
    @Param('id') id: string,
    @Body()
    body: {
      shipmentId?: number;
      driverName?: string;
      temperatureProfile?: string;
      startLocation?: string;
      toLocation?: string;
      carrierCompanyTin?: string;
    },
  ) {
    return this.logisticsService.updateTransportLeg(parseInt(id), body);
  }

  @Delete('transport-legs/:id')
  @HttpCode(HttpStatus.OK)
  async deleteTransportLeg(@Param('id') id: string) {
    return this.logisticsService.deleteTransportLeg(parseInt(id));
  }
}
