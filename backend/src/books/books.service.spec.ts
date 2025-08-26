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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getModelToken(Book),
          useValue: mockBookModel,
        },
        {
          provide: getModelToken(Author),
          useValue: { findByPk: jest.fn() },
        },
        {
          provide: getModelToken(Publisher),
          useValue: { findByPk: jest.fn() },
        },
        {
          provide: getModelToken(Genre),
          useValue: { findByPk: jest.fn() },
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
      expect(mockBookModel.findByPk).toHaveBeenCalledWith('1', {
        include: ['author', 'publisher', 'genre'],
      });
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
});
