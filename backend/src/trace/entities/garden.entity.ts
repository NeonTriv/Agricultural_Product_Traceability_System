import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * GARDEN Entity
 * Represents farms/gardens where agricultural products are grown
 */
@Entity('GARDEN')
export class Garden {
  @PrimaryColumn({ name: 'Garden_ID', length: 50 })
  gardenId: string;

  @Column({ name: 'Name', length: 200 })
  name: string;

  @Column({ name: 'Owner_Name', length: 200 })
  ownerName: string;

  @Column({ name: 'Contact_Info', length: 200 })
  contactInfo: string;

  @Column({ name: 'Address', length: 500 })
  address: string;

  @Column({ name: 'Country', length: 100 })
  country: string;

  @Column({ name: 'Province', length: 100 })
  province: string;

  @Column({ name: 'Latitude', type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ name: 'Longitude', type: 'decimal', precision: 11, scale: 8 })
  longitude: number;
}
