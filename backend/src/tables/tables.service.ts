import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { QrTokenService } from '../qr-token/qr-token.service';
@Injectable()
export class TablesService {
  constructor(
    private prisma: PrismaService,
    private qrTokenService: QrTokenService,
  ) {}

  async create(createTableDto: CreateTableDto) {
    // Check duplicate table_number
    const existed = await this.prisma.tables.findUnique({
      where: { table_number: createTableDto.table_number },
    });
    if (existed) throw new BadRequestException('Số bàn này đã tồn tại!');
    // Bước 1: Tạo bàn (chưa có QR)
    const table = await this.prisma.tables.create({
      data: { ...createTableDto, status: 'active' },
    });
    // Bước 2: Tự động sinh QR token
    const token = this.qrTokenService.generateQrToken(table.id);
    // Bước 3: Lưu token vào DB
    const updatedTable = await this.prisma.tables.update({
      where: { id: table.id },
      data: {
        qr_token: token,
        qr_token_created_at: new Date(),
      },
    });
    // Bước 4: Return kèm URL đầy đủ
    return {
      ...updatedTable,
      qr_url: this.qrTokenService.generateQrUrl(table.id, token),
    };
  }

  findAll(status?: string, location?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (location) where.location = location;
    return this.prisma.tables.findMany({
      where,
      orderBy: { table_number: 'asc' },
    });
  }

  async findOne(id: string) {
    const table = await this.prisma.tables.findUnique({ where: { id } });

    if (!table) {
      throw new NotFoundException('Không tìm thấy bàn');
    }

    return table;
  }

  update(id: string, dto: UpdateTableDto) {
    return this.prisma.tables.update({ where: { id }, data: dto });
  }

  async softDelete(id: string) {
    // Soft delete by setting status to 'inactive'
    return this.prisma.tables.update({
      where: { id },
      data: { status: 'inactive' },
    });
  }

  async generateQrCode(id: string) {
    const table = await this.findOne(id); // Check bàn tồn tại
    const token = this.qrTokenService.generateQrToken(table.id);

    const updated = await this.prisma.tables.update({
      where: { id },
      data: {
        qr_token: token,
        qr_token_created_at: new Date(),
      },
    });
    return {
      ...updated,
      qr_url: this.qrTokenService.generateQrUrl(table.id, token),
    };
  }
  /**
   * Regenerate QR - Tạo token mới và invalidate token cũ
   */
  async regenerateQrCode(id: string) {
    // Logic giống generateQrCode - đè token cũ = tự động invalidate
    return this.generateQrCode(id);
  }
}
