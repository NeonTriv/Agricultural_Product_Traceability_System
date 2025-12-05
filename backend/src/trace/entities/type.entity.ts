import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Category } from './category.entity';
import { AgricultureProduct } from './agriculture-product.entity';

/**
 * TYPE Entity
 * Represents product types (e.g., Tomato, Carrot)
 * Schema: ID, Variety, C_ID
 */
@Entity('TYPE')
export class Type {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'int' })
  id: number;

  @Column({ name: 'Variety', type: 'nvarchar', length: 100 })
  variety: string;

  @Column({ name: 'C_ID', type: 'int' })
  categoryId: number;

  // Relationships
  @ManyToOne(() => Category, (category) => category.types)
  @JoinColumn({ name: 'C_ID' })
  category: Category;

  @OneToMany(() => AgricultureProduct, (product) => product.type)
  products: AgricultureProduct[];
}
