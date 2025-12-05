import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Type } from './type.entity';
import { VendorProduct } from './vendor-product.entity';

/**
 * AGRICULTURE_PRODUCT Entity
 * Represents agricultural products (fruits, vegetables) in the traceability system
 */
@Entity('AGRICULTURE_PRODUCT')
export class AgricultureProduct {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'int' })
  id: number;

  @Column({ name: 'Name', type: 'nvarchar', length: 255 })
  name: string;

  @Column({ name: 'Image_URL', type: 'varchar', length: 2048, nullable: true })
  imageUrl: string;

  @Column({ name: 'T_ID', type: 'int' })
  typeId: number;

  // Relationships
  @ManyToOne(() => Type, (type) => type.products)
  @JoinColumn({ name: 'T_ID' })
  type: Type;

  @OneToMany(() => VendorProduct, (vendorProduct) => vendorProduct.agricultureProduct)
  vendorProducts: VendorProduct[];
}
