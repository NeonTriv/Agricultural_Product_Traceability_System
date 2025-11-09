import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { VendorProduct } from './vendor-product.entity';

/**
 * PRICE Entity
 * Stores pricing information for vendor products
 */
@Entity('PRICE')
export class Price {
  @PrimaryColumn({ name: 'VendorProduct_ID', length: 50 })
  vendorProductId: string;

  @Column({ name: 'Value', type: 'decimal', precision: 15, scale: 2 })
  value: number;

  @Column({ name: 'Currency', length: 10, default: 'VND' })
  currency: string;

  // Relationships
  @ManyToOne(() => VendorProduct, (vendorProduct) => vendorProduct.vendorProductId)
  @JoinColumn({ name: 'VendorProduct_ID' })
  vendorProduct: VendorProduct;
}
