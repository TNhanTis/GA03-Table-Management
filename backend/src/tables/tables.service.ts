import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  async create(createTableDto: CreateTableDto) {
    // Check duplicate table_number
    const existed = await this.prisma.tables.findUnique({
      where: { table_number: createTableDto.table_number },
    });
    if (existed) throw new BadRequestException('Số bàn này đã tồn tại!');

    return this.prisma.tables.create({ data: { ...createTableDto, status: 'active' } });
  }

  findAll(status?: string, location?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (location) where.location = location;
    return this.prisma.tables.findMany({ where, orderBy: { table_number: 'asc' } });
  }

  findOne(id: string) {
    return this.prisma.tables.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateTableDto) {
    return this.prisma.tables.update({ where: { id }, data: dto });
  }

  async softDelete(id: string) {
    // Soft delete by setting status to 'inactive'
    return this.prisma.tables.update({ where: { id }, data: { status: 'inactive' } });
  }
}
