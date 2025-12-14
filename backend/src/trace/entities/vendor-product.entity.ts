import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Vendor } from './vendor.entity';
import { Price } from './price.entity';
import { ProductHasDiscount } from './product-has-discount.entity';

/**
 * VENDOR_PRODUCT Entity
 * Represents products offered by vendors
 */
@Entity('VENDOR_PRODUCT')
export class VendorProduct {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'int' })
  id: number;

  @Column({ name: 'Unit', type: 'nvarchar', length: 50 })
  unit: string;

  @Column({ name: 'ValuePerUnit', type: 'decimal', precision: 10, scale: 2, nullable: true })
  valuePerUnit: number;

  @Column({ name: 'Vendor_TIN', type: 'varchar', length: 20 })
  vendorTin: string;

  // Relationships
  @ManyToOne(() => Vendor, (vendor) => vendor.vendorProducts)
  @JoinColumn({ name: 'Vendor_TIN' })
  vendor: Vendor;

  @OneToMany(() => Price, (price) => price.vendorProduct)
  prices: Price[];

  // Explicit relation to linking table for discounts
  @OneToMany(() => ProductHasDiscount, (phd) => phd.vendorProduct)
  productHasDiscounts: ProductHasDiscount[];
}
