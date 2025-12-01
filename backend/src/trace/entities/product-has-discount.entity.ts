import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { VendorProduct } from './vendor-product.entity';
import { Discount } from './discount.entity';

/**
 * PRODUCT_HAS_DISCOUNT Entity
 * Junction table representing vendor products with discounts
 * Composite primary key: V_ID + Discount_ID
 */
@Entity('PRODUCT_HAS_DISCOUNT')
export class ProductHasDiscount {
  @PrimaryColumn({ name: 'V_ID', type: 'int' })
  vendorProductId: number;

  @PrimaryColumn({ name: 'Discount_ID', type: 'int' })
  discountId: number;

  // Relationships
  @ManyToOne(() => VendorProduct, (vendorProduct) => vendorProduct.discounts)
  @JoinColumn({ name: 'V_ID' })
  vendorProduct: VendorProduct;

  @ManyToOne(() => Discount, (discount) => discount.products)
  @JoinColumn({ name: 'Discount_ID' })
  discount: Discount;
}
