import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  HasMany,
} from 'sequelize-typescript';
import { Book } from './book.model';

@Table({
  tableName: 'authors',
  timestamps: true,
  paranoid: true,
})
export class Author extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  first_name: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  last_name: string;

  @Column(DataType.TEXT)
  biography: string;

  @Column(DataType.DATE)
  birth_date: Date;

  @Column(DataType.STRING(100))
  nationality: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  is_active: boolean;

  @HasMany(() => Book)
  books: Book[];
}
