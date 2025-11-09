import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Batch } from './batch.entity';
import { ProcessingFacility } from './processing-facility.entity';

/**
 * PROCESSING Entity
 * Represents processing/packaging activities for agricultural products
 */
@Entity('PROCESSING')
export class Processing {
  @PrimaryColumn({ name: 'Processing_ID', length: 50 })
  processingId: string;

  @Column({ name: 'Packaging_Date', type: 'date' })
  packagingDate: Date;

  @Column({ name: 'Weight_Per_Unit', type: 'decimal', precision: 10, scale: 2 })
  weightPerUnit: number;

  @Column({ name: 'Processed_By', length: 200 })
  processedBy: string;

  @Column({ name: 'Packaging_Type', length: 100 })
  packagingType: string;

  @Column({ name: 'Processing_Date', type: 'date' })
  processingDate: Date;

  @Column({ name: 'Step', type: 'text', nullable: true })
  step: string;

  @Column({ name: 'Facility_ID', length: 50 })
  facilityId: string;

  @Column({ name: 'Batch_ID', length: 50 })
  batchId: string;

  // Relationships
  @ManyToOne(() => ProcessingFacility, (facility) => facility.facilityId)
  @JoinColumn({ name: 'Facility_ID' })
  facility: ProcessingFacility;

  @ManyToOne(() => Batch, (batch) => batch.batchId)
  @JoinColumn({ name: 'Batch_ID' })
  batch: Batch;
}
