import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Type } from './type.entity';

/**
 * CATEGORY Entity
 * Represents product categories (e.g., Vegetables, Fruits)
 */
@Entity('CATEGORY')
export class Category {
  @PrimaryColumn({ name: 'ID', type: 'int' })
  id: number;

  @Column({ name: 'Name', type: 'nvarchar', length: 100 })
  name: string;

  // Relationships
  @OneToMany(() => Type, (type) => type.category)
  types: Type[];
}
