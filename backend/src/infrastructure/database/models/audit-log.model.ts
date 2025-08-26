import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { User } from './user.model';

export enum AuditOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SOFT_DELETE = 'SOFT_DELETE',
  RESTORE = 'RESTORE',
}

@Table({
  tableName: 'audit_logs',
  timestamps: false,
})
export class AuditLog extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Index
  @Column(DataType.STRING(100))
  table_name: string;

  @AllowNull(false)
  @Index
  @Column(DataType.UUID)
  record_id: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(AuditOperation)))
  operation: AuditOperation;

  @Column(DataType.JSONB)
  old_values: object;

  @Column(DataType.JSONB)
  new_values: object;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  user_id: string;

  @Column(DataType.STRING(45))
  user_ip: string;

  @Column(DataType.TEXT)
  user_agent: string;

  @Default(() => new Date())
  @Index
  @Column(DataType.DATE)
  created_at: Date;

  @BelongsTo(() => User)
  user: User;
}
