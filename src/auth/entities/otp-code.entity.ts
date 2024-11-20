import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'otp_code' })
export class OtpCode {
  @PrimaryColumn({ name: 'phone_number', type: 'varchar' })
  phoneNumber: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP(6)'
  })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @Column({
    type: 'timestamp',
    name: 'expires_at'
  })
  expiresAt: Date;
}
