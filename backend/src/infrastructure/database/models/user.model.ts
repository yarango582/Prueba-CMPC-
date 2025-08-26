import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  Unique,
  Index,
} from 'sequelize-typescript';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
})
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(255))
  email: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  password: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  first_name: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  last_name: string;

  @Default(UserRole.USER)
  @Column(DataType.ENUM(...Object.values(UserRole)))
  role: UserRole;

  @Default(true)
  @Column(DataType.BOOLEAN)
  is_active: boolean;

  @Index
  @Column(DataType.DATE)
  deleted_at: Date;
}
