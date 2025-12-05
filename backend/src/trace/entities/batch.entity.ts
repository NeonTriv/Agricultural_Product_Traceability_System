import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Farm } from './farm.entity';
import { AgricultureProduct } from './agriculture-product.entity';
import { VendorProduct } from './vendor-product.entity';
import { Processing } from './processing.entity';
import { ShipBatch } from './ship-batch.entity';
import { StoredIn } from './stored-in.entity';

/**
 * BATCH Entity
 * Represents production batches from farms
 */
@Entity('BATCH')
export class Batch {
  @PrimaryGeneratedColumn('increment', { name: 'ID' })
  id: number;

  @Column({ name: 'Harvest_Date', type: 'datetimeoffset' })
  harvestDate: Date;

  @Column({ name: 'Created_By', type: 'nvarchar', length: 100, nullable: true })
  createdBy: string;

  @Column({ name: 'Grade', type: 'varchar', length: 50, nullable: true })
  grade: string;

  @Column({ name: 'Seed_Batch', type: 'varchar', length: 100, nullable: true })
  seedBatch: string;

  @Column({ name: 'Qr_Code_URL', type: 'varchar', length: 2048 })
  qrCodeUrl: string;

  @Column({ name: 'Farm_ID', type: 'int' })
  farmId: number;

  @Column({ name: 'AP_ID', type: 'int' })
  agricultureProductId: number;

  @Column({ name: 'V_ID', type: 'int', nullable: true })
  vendorProductId: number;

  // Relationships
  @ManyToOne(() => Farm, (farm) => farm.batches)
  @JoinColumn({ name: 'Farm_ID' })
  farm: Farm;

  @ManyToOne(() => AgricultureProduct, (product) => product.id)
  @JoinColumn({ name: 'AP_ID' })
  agricultureProduct: AgricultureProduct;

  @ManyToOne(() => VendorProduct)
  @JoinColumn({ name: 'V_ID' })
  vendorProduct: VendorProduct;

  @OneToMany(() => Processing, (processing) => processing.batch)
  processings: Processing[];

  @OneToMany(() => ShipBatch, (shipBatch) => shipBatch.batch)
  shipBatches: ShipBatch[];

  @OneToMany(() => StoredIn, (stored) => stored.batch)
  storedIn: StoredIn[];
}
