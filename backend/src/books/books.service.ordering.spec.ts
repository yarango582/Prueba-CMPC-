import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { getModelToken } from '@nestjs/sequelize';
import { Book } from '../infrastructure/database/models/book.model';
import { Author } from '../infrastructure/database/models/author.model';
import { Publisher } from '../infrastructure/database/models/publisher.model';
import { Genre } from '../infrastructure/database/models/genre.model';
import { AuditService } from '../audit/audit.service';
import { CloudinaryService } from '../infrastructure/file-upload/cloudinary.service';

describe('BooksService ordering', () => {
  let service: BooksService;

  const mockBookModel: Partial<Record<string, jest.Mock>> = {
    findAndCountAll: jest.fn(),
  };

  const mockAuthor = {};
  const mockPublisher = {};
  const mockGenre = {};
  const mockAudit = { log: jest.fn() };
  const mockCloud = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: getModelToken(Book), useValue: mockBookModel },
        { provide: getModelToken(Author), useValue: mockAuthor },
        { provide: getModelToken(Publisher), useValue: mockPublisher },
        { provide: getModelToken(Genre), useValue: mockGenre },
        { provide: AuditService, useValue: mockAudit },
        { provide: CloudinaryService, useValue: mockCloud },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    jest.clearAllMocks();
  });

  it('uses author ordering when sort_by=author', async () => {
    (mockBookModel.findAndCountAll as jest.Mock).mockResolvedValue({
      rows: [],
      count: 0,
    });

    await service.findAll({ sort_by: 'author', sort_order: 'ASC' });

    expect(mockBookModel.findAndCountAll).toHaveBeenCalled();
    const opts = (mockBookModel.findAndCountAll as jest.Mock).mock.calls[0][0];
    expect(opts).toBeDefined();
    expect(Array.isArray(opts.order)).toBe(true);
    // order for author is [[{ model: Author, as: 'author' }, 'last_name', 'ASC']]
    const first = opts.order[0];
    expect(first[0]).toEqual(expect.objectContaining({ as: 'author' }));
    expect(first[2]).toBe('ASC');
  });

  it('uses publisher ordering when sort_by=publisher', async () => {
    (mockBookModel.findAndCountAll as jest.Mock).mockResolvedValue({
      rows: [],
      count: 0,
    });

    await service.findAll({ sort_by: 'publisher', sort_order: 'DESC' } as any);

    const opts = (mockBookModel.findAndCountAll as jest.Mock).mock.calls[0][0];
    const first = opts.order[0];
    expect(first[0]).toEqual(expect.objectContaining({ as: 'publisher' }));
    expect(first[2]).toBe('DESC');
  });

  it('maps field names to table columns for literal ordering (title)', async () => {
    (mockBookModel.findAndCountAll as jest.Mock).mockResolvedValue({
      rows: [],
      count: 0,
    });

    await service.findAll({ sort_by: 'title', sort_order: 'ASC' } as any);

    const opts = (mockBookModel.findAndCountAll as jest.Mock).mock.calls[0][0];
    expect(opts.order).toBeDefined();
    // For literal ordering the first element should NOT be an array (unlike author/publisher ordering)
    expect(Array.isArray(opts.order[0])).toBe(false);
    expect(opts.order[0]).toBeDefined();
  });
});
