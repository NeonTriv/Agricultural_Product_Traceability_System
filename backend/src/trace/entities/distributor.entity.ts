import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Vendor } from './vendor.entity';
import { Shipment } from './shipment.entity';

/**
 * DISTRIBUTOR Entity
 * Represents distributors (vendors with distribution type)
 */
@Entity('DISTRIBUTOR')
export class Distributor {
  @PrimaryColumn({ name: 'Vendor_TIN', type: 'varchar', length: 20 })
  vendorTin: string;

  @Column({ name: 'Type', type: 'varchar', length: 50 })
  type: string;

  // Relationships
  @ManyToOne(() => Vendor, (vendor) => vendor.distributors)
  @JoinColumn({ name: 'Vendor_TIN' })
  vendor: Vendor;

  @OneToMany(() => Shipment, (shipment) => shipment.distributor)
  shipments: Shipment[];
}
