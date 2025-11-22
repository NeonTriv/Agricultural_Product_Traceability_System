import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { VendorProduct } from './vendor-product.entity';

/**
 * PRICE Entity
 * Represents prices for vendor products
 */
@Entity('PRICE')
export class Price {
  @PrimaryColumn({ name: 'V_ID', type: 'int' })
  vendorProductId: number;

  @Column({ name: 'Value', type: 'decimal', precision: 18, scale: 0 })
  value: number;

  @Column({ name: 'Currency', type: 'varchar', length: 3 })
  currency: string;

  // Relationships
  @ManyToOne(() => VendorProduct, (vendorProduct) => vendorProduct.prices)
  @JoinColumn({ name: 'V_ID' })
  vendorProduct: VendorProduct;
}
