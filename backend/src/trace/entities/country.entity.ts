import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Province } from './province.entity';

/**
 * COUNTRY Entity
 * Represents countries in the system
 */
@Entity('COUNTRY')
export class Country {
  @PrimaryGeneratedColumn('increment', { name: 'ID' })
  id: number;

  @Column({ name: 'Name', type: 'nvarchar', length: 100 })
  name: string;

  // Relationships
  @OneToMany(() => Province, (province) => province.country)
  provinces: Province[];
}
