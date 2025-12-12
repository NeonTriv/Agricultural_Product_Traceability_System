import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ProductHasDiscount } from './product-has-discount.entity';

/**
 * DISCOUNT Entity
 * Represents discount offers (Updated Schema)
 */
@Entity('DISCOUNT')
export class Discount {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'int' })
  id: number;

  @Column({ name: 'Name', type: 'nvarchar', length: 255, nullable: true })
  name: string;

  @Column({ name: 'Percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentage: number;

  @Column({ name: 'Min_Value', type: 'decimal', precision: 12, scale: 2, nullable: true })
  minValue: number;

  @Column({ name: 'Max_Discount_Amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  maxDiscountAmount: number;

  @Column({ name: 'Priority', type: 'int', default: 0 })
  priority: number;

  @Column({ name: 'Is_Stackable', type: 'bit', default: 0 })
  isStackable: boolean;

  @Column({ name: 'Start_Date', type: 'datetimeoffset' })
  startDate: Date;

  @Column({ name: 'Expired_Date', type: 'datetimeoffset' })
  expiredDate: Date;

  @OneToMany(() => ProductHasDiscount, (productDiscount) => productDiscount.discount)
  products: ProductHasDiscount[];
}