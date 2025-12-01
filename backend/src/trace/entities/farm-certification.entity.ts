import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Farm } from './farm.entity';

/**
 * FARM_CERTIFICATIONS Entity
 * Represents certifications held by farms
 * Composite primary key: F_ID + FarmCertifications
 */
@Entity('FARM_CERTIFICATIONS')
export class FarmCertification {
  @PrimaryColumn({ name: 'F_ID', type: 'int' })
  farmId: number;

  @PrimaryColumn({ name: 'FarmCertifications', type: 'nvarchar', length: 255 })
  farmCertifications: string;

  // Relationships
  @ManyToOne(() => Farm, (farm) => farm.certifications)
  @JoinColumn({ name: 'F_ID' })
  farm: Farm;
}
