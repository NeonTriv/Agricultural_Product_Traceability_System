import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../shared/base/base.service';
import { AgricultureProduct } from './entities/agriculture-product.entity';
import { Batch } from './entities/batch.entity';
import { Farm } from './entities/farm.entity';
import { FarmCertification } from './entities/farm-certification.entity';
import { Type } from './entities/type.entity';
import { Category } from './entities/category.entity';
import { Country } from './entities/country.entity';
import { Province } from './entities/province.entity';
import { VendorProduct } from './entities/vendor-product.entity';
import { Price } from './entities/price.entity';
import { Discount } from './entities/discount.entity';
import { ProductHasDiscount } from './entities/product-has-discount.entity';

@Injectable()
export class ProductService extends BaseService<AgricultureProduct> {
  constructor(
    @InjectRepository(AgricultureProduct)
    productRepo: Repository<AgricultureProduct>,
    @InjectRepository(Batch)
    private readonly batchRepo: Repository<Batch>,
    @InjectRepository(Farm)
    private readonly farmRepo: Repository<Farm>,
    @InjectRepository(Type)
    private readonly typeRepo: Repository<Type>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
    @InjectRepository(Province)
    private readonly provinceRepo: Repository<Province>,
    @InjectRepository(VendorProduct)
    private readonly vendorProductRepo: Repository<VendorProduct>,
    @InjectRepository(FarmCertification)
    private readonly farmCertRepo: Repository<FarmCertification>,
  ) {
    super(productRepo);
  }

  // Agriculture Product CRUD (using BaseService for basic operations)
  async getAllAgricultureProducts() {
    const products = await this.findAll({
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

  async createAgricultureProduct(name: string, typeId: number) {
    const product = await this.create({
      name,
      type: { id: typeId } as any
    });
    return product;
  }

  async updateAgricultureProduct(
    id: number,
    data: { name?: string; typeId?: number; imageUrl?: string },
  ) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.typeId !== undefined) updateData.type = { id: data.typeId };

    const product = await this.update(id, updateData);
    return { success: true, id: product.id };
  }

  async deleteAgricultureProduct(id: number) {
    // Check dependencies
    const batchCount = await this.batchRepo.count({ where: { agricultureProductId: id } });

    if (batchCount > 0) {
      throw new BadRequestException(
        `Cannot delete Agriculture Product: It is linked to ${batchCount} batch(es). ` +
        `Please remove them first (Batches tab).`
      );
    }

    await this.delete(id);
    return { success: true };
  }

  // Category CRUD
  async getAllCategories() {
    return this.categoryRepo.find({ take: 100 });
  }

  async createCategory(name: string) {
    const category = this.categoryRepo.create({ name });
    return this.categoryRepo.save(category);
  }

  // Type CRUD
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

  async createType(variety: string, categoryId: number) {
    const type = this.typeRepo.create({
      variety,
      category: { id: categoryId } as any
    });
    return this.typeRepo.save(type);
  }

  // Batch CRUD
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

  async getAllProducts() {
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
      .orderBy('batch.id', 'DESC')
      .take(100)
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
      variety: (b as any).seedBatch,
    }));
  }

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

  async updateBatch(
    id: number,
    data: { harvestDate?: string | Date; grade?: string; vendorProductId?: number | null; qrCodeUrl?: string },
  ) {
    const batch = await this.batchRepo.findOne({ where: { id } });
    if (!batch) {
      throw new BadRequestException(`Batch with ID ${id} not found`);
    }

    if (data.harvestDate !== undefined) {
      batch.harvestDate = typeof data.harvestDate === 'string'
        ? new Date(data.harvestDate)
        : data.harvestDate;
    }
    if (data.grade !== undefined) batch.grade = data.grade;
    if (data.vendorProductId !== undefined) batch.vendorProductId = data.vendorProductId as any;
    if (data.qrCodeUrl !== undefined) batch.qrCodeUrl = data.qrCodeUrl;

    await this.batchRepo.save(batch);
    return { success: true, id: batch.id };
  }

  async deleteBatch(id: number) {
    const batch = await this.batchRepo.findOne({
      where: { id },
      relations: ['processings', 'storedIn', 'shipBatches'],
    });

    if (!batch) {
      throw new BadRequestException(`Batch with ID ${id} not found`);
    }

    const blockers: string[] = [];
    if ((batch as any).processings?.length > 0) blockers.push(`${(batch as any).processings.length} Processing(s)`);
    if ((batch as any).storedIn?.length > 0) blockers.push(`${(batch as any).storedIn.length} Storage record(s)`);
    if ((batch as any).shipBatches?.length > 0) blockers.push(`${(batch as any).shipBatches.length} Shipment(s)`);

    if (blockers.length > 0) {
      throw new BadRequestException(
        `Cannot delete Batch: It has ${blockers.join(' and ')}. Please remove them first.`
      );
    }

    await this.batchRepo.remove(batch);
    return { success: true };
  }

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
          type: { id: payload.newProductTypeId } as any,
        });
        const savedProduct = await manager.save(newProduct);
        agricultureProductId = savedProduct.id;
      }

      if (!agricultureProductId) {
        throw new BadRequestException('agricultureProductId is required');
      }

      // 2) Resolve vendor product
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

      if (!vendorProductId && !payload.isNewProduct) {
        throw new BadRequestException('vendorProductId is required for existing product flow');
      }

      // 3) Create batch
      const batchData: any = {
        farmId: payload.farmId,
        agricultureProductId,
        vendorProductId: vendorProductId || null,
        harvestDate: new Date(payload.harvestDate),
        grade: payload.grade || null,
        qrCodeUrl: `BATCH-${Date.now()}`,
      };

      if (payload.seedBatch) (batchData as any).seedBatch = payload.seedBatch;
      if (payload.createdBy) (batchData as any).createdBy = payload.createdBy;

      const batch = manager.create(Batch, batchData);
      const savedBatch = await manager.save(batch);

      return {
        success: true,
        batchId: savedBatch.id,
        qrCodeUrl: savedBatch.qrCodeUrl,
        agricultureProductId,
        vendorProductId
      };
    });
  }

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
    const batch = await this.batchRepo.findOne({ where: { id } });
    if (!batch) {
      throw new BadRequestException(`Batch with ID ${id} not found`);
    }

    if (data.qrCodeUrl !== undefined) batch.qrCodeUrl = data.qrCodeUrl;
    if (data.farmId !== undefined) batch.farmId = data.farmId;
    if (data.agricultureProductId !== undefined) batch.agricultureProductId = data.agricultureProductId;
    if (data.harvestDate !== undefined) batch.harvestDate = data.harvestDate;
    if (data.grade !== undefined) batch.grade = data.grade;
    if (data.seedBatch !== undefined) (batch as any).seedBatch = data.seedBatch;

    await this.batchRepo.save(batch);
    return { success: true, id: batch.id };
  }

  async deleteProduct(id: number) {
    return this.deleteBatch(id);
  }

  // Location CRUD (supporting data for farms and warehouses)
  async getAllCountries() {
    const countries = await this.countryRepo.find({ take: 100 });
    return countries.map((c) => ({ id: c.id, name: c.name }));
  }

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

  async deleteCountry(id: number) {
    const provinces = await this.provinceRepo.find({ where: { countryId: id } });
    if (provinces.length > 0) {
      throw new BadRequestException(
        `Cannot delete Country: It has ${provinces.length} province(s). Please delete them first.`
      );
    }
    const result = await this.countryRepo.delete({ id });
    if (result.affected === 0) {
      throw new BadRequestException(`Country with ID ${id} not found`);
    }
    return { success: true };
  }

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

    const exists = await this.provinceRepo.findOne({ where: { name, countryId } });
    if (exists) return { success: true, id: exists.id };

    const province = this.provinceRepo.create({ name, countryId });
    const saved = await this.provinceRepo.save(province);
    return { success: true, id: saved.id };
  }

  async deleteProvince(id: number) {
    const farms = await this.farmRepo.find({ where: { provinceId: id } });
    if (farms.length > 0) {
      throw new BadRequestException(
        `Cannot delete Province: It has ${farms.length} farm(s). Please delete them first.`
      );
    }
    const result = await this.provinceRepo.delete({ id });
    if (result.affected === 0) {
      throw new BadRequestException(`Province with ID ${id} not found`);
    }
    return { success: true };
  }

  // Farm operations
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

  // Farm CRUD
  async getFarmById(id: number) {
    const farm = await this.farmRepo.findOne({
      where: { id },
      relations: ['province', 'province.country', 'certifications'],
    });
    if (!farm) throw new NotFoundException(`Farm with ID ${id} not found`);

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
      ...data,
      longitude: data.longitude || 0,
      latitude: data.latitude || 0,
    });
    const saved = await this.farmRepo.save(farm);
    return { success: true, id: saved.id };
  }

  async updateFarm(id: number, data: Partial<Farm>) {
    const farm = await this.farmRepo.findOne({ where: { id } });
    if (!farm) throw new NotFoundException(`Farm with ID ${id} not found`);

    Object.assign(farm, data);
    await this.farmRepo.save(farm);
    return { success: true, id: farm.id };
  }

  async deleteFarm(id: number) {
    const farm = await this.farmRepo.findOne({ where: { id } });
    if (!farm) throw new NotFoundException(`Farm with ID ${id} not found`);

    const batchCount = await this.batchRepo.count({ where: { farmId: id } });
    if (batchCount > 0) {
      throw new BadRequestException(
        `Cannot delete: Farm is linked to ${batchCount} batch(es). Remove them first.`
      );
    }

    await this.farmRepo.remove(farm);
    return { success: true };
  }

  // Farm Certifications
  async getFarmCertifications(farmId: number) {
    const certs = await this.farmCertRepo.find({ where: { farmId } });
    return certs.map(c => ({ farmId: c.farmId, certification: c.farmCertifications }));
  }

  async addFarmCertification(farmId: number, certification: string) {
    const farm = await this.farmRepo.findOne({ where: { id: farmId } });
    if (!farm) throw new NotFoundException(`Farm with ID ${farmId} not found`);

    const trimmed = certification.trim();
    if (!trimmed) throw new BadRequestException('Certification name is required');

    const exists = await this.farmCertRepo.findOne({
      where: { farmId, farmCertifications: trimmed },
    });
    if (exists) return { success: true, message: 'Certification already exists' };

    const cert = this.farmCertRepo.create({ farmId, farmCertifications: trimmed });
    await this.farmCertRepo.save(cert);
    return { success: true };
  }

  async deleteFarmCertification(farmId: number, certification: string) {
    const trimmed = certification.trim();
    const cert = await this.farmCertRepo.findOne({
      where: { farmId, farmCertifications: trimmed },
    });
    if (!cert) throw new NotFoundException('Certification not found');

    await this.farmCertRepo.remove(cert);
    return { success: true };
  }
}
