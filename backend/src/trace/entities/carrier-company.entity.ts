import { Entity, PrimaryColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { TransportLeg } from './transport-leg.entity';
import { Vendor } from './vendor.entity';

/**
 * CARRIERCOMPANY Entity
 * Represents carrier companies for transportation
 * Inherits from VENDOR via V_TIN FK
 */
@Entity('CARRIERCOMPANY')
export class CarrierCompany {
  @PrimaryColumn({ name: 'V_TIN', type: 'varchar', length: 20 })
  vTin: string;

  // Relationship to Vendor (inherits name, address, contact from Vendor)
  @OneToOne(() => Vendor)
  @JoinColumn({ name: 'V_TIN', referencedColumnName: 'tin' })
  vendor: Vendor;

  // Relationships
  @OneToMany(() => TransportLeg, (leg) => leg.carrierCompany)
  transportLegs: TransportLeg[];
}
