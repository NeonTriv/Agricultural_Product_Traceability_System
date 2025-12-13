import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../shared/base/base.service';
import { VendorProduct } from './entities/vendor-product.entity';
import { Price } from './entities/price.entity';
import { Discount } from './entities/discount.entity';
import { ProductHasDiscount } from './entities/product-has-discount.entity';
import { Batch } from './entities/batch.entity';

@Injectable()
export class PricingService extends BaseService<VendorProduct> {
  constructor(
    @InjectRepository(VendorProduct)
    vendorProductRepo: Repository<VendorProduct>,
    @InjectRepository(Price)
    private readonly priceRepo: Repository<Price>,
    @InjectRepository(Batch)
    private readonly batchRepo: Repository<Batch>,
    @InjectRepository(Discount)
    private readonly discountRepo: Repository<Discount>,
    @InjectRepository(ProductHasDiscount)
    private readonly phdRepo: Repository<ProductHasDiscount>,
  ) {
    super(vendorProductRepo);
  }

  // Vendor Product CRUD (using BaseService)
  async getAllVendorProducts() {
    const vendorProducts = await this.findAll({
      relations: ['agricultureProduct', 'vendor'],
      order: { id: 'ASC' },
    });

    return vendorProducts.map((vp) => ({
      id: vp.id,
      unit: vp.unit,
      vendorTin: vp.vendorTin,
      vendorName: vp.vendor?.name,
      agricultureProductId: vp.agricultureProductId,
      productName: vp.agricultureProduct?.name,
    }));
  }

  async createVendorProduct(data: {
    unit: string;
    vendorTin: string;
    agricultureProductId: number;
  }) {
    const vendorProduct = await this.create({
      unit: data.unit,
      vendorTin: data.vendorTin,
      agricultureProductId: data.agricultureProductId,
    });
    return { success: true, id: vendorProduct.id };
  }

  async updateVendorProduct(id: number, data: { unit?: string }) {
    const vendorProduct = await this.update(id, data);
    return { success: true, id: vendorProduct.id };
  }

  async deleteVendorProduct(id: number) {
    const vendorProduct = await this.repository.findOne({
      where: { id },
      relations: ['prices', 'productHasDiscounts']
    });

    if (!vendorProduct) {
      throw new NotFoundException(`Vendor Product with ID ${id} not found`);
    }

    const blockers: string[] = [];
    if (vendorProduct.prices?.length > 0) {
      blockers.push(`${vendorProduct.prices.length} Price(s)`);
    }
    if (vendorProduct.productHasDiscounts?.length > 0) {
      blockers.push(`${vendorProduct.productHasDiscounts.length} Linked Discount(s)`);
    }

    const batches = await this.batchRepo.find({ where: { vendorProductId: id } });
    if (batches.length > 0) {
      blockers.push(`${batches.length} Batch(es)`);
    }

    if (blockers.length > 0) {
      throw new BadRequestException(
        `Cannot delete Vendor Product: It has ${blockers.join(' and ')}. ` +
        `Please delete them first.`
      );
    }

    await this.delete(id);
    return { success: true };
  }

  // Price CRUD
  async getAllPrices() {
    const prices = await this.priceRepo.find({
      relations: ['vendorProduct', 'vendorProduct.agricultureProduct', 'vendorProduct.vendor'],
      order: { vendorProductId: 'ASC' },
    });

    return prices.map((p) => ({
      vendorProductId: p.vendorProductId,
      value: p.value,
      currency: p.currency,
      productName: p.vendorProduct?.agricultureProduct?.name,
      vendorName: p.vendorProduct?.vendor?.name,
      unit: p.vendorProduct?.unit,
    }));
  }

  async getPrice(vendorProductId: number) {
    const price = await this.priceRepo.findOne({
      where: { vendorProductId },
      relations: ['vendorProduct', 'vendorProduct.agricultureProduct', 'vendorProduct.vendor'],
    });

    if (!price) {
      throw new NotFoundException(`Price for Vendor Product ID ${vendorProductId} not found`);
    }

    return {
      vendorProductId: price.vendorProductId,
      value: price.value,
      currency: price.currency,
      productName: price.vendorProduct?.agricultureProduct?.name,
      vendorName: price.vendorProduct?.vendor?.name,
      unit: price.vendorProduct?.unit,
    };
  }

  async createPrice(data: {
    vendorProductId: number;
    value: number;
    currency: string;
  }) {
    const vendorProduct = await this.findOne(data.vendorProductId);
    if (!vendorProduct) {
      throw new NotFoundException(`Vendor Product with ID ${data.vendorProductId} not found`);
    }

    const existingPrice = await this.priceRepo.findOne({
      where: { vendorProductId: data.vendorProductId },
    });

    if (existingPrice) {
      throw new BadRequestException(`Price for Vendor Product ID ${data.vendorProductId} already exists`);
    }

    const price = this.priceRepo.create({
      vendorProductId: data.vendorProductId,
      value: data.value,
      currency: data.currency,
    });

    await this.priceRepo.save(price);
    return { success: true, vendorProductId: price.vendorProductId };
  }

  async updatePrice(
    vendorProductId: number,
    data: { value?: number; currency?: string },
  ) {
    const price = await this.priceRepo.findOne({ where: { vendorProductId } });

    if (!price) {
      throw new NotFoundException(`Price for Vendor Product ID ${vendorProductId} not found`);
    }

    if (data.value !== undefined) price.value = data.value;
    if (data.currency !== undefined) price.currency = data.currency;

    await this.priceRepo.save(price);
    return { success: true, vendorProductId: price.vendorProductId };
  }

  async deletePrice(vendorProductId: number) {
    const result = await this.priceRepo.delete({ vendorProductId });

    if (result.affected === 0) {
      throw new NotFoundException(`Price for Vendor Product ID ${vendorProductId} not found`);
    }

    return { success: true };
  }

  // Discount CRUD
  async getAllDiscounts() {
    const discounts = await this.discountRepo.find({ order: { id: 'ASC' } });
    return discounts.map((d) => ({
      id: d.id,
      name: d.name,
      percentage: d.percentage,
      minValue: d.minValue,
      maxDiscountAmount: d.maxDiscountAmount,
      priority: d.priority,
      isStackable: d.isStackable,
      startDate: d.startDate,
      expiredDate: d.expiredDate,
    }));
  }

  async createDiscount(data: {
    name: string;
    percentage?: number;
    minValue?: number;
    maxDiscountAmount?: number;
    priority?: number;
    isStackable?: boolean;
    startDate: Date;
    expiredDate: Date;
  }) {
    const discount = this.discountRepo.create({
      name: data.name,
      percentage: data.percentage,
      minValue: data.minValue,
      maxDiscountAmount: data.maxDiscountAmount,
      priority: data.priority,
      isStackable: data.isStackable,
      startDate: data.startDate,
      expiredDate: data.expiredDate,
    });
    const saved = await this.discountRepo.save(discount);
    return { success: true, id: saved.id };
  }

  async updateDiscount(
    id: number,
    data: {
      name?: string;
      percentage?: number;
      minValue?: number;
      maxDiscountAmount?: number;
      priority?: number;
      isStackable?: boolean;
      startDate?: Date;
      expiredDate?: Date;
    },
  ) {
    const discount = await this.discountRepo.findOne({ where: { id } });
    if (!discount) throw new NotFoundException(`Discount ID ${id} not found`);

    if (data.name !== undefined) discount.name = data.name;
    if (data.percentage !== undefined) discount.percentage = data.percentage;
    if (data.minValue !== undefined) discount.minValue = data.minValue;
    if (data.maxDiscountAmount !== undefined) discount.maxDiscountAmount = data.maxDiscountAmount;
    if (data.priority !== undefined) discount.priority = data.priority;
    if (data.isStackable !== undefined) discount.isStackable = data.isStackable;
    if (data.startDate !== undefined) discount.startDate = data.startDate;
    if (data.expiredDate !== undefined) discount.expiredDate = data.expiredDate;

    await this.discountRepo.save(discount);
    return { success: true, id };
  }

  async deleteDiscount(id: number) {
    const result = await this.discountRepo.delete({ id });
    if (result.affected === 0) throw new NotFoundException(`Discount ID ${id} not found`);
    return { success: true };
  }

  async linkProductHasDiscount(vendorProductId: number, discountId: number) {
    const link = this.phdRepo.create({ vendorProductId, discountId });
    await this.phdRepo.save(link);
    return { success: true };
  }

  // Orchestration: Full vendor product setup with pricing and discounts
  async createVendorProductWithPricingAndDiscounts(data: {
    vendorTin: string;
    agricultureProductId: number;
    unit: string;
    valuePerUnit?: number;
    priceValue?: number;
    priceCurrency?: string;
    discounts?: Array<{
      percentage: number;
      minValue?: number;
      maxDiscountAmount?: number;
      priority?: number;
      isStackable?: boolean;
      startDate?: Date;
      expiredDate?: Date;
    }>;
  }) {
    try {
      // Step 1: Create Vendor Product
      const vpResult = await this.createVendorProduct({
        vendorTin: data.vendorTin,
        agricultureProductId: data.agricultureProductId,
        unit: data.unit,
      });

      if (!vpResult.id) {
        throw new BadRequestException('Failed to create vendor product');
      }

      const vendorProductId = vpResult.id;

      // Step 2: Create Price (if provided)
      if (data.priceValue) {
        await this.createPrice({
          vendorProductId,
          value: data.priceValue,
          currency: data.priceCurrency || 'VND',
        });
      }

      // Step 3: Create Discounts and link them
      if (data.discounts && data.discounts.length > 0) {
        const autoName = `PROMO-${data.vendorTin}-${data.agricultureProductId}`;

        for (const discountData of data.discounts) {
          if (discountData.percentage && discountData.percentage > 0) {
            const startDate = discountData.startDate || new Date();
            const expiredDate = discountData.expiredDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            const discResult = await this.createDiscount({
              name: autoName,
              percentage: discountData.percentage,
              minValue: discountData.minValue,
              maxDiscountAmount: discountData.maxDiscountAmount,
              priority: discountData.priority || 0,
              isStackable: discountData.isStackable || false,
              startDate: startDate,
              expiredDate: expiredDate,
            });

            if (discResult.id) {
              await this.linkProductHasDiscount(vendorProductId, discResult.id);
            }
          }
        }
      }

      return { success: true, vendorProductId };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create vendor product with pricing: ${error.message}`,
      );
    }
  }

  async getProductsByDiscount(discountId: number) {
    const relations = await this.phdRepo.find({
      where: { discountId },
      relations: ['vendorProduct', 'vendorProduct.agricultureProduct', 'vendorProduct.vendor'],
    });

    return relations.map((r) => ({
      vendorProductId: r.vendorProductId,
      productName: (r.vendorProduct as any)?.agricultureProduct?.name,
      vendorName: (r.vendorProduct as any)?.vendor?.name,
      unit: (r.vendorProduct as any)?.unit,
    }));
  }

  async unlinkProductHasDiscount(vendorProductId: number, discountId: number) {
    const result = await this.phdRepo.delete({ vendorProductId, discountId });
    if (result.affected === 0) throw new NotFoundException('Link not found');
    return { success: true };
  }
}
