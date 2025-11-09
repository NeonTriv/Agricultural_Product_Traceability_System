import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Batch } from './batch.entity';
import { Type } from './type.entity';

/**
 * AGRICULTURE_PRODUCT Entity
 * Represents agricultural products (fruits, vegetables) in the traceability system
 */
@Entity('AGRICULTURE_PRODUCT')
export class AgricultureProduct {
  @PrimaryColumn({ name: 'AgricultureProduct_ID', length: 50 })
  agricultureProductId: string;

  @Column({ name: 'Qr_Code_Url', length: 500, unique: true })
  qrCodeUrl: string;

  @Column({ name: 'Batch_ID', length: 50 })
  batchId: string;

  @Column({ name: 'Type_ID', length: 50 })
  typeId: string;

  @Column({ name: 'Expired_Date', type: 'datetime', nullable: true })
  expiredDate: Date;

  // Relationships
  @ManyToOne(() => Batch, (batch) => batch.batchId)
  @JoinColumn({ name: 'Batch_ID' })
  batch: Batch;

  @ManyToOne(() => Type, (type) => type.typeId)
  @JoinColumn({ name: 'Type_ID' })
  type: Type;
}
