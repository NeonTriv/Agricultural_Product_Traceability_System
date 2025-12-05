import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Price } from './entities/price.entity';
import { VendorProduct } from './entities/vendor-product.entity';
import { Batch } from './entities/batch.entity';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(Price)
    private readonly priceRepo: Repository<Price>,
    @InjectRepository(VendorProduct)
    private readonly vendorProductRepo: Repository<VendorProduct>,
    @InjectRepository(Batch)
    private readonly batchRepo: Repository<Batch>,
  ) {}

  // Vendor Product methods
  async getAllVendorProducts() {
    const vendorProducts = await this.vendorProductRepo.find({
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
    const vendorProduct = this.vendorProductRepo.create({
      unit: data.unit,
      vendorTin: data.vendorTin,
      agricultureProductId: data.agricultureProductId,
    });

    await this.vendorProductRepo.save(vendorProduct);

    return { success: true, id: vendorProduct.id };
  }

  async updateVendorProduct(
    id: number,
    data: {
      unit?: string;
    },
  ) {
    const vendorProduct = await this.vendorProductRepo.findOne({ where: { id } });

    if (!vendorProduct) {
      throw new NotFoundException(`Vendor Product with ID ${id} not found`);
    }

    if (data.unit !== undefined) vendorProduct.unit = data.unit;

    await this.vendorProductRepo.save(vendorProduct);

    return { success: true, id: vendorProduct.id };
  }

  async deleteVendorProduct(id: number) {
    const vendorProduct = await this.vendorProductRepo.findOne({ 
      where: { id },
      relations: ['prices', 'discounts']
    });

    if (!vendorProduct) {
      throw new NotFoundException(`Vendor Product with ID ${id} not found`);
    }

    // Check for blockers
    const blockers: string[] = [];

    // Check if there's a price for this vendor product
    if (vendorProduct.prices?.length > 0) {
      blockers.push('Price (tab Pricing)');
    }

    // Check if there's discounts
    if (vendorProduct.discounts?.length > 0) {
      blockers.push(`${vendorProduct.discounts.length} Discount(s)`);
    }

    // Check if any batch uses this vendor product
    const batches = await this.batchRepo.find({ where: { vendorProductId: id } });
    if (batches.length > 0) {
      blockers.push(`${batches.length} Batch(es) (tab Products > Batches)`);
    }

    if (blockers.length > 0) {
      throw new BadRequestException(`Cannot delete vendor product. Please delete the following first: ${blockers.join(', ')}`);
    }

    await this.vendorProductRepo.delete({ id });

    return { success: true };
  }

  // Price methods
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
    // Check if vendor product exists
    const vendorProduct = await this.vendorProductRepo.findOne({
      where: { id: data.vendorProductId },
    });

    if (!vendorProduct) {
      throw new NotFoundException(`Vendor Product with ID ${data.vendorProductId} not found`);
    }

    // Check if price already exists
    const existingPrice = await this.priceRepo.findOne({
      where: { vendorProductId: data.vendorProductId },
    });

    if (existingPrice) {
      throw new Error(`Price for Vendor Product ID ${data.vendorProductId} already exists`);
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
    data: {
      value?: number;
      currency?: string;
    },
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
}
