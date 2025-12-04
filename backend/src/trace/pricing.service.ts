import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Price } from './entities/price.entity';
import { VendorProduct } from './entities/vendor-product.entity';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(Price)
    private readonly priceRepo: Repository<Price>,
    @InjectRepository(VendorProduct)
    private readonly vendorProductRepo: Repository<VendorProduct>,
  ) {}

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
