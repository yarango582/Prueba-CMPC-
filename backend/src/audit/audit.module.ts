import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuditService } from './audit.service';
import { AuditLog } from '../infrastructure/database/models/audit-log.model';
import { BookInventoryLog } from '../infrastructure/database/models/book-inventory-log.model';

@Module({
  imports: [SequelizeModule.forFeature([AuditLog, BookInventoryLog])],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
