import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { StoredIn } from './stored-in.entity';

/**
 * WAREHOUSE Entity
 * Represents storage warehouses
 */
@Entity('WAREHOUSE')
export class Warehouse {
  @PrimaryColumn({ name: 'ID', type: 'int' })
  id: number;

  @Column({ name: 'Capacity', type: 'decimal', precision: 18, scale: 0, nullable: true })
  capacity: number;

  @Column({ name: 'Store_Condition', type: 'nvarchar', length: 255, nullable: true })
  storeCondition: string;

  @Column({ name: 'Address', type: 'nvarchar', length: 255 })
  address: string;

  @Column({ name: 'Start_Date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'End_Date', type: 'date', nullable: true })
  endDate: Date;

  // Relationships
  @OneToMany(() => StoredIn, (stored) => stored.warehouse)
  storedBatches: StoredIn[];
}
