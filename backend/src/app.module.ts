import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { AuthorsModule } from './authors/authors.module';
import { PublishersModule } from './publishers/publishers.module';
import { GenresModule } from './genres/genres.module';
import { AuditModule } from './audit/audit.module';
import { SharedModule } from './shared/shared.module';
import { FileUploadModule } from './infrastructure/file-upload/file-upload.module';
import { LoggingModule } from './infrastructure/logging/logging.module';
import { SeedsModule } from './seeds/seeds.module';
// Models
import { User } from './infrastructure/database/models/user.model';
import { Book } from './infrastructure/database/models/book.model';
import { Author } from './infrastructure/database/models/author.model';
import { Publisher } from './infrastructure/database/models/publisher.model';
import { Genre } from './infrastructure/database/models/genre.model';
import { AuditLog } from './infrastructure/database/models/audit-log.model';
import { BookInventoryLog } from './infrastructure/database/models/book-inventory-log.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'cmpc_user',
      password: process.env.DATABASE_PASSWORD || 'cmpc_password',
      database: process.env.DATABASE_NAME || 'cmpc_libros',
      autoLoadModels: true,
      synchronize: true,
      models: [
        User,
        Book,
        Author,
        Publisher,
        Genre,
        AuditLog,
        BookInventoryLog,
      ],
    }),
    AuthModule,
    UsersModule,
    BooksModule,
    AuthorsModule,
    PublishersModule,
    GenresModule,
    AuditModule,
    SharedModule,
    FileUploadModule,
    LoggingModule,
    SeedsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
