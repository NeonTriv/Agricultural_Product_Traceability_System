import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Processing } from './processing.entity';
import { Province } from './province.entity';

/**
 * PROCESSING_FACILITY Entity
 * Represents facilities where products are processed and packaged
 */
@Entity('PROCESSING_FACILITY')
export class ProcessingFacility {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'int' })
  id: number;

  @Column({ name: 'Name', type: 'nvarchar', length: 255 })
  name: string;

  @Column({ name: 'Address_detail', type: 'nvarchar', length: 255 })
  address: string;

  @Column({ name: 'Contact_Info', type: 'varchar', length: 255, nullable: true })
  contactInfo: string;

  @Column({ name: 'License_Number', type: 'varchar', length: 100 })
  licenseNumber: string;

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

  @OneToMany(() => Processing, (processing) => processing.facility)
  processings: Processing[];
}
