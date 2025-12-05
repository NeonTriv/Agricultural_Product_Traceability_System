import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from './entities/shipment.entity';
import { TransportLeg } from './entities/transport-leg.entity';
import { CarrierCompany } from './entities/carrier-company.entity';
import { Distributor } from './entities/distributor.entity';
import { Vendor } from './entities/vendor.entity';

@Injectable()
export class LogisticsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    @InjectRepository(TransportLeg)
    private readonly transportLegRepo: Repository<TransportLeg>,
    @InjectRepository(CarrierCompany)
    private readonly carrierRepo: Repository<CarrierCompany>,
    @InjectRepository(Distributor)
    private readonly distributorRepo: Repository<Distributor>,
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
  ) {}

  // Carrier Companies methods
  async getAllCarriers() {
    const carriers = await this.carrierRepo.find({
      relations: ['vendor', 'transportLegs'],
      order: { vTin: 'ASC' },
    });

    return carriers.map((c) => ({
      vTin: c.vTin,
      name: c.vendor?.name,
      address: c.vendor?.address,
      contactInfo: c.vendor?.contactInfo,
      transportLegCount: c.transportLegs?.length || 0,
    }));
  }

  async getCarrier(tin: string) {
    const carrier = await this.carrierRepo.findOne({
      where: { vTin: tin },
      relations: ['vendor', 'transportLegs'],
    });

    if (!carrier) {
      throw new NotFoundException(`Carrier Company with TIN ${tin} not found`);
    }

    return {
      vTin: carrier.vTin,
      name: carrier.vendor?.name,
      address: carrier.vendor?.address,
      contactInfo: carrier.vendor?.contactInfo,
      transportLegCount: carrier.transportLegs?.length || 0,
    };
  }

  async createCarrier(data: {
    vTin: string;
    name: string;
    address?: string;
    contactInfo?: string;
  }) {
    // First create or update vendor
    let vendor = await this.vendorRepo.findOne({ where: { tin: data.vTin } });
    if (!vendor) {
      vendor = this.vendorRepo.create({
        tin: data.vTin,
        name: data.name,
        address: data.address || '',
        contactInfo: data.contactInfo,
      });
      await this.vendorRepo.save(vendor);
    }

    // Then create carrier company
    const carrier = this.carrierRepo.create({
      vTin: data.vTin,
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

    // Update the vendor record
    const vendor = await this.vendorRepo.findOne({ where: { tin } });
    if (vendor) {
      if (data.name) vendor.name = data.name;
      if (data.address !== undefined) vendor.address = data.address;
      if (data.contactInfo !== undefined) vendor.contactInfo = data.contactInfo;
      await this.vendorRepo.save(vendor);
    }

    return { success: true, vTin: carrier.vTin };
  }

  async deleteCarrier(tin: string) {
    // Check if carrier exists
    const carrier = await this.carrierRepo.findOne({ 
      where: { vTin: tin },
      relations: ['transportLegs']
    });
    if (!carrier) {
      throw new NotFoundException(`Carrier Company with TIN ${tin} not found`);
    }

    // Check for related records and provide helpful error message
    if (carrier.transportLegs?.length > 0) {
      throw new BadRequestException(`Cannot delete carrier. Please delete ${carrier.transportLegs.length} Transport Leg(s) first (tab Logistics > Transport Legs)`);
    }

    // Delete the carrier company
    await this.carrierRepo.delete({ vTin: tin });

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
      destination: shipment.destination,
      distributorTin: shipment.distributorTin,
      distributorName: shipment.distributor?.vendor?.name,
      transportLegCount: shipment.transportLegs?.length || 0,
    };
  }

  async createShipment(data: {
    status: string;
    destination?: string;
    distributorTin: string;
  }) {
    const shipment = this.shipmentRepo.create({
      status: data.status,
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
      destination?: string;
      distributorTin?: string;
    },
  ) {
    const shipment = await this.shipmentRepo.findOne({ where: { id } });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    if (data.status) shipment.status = data.status;
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
      relations: ['shipment', 'carrierCompany', 'carrierCompany.vendor'],
      order: { id: 'DESC' },
    });

    return legs.map((leg) => ({
      id: leg.id,
      shipmentId: leg.shipmentId,
      driverName: leg.driverName,
      temperatureProfile: leg.temperatureProfile,
      startLocation: leg.startLocation,
      toLocation: leg.toLocation,
      departureTime: leg.departureTime,
      arrivalTime: leg.arrivalTime,
      carrierCompanyTin: leg.carrierCompanyTin,
      carrierCompanyName: leg.carrierCompany?.vendor?.name,
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
      departureTime: leg.departureTime,
      arrivalTime: leg.arrivalTime,
      carrierCompanyTin: leg.carrierCompanyTin,
      carrierCompanyName: leg.carrierCompany?.vendor?.name,
      shipmentDestination: leg.shipment?.destination,
    };
  }

  async createTransportLeg(data: {
    shipmentId: number;
    driverName?: string;
    temperatureProfile?: string;
    startLocation: string;
    toLocation: string;
    departureTime?: string;
    arrivalTime?: string;
    carrierCompanyTin: string;
  }) {
    const leg = this.transportLegRepo.create({
      shipmentId: data.shipmentId,
      driverName: data.driverName,
      temperatureProfile: data.temperatureProfile,
      startLocation: data.startLocation,
      toLocation: data.toLocation,
      departureTime: data.departureTime ? new Date(data.departureTime) : null,
      arrivalTime: data.arrivalTime ? new Date(data.arrivalTime) : null,
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
      departureTime?: string;
      arrivalTime?: string;
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
    if (data.departureTime !== undefined) leg.departureTime = data.departureTime ? new Date(data.departureTime) : null;
    if (data.arrivalTime !== undefined) leg.arrivalTime = data.arrivalTime ? new Date(data.arrivalTime) : null;
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

  // Distributors methods
  async getAllDistributors() {
    const distributors = await this.distributorRepo.find({
      relations: ['vendor'],
      order: { vendorTin: 'ASC' },
    });

    return distributors.map((d) => ({
      vTin: d.vendorTin,
      name: d.vendor?.name || 'Unknown',
    }));
  }
}
