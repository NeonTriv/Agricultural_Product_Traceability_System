import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgricultureProduct } from './entities/agriculture-product.entity';
import { Batch } from './entities/batch.entity';
import { Farm } from './entities/farm.entity';
import { FarmCertification } from './entities/farm-certification.entity';
import { Type } from './entities/type.entity';
import { Province } from './entities/province.entity';
import { Country } from './entities/country.entity';
import { Processing } from './entities/processing.entity';
import { ProcessingFacility } from './entities/processing-facility.entity';
import { VendorProduct } from './entities/vendor-product.entity';
import { Vendor } from './entities/vendor.entity';
import { Price } from './entities/price.entity';
import {
  TraceResponseDto,
  ProductDto,
  BatchDto,
  FarmDto,
  ProcessingDto,
  DistributorDto,
  PriceDto,
} from './dto/trace-response.dto';

@Injectable()
export class TraceService {
  constructor(
    @InjectRepository(AgricultureProduct)
    private readonly productRepo: Repository<AgricultureProduct>,
    @InjectRepository(Batch)
    private readonly batchRepo: Repository<Batch>,
    @InjectRepository(Farm)
    private readonly farmRepo: Repository<Farm>,
    @InjectRepository(FarmCertification)
    private readonly farmCertRepo: Repository<FarmCertification>,
    @InjectRepository(Type)
    private readonly typeRepo: Repository<Type>,
    @InjectRepository(Province)
    private readonly provinceRepo: Repository<Province>,
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
    @InjectRepository(Processing)
    private readonly processingRepo: Repository<Processing>,
    @InjectRepository(ProcessingFacility)
    private readonly facilityRepo: Repository<ProcessingFacility>,
    @InjectRepository(VendorProduct)
    private readonly vendorProductRepo: Repository<VendorProduct>,
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(Price)
    private readonly priceRepo: Repository<Price>,
  ) {}

  /**
   * OPTIMIZED QUERY: Fetch product traceability by QR code
   *
   * KEY SCHEMA CHANGES:
   * - QR code is now in BATCH table (Qr_Code_URL column)
   * - BATCH links to AGRICULTURE_PRODUCT via AP_ID
   * - BATCH links to FARM via Farm_ID
   * - FARM links to PROVINCE via P_ID
   * - PROVINCE links to COUNTRY via C_ID
   *
   * OPTIMIZATION TECHNIQUES:
   * 1. Single query with JOINs instead of N+1 queries
   * 2. Select only required columns
   * 3. Use index on Qr_Code_URL for fast lookup
   */
  async getTraceByCode(qrCodeUrl: string): Promise<TraceResponseDto> {
    // Start from BATCH table since QR code is there
    const batch = await this.batchRepo
      .createQueryBuilder('batch')
      .select([
        // Batch fields
        'batch.id',
        'batch.harvestDate',
        'batch.grade',
        'batch.qrCodeUrl',
        'batch.createdBy',
        'batch.seedBatch',
        // Agriculture Product fields
        'product.id',
        'product.name',
        'product.imageUrl',
        // Type fields
        'type.id',
        'type.name',
        'type.variety',
        // Farm fields
        'farm.id',
        'farm.name',
        'farm.ownerName',
        'farm.contactInfo',
        'farm.longitude',
        'farm.latitude',
        // Province fields
        'province.id',
        'province.name',
        // Country fields
        'country.id',
        'country.name',
      ])
      .where('batch.qrCodeUrl = :qrCodeUrl', { qrCodeUrl })
      // Join agriculture product
      .leftJoin('batch.agricultureProduct', 'product')
      // Join type
      .leftJoin('product.type', 'type')
      // Join farm
      .leftJoin('batch.farm', 'farm')
      // Join province
      .leftJoin('farm.province', 'province')
      // Join country
      .leftJoin('province.country', 'country')
      .getOne();

    if (!batch) {
      throw new NotFoundException(
        `Product with QR code "${qrCodeUrl}" not found`,
      );
    }

    // Fetch farm certifications
    let certifications: string[] = [];
    if (batch.farm) {
      const certs = await this.farmCertRepo.find({
        where: { farmId: batch.farm.id },
      });
      certifications = certs.map((c) => c.farmCertifications);
    }

    // Fetch processing info
    let processingDto: ProcessingDto | undefined;
    const processing = await this.processingRepo
      .createQueryBuilder('p')
      .select([
        'p.id',
        'p.packagingDate',
        'p.processedBy',
        'p.packagingType',
        'p.processingDate',
        'facility.id',
        'facility.name',
      ])
      .leftJoin('p.facility', 'facility')
      .where('p.batchId = :batchId', { batchId: batch.id })
      .getOne();

    if (processing) {
      processingDto = {
        facility: processing.facility?.name,
        packedAt: processing.packagingDate
          ? new Date(processing.packagingDate).toISOString().split('T')[0]
          : undefined,
        processedBy: processing.processedBy,
        packagingType: processing.packagingType,
      };
    }

    // Fetch vendor and price info
    // Find vendor product by agriculture product ID
    let distributorDto: DistributorDto | undefined;
    let priceDto: PriceDto | undefined;

    if (batch.agricultureProduct) {
      const vendorProduct = await this.vendorProductRepo
        .createQueryBuilder('vp')
        .select([
          'vp.id',
          'vp.unit',
          'vendor.tin',
          'vendor.name',
          'vendor.address',
        ])
        .leftJoin('vp.vendor', 'vendor')
        .where('vp.agricultureProductId = :apId', {
          apId: batch.agricultureProduct.id,
        })
        .getOne();

      if (vendorProduct) {
        distributorDto = {
          name: vendorProduct.vendor?.name,
          location: vendorProduct.vendor?.address,
        };

        // Fetch price
        const price = await this.priceRepo.findOne({
          where: { vendorProductId: vendorProduct.id },
        });

        if (price) {
          priceDto = {
            amount: Number(price.value),
            currency: price.currency,
          };
        }
      }
    }

    // Map to DTOs
    const productDto: ProductDto = {
      id: batch.agricultureProduct?.id?.toString() || 'unknown',
      name: batch.agricultureProduct?.name || 'Unknown Product',
      imageUrl: batch.agricultureProduct?.imageUrl,
    };

    const batchDto: BatchDto = {
      id: batch.id.toString(),
      farmName: batch.farm?.name || 'Unknown Farm',
      harvestDate: batch.harvestDate
        ? new Date(batch.harvestDate).toISOString().split('T')[0]
        : undefined,
      grade: batch.grade,
    };

    let farmDto: FarmDto | undefined;
    if (batch.farm) {
      farmDto = {
        name: batch.farm.name,
        address: `${batch.farm.province?.name || ''}, ${batch.farm.province?.country?.name || ''}`.trim(),
        country: batch.farm.province?.country?.name,
        province: batch.farm.province?.name,
        certifications,
      };
    }

    return {
      code: qrCodeUrl,
      product: productDto,
      batch: batchDto,
      farm: farmDto,
      processing: processingDto,
      distributor: distributorDto,
      price: priceDto,
    };
  }

  /**
   * Get all batches with QR codes (for testing)
   * OPTIMIZED: Select only necessary columns
   */
  async getAllProducts(): Promise<any[]> {
    const batches = await this.batchRepo
      .createQueryBuilder('batch')
      .select([
        'batch.id',
        'batch.qrCodeUrl',
        'batch.harvestDate',
        'batch.grade',
        'batch.seedBatch',
        'product.id',
        'product.name',
        'product.imageUrl',
        'farm.id',
        'farm.name',
        'province.id',
        'province.name',
        'country.id',
        'country.name',
      ])
      .leftJoin('batch.agricultureProduct', 'product')
      .leftJoin('batch.farm', 'farm')
      .leftJoin('farm.province', 'province')
      .leftJoin('province.country', 'country')
      .orderBy('batch.id', 'DESC') // Show newest products first
      .take(100) // Limit for performance
      .getMany();

    return batches.map((b) => ({
      batchId: b.id,
      qrCodeUrl: b.qrCodeUrl,
      productName: b.agricultureProduct?.name || 'Unknown',
      productImageUrl: b.agricultureProduct?.imageUrl,
      farmName: b.farm?.name || 'Unknown Farm',
      province: b.farm?.province?.name,
      country: b.farm?.province?.country?.name,
      harvestDate: b.harvestDate,
      grade: b.grade,
      variety: b.seedBatch,
    }));
  }

  /**
   * Create a new batch
   */
  async createProduct(data: {
    qrCodeUrl: string;
    farmId: number;
    agricultureProductId: number;
    harvestDate: Date;
    grade?: string;
  }) {
    const batch = this.batchRepo.create({
      qrCodeUrl: data.qrCodeUrl,
      farmId: data.farmId,
      agricultureProductId: data.agricultureProductId,
      harvestDate: data.harvestDate,
      grade: data.grade,
    });

    const saved = await this.batchRepo.save(batch);
    return { success: true, id: saved.id };
  }

  /**
   * Update an existing batch
   */
  async updateProduct(
    id: number,
    data: {
      qrCodeUrl?: string;
      farmId?: number;
      agricultureProductId?: number;
      harvestDate?: Date;
      grade?: string;
      seedBatch?: string;
    },
  ) {
    const batch = await this.batchRepo.findOne({
      where: { id },
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID "${id}" not found`);
    }

    if (data.qrCodeUrl) batch.qrCodeUrl = data.qrCodeUrl;
    if (data.farmId) batch.farmId = data.farmId;
    if (data.agricultureProductId)
      batch.agricultureProductId = data.agricultureProductId;
    if (data.harvestDate) batch.harvestDate = data.harvestDate;
    if (data.grade) batch.grade = data.grade;
    if (data.seedBatch !== undefined) batch.seedBatch = data.seedBatch;

    await this.batchRepo.save(batch);
    return { success: true, id };
  }

  /**
   * Delete a batch
   */
  async deleteProduct(id: number) {
    const result = await this.batchRepo.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Batch with ID "${id}" not found`);
    }

    return { success: true, id };
  }

  /**
   * Get all farms for dropdown selection
   */
  async getAllFarms() {
    const farms = await this.farmRepo.find({
      relations: ['province', 'province.country'],
      take: 100,
    });
    return farms.map((f) => ({
      id: f.id,
      name: f.name,
      ownerName: f.ownerName,
      contactInfo: f.contactInfo,
      longitude: f.longitude,
      latitude: f.latitude,
      provinceId: f.provinceId,
      provinceName: f.province?.name || 'Unknown',
      countryName: f.province?.country?.name || 'Unknown',
    }));
  }

  /**
   * Get all agriculture products for dropdown selection
   */
  async getAllAgricultureProducts() {
    const products = await this.productRepo.find({
      take: 100,
    });
    return products.map((p) => ({
      id: p.id,
      name: p.name,
    }));
  }

  /**
   * Get all provinces with their country information
   */
  async getAllProvinces() {
    const provinces = await this.provinceRepo.find({
      relations: ['country'],
      take: 100,
    });
    return provinces.map((p) => ({
      id: p.id,
      name: p.name,
      countryId: p.countryId,
      countryName: p.country?.name || 'Unknown',
    }));
  }

  /**
   * Get all countries for dropdown selection
   */
  async getAllCountries() {
    const countries = await this.countryRepo.find({
      take: 100,
    });
    return countries.map((c) => ({
      id: c.id,
      name: c.name,
    }));
  }

  /**
   * Create a new farm
   */
  async createFarm(data: {
    name: string;
    ownerName?: string;
    contactInfo?: string;
    longitude?: number;
    latitude?: number;
    provinceId: number;
  }) {
    const farm = this.farmRepo.create({
      name: data.name,
      ownerName: data.ownerName,
      contactInfo: data.contactInfo,
      longitude: data.longitude || 0,
      latitude: data.latitude || 0,
      provinceId: data.provinceId,
    });

    const saved = await this.farmRepo.save(farm);
    return { success: true, id: saved.id };
  }
}
