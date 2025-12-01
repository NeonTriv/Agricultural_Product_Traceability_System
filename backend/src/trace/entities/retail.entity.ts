import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Vendor } from './vendor.entity';

/**
 * RETAIL Entity
 * Represents retail vendors
 */
@Entity('RETAIL')
export class Retail {
  @PrimaryColumn({ name: 'Vendor_TIN', type: 'varchar', length: 20 })
  vendorTin: string;

  @Column({ name: 'Format', type: 'nvarchar', length: 100 })
  format: string;

  // Relationships
  @ManyToOne(() => Vendor, (vendor) => vendor.retails)
  @JoinColumn({ name: 'Vendor_TIN' })
  vendor: Vendor;
}
