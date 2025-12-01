import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Shipment } from './shipment.entity';
import { CarrierCompany } from './carrier-company.entity';

/**
 * TRANSPORLEG Entity
 * Represents individual transport legs of a shipment
 */
@Entity('TRANSPORLEG')
export class TransportLeg {
  @PrimaryColumn({ name: 'ID', type: 'int' })
  id: number;

  @Column({ name: 'Shipment_ID', type: 'int' })
  shipmentId: number;

  @Column({ name: 'Driver_Name', type: 'nvarchar', length: 100, nullable: true })
  driverName: string;

  @Column({ name: 'Temperature_Profile', type: 'nvarchar', length: 'MAX', nullable: true })
  temperatureProfile: string;

  @Column({ name: 'Start_Location', type: 'nvarchar', length: 255 })
  startLocation: string;

  @Column({ name: 'To_Location', type: 'nvarchar', length: 255 })
  toLocation: string;

  @Column({ name: 'CarrierCompany_TIN', type: 'varchar', length: 20 })
  carrierCompanyTin: string;

  // Relationships
  @ManyToOne(() => Shipment, (shipment) => shipment.transportLegs)
  @JoinColumn({ name: 'Shipment_ID' })
  shipment: Shipment;

  @ManyToOne(() => CarrierCompany, (carrier) => carrier.transportLegs)
  @JoinColumn({ name: 'CarrierCompany_TIN' })
  carrierCompany: CarrierCompany;
}
