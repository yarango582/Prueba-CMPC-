import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Author } from '../infrastructure/database/models/author.model';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { Op } from 'sequelize';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel(Author)
    private authorModel: typeof Author,
  ) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    // Verificar si ya existe un autor con el mismo nombre
    const existingAuthor = await this.authorModel.findOne({
      where: {
        first_name: createAuthorDto.first_name,
        last_name: createAuthorDto.last_name,
      },
    });

    if (existingAuthor) {
      throw new ConflictException('Ya existe un autor con este nombre');
    }

    return this.authorModel.create({ ...createAuthorDto });
  }

  async findAll(paginationDto: PaginationDto, search?: string) {
    const { page = 1, limit = 10 } = paginationDto;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { nationality: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: authors, count: total } =
      await this.authorModel.findAndCountAll({
        where,
        order: [
          ['last_name', 'ASC'],
          ['first_name', 'ASC'],
        ],
        limit,
        offset,
      });

    return {
      authors,
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

  async findOne(id: string): Promise<Author> {
    const author = await this.authorModel.findByPk(id);
    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }
    return author;
  }

  async update(id: string, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    const author = await this.findOne(id);

    // Si se cambia el nombre, verificar que no exista otro
    if (updateAuthorDto.first_name || updateAuthorDto.last_name) {
      const existingAuthor = await this.authorModel.findOne({
        where: {
          id: { [Op.ne]: id },
          first_name: updateAuthorDto.first_name || author.first_name,
          last_name: updateAuthorDto.last_name || author.last_name,
        },
      });

      if (existingAuthor) {
        throw new ConflictException('Ya existe un autor con este nombre');
      }
    }

    await author.update(updateAuthorDto);
    return author;
  }

  async remove(id: string): Promise<void> {
    const author = await this.findOne(id);
    await author.destroy();
  }

  async findByName(firstName: string, lastName: string): Promise<Author[]> {
    return this.authorModel.findAll({
      where: {
        [Op.or]: [
          {
            first_name: { [Op.iLike]: `%${firstName}%` },
            last_name: { [Op.iLike]: `%${lastName}%` },
          },
          {
            [Op.and]: [
              { first_name: { [Op.iLike]: `%${firstName}%` } },
              { last_name: { [Op.iLike]: `%${lastName}%` } },
            ],
          },
        ],
      },
      order: [
        ['last_name', 'ASC'],
        ['first_name', 'ASC'],
      ],
    });
  }
}
