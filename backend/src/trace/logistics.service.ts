import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from './entities/shipment.entity';
import { TransportLeg } from './entities/transport-leg.entity';
import { CarrierCompany } from './entities/carrier-company.entity';

@Injectable()
export class LogisticsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    @InjectRepository(TransportLeg)
    private readonly transportLegRepo: Repository<TransportLeg>,
    @InjectRepository(CarrierCompany)
    private readonly carrierRepo: Repository<CarrierCompany>,
  ) {}

  // Carrier Companies methods
  async getAllCarriers() {
    const carriers = await this.carrierRepo.find({
      relations: ['transportLegs'],
      order: { vTin: 'ASC' },
    });

    return carriers.map((c) => ({
      vTin: c.vTin,
      name: c.name,
      address: c.address,
      contactInfo: c.contactInfo,
      transportLegCount: c.transportLegs?.length || 0,
    }));
  }

  async getCarrier(tin: string) {
    const carrier = await this.carrierRepo.findOne({
      where: { vTin: tin },
      relations: ['transportLegs'],
    });

    if (!carrier) {
      throw new NotFoundException(`Carrier Company with TIN ${tin} not found`);
    }

    return {
      vTin: carrier.vTin,
      name: carrier.name,
      address: carrier.address,
      contactInfo: carrier.contactInfo,
      transportLegCount: carrier.transportLegs?.length || 0,
    };
  }

  async createCarrier(data: {
    vTin: string;
    name: string;
    address?: string;
    contactInfo?: string;
  }) {
    const carrier = this.carrierRepo.create({
      vTin: data.vTin,
      name: data.name,
      address: data.address,
      contactInfo: data.contactInfo,
    });

    await this.carrierRepo.save(carrier);

    return { success: true, vTin: carrier.vTin };
  }

  async updateCarrier(
    tin: string,
    data: {
      name?: string;
      address?: string;
      contactInfo?: string;
    },
  ) {
    const carrier = await this.carrierRepo.findOne({ where: { vTin: tin } });

    if (!carrier) {
      throw new NotFoundException(`Carrier Company with TIN ${tin} not found`);
    }

    if (data.name) carrier.name = data.name;
    if (data.address !== undefined) carrier.address = data.address;
    if (data.contactInfo !== undefined) carrier.contactInfo = data.contactInfo;

    await this.carrierRepo.save(carrier);

    return { success: true, vTin: carrier.vTin };
  }

  async deleteCarrier(tin: string) {
    const result = await this.carrierRepo.delete({ vTin: tin });

    if (result.affected === 0) {
      throw new NotFoundException(`Carrier Company with TIN ${tin} not found`);
    }

    return { success: true };
  }

  // Shipments methods
  async getAllShipments() {
    const shipments = await this.shipmentRepo.find({
      relations: ['distributor', 'distributor.vendor', 'transportLegs'],
      order: { id: 'DESC' },
    });

    return shipments.map((s) => ({
      id: s.id,
      status: s.status,
      departuredTime: s.departuredTime,
      arrivalTime: s.arrivalTime,
      destination: s.destination,
      distributorTin: s.distributorTin,
      distributorName: s.distributor?.vendor?.name,
      transportLegCount: s.transportLegs?.length || 0,
    }));
  }

  async getShipment(id: number) {
    const shipment = await this.shipmentRepo.findOne({
      where: { id },
      relations: ['distributor', 'distributor.vendor', 'transportLegs'],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    return {
      id: shipment.id,
      status: shipment.status,
      departuredTime: shipment.departuredTime,
      arrivalTime: shipment.arrivalTime,
      destination: shipment.destination,
      distributorTin: shipment.distributorTin,
      distributorName: shipment.distributor?.vendor?.name,
      transportLegCount: shipment.transportLegs?.length || 0,
    };
  }

  async createShipment(data: {
    id: number;
    status: string;
    departuredTime?: string;
    arrivalTime?: string;
    destination?: string;
    distributorTin: string;
  }) {
    const shipment = this.shipmentRepo.create({
      id: data.id,
      status: data.status,
      departuredTime: data.departuredTime ? new Date(data.departuredTime) : null,
      arrivalTime: data.arrivalTime ? new Date(data.arrivalTime) : null,
      destination: data.destination,
      distributorTin: data.distributorTin,
    });

    await this.shipmentRepo.save(shipment);

    return { success: true, id: shipment.id };
  }

  async updateShipment(
    id: number,
    data: {
      status?: string;
      departuredTime?: string;
      arrivalTime?: string;
      destination?: string;
      distributorTin?: string;
    },
  ) {
    const shipment = await this.shipmentRepo.findOne({ where: { id } });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    if (data.status) shipment.status = data.status;
    if (data.departuredTime !== undefined) {
      shipment.departuredTime = data.departuredTime ? new Date(data.departuredTime) : null;
    }
    if (data.arrivalTime !== undefined) {
      shipment.arrivalTime = data.arrivalTime ? new Date(data.arrivalTime) : null;
    }
    if (data.destination !== undefined) shipment.destination = data.destination;
    if (data.distributorTin) shipment.distributorTin = data.distributorTin;

    await this.shipmentRepo.save(shipment);

    return { success: true, id: shipment.id };
  }

  async deleteShipment(id: number) {
    const result = await this.shipmentRepo.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    return { success: true };
  }

  // Transport Legs methods
  async getAllTransportLegs() {
    const legs = await this.transportLegRepo.find({
      relations: ['shipment', 'carrierCompany'],
      order: { id: 'DESC' },
    });

    return legs.map((leg) => ({
      id: leg.id,
      shipmentId: leg.shipmentId,
      driverName: leg.driverName,
      temperatureProfile: leg.temperatureProfile,
      startLocation: leg.startLocation,
      toLocation: leg.toLocation,
      carrierCompanyTin: leg.carrierCompanyTin,
      carrierCompanyName: leg.carrierCompany?.name,
      shipmentDestination: leg.shipment?.destination,
    }));
  }

  async getTransportLeg(id: number) {
    const leg = await this.transportLegRepo.findOne({
      where: { id },
      relations: ['shipment', 'carrierCompany'],
    });

    if (!leg) {
      throw new NotFoundException(`Transport Leg with ID ${id} not found`);
    }

    return {
      id: leg.id,
      shipmentId: leg.shipmentId,
      driverName: leg.driverName,
      temperatureProfile: leg.temperatureProfile,
      startLocation: leg.startLocation,
      toLocation: leg.toLocation,
      carrierCompanyTin: leg.carrierCompanyTin,
      carrierCompanyName: leg.carrierCompany?.name,
      shipmentDestination: leg.shipment?.destination,
    };
  }

  async createTransportLeg(data: {
    id: number;
    shipmentId: number;
    driverName?: string;
    temperatureProfile?: string;
    startLocation: string;
    toLocation: string;
    carrierCompanyTin: string;
  }) {
    const leg = this.transportLegRepo.create({
      id: data.id,
      shipmentId: data.shipmentId,
      driverName: data.driverName,
      temperatureProfile: data.temperatureProfile,
      startLocation: data.startLocation,
      toLocation: data.toLocation,
      carrierCompanyTin: data.carrierCompanyTin,
    });

    await this.transportLegRepo.save(leg);

    return { success: true, id: leg.id };
  }

  async updateTransportLeg(
    id: number,
    data: {
      shipmentId?: number;
      driverName?: string;
      temperatureProfile?: string;
      startLocation?: string;
      toLocation?: string;
      carrierCompanyTin?: string;
    },
  ) {
    const leg = await this.transportLegRepo.findOne({ where: { id } });

    if (!leg) {
      throw new NotFoundException(`Transport Leg with ID ${id} not found`);
    }

    if (data.shipmentId) leg.shipmentId = data.shipmentId;
    if (data.driverName !== undefined) leg.driverName = data.driverName;
    if (data.temperatureProfile !== undefined) leg.temperatureProfile = data.temperatureProfile;
    if (data.startLocation) leg.startLocation = data.startLocation;
    if (data.toLocation) leg.toLocation = data.toLocation;
    if (data.carrierCompanyTin) leg.carrierCompanyTin = data.carrierCompanyTin;

    await this.transportLegRepo.save(leg);

    return { success: true, id: leg.id };
  }

  async deleteTransportLeg(id: number) {
    const result = await this.transportLegRepo.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Transport Leg with ID ${id} not found`);
    }

    return { success: true };
  }
}
