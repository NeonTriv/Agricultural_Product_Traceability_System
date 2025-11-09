import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * PROCESSING_FACILITY Entity
 * Represents facilities where products are processed/packaged
 */
@Entity('PROCESSING_FACILITY')
export class ProcessingFacility {
  @PrimaryColumn({ name: 'Facility_ID', length: 50 })
  facilityId: string;

  @Column({ name: 'Name', length: 200 })
  name: string;

  @Column({ name: 'Address', length: 500 })
  address: string;

  @Column({ name: 'Contact_Info', length: 200 })
  contactInfo: string;

  @Column({ name: 'License_Number', length: 100 })
  licenseNumber: string;
}
