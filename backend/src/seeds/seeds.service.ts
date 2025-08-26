import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User, UserRole } from '../infrastructure/database/models/user.model';
import { Author } from '../infrastructure/database/models/author.model';
import { Publisher } from '../infrastructure/database/models/publisher.model';
import { Genre } from '../infrastructure/database/models/genre.model';
import { Book } from '../infrastructure/database/models/book.model';
import * as bcrypt from 'bcryptjs';
import { CloudinaryService } from '../infrastructure/file-upload/cloudinary.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedsService {
  private readonly logger = new Logger(SeedsService.name);
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Author) private authorModel: typeof Author,
    @InjectModel(Publisher) private publisherModel: typeof Publisher,
    @InjectModel(Genre) private genreModel: typeof Genre,
    @InjectModel(Book) private bookModel: typeof Book,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async seedIfNeeded() {
    const seedFlag = process.env.SEED_DB === 'true';
    if (!seedFlag) return;

    // If SEED_DB is true, ensure a fresh DB: truncate known tables (safe with CASCADE)
    const sequelize = this.userModel.sequelize;
    if (sequelize) {
      try {
        this.logger.log(
          'SEED_DB=true — truncating existing tables before seeding',
        );
        // Truncate in one statement with RESTART IDENTITY to reset serials
        await sequelize.query(
          `TRUNCATE TABLE "book_inventory_logs", "audit_logs", "books", "authors", "publishers", "genres", "users" RESTART IDENTITY CASCADE;`,
        );
      } catch (err: any) {
        this.logger.warn(
          'Could not truncate tables before seeding:',
          String(err),
        );
      }
    }

    this.logger.log('Seeding database with sample data...');

    // Create users
    const pass = await bcrypt.hash('password123', 12);
    const user = this.userModel.build({
      email: 'user@example.com',
      password: pass,
      first_name: 'Usuario',
      last_name: 'Normal',
      role: UserRole.USER,
    });
    await user.save();

    const admin = this.userModel.build({
      email: 'admin@example.com',
      password: pass,
      first_name: 'Admin',
      last_name: 'CMPC',
      role: UserRole.ADMIN,
    });
    await admin.save();

    // Publishers
    const publishersData = [
      { name: 'Debolsillo' },
      { name: 'Alfaguara' },
      { name: 'Planeta' },
    ];
    const publishers: Publisher[] = [];
    for (const p of publishersData) {
      const pub = this.publisherModel.build(p);
      await pub.save();
      publishers.push(pub);
    }

    // Genres
    const genresData = [
      { name: 'Literatura y Ficción' },
      { name: 'Fantasía' },
      { name: 'Ciencia' },
      { name: 'Historia' },
      { name: 'Infantil' },
      { name: 'Poesía' },
    ];
    const genres: Genre[] = [];
    for (const g of genresData) {
      const ge = this.genreModel.build(g);
      await ge.save();
      genres.push(ge);
    }

    // Authors
    const authorsData = [
      { first_name: 'Gabriel', last_name: 'Garcia Marquez' },
      { first_name: 'J.K.', last_name: 'Rowling' },
      { first_name: 'Isaac', last_name: 'Asimov' },
      { first_name: 'George', last_name: 'Orwell' },
      { first_name: 'Laura', last_name: 'Esquivel' },
      { first_name: 'Pablo', last_name: 'Neruda' },
    ];
    const authors: Author[] = [];
    for (const a of authorsData) {
      const au = this.authorModel.build(a);
      await au.save();
      authors.push(au);
    }

    // Books (15)
    const imagesDir = path.resolve(process.cwd(), 'assets', 'images');
    const imageFiles = fs.existsSync(imagesDir)
      ? fs
          .readdirSync(imagesDir)
          .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
      : [];

    for (let i = 0; i < 15; i++) {
      const title = `Libro de prueba ${i + 1}`;
      const author = authors[i % authors.length];
      const publisher = publishers[i % publishers.length];
      const genre = genres[i % genres.length];
      const imageFile = imageFiles[i % (imageFiles.length || 1)];

      let imageUrl = '';
      if (imageFile) {
        try {
          const filePath = path.join(imagesDir, imageFile);
          const buffer = fs.readFileSync(filePath);
          // Emulate Express.Multer.File minimally for CloudinaryService
          const fakeFile = {
            buffer,
            originalname: imageFile,
          } as unknown as Express.Multer.File;
          imageUrl = await this.cloudinary.uploadImage(fakeFile, 'books');
        } catch (err: any) {
          this.logger.warn(
            'Cloudinary upload failed, using local path',
            String(err),
          );
          imageUrl = `/assets/images/${imageFile}`;
        }
      }

      const book = this.bookModel.build({
        title,
        price: 15000 + i * 500,
        author_id: author.id,
        publisher_id: publisher.id,
        genre_id: genre.id,
        isbn: `978-1-23${i}`,
        pages: 100 + i * 10,
        language: 'Español',
        summary: `Resumen de ${title}`,
        description: `Descripción larga de ${title}`,
        image_url: imageUrl,
        stock_quantity: 5 + i,
        is_available: true,
        publication_date: new Date(1990 + (i % 30), 0, 1).toISOString(),
      });
      await book.save();
    }

    this.logger.log(`Seeding complete — users: ${user.email} / ${admin.email}`);
  }
}
