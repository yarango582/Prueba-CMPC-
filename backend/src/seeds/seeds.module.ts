import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../infrastructure/database/models/user.model';
import { Author } from '../infrastructure/database/models/author.model';
import { Publisher } from '../infrastructure/database/models/publisher.model';
import { Genre } from '../infrastructure/database/models/genre.model';
import { Book } from '../infrastructure/database/models/book.model';
import { SeedsService } from './seeds.service';
import { FileUploadModule } from '../infrastructure/file-upload/file-upload.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Author, Publisher, Genre, Book]),
    FileUploadModule,
  ],
  providers: [SeedsService],
  exports: [SeedsService],
})
export class SeedsModule {}
