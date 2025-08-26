import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  Unique,
  HasMany,
} from 'sequelize-typescript';
import { Book } from './book.model';

@Table({
  tableName: 'publishers',
  timestamps: true,
  paranoid: true,
})
export class Publisher extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(200))
  name: string;

  @Column(DataType.TEXT)
  address: string;

  @Column(DataType.STRING(20))
  phone: string;

  @Column(DataType.STRING(255))
  email: string;

  @Column(DataType.STRING(255))
  website: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  is_active: boolean;

  @HasMany(() => Book)
  books: Book[];
}
