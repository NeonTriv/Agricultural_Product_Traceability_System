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

    return vendors.map((v) => {
      const isDistributor = v.distributors?.length > 0;
      const isRetail = v.retails?.length > 0;
      let type: 'vendor' | 'distributor' | 'retail' | 'both' = 'vendor';
      
      if (isDistributor && isRetail) type = 'both';
      else if (isDistributor) type = 'distributor';
      else if (isRetail) type = 'retail';

      return {
        tin: v.tin,
        name: v.name,
        address: v.address,
        contactInfo: v.contactInfo,
        type,
        distributorType: v.distributors?.[0]?.type,
        retailFormat: v.retails?.[0]?.format,
      };
    });
  }

  async getVendor(tin: string) {
    const vendor = await this.vendorRepo.findOne({
      where: { tin },
      relations: ['distributors', 'retails', 'vendorProducts'],
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with TIN ${tin} not found`);
    }

    const isDistributor = vendor.distributors?.length > 0;
    const isRetail = vendor.retails?.length > 0;
    let type: 'vendor' | 'distributor' | 'retail' | 'both' = 'vendor';
    
    if (isDistributor && isRetail) type = 'both';
    else if (isDistributor) type = 'distributor';
    else if (isRetail) type = 'retail';

    return {
      tin: vendor.tin,
      name: vendor.name,
      address: vendor.address,
      contactInfo: vendor.contactInfo,
      type,
      distributorType: vendor.distributors?.[0]?.type,
      retailFormat: vendor.retails?.[0]?.format,
    };
  }

  async createVendor(data: {
    tin: string;
    name: string;
    address: string;
    contactInfo?: string;
    vendorType?: 'distributor' | 'retail' | 'both';
    distributorType?: string;
    retailFormat?: string;
  }) {
    // Validate required fields for distributor/retail
    if (data.vendorType === 'distributor' || data.vendorType === 'both') {
      if (!data.distributorType) {
        throw new BadRequestException('Distributor Type is required for distributor vendors');
      }
    }
    if (data.vendorType === 'retail' || data.vendorType === 'both') {
      if (!data.retailFormat) {
        throw new BadRequestException('Retail Format is required for retail vendors');
      }
    }

    // Create base vendor
    const vendor = this.vendorRepo.create({
      tin: data.tin,
      name: data.name,
      address: data.address,
      contactInfo: data.contactInfo,
    });

    await this.vendorRepo.save(vendor);

    // Create distributor or retail if specified
    if ((data.vendorType === 'distributor' || data.vendorType === 'both') && data.distributorType) {
      const distributor = this.distributorRepo.create({
        vendorTin: data.tin,
        type: data.distributorType,
      });
      await this.distributorRepo.save(distributor);
    }
    
    if ((data.vendorType === 'retail' || data.vendorType === 'both') && data.retailFormat) {
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
      vendorType?: 'distributor' | 'retail' | 'both';
      distributorType?: string;
      retailFormat?: string;
    },
  ) {
    // Validate required fields for distributor/retail
    if (data.vendorType === 'distributor' && !data.distributorType) {
      throw new BadRequestException('Distributor Type is required for distributor vendors');
    }
    if (data.vendorType === 'retail' && !data.retailFormat) {
      throw new BadRequestException('Retail Format is required for retail vendors');
    }
    if (data.vendorType === 'both' && (!data.distributorType || !data.retailFormat)) {
      throw new BadRequestException('Both Distributor Type and Retail Format are required for both vendors');
    }

    const vendor = await this.vendorRepo.findOne({ 
      where: { tin },
      relations: ['distributors', 'retails']
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with TIN ${tin} not found`);
    }

    // Update vendor base info
    if (data.name) vendor.name = data.name;
    if (data.address) vendor.address = data.address;
    if (data.contactInfo !== undefined) vendor.contactInfo = data.contactInfo;

    await this.vendorRepo.save(vendor);

    // Handle type changes
    if (data.vendorType) {
      const hasDistributor = vendor.distributors?.length > 0;
      const hasRetail = vendor.retails?.length > 0;

      if (data.vendorType === 'distributor') {
        // Keep distributor, remove retail
        if (!hasDistributor && data.distributorType) {
          const distributor = this.distributorRepo.create({
            vendorTin: tin,
            type: data.distributorType,
          });
          await this.distributorRepo.save(distributor);
        }
        if (hasRetail) {
          await this.retailRepo.delete({ vendorTin: tin });
        }
      } else if (data.vendorType === 'retail') {
        // Keep retail, remove distributor
        if (!hasRetail && data.retailFormat) {
          const retail = this.retailRepo.create({
            vendorTin: tin,
            format: data.retailFormat,
          });
          await this.retailRepo.save(retail);
        }
        if (hasDistributor) {
          await this.distributorRepo.delete({ vendorTin: tin });
        }
      } else if (data.vendorType === 'both') {
        // Create both if not exist
        if (!hasDistributor && data.distributorType) {
          const distributor = this.distributorRepo.create({
            vendorTin: tin,
            type: data.distributorType,
          });
          await this.distributorRepo.save(distributor);
        }
        if (!hasRetail && data.retailFormat) {
          const retail = this.retailRepo.create({
            vendorTin: tin,
            format: data.retailFormat,
          });
          await this.retailRepo.save(retail);
        }
      }
    }

    return { success: true, tin: vendor.tin };
  }

  async deleteVendor(tin: string) {
    // Check if vendor exists
    const vendor = await this.vendorRepo.findOne({
      where: { tin },
      relations: ['distributors', 'distributors.shipments', 'retails', 'vendorProducts']
    });
    if (!vendor) {
      throw new NotFoundException(`Vendor with TIN ${tin} not found`);
    }

    // Check for carrier company separately
    const carrierCompany = await this.carrierRepo.findOne({ where: { vTin: tin } });

    // Check for related records and provide helpful error message
    const blockers: string[] = [];

    // Check if distributor has shipments (the actual blocker, not just being a distributor)
    if (vendor.distributors?.length > 0) {
      const shipmentsCount = vendor.distributors.reduce((sum, d) => sum + (d.shipments?.length || 0), 0);
      if (shipmentsCount > 0) {
        blockers.push(`${shipmentsCount} Shipment(s) from this distributor (tab Logistics > Shipments)`);
      }
    }

    // Retail records can be cascade deleted, so they're not a blocker
    // (no other tables reference RETAIL)

    if (vendor.vendorProducts?.length > 0) {
      blockers.push(`${vendor.vendorProducts.length} Vendor Product(s)`);
    }

    if (carrierCompany) {
      blockers.push('Carrier Company record');
    }

    if (blockers.length > 0) {
      throw new BadRequestException(
        `Cannot delete Vendor: It has ${blockers.join(' and ')}. ` +
        `Please delete them first.`
      );
    }

    // Now safe to delete the vendor
    await this.vendorRepo.delete({ tin });

    return { success: true };
  }
}
