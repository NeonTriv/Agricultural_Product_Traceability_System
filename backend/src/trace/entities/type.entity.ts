import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * TYPE Entity
 * Represents product types/categories (fruit, vegetable, grain, etc.)
 */
@Entity('TYPE')
export class Type {
  @PrimaryColumn({ name: 'Type_ID', length: 50 })
  typeId: string;

  @Column({ name: 'Name', length: 200 })
  name: string;

  @Column({ name: 'Variety', length: 200 })
  variety: string;

  @Column({ name: 'Image_Url', length: 500, nullable: true })
  imageUrl: string;

  @Column({ name: 'Category', length: 100 })
  category: string;
}
