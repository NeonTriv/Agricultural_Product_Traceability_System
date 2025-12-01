import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { TransportLeg } from './transport-leg.entity';

/**
 * CARRIERCOMPANY Entity
 * Represents carrier companies for transportation
 */
@Entity('CARRIERCOMPANY')
export class CarrierCompany {
  @PrimaryColumn({ name: 'V_TIN', type: 'varchar', length: 20 })
  vTin: string;

  @Column({ name: 'Name', type: 'nvarchar', length: 255 })
  name: string;

  @Column({ name: 'Address', type: 'nvarchar', length: 255, nullable: true })
  address: string;

  @Column({ name: 'Contact_Info', type: 'varchar', length: 255, nullable: true })
  contactInfo: string;

  // Relationships
  @OneToMany(() => TransportLeg, (leg) => leg.carrierCompany)
  transportLegs: TransportLeg[];
}
