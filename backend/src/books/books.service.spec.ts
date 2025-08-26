import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { BooksService } from './books.service';
import { Book } from '../infrastructure/database/models/book.model';
import { Author } from '../infrastructure/database/models/author.model';
import { Publisher } from '../infrastructure/database/models/publisher.model';
import { Genre } from '../infrastructure/database/models/genre.model';
import { AuditService } from '../audit/audit.service';
import { CloudinaryService } from '../infrastructure/file-upload/cloudinary.service';
import { NotFoundException } from '@nestjs/common';

describe('BooksService', () => {
  let service: BooksService;
  let bookModel: typeof Book;
  let auditService: AuditService;
  let cloudinaryService: CloudinaryService;
  let mockAuthor: any;
  let mockPublisher: any;
  let mockGenre: any;

  const mockBook = {
    id: '1',
    title: 'Test Book',
    isbn: '1234567890',
    price: 25.99,
    stock_quantity: 10,
    is_available: true,
    author_id: 'author-1',
    publisher_id: 'publisher-1',
    genre_id: 'genre-1',
    toJSON: jest.fn().mockReturnValue({}),
    update: jest.fn(),
    destroy: jest.fn(),
  };

  const mockBookModel = {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  const mockCloudinaryService = {
    uploadImage: jest.fn(),
    deleteImage: jest.fn(),
  };

  beforeEach(async () => {
    mockAuthor = { findByPk: jest.fn() };
    mockPublisher = { findByPk: jest.fn() };
    mockGenre = { findByPk: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getModelToken(Book),
          useValue: mockBookModel,
        },
        {
          provide: getModelToken(Author),
          useValue: mockAuthor,
        },
        {
          provide: getModelToken(Publisher),
          useValue: mockPublisher,
        },
        {
          provide: getModelToken(Genre),
          useValue: mockGenre,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    bookModel = module.get<typeof Book>(getModelToken(Book));
    auditService = module.get<AuditService>(AuditService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  // expose the injected mocks for tests
  mockAuthor = module.get(getModelToken(Author));
  mockPublisher = module.get(getModelToken(Publisher));
  mockGenre = module.get(getModelToken(Genre));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a book when found', async () => {
      mockBookModel.findByPk.mockResolvedValue(mockBook);

      const result = await service.findOne('1');

      expect(result).toEqual(mockBook);
      expect(mockBookModel.findByPk).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          include: expect.any(Array),
        }),
      );
    });

    it('should throw NotFoundException when book not found', async () => {
      mockBookModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadImage', () => {
    const mockFile = {
      buffer: Buffer.from('test'),
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    it('should upload image and update book', async () => {
      const newImageUrl = 'https://cloudinary.com/new-image.jpg';

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockBook as any)
        .mockResolvedValueOnce({ ...mockBook, image_url: newImageUrl } as any);

      mockCloudinaryService.uploadImage.mockResolvedValue(newImageUrl);
      mockCloudinaryService.deleteImage.mockResolvedValue(undefined);

      const result = await service.uploadImage('1', mockFile, 'user-1');

      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
        mockFile,
        'books',
      );
      expect(mockBook.update).toHaveBeenCalledWith({ image_url: newImageUrl });
      expect(auditService.log).toHaveBeenCalled();
      expect(result.image_url).toBe(newImageUrl);
    });
  });

  describe('validateRelations', () => {
    it('throws BadRequestException when author not found', async () => {
      const dto = { author_id: 'missing-author' } as any;
      (mockAuthor.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service['validateRelations'](dto)).rejects.toThrow();
    });
  });

  describe('exportToCsv', () => {
    it('returns csv string with headers and rows', async () => {
      const rowBook = {
        id: 'b1',
        title: 'T',
        isbn: 'i',
        author: { first_name: 'A', last_name: 'B' },
        publisher: { name: 'P' },
        genre: { name: 'G' },
        price: 10,
        stock_quantity: 2,
        is_available: true,
        publication_date: '2020-01-01',
        createdAt: '2020-01-02',
      };

      (mockBookModel.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: [rowBook],
        count: 1,
      });

      const csv = await service.exportToCsv({} as any);
      expect(csv).toContain('ID,Title,ISBN');
      expect(csv).toContain('b1');
    });
  });
});
