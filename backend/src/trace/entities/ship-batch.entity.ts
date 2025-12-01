import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Shipment } from './shipment.entity';
import { Batch } from './batch.entity';

/**
 * SHIP_BATCH Entity
 * Junction table representing batches in shipments
 * Composite primary key: S_ID + B_ID
 */
@Entity('SHIP_BATCH')
export class ShipBatch {
  @PrimaryColumn({ name: 'S_ID', type: 'int' })
  shipmentId: number;

  @PrimaryColumn({ name: 'B_ID', type: 'int' })
  batchId: number;

  // Relationships
  @ManyToOne(() => Shipment, (shipment) => shipment.shipBatches)
  @JoinColumn({ name: 'S_ID' })
  shipment: Shipment;

  @ManyToOne(() => Batch, (batch) => batch.shipBatches)
  @JoinColumn({ name: 'B_ID' })
  batch: Batch;
}
