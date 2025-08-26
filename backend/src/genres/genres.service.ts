import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Genre } from '../infrastructure/database/models/genre.model';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { Op } from 'sequelize';

@Injectable()
export class GenresService {
  constructor(
    @InjectModel(Genre)
    private genreModel: typeof Genre,
  ) {}

  async create(createGenreDto: CreateGenreDto): Promise<Genre> {
    const existingGenre = await this.genreModel.findOne({
      where: { name: createGenreDto.name },
    });

    if (existingGenre) {
      throw new ConflictException('Ya existe un género con este nombre');
    }

    return this.genreModel.create({ ...createGenreDto });
  }

  async findAll(paginationDto: PaginationDto, search?: string) {
    const { page = 1, limit = 10 } = paginationDto;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: genres, count: total } =
      await this.genreModel.findAndCountAll({
        where,
        order: [['name', 'ASC']],
        limit,
        offset,
      });

    return {
      genres,
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

  async findOne(id: string): Promise<Genre> {
    const genre = await this.genreModel.findByPk(id);
    if (!genre) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }
    return genre;
  }

  async update(id: string, updateGenreDto: UpdateGenreDto): Promise<Genre> {
    const genre = await this.findOne(id);

    if (updateGenreDto.name) {
      const existingGenre = await this.genreModel.findOne({
        where: {
          id: { [Op.ne]: id },
          name: updateGenreDto.name,
        },
      });

      if (existingGenre) {
        throw new ConflictException('Ya existe un género con este nombre');
      }
    }

    await genre.update(updateGenreDto);
    return genre;
  }

  async remove(id: string): Promise<void> {
    const genre = await this.findOne(id);
    await genre.destroy();
  }
}
