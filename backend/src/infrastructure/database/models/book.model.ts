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
  Unique,
  Index,
} from 'sequelize-typescript';
import { Author } from './author.model';
import { Publisher } from './publisher.model';
import { Genre } from './genre.model';

@Table({
  tableName: 'books',
  timestamps: true,
  paranoid: true,
})
export class Book extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Index
  @Column(DataType.STRING(300))
  title: string;

  @Unique
  @Column(DataType.STRING(20))
  isbn: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL(10, 2))
  price: number;

  @Default(0)
  @Column(DataType.INTEGER)
  stock_quantity: number;

  @Column(DataType.DATE)
  publication_date: Date;

  @Column(DataType.INTEGER)
  pages: number;

  @Default('Español')
  @Column(DataType.STRING(50))
  language: string;

  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.STRING(500))
  image_url: string;

  @ForeignKey(() => Author)
  @AllowNull(false)
  @Column(DataType.UUID)
  author_id: string;

  @ForeignKey(() => Publisher)
  @AllowNull(false)
  @Column(DataType.UUID)
  publisher_id: string;

  @ForeignKey(() => Genre)
  @AllowNull(false)
  @Column(DataType.UUID)
  genre_id: string;

  @Default(true)
  @Index
  @Column(DataType.BOOLEAN)
  is_available: boolean;

  @Default(true)
  @Column(DataType.BOOLEAN)
  is_active: boolean;

  @BelongsTo(() => Author)
  author: Author;

  @BelongsTo(() => Publisher)
  publisher: Publisher;

  @BelongsTo(() => Genre)
  genre: Genre;
}
