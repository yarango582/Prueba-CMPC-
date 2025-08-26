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
import { Book } from './book.model';
import { User } from './user.model';

export enum InventoryOperation {
  STOCK_IN = 'stock_in',
  STOCK_OUT = 'stock_out',
  ADJUSTMENT = 'adjustment',
  INITIAL_STOCK = 'initial_stock',
}

@Table({
  tableName: 'book_inventory_logs',
  timestamps: false,
})
export class BookInventoryLog extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Book)
  @AllowNull(false)
  @Index
  @Column(DataType.UUID)
  declare book_id: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(InventoryOperation)))
  declare operation_type: InventoryOperation;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare quantity_change: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare previous_stock: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare new_stock: number;

  @Column(DataType.STRING(255))
  declare reason: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column(DataType.UUID)
  declare user_id: string;

  @Default(() => new Date())
  @Index
  @Column(DataType.DATE)
  declare created_at: Date;

  @BelongsTo(() => Book)
  declare book: Book;

  @BelongsTo(() => User)
  declare user: User;
}
