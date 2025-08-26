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
  declare first_name: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare last_name: string;

  @Column(DataType.TEXT)
  declare biography: string;

  @Column(DataType.DATE)
  declare birth_date: Date;

  @Column(DataType.STRING(100))
  declare nationality: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare is_active: boolean;

  @HasMany(() => Book)
  declare books: Book[];
}
