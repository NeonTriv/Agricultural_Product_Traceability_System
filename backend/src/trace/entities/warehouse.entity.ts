import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Province } from './province.entity';
import { StoredIn } from './stored-in.entity';

/**
 * WAREHOUSE Entity
 * Represents storage warehouses
 */
@Entity('WAREHOUSE')
export class Warehouse {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'int' })
  id: number;

  @Column({ name: 'Capacity', type: 'decimal', precision: 10, scale: 2, nullable: true })
  capacity: number;

  @Column({ name: 'Store_Condition', type: 'nvarchar', length: 255, nullable: true })
  storeCondition: string;

  @Column({ name: 'Address_detail', type: 'nvarchar', length: 255 })
  addressDetail: string;

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

  @OneToMany(() => StoredIn, (stored) => stored.warehouse)
  storedInRecords: StoredIn[];
}
