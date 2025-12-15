import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { QrExportService } from './qr-export.service';

@Controller('tables/qr')
export class QrExportController {
  constructor(private readonly qrExportService: QrExportService) {}

  // API Download PDF của 1 bàn
  @Get(':id/download-pdf')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    // [TODO]: Gọi Service của TV1 để lấy thông tin bàn từ DB theo ID
    // Ở đây mình Mock dữ liệu giả
    const mockTable = {
      id: id,
      table_number: '10',
      qr_token: `http://localhost:5173/menu?table=${id}&token=xyz123`,
    };

    return this.qrExportService.generateTablePdf(mockTable, res);
  }

  // API Download ZIP tất cả bàn
  @Get('download-all-zip')
  async downloadAllZip(@Res() res: Response) {
    // [TODO]: Gọi Service của TV1 để lấy danh sách tất cả bàn ACTIVE
    const mockTables = [
      { id: '1', table_number: '01', qr_token: 'URL_1' },
      { id: '2', table_number: '02', qr_token: 'URL_2' },
    ];

    return this.qrExportService.generateAllQrZip(mockTables, res);
  }
}
