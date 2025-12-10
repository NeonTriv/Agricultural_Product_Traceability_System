import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Processing } from './processing.entity';

/**
 * PROCESS_STEP Entity
 * Represents processing steps for a processing operation
 */
@Entity('PROCESS_STEP')
export class ProcessStep {
  @PrimaryColumn({ name: 'P_ID', type: 'int' })
  processingId: number;

  @PrimaryColumn({ name: 'Step', type: 'nvarchar', length: 255 })
  step: string;

  // Relationships
  @ManyToOne(() => Processing)
  @JoinColumn({ name: 'P_ID' })
  processing: Processing;
}
