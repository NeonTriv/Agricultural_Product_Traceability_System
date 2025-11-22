import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Vendor } from './vendor.entity';
import { ProductHasDiscount } from './product-has-discount.entity';

/**
 * DISCOUNT Entity
 * Represents discount offers from vendors
 */
@Entity('DISCOUNT')
export class Discount {
  @PrimaryColumn({ name: 'ID', type: 'int' })
  id: number;

  @Column({ name: 'V_TIN', type: 'varchar', length: 20 })
  vendorTin: string;

  @Column({ name: 'Percentage', type: 'decimal', precision: 18, scale: 0, nullable: true })
  percentage: number;

  @Column({ name: 'Min_Value', type: 'decimal', precision: 18, scale: 0, nullable: true })
  minValue: number;

  @Column({ name: 'Max_Discount_Amount', type: 'decimal', precision: 18, scale: 0, nullable: true })
  maxDiscountAmount: number;

  @Column({ name: 'Start_Date', type: 'datetimeoffset' })
  startDate: Date;

  @Column({ name: 'Expired_Date', type: 'datetimeoffset' })
  expiredDate: Date;

  // Relationships
  @ManyToOne(() => Vendor, (vendor) => vendor.discounts)
  @JoinColumn({ name: 'V_TIN' })
  vendor: Vendor;

  @OneToMany(() => ProductHasDiscount, (productDiscount) => productDiscount.discount)
  products: ProductHasDiscount[];
}
