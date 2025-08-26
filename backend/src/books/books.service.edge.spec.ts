import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { getModelToken } from '@nestjs/sequelize';
import { Book } from '../infrastructure/database/models/book.model';
import { Author } from '../infrastructure/database/models/author.model';
import { Publisher } from '../infrastructure/database/models/publisher.model';
import { Genre } from '../infrastructure/database/models/genre.model';
import { AuditService } from '../audit/audit.service';
import { CloudinaryService } from '../infrastructure/file-upload/cloudinary.service';
import { BadRequestException } from '@nestjs/common';

describe('BooksService edge cases', () => {
  let service: BooksService;

  const mockBookModel: Partial<Record<string, jest.Mock>> = {
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
  };

  const mockAuthor = { findByPk: jest.fn() };
  const mockPublisher = { findByPk: jest.fn() };
  const mockGenre = { findByPk: jest.fn() };
  const mockAudit = { log: jest.fn() };
  const mockCloud = { uploadImage: jest.fn(), deleteImage: jest.fn() };

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

  it('validateRelations throws when publisher missing', async () => {
    const dto: any = { publisher_id: 'p-x' };
    (mockPublisher.findByPk as jest.Mock).mockResolvedValue(null);
    await expect(service['validateRelations'](dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('validateRelations throws when genre missing', async () => {
    const dto: any = { genre_id: 'g-x' };
    (mockGenre.findByPk as jest.Mock).mockResolvedValue(null);
    await expect(service['validateRelations'](dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('exportToCsv returns headers only when no books', async () => {
    (mockBookModel.findAndCountAll as jest.Mock).mockResolvedValue({
      rows: [],
      count: 0,
    });
    const csv = await service.exportToCsv({} as any);
    expect(csv).toContain('ID,Title,ISBN');
    // only header line
    expect(csv.split('\n').length).toBe(1);
  });

  it('uploadImage maps cloudinary errors to BadRequestException and deletes previous image', async () => {
    const bookId = 'b-1';
    const file = {
      buffer: Buffer.from('x'),
      originalname: 't.png',
      mimetype: 'image/png',
    } as Express.Multer.File;

    const bookInstance: any = {
      id: bookId,
      image_url: 'http://old.jpg',
      update: jest.fn(),
      toJSON: () => ({ id: bookId }),
    };

    jest.spyOn(service, 'findOne').mockResolvedValueOnce(bookInstance);
    // simulate deleteImage called for previous image
    (mockCloud.deleteImage as jest.Mock).mockResolvedValue(undefined);
    // simulate uploadImage throwing an error with message that should map
    (mockCloud.uploadImage as jest.Mock).mockRejectedValue(
      new Error('Error uploading to Cloudinary: Invalid image format'),
    );

    await expect(
      service.uploadImage(bookId, file, 'u1'),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(mockCloud.deleteImage).toHaveBeenCalledWith('http://old.jpg');
    expect(mockCloud.uploadImage).toHaveBeenCalledWith(file, 'books');
  });
});
