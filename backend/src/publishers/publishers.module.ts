import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PublishersController } from './publishers.controller';
import { PublishersService } from './publishers.service';
import { Publisher } from '../infrastructure/database/models/publisher.model';

@Module({
  imports: [SequelizeModule.forFeature([Publisher])],
  controllers: [PublishersController],
  providers: [PublishersService],
  exports: [PublishersService],
})
export class PublishersModule {}
