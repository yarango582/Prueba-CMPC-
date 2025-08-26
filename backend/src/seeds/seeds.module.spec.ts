import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { SeedsModule } from './seeds.module';
import { SeedsService } from './seeds.service';
import { CloudinaryService } from '../infrastructure/file-upload/cloudinary.service';
import { User } from '../infrastructure/database/models/user.model';
import { Author } from '../infrastructure/database/models/author.model';
import { Publisher } from '../infrastructure/database/models/publisher.model';
import { Genre } from '../infrastructure/database/models/genre.model';
import { Book } from '../infrastructure/database/models/book.model';

describe('SeedsModule', () => {
  it('compiles SeedsModule and provides SeedsService when models are mocked', async () => {
    const mockModel = {};
    const moduleRef = await Test.createTestingModule({
      imports: [SeedsModule],
    })
      .overrideProvider(getModelToken(User))
      .useValue(mockModel)
      .overrideProvider(getModelToken(Author))
      .useValue(mockModel)
      .overrideProvider(getModelToken(Publisher))
      .useValue(mockModel)
      .overrideProvider(getModelToken(Genre))
      .useValue(mockModel)
      .overrideProvider(getModelToken(Book))
      .useValue(mockModel)
      .overrideProvider('CLOUDINARY')
      .useValue({})
      .overrideProvider(CloudinaryService)
      .useValue({ uploadImage: jest.fn() })
      .compile();

    const svc = moduleRef.get<SeedsService>(SeedsService);
    expect(svc).toBeDefined();

    await moduleRef.close();
  });
});
