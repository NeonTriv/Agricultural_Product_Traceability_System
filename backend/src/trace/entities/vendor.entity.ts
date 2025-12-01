import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { VendorProduct } from './vendor-product.entity';
import { Discount } from './discount.entity';
import { Distributor } from './distributor.entity';
import { Retail } from './retail.entity';

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

  @Column({ name: 'Address', type: 'nvarchar', length: 255 })
  address: string;

  @Column({ name: 'Contact_Info', type: 'varchar', length: 255, nullable: true })
  contactInfo: string;

  // Relationships
  @OneToMany(() => VendorProduct, (vendorProduct) => vendorProduct.vendor)
  vendorProducts: VendorProduct[];

  @OneToMany(() => Discount, (discount) => discount.vendor)
  discounts: Discount[];

  @OneToMany(() => Distributor, (distributor) => distributor.vendor)
  distributors: Distributor[];

  @OneToMany(() => Retail, (retail) => retail.vendor)
  retails: Retail[];
}
