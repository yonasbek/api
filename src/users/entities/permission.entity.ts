import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  module: string; // e.g., 'Annual Plans', 'Users', 'Training'

  @Column()
  action: string; // e.g., 'create', 'read', 'update', 'delete', 'view', 'export'

  @Column({ nullable: true })
  resource: string; // e.g., 'plan', 'activity', 'user', 'contact'

  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

