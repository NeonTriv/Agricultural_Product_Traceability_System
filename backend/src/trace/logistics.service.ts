import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../shared/base/base.service';
import { Shipment } from './entities/shipment.entity';
import { TransportLeg } from './entities/transport-leg.entity';
import { CarrierCompany } from './entities/carrier-company.entity';
import { Distributor } from './entities/distributor.entity';
import { Vendor } from './entities/vendor.entity';

@Injectable()
export class LogisticsService extends BaseService<Shipment> {
  constructor(
    @InjectRepository(Shipment)
    shipmentRepo: Repository<Shipment>,
    @InjectRepository(TransportLeg)
    private readonly transportLegRepo: Repository<TransportLeg>,
    @InjectRepository(CarrierCompany)
    private readonly carrierRepo: Repository<CarrierCompany>,
    @InjectRepository(Distributor)
    private readonly distributorRepo: Repository<Distributor>,
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
  ) {
    super(shipmentRepo);
  }

  // Carrier Companies methods
  async getAllCarriers() {
    const carriers = await this.carrierRepo.find({
      relations: ['vendor', 'vendor.province', 'vendor.province.country', 'transportLegs'],
      order: { vTin: 'ASC' },
    });

    return carriers.map((c) => ({
      vTin: c.vTin,
      name: c.vendor?.name,
      addressDetail: c.vendor?.address,
      longitude: c.vendor?.longitude,
      latitude: c.vendor?.latitude,
      provinceId: c.vendor?.provinceId,
      provinceName: c.vendor?.province?.name,
      countryName: c.vendor?.province?.country?.name,
      contactInfo: c.vendor?.contactInfo,
      transportLegCount: c.transportLegs?.length || 0,
    }));
  }

  async getCarrier(tin: string) {
    const carrier = await this.carrierRepo.findOne({
      where: { vTin: tin },
      relations: ['vendor', 'vendor.province', 'vendor.province.country', 'transportLegs'],
    });

    if (!carrier) {
      throw new NotFoundException(`Carrier Company with TIN ${tin} not found`);
    }

    return {
      vTin: carrier.vTin,
      name: carrier.vendor?.name,
      addressDetail: carrier.vendor?.address,
      longitude: carrier.vendor?.longitude,
      latitude: carrier.vendor?.latitude,
      provinceId: carrier.vendor?.provinceId,
      provinceName: carrier.vendor?.province?.name,
      countryName: carrier.vendor?.province?.country?.name,
      contactInfo: carrier.vendor?.contactInfo,
      transportLegCount: carrier.transportLegs?.length || 0,
    };
  }

  async createCarrier(data: {
    vTin: string;
    name: string;
    addressDetail?: string;
    provinceId?: number;
    contactInfo?: string;
  }) {
    // First create or update vendor
    let vendor = await this.vendorRepo.findOne({ where: { tin: data.vTin } });
    if (!vendor) {
      vendor = this.vendorRepo.create({
        tin: data.vTin,
        name: data.name,
        address: data.addressDetail || '',
        contactInfo: data.contactInfo,
        provinceId: data.provinceId,
      });
      await this.vendorRepo.save(vendor);
    } else {
      vendor.name = data.name;
      if (data.addressDetail !== undefined) vendor.address = data.addressDetail;
      if (data.provinceId !== undefined) vendor.provinceId = data.provinceId;
      if (data.contactInfo !== undefined) vendor.contactInfo = data.contactInfo;
      await this.vendorRepo.save(vendor);
    }

    // Then create carrier company (if not exists)
    let carrier = await this.carrierRepo.findOne({ where: { vTin: data.vTin } });
    if (!carrier) {
      carrier = this.carrierRepo.create({ vTin: data.vTin });
      await this.carrierRepo.save(carrier);
    }

    return { success: true, vTin: data.vTin };
  }

  async updateCarrier(
    tin: string,
    data: {
      name?: string;
      addressDetail?: string;
      provinceId?: number;
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
      if (data.addressDetail !== undefined) vendor.address = data.addressDetail;
      if (data.provinceId !== undefined) vendor.provinceId = data.provinceId;
      if (data.contactInfo !== undefined) vendor.contactInfo = data.contactInfo;
      await this.vendorRepo.save(vendor);
    }

    return { success: true, vTin: carrier.vTin };
  }

  async deleteCarrier(tin: string) {
    const carrier = await this.carrierRepo.findOne({
      where: { vTin: tin },
      relations: ['transportLegs']
    });
    if (!carrier) {
      throw new NotFoundException(`Carrier Company with TIN ${tin} not found`);
    }

    if (carrier.transportLegs?.length > 0) {
      throw new BadRequestException(
        `Cannot delete carrier. Please delete ${carrier.transportLegs.length} Transport Leg(s) first (tab Logistics > Transport Legs)`
      );
    }

    await this.carrierRepo.delete({ vTin: tin });
    return { success: true };
  }

  // Shipments methods (using BaseService)
  async getAllShipments() {
    const shipments = await this.findAll({
      relations: ['distributor', 'distributor.vendor', 'transportLegs'],
      order: { id: 'DESC' },
    });

    return shipments.map((s) => ({
      id: s.id,
      status: s.status,
      destination: s.destination,
      startLocation: s.startLocation,
      distributorTin: s.distributorTin,
      distributorName: s.distributor?.vendor?.name,
      transportLegCount: s.transportLegs?.length || 0,
    }));
  }

  async getShipment(id: number) {
    const shipment = await this.findOne(id, ['distributor', 'distributor.vendor', 'transportLegs']);

    return {
      id: shipment.id,
      status: shipment.status,
      destination: shipment.destination,
      startLocation: shipment.startLocation,
      distributorTin: shipment.distributorTin,
      distributorName: shipment.distributor?.vendor?.name,
      transportLegCount: shipment.transportLegs?.length || 0,
    };
  }

  async createShipment(data: {
    status: string;
    destination?: string;
    distributorTin: string;
    startLocation?: string;
  }) {
    const shipment = await this.create({
      status: data.status,
      destination: data.destination,
      startLocation: data.startLocation,
      distributorTin: data.distributorTin,
    });
    return { success: true, id: shipment.id };
  }

  async updateShipment(
    id: number,
    data: {
      status?: string;
      destination?: string;
      distributorTin?: string;
      startLocation?: string;
    },
  ) {
    const shipment = await this.update(id, data);
    return { success: true, id: shipment.id };
  }

  async deleteShipment(id: number) {
    const shipment = await this.repository.findOne({
      where: { id },
      relations: ['shipBatches', 'transportLegs']
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    if (shipment.shipBatches && shipment.shipBatches.length > 0) {
      throw new BadRequestException(
        `Cannot delete Shipment: It contains ${shipment.shipBatches.length} batch(es). ` +
        `Please remove them first (Logistics > Shipments).`
      );
    }

    if (shipment.transportLegs && shipment.transportLegs.length > 0) {
      throw new BadRequestException(
        `Cannot delete Shipment: It has ${shipment.transportLegs.length} transport leg(s). ` +
        `Please delete them first (Logistics > Transport Legs).`
      );
    }

    await this.delete(id);
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
      regNo: leg.regNo,
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
      regNo: leg.regNo,
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
    regNo?: string;
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
      regNo: data.regNo,
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
      regNo?: string;
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
    if (data.regNo !== undefined) leg.regNo = data.regNo;
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
