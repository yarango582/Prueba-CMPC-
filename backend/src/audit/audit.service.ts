import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  AuditLog,
  AuditOperation,
} from '../infrastructure/database/models/audit-log.model';

export interface CreateAuditLogDto {
  table_name: string;
  record_id: string;
  operation: AuditOperation;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  user_id?: string;
  user_ip?: string;
  user_agent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog)
    private auditLogModel: typeof AuditLog,
  ) {}

  async log(data: CreateAuditLogDto): Promise<AuditLog> {
    return this.auditLogModel.create({ ...data });
  }

  async findByTableAndRecord(
    table_name: string,
    record_id: string,
  ): Promise<AuditLog[]> {
    return this.auditLogModel.findAll({
      where: { table_name, record_id },
      order: [['created_at', 'DESC']],
      include: ['user'],
    });
  }

  async findByUser(user_id: string, limit = 100): Promise<AuditLog[]> {
    return this.auditLogModel.findAll({
      where: { user_id },
      order: [['created_at', 'DESC']],
      limit,
    });
  }

  async findRecent(limit = 50): Promise<AuditLog[]> {
    return this.auditLogModel.findAll({
      order: [['created_at', 'DESC']],
      limit,
      include: ['user'],
    });
  }
}
