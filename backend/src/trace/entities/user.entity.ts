import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Users Entity
 * Represents system users
 */
@Entity('Users')
export class User {
  @PrimaryGeneratedColumn({ name: 'UserID', type: 'int' })
  userId: number;

  @Column({ name: 'Username', type: 'nvarchar', length: 100 })
  username: string;

  @Column({ name: 'PasswordHash', type: 'nvarchar', length: 200 })
  passwordHash: string;

  @Column({ name: 'Role', type: 'nvarchar', length: 20 })
  role: string;

  @Column({ name: 'CreatedAt', type: 'datetime2' })
  createdAt: Date;
}
