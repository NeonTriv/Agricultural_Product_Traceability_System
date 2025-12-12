import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AgricultureProduct } from './entities/agriculture-product.entity';
import { Batch } from './entities/batch.entity';
import { Farm } from './entities/farm.entity';
import { FarmCertification } from './entities/farm-certification.entity';
import { Type } from './entities/type.entity';
import { Category } from './entities/category.entity';
import { Province } from './entities/province.entity';
import { Country } from './entities/country.entity';
import { Processing } from './entities/processing.entity';
import { ProcessingFacility } from './entities/processing-facility.entity';
import { VendorProduct } from './entities/vendor-product.entity';
import { Vendor } from './entities/vendor.entity';
import { Price } from './entities/price.entity';
import { Discount } from './entities/discount.entity';
import { ProductHasDiscount } from './entities/product-has-discount.entity';
import { StoredIn } from './entities/stored-in.entity';
import { Warehouse } from './entities/warehouse.entity';
import { ShipBatch } from './entities/ship-batch.entity';
import { Shipment } from './entities/shipment.entity';
import { TransportLeg } from './entities/transport-leg.entity';
import { CarrierCompany } from './entities/carrier-company.entity';
import {
  TraceResponseDto,
  ProductDto,
  BatchDto,
  FarmDto,
  ProcessingDto,
  DistributorDto,
  PriceDto,
  TypeDto,
  LocationDto,
  VendorDto,
  ProcessingFacilityDto,
  WarehouseDto,
  DiscountDto,
  ShipmentDto,
  TransportLegDto,
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
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
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
    @InjectRepository(ProductHasDiscount)
    private readonly productHasDiscountRepo: Repository<ProductHasDiscount>,
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
    // Single optimized query with all necessary joins
    const batch = await this.batchRepo
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.farm', 'farm')
      .leftJoinAndSelect('farm.province', 'province')
      .leftJoinAndSelect('province.country', 'country')
      .leftJoinAndSelect('farm.certifications', 'cert')
      .leftJoinAndSelect('batch.agricultureProduct', 'product')
      .leftJoinAndSelect('product.type', 'type')
      .leftJoinAndSelect('product.vendorProducts', 'vendorProduct')
      .leftJoinAndSelect('vendorProduct.vendor', 'vendor')
      .leftJoinAndSelect('vendorProduct.prices', 'price')
      .leftJoinAndSelect('vendorProduct.productHasDiscounts', 'productDiscount')
      .leftJoinAndSelect('productDiscount.discount', 'discount')
      .leftJoinAndSelect('batch.processings', 'processing')
      .leftJoinAndSelect('processing.facility', 'facility')
      .leftJoinAndSelect('batch.storedIn', 'storedIn')
      .leftJoinAndSelect('storedIn.warehouse', 'warehouse')
      .leftJoinAndSelect('warehouse.province', 'warehouseProvince')
      .leftJoinAndSelect('batch.shipBatches', 'shipBatch')
      .leftJoinAndSelect('shipBatch.shipment', 'shipment')
      .leftJoinAndSelect('shipment.transportLegs', 'transportLeg')
      .leftJoinAndSelect('transportLeg.carrierCompany', 'carrierCompany')
      .leftJoinAndSelect('carrierCompany.vendor', 'carrierVendor')
      .where('batch.qrCodeUrl = :qrCodeUrl', { qrCodeUrl })
      .getOne();

    if (!batch) {
      throw new NotFoundException(
        `Product with QR code "${qrCodeUrl}" not found`,
      );
    }

    return this.mapBatchToTraceResponse(batch);
  }

  private mapBatchToTraceResponse(batch: Batch): TraceResponseDto {
    // Type information
    const typeDto: TypeDto | undefined = batch.agricultureProduct?.type
      ? {
          id: batch.agricultureProduct.type.id?.toString() || '',
          // TYPE entity does not have 'name'; use 'variety' for display
          name: batch.agricultureProduct.type.variety || '',
          variety: batch.agricultureProduct.type.variety || undefined,
        }
      : undefined;

    // Product information
    const productDto: ProductDto = {
      id: batch.agricultureProduct?.id?.toString() || 'unknown',
      name: batch.agricultureProduct?.name || 'Unknown Product',
      imageUrl: batch.agricultureProduct?.imageUrl,
      qrCodeUrl: batch.qrCodeUrl,
      batchId: batch.id.toString(),
      type: typeDto,
    };

    // Batch information
    const batchDto: BatchDto = {
      id: batch.id.toString(),
      harvestDate: batch.harvestDate
        ? new Date(batch.harvestDate).toISOString().split('T')[0]
        : undefined,
      grade: batch.grade,
      seedBatch: (batch as any).seedBatch,
      createdBy: (batch as any).createdBy,
      farmName: batch.farm?.name || 'Unknown Farm',
    };

    // Farm & location
    let farmDto: FarmDto | undefined;
    if (batch.farm) {
      const locationDto: LocationDto = {
        country: batch.farm.province?.country?.name,
        province: batch.farm.province?.name,
        address: batch.farm.addressDetail,
        latitude: batch.farm.latitude ? Number(batch.farm.latitude) : undefined,
        longitude: batch.farm.longitude ? Number(batch.farm.longitude) : undefined,
      };

      const certifications = batch.farm.certifications?.map((c) => c.farmCertifications) || [];

      farmDto = {
        id: batch.farm.id?.toString() || '',
        name: batch.farm.name,
        ownerName: batch.farm.ownerName,
        contactInfo: batch.farm.contactInfo,
        location: locationDto,
        certifications,
      };
    }

    // Processing
    let processingDto: ProcessingDto | undefined;
    if ((batch as any).processings && (batch as any).processings.length > 0) {
      const proc = (batch as any).processings[0];

      const facilityDto: ProcessingFacilityDto | undefined = proc.facility
        ? {
            id: proc.facility.id?.toString() || '',
            name: proc.facility.name,
            location: proc.facility.address,
          }
        : undefined;

      processingDto = {
        id: proc.id?.toString() || '',
        facility: facilityDto,
        processingDate: proc.processingDate
          ? new Date(proc.processingDate).toISOString().split('T')[0]
          : undefined,
        packagingDate: proc.packagingDate
          ? new Date(proc.packagingDate).toISOString().split('T')[0]
          : undefined,
        processedBy: proc.processedBy,
        packagingType: proc.packagingType,
        weightPerUnit: proc.weightPerUnit ? Number(proc.weightPerUnit) : undefined,
      };
    }

    // Distributor & Price
    let distributorDto: DistributorDto | undefined;
    let priceDto: PriceDto | undefined;

    if (batch.agricultureProduct?.vendorProducts && batch.agricultureProduct.vendorProducts.length > 0) {
      const vp = batch.agricultureProduct.vendorProducts[0];

      if (vp.vendor) {
        const vendorDto: VendorDto = {
          tin: vp.vendor.tin || '',
          name: vp.vendor.name,
          address: vp.vendor.address,
          contactInfo: vp.vendor.contactInfo,
        };

        distributorDto = {
          vendor: vendorDto,
          unit: vp.unit,
        };
      }

      if (vp.prices && vp.prices.length > 0) {
        const latestPrice = vp.prices[0];
        priceDto = {
          amount: latestPrice.value ? Number(latestPrice.value) : undefined,
          currency: latestPrice.currency,
        };
      }
    }

    // Warehouse information
    const warehouseDtos: WarehouseDto[] = [];
    if ((batch as any).storedIn && (batch as any).storedIn.length > 0) {
      for (const stored of (batch as any).storedIn) {
        if (stored.warehouse) {
          warehouseDtos.push({
            id: stored.warehouse.id,
            address: stored.warehouse.addressDetail || '',
            capacity: stored.warehouse.capacity ? Number(stored.warehouse.capacity) : undefined,
            storeCondition: stored.warehouse.storeCondition,
            province: stored.warehouse.province?.name,
            quantity: stored.quantity ? Number(stored.quantity) : undefined,
            startDate: stored.startDate ? new Date(stored.startDate).toISOString().split('T')[0] : undefined,
            endDate: stored.endDate ? new Date(stored.endDate).toISOString().split('T')[0] : undefined,
          });
        }
      }
    }

    // Discount information
    const discountDtos: DiscountDto[] = [];
    if (batch.agricultureProduct?.vendorProducts && batch.agricultureProduct.vendorProducts.length > 0) {
      for (const vp of batch.agricultureProduct.vendorProducts) {
        if ((vp as any).productHasDiscounts && (vp as any).productHasDiscounts.length > 0) {
          for (const phd of (vp as any).productHasDiscounts) {
            if (phd.discount) {
              discountDtos.push({
                id: phd.discount.id,
                name: phd.discount.name,
                percentage: phd.discount.percentage ? Number(phd.discount.percentage) : undefined,
                minValue: phd.discount.minValue ? Number(phd.discount.minValue) : undefined,
                maxDiscountAmount: phd.discount.maxDiscountAmount ? Number(phd.discount.maxDiscountAmount) : undefined,
                startDate: phd.discount.startDate ? new Date(phd.discount.startDate).toISOString().split('T')[0] : undefined,
                expiredDate: phd.discount.expiredDate ? new Date(phd.discount.expiredDate).toISOString().split('T')[0] : undefined,
                isStackable: phd.discount.isStackable,
              });
            }
          }
        }
      }
    }

    // Shipment & Transport information
    const shipmentDtos: ShipmentDto[] = [];
    if ((batch as any).shipBatches && (batch as any).shipBatches.length > 0) {
      for (const shipBatch of (batch as any).shipBatches) {
        if (shipBatch.shipment) {
          const transportLegDtos: TransportLegDto[] = [];
          
          if (shipBatch.shipment.transportLegs && shipBatch.shipment.transportLegs.length > 0) {
            for (const leg of shipBatch.shipment.transportLegs) {
              transportLegDtos.push({
                id: leg.id,
                startLocation: leg.startLocation,
                toLocation: leg.toLocation,
                departureTime: leg.departureTime ? new Date(leg.departureTime).toISOString() : undefined,
                arrivalTime: leg.arrivalTime ? new Date(leg.arrivalTime).toISOString() : undefined,
                driverName: leg.driverName,
                temperatureProfile: leg.temperatureProfile,
                carrierCompany: leg.carrierCompany?.vendor ? {
                  name: leg.carrierCompany.vendor.name,
                  tin: leg.carrierCompany.vTin,
                  contactInfo: leg.carrierCompany.vendor.contactInfo,
                } : undefined,
              });
            }
          }

          shipmentDtos.push({
            id: shipBatch.shipment.id,
            status: shipBatch.shipment.status,
            startLocation: shipBatch.shipment.startLocation,
            destination: shipBatch.shipment.destination,
            transportLegs: transportLegDtos.length > 0 ? transportLegDtos : undefined,
          });
        }
      }
    }

    return {
      code: batch.qrCodeUrl,
      product: productDto,
      batch: batchDto,
      farm: farmDto,
      processing: processingDto,
      distributor: distributorDto,
      price: priceDto,
      warehouses: warehouseDtos.length > 0 ? warehouseDtos : undefined,
      discounts: discountDtos.length > 0 ? discountDtos : undefined,
      shipments: shipmentDtos.length > 0 ? shipmentDtos : undefined,
    };
  }

  async updateBatch(
    id: number,
    body: { harvestDate?: string | Date; grade?: string; vendorProductId?: number | null; qrCodeUrl?: string },
  ) {
    const batch = await this.batchRepo.findOne({ where: { id } });
    if (!batch) throw new NotFoundException('Batch not found');
    if (body.harvestDate) {
      batch.harvestDate = body.harvestDate instanceof Date ? body.harvestDate : new Date(body.harvestDate);
    }
    if (body.grade !== undefined) batch.grade = body.grade ?? batch.grade;
    if (body.vendorProductId !== undefined) batch.vendorProductId = body.vendorProductId ?? batch.vendorProductId;
    if (body.qrCodeUrl !== undefined) batch.qrCodeUrl = body.qrCodeUrl ?? batch.qrCodeUrl;
    await this.batchRepo.save(batch);
    return { success: true, id };
  }

  async deleteBatch(id: number) {
    const batch = await this.batchRepo.findOne({ 
      where: { id },
      relations: ['processings', 'storedIn']
    });
    if (!batch) throw new NotFoundException('Batch not found');

    // Check for related processing records
    if (batch.processings && batch.processings.length > 0) {
      throw new BadRequestException(
        `Cannot delete Batch: It has ${batch.processings.length} processing operation(s). ` +
        `Please delete them first (Processing > Operations).`
      );
    }

    // Check for stored batches (in warehouses)
    if (batch.storedIn && batch.storedIn.length > 0) {
      throw new BadRequestException(
        `Cannot delete Batch: It is stored in ${batch.storedIn.length} warehouse(s). ` +
        `Please remove it from storage first (Storage > Stored Items).`
      );
    }

    await this.batchRepo.remove(batch);
    return { success: true };
  }

  async updateAgricultureProduct(
    id: number,
    body: { name?: string; typeId?: number; imageUrl?: string },
  ) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Agriculture product not found');
    if (body.name !== undefined) product.name = body.name || product.name;
    if (body.typeId !== undefined) {
      const type = await this.typeRepo.findOne({ where: { id: body.typeId } });
      if (!type) throw new BadRequestException('Invalid typeId');
      product.type = type;
      product.typeId = type.id;
    }
    if (body.imageUrl !== undefined) product.imageUrl = body.imageUrl ?? product.imageUrl;
    await this.productRepo.save(product);
    return { success: true, id };
  }

  async deleteAgricultureProduct(id: number) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Agriculture product not found');

    // Check dependencies
    const batchCount = await this.batchRepo.count({ where: { agricultureProductId: id } });
    const vendorProductCount = await this.vendorProductRepo.count({ where: { agricultureProductId: id } });

    if (batchCount > 0 || vendorProductCount > 0) {
      const details: string[] = [];
      if (batchCount > 0) details.push(`${batchCount} batch(es)`);
      if (vendorProductCount > 0) details.push(`${vendorProductCount} vendor product(s)`);
      
      throw new BadRequestException(
        `Cannot delete Agriculture Product: It is linked to ${details.join(' and ')}. ` +
        `Please remove them first (Batches tab).`
      );
    }

    await this.productRepo.remove(product);
    return { success: true };
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
        'batch.farmId',
        'batch.agricultureProductId',
        'batch.vendorProductId',
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
      farmId: b.farmId,
      farmName: b.farm?.name || 'Unknown Farm',
      agricultureProductId: b.agricultureProductId,
      vendorProductId: b.vendorProductId,
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
    vendorProductId?: number;
  }) {
    const batch = this.batchRepo.create({
      qrCodeUrl: data.qrCodeUrl,
      farmId: data.farmId,
      agricultureProductId: data.agricultureProductId,
      harvestDate: data.harvestDate,
      grade: data.grade,
      vendorProductId: data.vendorProductId,
    });

    const saved = await this.batchRepo.save(batch);
    return { success: true, id: saved.id };
  }

  /**
   * Transactional flow: create product (optional) -> vendor product (optional) -> batch
   * Used by deferred-saving flow from frontend
   */
  async createFullBatch(payload: {
    farmId: number;
    harvestDate: string;
    grade?: string;
    seedBatch?: string;
    createdBy?: string;
    isNewProduct: boolean;
    productId?: number | null;
    newProductName?: string | null;
    newProductTypeId?: number | null;
    vendorConfig?:
      | {
          vendorTin: string;
          unit: string;
          priceValue?: number;
          priceCurrency: string;
          discounts?: Array<{
            percentage: number;
            minValue?: number;
            maxDiscountAmount?: number;
            priority: number;
            isStackable: boolean;
            startDate: string;
            expiredDate: string;
          }>;
        }
      | { vendorProductId: number };
  }) {
    return this.batchRepo.manager.transaction(async (manager) => {
      // 1) Resolve agriculture product
      let agricultureProductId: number | undefined = payload.productId ?? undefined;

      if (payload.isNewProduct) {
        if (!payload.newProductName || !payload.newProductTypeId) {
          throw new BadRequestException('newProductName and newProductTypeId are required for new product flow');
        }
        const newProduct = manager.create(AgricultureProduct, {
          name: payload.newProductName,
          type: { id: payload.newProductTypeId },
        });
        const savedProduct = await manager.save(newProduct);
        agricultureProductId = savedProduct.id;
      }

      if (!agricultureProductId) {
        throw new BadRequestException('agricultureProductId is required');
      }

      // 2) Resolve vendor product (optional for existing product, required for new config)
      let vendorProductId: number | undefined;
      const vc = payload.vendorConfig;

      if (vc && 'vendorTin' in vc) {
        if (!vc.vendorTin || !vc.unit) {
          throw new BadRequestException('vendorTin and unit are required in vendorConfig');
        }
        const vendorProduct = manager.create(VendorProduct, {
          vendorTin: vc.vendorTin,
          unit: vc.unit,
          agricultureProductId,
        });
        const savedVendorProduct = await manager.save(vendorProduct);
        vendorProductId = savedVendorProduct.id;

        // Price
        if (vc.priceValue) {
          const price = manager.create(Price, {
            vendorProductId,
            value: vc.priceValue,
            currency: vc.priceCurrency || 'VND',
          });
          await manager.save(price);
        }

        // Discounts
        if (vc.discounts && vc.discounts.length) {
          for (const disc of vc.discounts) {
            const discount = manager.create(Discount, {
              name: `${payload.newProductName || 'Product'}-${vc.vendorTin}-D${disc.priority}`,
              percentage: disc.percentage,
              minValue: disc.minValue,
              maxDiscountAmount: disc.maxDiscountAmount,
              priority: disc.priority,
              isStackable: disc.isStackable,
              startDate: new Date(disc.startDate),
              expiredDate: new Date(disc.expiredDate),
            });
            const savedDiscount = await manager.save(discount);
            const link = manager.create(ProductHasDiscount, {
              vendorProductId,
              discountId: savedDiscount.id,
            });
            await manager.save(link);
          }
        }
      } else if (vc && 'vendorProductId' in vc) {
        vendorProductId = vc.vendorProductId;
      }

      // Require vendorProductId when not creating new product flow? allow nullable
      if (!vendorProductId && !payload.isNewProduct) {
        throw new BadRequestException('vendorProductId is required for existing product flow');
      }

      // 3) Create batch
      const qrCodeUrl = `QR-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const batch = manager.create(Batch, {
        farmId: payload.farmId,
        agricultureProductId,
        harvestDate: new Date(payload.harvestDate),
        grade: payload.grade,
        seedBatch: payload.seedBatch,
        createdBy: payload.createdBy || 'System',
        vendorProductId,
        qrCodeUrl,
      });

      const savedBatch = await manager.save(batch);

      return {
        success: true,
        batchId: savedBatch.id,
        vendorProductId,
        agricultureProductId,
        qrCodeUrl,
      };
    });
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
    const province = await this.provinceRepo.findOne({
      where: { id },
      relations: ['farms', 'warehouses']
    });
    
    if (!province) {
      throw new NotFoundException(`Province with ID "${id}" not found`);
    }

    // Check for related farms
    if (province.farms && province.farms.length > 0) {
      throw new BadRequestException(
        `Cannot delete Province: It has ${province.farms.length} farm(s). ` +
        `Please delete them first (Farms tab).`
      );
    }

    // Check for related warehouses
    if (province.warehouses && province.warehouses.length > 0) {
      throw new BadRequestException(
        `Cannot delete Province: It has ${province.warehouses.length} warehouse(s). ` +
        `Please delete them first (Storage > Warehouses).`
      );
    }

    await this.provinceRepo.remove(province);
    return { success: true, id };
  }

  /**
   * Delete a province
   */
  async deleteProvince(id: number) {
    // Check if province exists and has related records
    const province = await this.provinceRepo.findOne({
      where: { id },
      relations: ['farms']
    });

    if (!province) {
      throw new NotFoundException(`Province with ID "${id}" not found`);
    }

    // Check for related records
    if (province.farms && province.farms.length > 0) {
      throw new BadRequestException(
        `Cannot delete province "${province.name}" because it has ${province.farms.length} related farm(s). ` +
        `Please delete or reassign these farms first (Admin > Farms tab).`
      );
    }

    const result = await this.provinceRepo.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Province with ID "${id}" not found`);
    }

    return { success: true, id };
  }

  /**
   * Delete a country
   */
  async deleteCountry(id: number) {
    const result = await this.countryRepo.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Country with ID "${id}" not found`);
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
      addressDetail: f.addressDetail,
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
      relations: ['type', 'type.category'],
      take: 100,
    });
    return products.map((p: any) => ({
      id: p.id,
      name: p.name,
      imageUrl: p.imageUrl,
      typeId: p.type?.id,
      typeName: p.type?.variety,
      categoryId: p.type?.category?.id,
      categoryName: p.type?.category?.name,
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
   * Create a new country
   */
  async createCountry(data: { name: string }) {
    const name = (data.name || '').trim();
    if (!name) {
      throw new BadRequestException('Country name is required');
    }

    const exists = await this.countryRepo.findOne({ where: { name } });
    if (exists) {
      return { success: true, id: exists.id };
    }

    const country = this.countryRepo.create({ name });
    const saved = await this.countryRepo.save(country);
    return { success: true, id: saved.id };
  }

  /**
   * Create a new province, with either existing countryId or new countryName
   */
  async createProvince(data: { name: string; countryId?: number; countryName?: string }) {
    const name = (data.name || '').trim();
    if (!name) throw new BadRequestException('Province name is required');

    let countryId = data.countryId;
    if (!countryId && data.countryName) {
      const countryName = data.countryName.trim();
      if (!countryName) throw new BadRequestException('countryName is empty');
      let country = await this.countryRepo.findOne({ where: { name: countryName } });
      if (!country) {
        country = await this.countryRepo.save(this.countryRepo.create({ name: countryName }));
      }
      countryId = country.id;
    }

    if (!countryId) throw new BadRequestException('countryId or countryName is required');

    // Unique(Name, C_ID) in schema: check existence
    const exists = await this.provinceRepo.findOne({ where: { name, countryId } });
    if (exists) return { success: true, id: exists.id };

    const province = this.provinceRepo.create({ name, countryId });
    const saved = await this.provinceRepo.save(province);
    return { success: true, id: saved.id };
  }

  /**
   * Get all types for dropdown selection
   */
  async getAllTypes() {
    const types = await this.typeRepo.find({
      relations: ['category'],
      take: 100,
    });
    return types.map((t) => ({
      id: t.id,
      variety: t.variety,
      categoryId: t.category?.id,
      categoryName: t.category?.name || 'Unknown',
    }));
  }

  /**
   * Get all categories for dropdown selection
   */
  async getAllCategories() {
    return this.categoryRepo.find({ take: 100 });
  }

  /**
   * Create new category
   */
  async createCategory(name: string) {
    const category = this.categoryRepo.create({ name });
    return this.categoryRepo.save(category);
  }

  /**
   * Create new type
   */
  async createType(variety: string, categoryId: number) {
    const type = this.typeRepo.create({ 
      variety, 
      category: { id: categoryId } 
    });
    return this.typeRepo.save(type);
  }

  /**
   * Create new agriculture product
   */
  async createAgricultureProduct(name: string, typeId: number) {
    const product = this.productRepo.create({ 
      name, 
      type: { id: typeId } 
    });
    return this.productRepo.save(product);
  }

  /**
   * Get all batches for dropdown selection in Storage and Processing tabs
   */
  async getAllBatches() {
    const batches = await this.batchRepo.find({
      relations: ['agricultureProduct'],
      take: 200,
    });
    return batches.map((b) => ({
      id: b.id,
      productName: b.agricultureProduct?.name || 'Unknown Product',
      qrCodeUrl: b.qrCodeUrl,
      harvestDate: b.harvestDate,
      grade: b.grade,
    }));
  }

  /**
   * Create a new farm
   */
  async createFarm(data: {
    name: string;
    ownerName?: string;
    contactInfo?: string;
    addressDetail?: string;
    longitude?: number;
    latitude?: number;
    provinceId: number;
  }) {
    const farm = this.farmRepo.create({
      name: data.name,
      ownerName: data.ownerName,
      contactInfo: data.contactInfo,
      addressDetail: data.addressDetail,
      longitude: data.longitude || 0,
      latitude: data.latitude || 0,
      provinceId: data.provinceId,
    });

    const saved = await this.farmRepo.save(farm);
    return { success: true, id: saved.id };
  }

  /**
   * Get farm by ID with relations
   */
  async getFarmById(id: number) {
    const farm = await this.farmRepo.findOne({
      where: { id },
      relations: ['province', 'province.country', 'certifications'],
    });

    if (!farm) {
      throw new NotFoundException(`Farm with ID ${id} not found`);
    }

    return {
      id: farm.id,
      name: farm.name,
      ownerName: farm.ownerName,
      contactInfo: farm.contactInfo,
      addressDetail: farm.addressDetail,
      longitude: farm.longitude,
      latitude: farm.latitude,
      provinceId: farm.provinceId,
      provinceName: farm.province?.name || 'Unknown',
      countryName: farm.province?.country?.name || 'Unknown',
      certifications: farm.certifications?.map(c => c.farmCertifications) || [],
    };
  }

  /**
   * Update farm
   */
  async updateFarm(
    id: number,
    data: {
      name?: string;
      ownerName?: string;
      contactInfo?: string;
      addressDetail?: string;
      longitude?: number;
      latitude?: number;
      provinceId?: number;
    },
  ) {
    const farm = await this.farmRepo.findOne({ where: { id } });
    if (!farm) {
      throw new NotFoundException(`Farm with ID ${id} not found`);
    }

    Object.assign(farm, data);
    await this.farmRepo.save(farm);
    return { success: true, id: farm.id };
  }

  /**
   * Delete farm
   */
  async deleteFarm(id: number) {
    const farm = await this.farmRepo.findOne({ where: { id } });
    if (!farm) {
      throw new NotFoundException(`Farm with ID ${id} not found`);
    }

    // Check dependencies
    const batchCount = await this.batchRepo.count({ where: { farmId: id } });

    if (batchCount > 0) {
      throw new BadRequestException(
        `Cannot delete: This farm is linked to ${batchCount} batch(es). ` +
        `Please remove or reassign them first to preserve traceability integrity.`
      );
    }

    await this.farmRepo.remove(farm);
    return { success: true, message: 'Farm deleted successfully' };
  }

  /**
   * Get farm certifications
   */
  async getFarmCertifications(farmId: number) {
    const certifications = await this.farmCertRepo.find({
      where: { farmId },
    });
    return certifications.map(c => ({
      farmId: c.farmId,
      certification: c.farmCertifications,
    }));
  }

  /**
   * Add farm certification
   */
  async addFarmCertification(farmId: number, certification: string) {
    const farm = await this.farmRepo.findOne({ where: { id: farmId } });
    if (!farm) {
      throw new NotFoundException(`Farm with ID ${farmId} not found`);
    }

    const trimmedCert = certification.trim();
    if (!trimmedCert) {
      throw new BadRequestException('Certification name is required');
    }

    // Check if certification already exists
    const exists = await this.farmCertRepo.findOne({
      where: { farmId, farmCertifications: trimmedCert },
    });

    if (exists) {
      return { success: true, message: 'Certification already exists' };
    }

    const cert = this.farmCertRepo.create({
      farmId,
      farmCertifications: trimmedCert,
    });

    await this.farmCertRepo.save(cert);
    return { success: true, message: 'Certification added successfully' };
  }

  /**
   * Delete farm certification
   */
  async deleteFarmCertification(farmId: number, certification: string) {
    const trimmedCert = certification.trim();
    
    const cert = await this.farmCertRepo.findOne({
      where: { farmId, farmCertifications: trimmedCert },
    });

    if (!cert) {
      throw new NotFoundException('Certification not found');
    }

    try {
      await this.farmCertRepo.remove(cert);
      return { success: true, message: 'Certification deleted successfully' };
    } catch (error) {
      // If remove fails, try delete as fallback
      const result = await this.farmCertRepo.delete({ farmId, farmCertifications: trimmedCert });
      if (result.affected === 0) {
        throw new NotFoundException('Failed to delete certification');
      }
      return { success: true, message: 'Certification deleted successfully' };
    }
  }
}
