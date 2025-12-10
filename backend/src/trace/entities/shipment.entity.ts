import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Distributor } from './distributor.entity';
import { TransportLeg } from './transport-leg.entity';
import { ShipBatch } from './ship-batch.entity';

/**
 * SHIPMENT Entity
 * Represents shipments from distributors
 */
@Entity('SHIPMENT')
export class Shipment {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'int' })
  id: number;

  @Column({ name: 'Status', type: 'varchar', length: 50 })
  status: string;

  @Column({ name: 'Destination', type: 'nvarchar', length: 255, nullable: true })
  destination: string;

  @Column({ name: 'Start_Location', type: 'nvarchar', length: 255, nullable: true })
  startLocation: string;

  @Column({ name: 'Distributor_TIN', type: 'varchar', length: 20 })
  distributorTin: string;

  // Relationships
  @ManyToOne(() => Distributor, (distributor) => distributor.shipments)
  @JoinColumn({ name: 'Distributor_TIN' })
  distributor: Distributor;

  @OneToMany(() => TransportLeg, (leg) => leg.shipment)
  transportLegs: TransportLeg[];

  @OneToMany(() => ShipBatch, (shipBatch) => shipBatch.shipment)
  shipBatches: ShipBatch[];
}
