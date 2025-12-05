import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Batch } from './batch.entity';
import { Warehouse } from './warehouse.entity';

/**
 * STORED_IN Entity
 * Junction table representing batches stored in warehouses
 * Composite primary key: B_ID + W_ID
 */
@Entity('STORED_IN')
export class StoredIn {
  @PrimaryColumn({ name: 'B_ID', type: 'int' })
  batchId: number;

  @PrimaryColumn({ name: 'W_ID', type: 'int' })
  warehouseId: number;

  @Column({ name: 'Quantity', type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ name: 'Start_Date', type: 'datetimeoffset', nullable: true })
  startDate: Date | null;

  @Column({ name: 'End_Date', type: 'datetimeoffset', nullable: true })
  endDate: Date | null;

  // Relationships
  @ManyToOne(() => Batch, (batch) => batch.storedIn)
  @JoinColumn({ name: 'B_ID' })
  batch: Batch;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.storedInRecords)
  @JoinColumn({ name: 'W_ID' })
  warehouse: Warehouse;
}
