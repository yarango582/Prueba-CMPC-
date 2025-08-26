import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book } from '../infrastructure/database/models/book.model';
import { Author } from '../infrastructure/database/models/author.model';
import { Publisher } from '../infrastructure/database/models/publisher.model';
import { Genre } from '../infrastructure/database/models/genre.model';
import { AuditModule } from '../audit/audit.module';
import { FileUploadModule } from '../infrastructure/file-upload/file-upload.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Book, Author, Publisher, Genre]),
    AuditModule,
    FileUploadModule,
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
