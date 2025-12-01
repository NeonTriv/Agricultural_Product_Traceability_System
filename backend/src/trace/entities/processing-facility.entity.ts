import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Processing } from './processing.entity';

/**
 * PROCESSING_FACILITY Entity
 * Represents facilities where products are processed and packaged
 */
@Entity('PROCESSING_FACILITY')
export class ProcessingFacility {
  @PrimaryColumn({ name: 'ID', type: 'int' })
  id: number;

  @Column({ name: 'Name', type: 'nvarchar', length: 255 })
  name: string;

  @Column({ name: 'Address', type: 'nvarchar', length: 255 })
  address: string;

  @Column({ name: 'Contact_Info', type: 'varchar', length: 255, nullable: true })
  contactInfo: string;

  @Column({ name: 'License_Number', type: 'varchar', length: 100 })
  licenseNumber: string;

  // Relationships
  @OneToMany(() => Processing, (processing) => processing.facility)
  processings: Processing[];
}
