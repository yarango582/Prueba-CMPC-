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
  declare title: string;

  @Unique
  @Column(DataType.STRING(20))
  declare isbn: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL(10, 2))
  declare price: number;

  @Default(0)
  @Column(DataType.INTEGER)
  declare stock_quantity: number;

  @Column(DataType.DATE)
  declare publication_date: Date;

  @Column(DataType.INTEGER)
  declare pages: number;

  @Default('Español')
  @Column(DataType.STRING(50))
  declare language: string;

  @Column(DataType.TEXT)
  declare description: string;

  @Column(DataType.STRING(500))
  declare image_url: string;

  @ForeignKey(() => Author)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare author_id: string;

  @ForeignKey(() => Publisher)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare publisher_id: string;

  @ForeignKey(() => Genre)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare genre_id: string;

  @Default(true)
  @Index
  @Column(DataType.BOOLEAN)
  declare is_available: boolean;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare is_active: boolean;

  @BelongsTo(() => Author)
  declare author: Author;

  @BelongsTo(() => Publisher)
  declare publisher: Publisher;

  @BelongsTo(() => Genre)
  declare genre: Genre;
}
