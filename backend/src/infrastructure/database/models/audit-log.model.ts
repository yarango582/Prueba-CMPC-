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
  declare table_name: string;

  @AllowNull(false)
  @Index
  @Column(DataType.UUID)
  declare record_id: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(AuditOperation)))
  declare operation: AuditOperation;

  @Column(DataType.JSONB)
  declare old_values: object;

  @Column(DataType.JSONB)
  declare new_values: object;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare user_id: string;

  @Column(DataType.STRING(45))
  declare user_ip: string;

  @Column(DataType.TEXT)
  declare user_agent: string;

  @Default(() => new Date())
  @Index
  @Column(DataType.DATE)
  declare created_at: Date;

  @BelongsTo(() => User)
  declare user: User;
}
