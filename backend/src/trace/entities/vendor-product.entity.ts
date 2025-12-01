import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Vendor } from './vendor.entity';
import { AgricultureProduct } from './agriculture-product.entity';
import { Price } from './price.entity';
import { ProductHasDiscount } from './product-has-discount.entity';

/**
 * VENDOR_PRODUCT Entity
 * Represents products offered by vendors
 */
@Entity('VENDOR_PRODUCT')
export class VendorProduct {
  @PrimaryColumn({ name: 'ID', type: 'int' })
  id: number;

  @Column({ name: 'Unit', type: 'nvarchar', length: 50 })
  unit: string;

  @Column({ name: 'Vendor_TIN', type: 'varchar', length: 20 })
  vendorTin: string;

  @Column({ name: 'AP_ID', type: 'int' })
  agricultureProductId: number;

  // Relationships
  @ManyToOne(() => Vendor, (vendor) => vendor.vendorProducts)
  @JoinColumn({ name: 'Vendor_TIN' })
  vendor: Vendor;

  @ManyToOne(() => AgricultureProduct, (product) => product.vendorProducts)
  @JoinColumn({ name: 'AP_ID' })
  agricultureProduct: AgricultureProduct;

  @OneToMany(() => Price, (price) => price.vendorProduct)
  prices: Price[];

  @OneToMany(() => ProductHasDiscount, (discount) => discount.vendorProduct)
  discounts: ProductHasDiscount[];
}
