import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Book } from '../infrastructure/database/models/book.model';
import { Author } from '../infrastructure/database/models/author.model';
import { Publisher } from '../infrastructure/database/models/publisher.model';
import { Genre } from '../infrastructure/database/models/genre.model';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FilterBookDto } from './dto/filter-book.dto';
import { Op, literal } from 'sequelize';
import { AuditService } from '../audit/audit.service';
import { CloudinaryService } from '../infrastructure/file-upload/cloudinary.service';
import { AuditOperation } from '../infrastructure/database/models/audit-log.model';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book)
    private bookModel: typeof Book,
    @InjectModel(Author)
    private authorModel: typeof Author,
    @InjectModel(Publisher)
    private publisherModel: typeof Publisher,
    @InjectModel(Genre)
    private genreModel: typeof Genre,
    private auditService: AuditService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createBookDto: CreateBookDto, userId: string): Promise<Book> {
    // Validar que existan las relaciones
    await this.validateRelations(createBookDto);

    const book = await this.bookModel.create({
      ...createBookDto,
      is_available: (createBookDto.stock_quantity ?? 0) > 0,
    });

    // Auditoría
    await this.auditService.log({
      table_name: 'books',
      record_id: book.id,
      operation: AuditOperation.CREATE,
      new_values: book.toJSON(),
      user_id: userId,
    });

    return this.findOne(book.id);
  }

  async findAll(filterDto: FilterBookDto) {
    const {
      search,
      genres,
      authors,
      publishers,
      is_available,
      min_price,
      max_price,
      sort_by = 'created_at',
      sort_order = 'DESC',
      page = 1,
      limit = 10,
    } = filterDto;

    const where: any = {};
    const include = [
      {
        model: Author,
        as: 'author',
        attributes: ['id', 'first_name', 'last_name'],
      },
      {
        model: Publisher,
        as: 'publisher',
        attributes: ['id', 'name'],
      },
      {
        model: Genre,
        as: 'genre',
        attributes: ['id', 'name'],
      },
    ];

    // Búsqueda por texto
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { isbn: { [Op.iLike]: `%${search}%` } },
        { '$author.first_name$': { [Op.iLike]: `%${search}%` } },
        { '$author.last_name$': { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Filtros por categorías
    if (genres?.length) {
      where.genre_id = { [Op.in]: genres };
    }

    if (authors?.length) {
      where.author_id = { [Op.in]: authors };
    }

    if (publishers?.length) {
      where.publisher_id = { [Op.in]: publishers };
    }

    if (typeof is_available === 'boolean') {
      where.is_available = is_available;
    }

    // Filtros por precio
    if (min_price !== undefined || max_price !== undefined) {
      where.price = {};
      if (min_price !== undefined) {
        where.price[Op.gte] = min_price;
      }
      if (max_price !== undefined) {
        where.price[Op.lte] = max_price;
      }
    }

    // Ordenamiento: mapear valores de entrada a columnas reales para evitar SQL inválido
    let order: any;
    const mapSortBy = (val: string) => {
      if (!val) return 'createdAt';
      switch (val) {
        case 'created_at':
          return 'createdAt';
        case 'publication_date':
          return 'publication_date';
        case 'title':
          return 'title';
        case 'price':
          return 'price';
        default:
          return val;
      }
    };

    if (sort_by === 'author') {
      order = [[{ model: Author, as: 'author' }, 'last_name', sort_order]];
    } else if (sort_by === 'publisher') {
      order = [[{ model: Publisher, as: 'publisher' }, 'name', sort_order]];
    } else {
      const field = mapSortBy(sort_by);
      // Usar literal para evitar inconsistencias en el mapeo de columnas/atributos
      // y generar un ORDER BY explícito sobre la tabla "Book".
      order = [literal(`"Book"."${field}" ${sort_order}`)];
    }

    const offset = (page - 1) * limit;

    const { rows: books, count: total } = await this.bookModel.findAndCountAll({
      where,
      include,
      order,
      limit,
      offset,
      distinct: true,
    });

    return {
      books,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookModel.findByPk(id, {
      include: [
        {
          model: Author,
          as: 'author',
          attributes: [
            'id',
            'first_name',
            'last_name',
            'biography',
            'nationality',
          ],
        },
        {
          model: Publisher,
          as: 'publisher',
          attributes: ['id', 'name', 'address', 'phone', 'email', 'website'],
        },
        {
          model: Genre,
          as: 'genre',
          attributes: ['id', 'name', 'description'],
        },
      ],
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  async update(
    id: string,
    updateBookDto: UpdateBookDto,
    userId: string,
  ): Promise<Book> {
    const book = await this.findOne(id);

    if (
      updateBookDto.author_id ||
      updateBookDto.publisher_id ||
      updateBookDto.genre_id
    ) {
      await this.validateRelations(updateBookDto);
    }

    const oldValues = book.toJSON();

    await book.update({
      ...updateBookDto,
      is_available:
        updateBookDto.stock_quantity !== undefined
          ? updateBookDto.stock_quantity > 0
          : book.is_available,
    });

    // Auditoría
    await this.auditService.log({
      table_name: 'books',
      record_id: book.id,
      operation: AuditOperation.UPDATE,
      old_values: oldValues,
      new_values: book.toJSON(),
      user_id: userId,
    });

    return this.findOne(book.id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const book = await this.findOne(id);
    const oldValues = book.toJSON();

    await book.destroy();

    // Auditoría
    await this.auditService.log({
      table_name: 'books',
      record_id: book.id,
      operation: AuditOperation.SOFT_DELETE,
      old_values: oldValues,
      user_id: userId,
    });
  }

  async exportToCsv(filterDto: FilterBookDto): Promise<string> {
    const { books } = await this.findAll({
      ...filterDto,
      limit: 10000,
      page: 1,
    });

    const csvHeaders = [
      'ID',
      'Title',
      'ISBN',
      'Author',
      'Publisher',
      'Genre',
      'Price',
      'Stock',
      'Available',
      'Publication Date',
      'Created At',
    ];

    const csvRows = books.map((book) => [
      book.id,
      `"${book.title.replace(/"/g, '""')}"`,
      book.isbn || '',
      `"${book.author.first_name} ${book.author.last_name}"`,
      `"${book.publisher.name}"`,
      `"${book.genre.name}"`,
      book.price,
      book.stock_quantity,
      book.is_available ? 'Yes' : 'No',
      book.publication_date || '',
      book.createdAt,
    ]);

    return [csvHeaders, ...csvRows].map((row) => row.join(',')).join('\n');
  }

  private async validateRelations(dto: Partial<CreateBookDto>): Promise<void> {
    if (dto.author_id) {
      const author = await this.authorModel.findByPk(dto.author_id);
      if (!author) {
        throw new BadRequestException(
          `Author with ID ${dto.author_id} not found`,
        );
      }
    }

    if (dto.publisher_id) {
      const publisher = await this.publisherModel.findByPk(dto.publisher_id);
      if (!publisher) {
        throw new BadRequestException(
          `Publisher with ID ${dto.publisher_id} not found`,
        );
      }
    }

    if (dto.genre_id) {
      const genre = await this.genreModel.findByPk(dto.genre_id);
      if (!genre) {
        throw new BadRequestException(
          `Genre with ID ${dto.genre_id} not found`,
        );
      }
    }
  }

  async uploadImage(
    bookId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<Book> {
    const book = await this.findOne(bookId);

    // Si ya hay una imagen, eliminarla de Cloudinary
    if (book.image_url) {
      await this.cloudinaryService.deleteImage(book.image_url);
    }

    // Subir nueva imagen
    let imageUrl: string;
    try {
      imageUrl = await this.cloudinaryService.uploadImage(file, 'books');
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as any).message)
          : '';
      // Mapear errores conocidos de Cloudinary a BadRequest
      if (
        msg.includes('Invalid image') ||
        msg.includes('invalid image') ||
        msg.includes('Error uploading') ||
        msg.includes('No result from Cloudinary')
      ) {
        throw new BadRequestException(
          'Archivo de imagen inválido o con formato no soportado',
        );
      }
      throw err;
    }

    // Actualizar libro con nueva URL
    const oldValues = book.toJSON();
    await book.update({ image_url: imageUrl });

    // Auditoría
    await this.auditService.log({
      table_name: 'books',
      record_id: book.id,
      operation: AuditOperation.UPDATE,
      old_values: oldValues,
      new_values: { image_url: imageUrl },
      user_id: userId,
    });

    return this.findOne(bookId);
  }
}
