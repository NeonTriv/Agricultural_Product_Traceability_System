import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Vegetable {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column()
  Name: string;

  @Column()
  Quantity: number;
}