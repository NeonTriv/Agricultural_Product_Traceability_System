import { Entity, Column, PrimaryColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { VendorProduct } from './vendor-product.entity';
import { Distributor } from './distributor.entity';
import { Retail } from './retail.entity';
import { Province } from './province.entity';

/**
 * VENDOR Entity
 * Represents vendors in the system
 */
@Entity('VENDOR')
export class Vendor {
  @PrimaryColumn({ name: 'TIN', type: 'varchar', length: 20 })
  tin: string;

  @Column({ name: 'Name', type: 'nvarchar', length: 255 })
  name: string;

  @Column({ name: 'Address_detail', type: 'nvarchar', length: 255 })
  address: string;

  @Column({ name: 'Contact_Info', type: 'varchar', length: 255, nullable: true })
  contactInfo: string;

  @Column({ name: 'Longitude', type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitude: number;

  @Column({ name: 'Latitude', type: 'decimal', precision: 9, scale: 6, nullable: true })
  latitude: number;

  @Column({ name: 'P_ID', type: 'int', nullable: true })
  provinceId: number;

  // Relationships
  @ManyToOne(() => Province)
  @JoinColumn({ name: 'P_ID' })
  province: Province;

  @OneToMany(() => VendorProduct, (vendorProduct) => vendorProduct.vendor)
  vendorProducts: VendorProduct[];

  @OneToMany(() => Distributor, (distributor) => distributor.vendor)
  distributors: Distributor[];

  @OneToMany(() => Retail, (retail) => retail.vendor)
  retails: Retail[];
}
