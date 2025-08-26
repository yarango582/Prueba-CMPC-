import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Publisher } from '../infrastructure/database/models/publisher.model';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { Op } from 'sequelize';

@Injectable()
export class PublishersService {
  constructor(
    @InjectModel(Publisher)
    private publisherModel: typeof Publisher,
  ) {}

  async create(createPublisherDto: CreatePublisherDto): Promise<Publisher> {
    const existingPublisher = await this.publisherModel.findOne({
      where: { name: createPublisherDto.name },
    });

    if (existingPublisher) {
      throw new ConflictException('Ya existe una editorial con este nombre');
    }

    return this.publisherModel.create({ ...createPublisherDto });
  }

  async findAll(paginationDto: PaginationDto, search?: string) {
    const { page = 1, limit = 10 } = paginationDto;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: publishers, count: total } =
      await this.publisherModel.findAndCountAll({
        where,
        order: [['name', 'ASC']],
        limit,
        offset,
      });

    return {
      publishers,
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

  async findOne(id: string): Promise<Publisher> {
    const publisher = await this.publisherModel.findByPk(id);
    if (!publisher) {
      throw new NotFoundException(`Publisher with ID ${id} not found`);
    }
    return publisher;
  }

  async update(
    id: string,
    updatePublisherDto: UpdatePublisherDto,
  ): Promise<Publisher> {
    const publisher = await this.findOne(id);

    if (updatePublisherDto.name) {
      const existingPublisher = await this.publisherModel.findOne({
        where: {
          id: { [Op.ne]: id },
          name: updatePublisherDto.name,
        },
      });

      if (existingPublisher) {
        throw new ConflictException('Ya existe una editorial con este nombre');
      }
    }

    await publisher.update(updatePublisherDto);
    return publisher;
  }

  async remove(id: string): Promise<void> {
    const publisher = await this.findOne(id);
    await publisher.destroy();
  }
}
