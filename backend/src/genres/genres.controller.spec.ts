/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { Genre } from '../infrastructure/database/models/genre.model';

describe('GenresController', () => {
  let controller: GenresController;
  let mockGenresService: jest.Mocked<GenresService>;

  beforeEach(async () => {
    mockGenresService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<GenresService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenresController],
      providers: [
        {
          provide: GenresService,
          useValue: mockGenresService,
        },
      ],
    }).compile();

    controller = module.get<GenresController>(GenresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create calls service.create with dto', async () => {
    const dto: CreateGenreDto = { name: 'Ficción' };
    mockGenresService.create.mockResolvedValue({
      id: 'g1',
      ...dto,
    } as unknown as Genre);

    const res = await controller.create(dto);
    expect(mockGenresService.create).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ id: 'g1', ...dto });
  });

  it('findAll calls service.findAll without search', async () => {
    const pagination: PaginationDto = { page: 1, limit: 10 };
    mockGenresService.findAll.mockResolvedValue({
      genres: [{ id: 'g1', name: 'Ficción' } as unknown as Genre],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        pages: 1,
        hasNext: false,
        hasPrev: false,
      },
    });

    const res = await controller.findAll(pagination);
    expect(mockGenresService.findAll).toHaveBeenCalledWith(
      pagination,
      undefined,
    );
    expect(res.genres).toEqual([{ id: 'g1', name: 'Ficción' }]);
    expect(res.pagination.total).toBe(1);
  });

  it('findAll calls service.findAll with search', async () => {
    const pagination: PaginationDto = { page: 1, limit: 10 };
    mockGenresService.findAll.mockResolvedValue({
      genres: [{ id: 'g2', name: 'No Ficción' } as unknown as Genre],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        pages: 1,
        hasNext: false,
        hasPrev: false,
      },
    });

    const res = await controller.findAll(pagination, 'No');
    expect(mockGenresService.findAll).toHaveBeenCalledWith(pagination, 'No');
    expect(res.genres).toEqual([{ id: 'g2', name: 'No Ficción' }]);
    expect(res.pagination.total).toBe(1);
  });

  it('findOne calls service.findOne with id', async () => {
    mockGenresService.findOne.mockResolvedValue({
      id: 'g1',
      name: 'Ficción',
    } as unknown as Genre);

    const res = await controller.findOne('g1');
    expect(mockGenresService.findOne).toHaveBeenCalledWith('g1');
    expect(res).toEqual({ id: 'g1', name: 'Ficción' });
  });

  it('update calls service.update with id and dto', async () => {
    const dto: UpdateGenreDto = {
      name: 'Ficción Actualizada',
    } as UpdateGenreDto;
    mockGenresService.update.mockResolvedValue({
      id: 'g1',
      ...dto,
    } as unknown as Genre);

    const res = await controller.update('g1', dto);
    expect(mockGenresService.update).toHaveBeenCalledWith('g1', dto);
    expect(res).toEqual({ id: 'g1', ...dto });
  });

  it('remove calls service.remove with id', async () => {
    mockGenresService.remove.mockResolvedValue(undefined);

    const res = await controller.remove('g1');
    expect(mockGenresService.remove).toHaveBeenCalledWith('g1');
    expect(res).toBeUndefined();
  });
});
