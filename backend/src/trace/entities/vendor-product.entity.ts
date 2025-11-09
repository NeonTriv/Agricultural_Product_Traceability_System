import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Vendor } from './vendor.entity';
import { Type } from './type.entity';

/**
 * VENDOR_PRODUCT Entity
 * Links vendors with products they sell
 */
@Entity('VENDOR_PRODUCT')
export class VendorProduct {
  @PrimaryColumn({ name: 'VendorProduct_ID', length: 50 })
  vendorProductId: string;

  @Column({ name: 'Unit', length: 50 })
  unit: string;

  @Column({ name: 'Vendor_TIN', length: 50 })
  vendorTin: string;

  @Column({ name: 'Type_ID', length: 50 })
  typeId: string;

  // Relationships
  @ManyToOne(() => Vendor, (vendor) => vendor.tin)
  @JoinColumn({ name: 'Vendor_TIN' })
  vendor: Vendor;

  @ManyToOne(() => Type, (type) => type.typeId)
  @JoinColumn({ name: 'Type_ID' })
  type: Type;
}
