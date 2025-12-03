import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Province } from './province.entity';
import { Batch } from './batch.entity';
import { FarmCertification } from './farm-certification.entity';

/**
 * FARM Entity
 * Represents farms that produce agricultural products
 */
@Entity('FARM')
export class Farm {
  @PrimaryGeneratedColumn('increment', { name: 'ID' })
  id: number;

  @Column({ name: 'Name', type: 'nvarchar', length: 255 })
  name: string;

  @Column({ name: 'Owner_Name', type: 'nvarchar', length: 255, nullable: true })
  ownerName: string;

  @Column({ name: 'Contact_Info', type: 'varchar', length: 255, nullable: true })
  contactInfo: string;

  @Column({ name: 'Longitude', type: 'decimal', precision: 18, scale: 0 })
  longitude: number;

  @Column({ name: 'Latitude', type: 'decimal', precision: 18, scale: 0 })
  latitude: number;

  @Column({ name: 'P_ID', type: 'int' })
  provinceId: number;

  // Relationships
  @ManyToOne(() => Province, (province) => province.farms)
  @JoinColumn({ name: 'P_ID' })
  province: Province;

  @OneToMany(() => Batch, (batch) => batch.farm)
  batches: Batch[];

  @OneToMany(() => FarmCertification, (cert) => cert.farm)
  certifications: FarmCertification[];
}
