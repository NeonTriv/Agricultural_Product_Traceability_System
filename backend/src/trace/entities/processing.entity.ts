import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Batch } from './batch.entity';
import { ProcessingFacility } from './processing-facility.entity';

/**
 * PROCESSING Entity
 * Represents processing operations on batches
 */
@Entity('PROCESSING')
export class Processing {
  @PrimaryColumn({ name: 'ID', type: 'int' })
  id: number;

  @Column({ name: 'Packaging_Date', type: 'datetimeoffset' })
  packagingDate: Date;

  @Column({ name: 'Weight_per_unit', type: 'decimal', precision: 18, scale: 0 })
  weightPerUnit: number;

  @Column({ name: 'Processed_By', type: 'nvarchar', length: 100, nullable: true })
  processedBy: string;

  @Column({ name: 'Packaging_Type', type: 'nvarchar', length: 100, nullable: true })
  packagingType: string;

  @Column({ name: 'Processing_Date', type: 'datetimeoffset', nullable: true })
  processingDate: Date;

  @Column({ name: 'Facility_ID', type: 'int' })
  facilityId: number;

  @Column({ name: 'Batch_ID', type: 'int' })
  batchId: number;

  // Relationships
  @ManyToOne(() => ProcessingFacility, (facility) => facility.processings)
  @JoinColumn({ name: 'Facility_ID' })
  facility: ProcessingFacility;

  @ManyToOne(() => Batch, (batch) => batch.processings)
  @JoinColumn({ name: 'Batch_ID' })
  batch: Batch;
}
