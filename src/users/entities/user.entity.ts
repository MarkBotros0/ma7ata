import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { UserRole } from '../enums/user-roles.enum';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ name: 'phone_number', unique: true })
  phoneNumber: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true
  })
  fullname: string;

  @Column({
    type: 'varchar',
    length: 30,
    nullable: true
  })
  email: string;

  @Column({
    type: 'text',
    nullable: true
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 768,
    nullable: true
  })
  refreshToken: string;

  @Column({
    type: 'set',
    name: 'user_roles',
    enum: UserRole,
    default: [UserRole.NORMAL]
  })
  userRoles: UserRole[];
}
