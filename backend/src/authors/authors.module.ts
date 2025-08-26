import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';
import { Author } from '../infrastructure/database/models/author.model';

@Module({
  imports: [SequelizeModule.forFeature([Author])],
  controllers: [AuthorsController],
  providers: [AuthorsService],
  exports: [AuthorsService],
})
export class AuthorsModule {}
