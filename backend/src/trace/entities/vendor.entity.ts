import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * VENDOR Entity
 * Represents vendors (distributors/retailers) selling agricultural products
 */
@Entity('VENDOR')
export class Vendor {
  @PrimaryColumn({ name: 'TIN', length: 50 })
  tin: string;

  @Column({ name: 'Name', length: 200 })
  name: string;

  @Column({ name: 'Address', length: 500 })
  address: string;

  @Column({ name: 'Contact_Info', length: 200 })
  contactInfo: string;
}
