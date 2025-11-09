import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Garden } from './garden.entity';

/**
 * BATCH Entity
 * Represents production batches from gardens
 */
@Entity('BATCH')
export class Batch {
  @PrimaryColumn({ name: 'Batch_ID', length: 50 })
  batchId: string;

  @Column({ name: 'Harvest_Date', type: 'date' })
  harvestDate: Date;

  @Column({ name: 'Created_By', length: 50 })
  createdBy: string;

  @Column({ name: 'Grade', length: 20 })
  grade: string;

  @Column({ name: 'Seed_Batch', length: 50 })
  seedBatch: string;

  @Column({ name: 'Description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'G_ID', length: 50 })
  gId: string;

  // Relationships
  @ManyToOne(() => Garden, (garden) => garden.gardenId)
  @JoinColumn({ name: 'G_ID' })
  garden: Garden;
}
