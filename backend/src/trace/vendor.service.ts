import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { Distributor } from './entities/distributor.entity';
import { Retail } from './entities/retail.entity';
import { CarrierCompany } from './entities/carrier-company.entity';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(Distributor)
    private readonly distributorRepo: Repository<Distributor>,
    @InjectRepository(Retail)
    private readonly retailRepo: Repository<Retail>,
    @InjectRepository(CarrierCompany)
    private readonly carrierRepo: Repository<CarrierCompany>,
  ) {}

  async getAllVendors() {
    const vendors = await this.vendorRepo.find({
      relations: ['distributors', 'retails'],
    });

    return vendors.map((v) => ({
      tin: v.tin,
      name: v.name,
      address: v.address,
      contactInfo: v.contactInfo,
      type: v.distributors?.length > 0
        ? 'distributor'
        : v.retails?.length > 0
        ? 'retail'
        : 'vendor',
      distributorType: v.distributors?.[0]?.type,
      retailFormat: v.retails?.[0]?.format,
    }));
  }

  async getVendor(tin: string) {
    const vendor = await this.vendorRepo.findOne({
      where: { tin },
      relations: ['distributors', 'retails', 'vendorProducts'],
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with TIN ${tin} not found`);
    }

    return {
      tin: vendor.tin,
      name: vendor.name,
      address: vendor.address,
      contactInfo: vendor.contactInfo,
      type: vendor.distributors?.length > 0
        ? 'distributor'
        : vendor.retails?.length > 0
        ? 'retail'
        : 'vendor',
      distributorType: vendor.distributors?.[0]?.type,
      retailFormat: vendor.retails?.[0]?.format,
    };
  }

  async createVendor(data: {
    tin: string;
    name: string;
    address: string;
    contactInfo?: string;
    vendorType?: 'distributor' | 'retail';
    distributorType?: string;
    retailFormat?: string;
  }) {
    // Create base vendor
    const vendor = this.vendorRepo.create({
      tin: data.tin,
      name: data.name,
      address: data.address,
      contactInfo: data.contactInfo,
    });

    await this.vendorRepo.save(vendor);

    // Create distributor or retail if specified
    if (data.vendorType === 'distributor' && data.distributorType) {
      const distributor = this.distributorRepo.create({
        vendorTin: data.tin,
        type: data.distributorType,
      });
      await this.distributorRepo.save(distributor);
    } else if (data.vendorType === 'retail' && data.retailFormat) {
      const retail = this.retailRepo.create({
        vendorTin: data.tin,
        format: data.retailFormat,
      });
      await this.retailRepo.save(retail);
    }

    return { success: true, tin: vendor.tin };
  }

  async updateVendor(
    tin: string,
    data: {
      name?: string;
      address?: string;
      contactInfo?: string;
    },
  ) {
    const vendor = await this.vendorRepo.findOne({ where: { tin } });

    if (!vendor) {
      throw new NotFoundException(`Vendor with TIN ${tin} not found`);
    }

    if (data.name) vendor.name = data.name;
    if (data.address) vendor.address = data.address;
    if (data.contactInfo !== undefined) vendor.contactInfo = data.contactInfo;

    await this.vendorRepo.save(vendor);

    return { success: true, tin: vendor.tin };
  }

  async deleteVendor(tin: string) {
    // Check if vendor exists
    const vendor = await this.vendorRepo.findOne({ 
      where: { tin },
      relations: ['distributors', 'retails', 'vendorProducts']
    });
    if (!vendor) {
      throw new NotFoundException(`Vendor with TIN ${tin} not found`);
    }

    // Check for carrier company separately
    const carrierCompany = await this.carrierRepo.findOne({ where: { vTin: tin } });

    // Check for related records and provide helpful error message
    const blockers: string[] = [];
    if (vendor.distributors?.length > 0) {
      blockers.push('Distributor records (tab Vendors > delete distributor type)');
    }
    if (vendor.retails?.length > 0) {
      blockers.push('Retail records (tab Vendors > delete retail type)');
    }
    if (vendor.vendorProducts?.length > 0) {
      blockers.push(`Vendor Products (${vendor.vendorProducts.length} items - tab Vendors > Vendor Products)`);
    }
    if (carrierCompany) {
      blockers.push('Carrier Company (tab Logistics > Carrier Companies)');
    }

    if (blockers.length > 0) {
      throw new BadRequestException(`Cannot delete vendor. Please delete the following first: ${blockers.join(', ')}`);
    }

    // Now safe to delete the vendor
    await this.vendorRepo.delete({ tin });

    return { success: true };
  }
}
