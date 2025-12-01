import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Category } from './category.entity';
import { AgricultureProduct } from './agriculture-product.entity';

/**
 * TYPE Entity
 * Represents product types (e.g., Tomato, Carrot)
 */
@Entity('TYPE')
export class Type {
  @PrimaryColumn({ name: 'ID', type: 'int' })
  id: number;

  @Column({ name: 'Name', type: 'nvarchar', length: 100 })
  name: string;

  @Column({ name: 'Variety', type: 'nvarchar', length: 100, nullable: true })
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
