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
  tableName: 'genres',
  timestamps: true,
  paranoid: true,
})
export class Genre extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(100))
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  is_active: boolean;

  @HasMany(() => Book)
  books: Book[];
}
