import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Country } from './country.entity';
import { Farm } from './farm.entity';

/**
 * PROVINCE Entity
 * Represents provinces/states within countries
 */
@Entity('PROVINCE')
export class Province {
  @PrimaryColumn({ name: 'ID', type: 'int' })
  id: number;

  @Column({ name: 'Name', type: 'nvarchar', length: 100 })
  name: string;

  @Column({ name: 'C_ID', type: 'int' })
  countryId: number;

  // Relationships
  @ManyToOne(() => Country, (country) => country.provinces)
  @JoinColumn({ name: 'C_ID' })
  country: Country;

  @OneToMany(() => Farm, (farm) => farm.province)
  farms: Farm[];
}
