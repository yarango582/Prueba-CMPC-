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
  book_id: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(InventoryOperation)))
  operation_type: InventoryOperation;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  quantity_change: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  previous_stock: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  new_stock: number;

  @Column(DataType.STRING(255))
  reason: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column(DataType.UUID)
  user_id: string;

  @Default(() => new Date())
  @Index
  @Column(DataType.DATE)
  created_at: Date;

  @BelongsTo(() => Book)
  book: Book;

  @BelongsTo(() => User)
  user: User;
}
