import { Injectable } from '@nestjs/common';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
// archiver's ESM/CJS interop can be flaky with namespace imports in TS builds
// so require it at runtime to get a callable function
// eslint-disable-next-line @typescript-eslint/no-var-requires
const archiver = require('archiver');
import type { Response } from 'express';

// Giả lập kiểu dữ liệu Table (lấy từ module của TV1)
interface TableMock {
  id: string;
  table_number: string;
  qr_token: string; // Token hoặc URL đầy đủ
}

@Injectable()
export class QrExportService {
  // 1. Tạo 1 file PDF cho 1 bàn
  async generateTablePdf(table: TableMock, res: Response) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Thiết lập Header phản hồi để trình duyệt hiểu là file PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Table-${table.table_number}.pdf`,
    });

    doc.pipe(res); // Ghi dữ liệu trực tiếp vào response

    // --- Vẽ nội dung PDF ---
    // Logo hoặc Tiêu đề
    doc.fontSize(25).text('Smart Restaurant', { align: 'center' });
    doc.moveDown();

    // Số bàn
    doc.fontSize(20).text(`Table: ${table.table_number}`, { align: 'center' });
    doc.moveDown();

    // Sinh ảnh QR từ token
    // Lưu ý: Token này phải là URL đầy đủ (ví dụ: https://domain.com/menu?...)
    const qrDataUrl = await QRCode.toDataURL(table.qr_token, { width: 300 });

    // Chèn ảnh QR vào giữa trang
    doc.image(qrDataUrl, (doc.page.width - 300) / 2, 150, { width: 300 });

    // Hướng dẫn
    doc.moveDown(12);
    doc
      .fontSize(14)
      .text('Quét mã để gọi món / Scan to order', { align: 'center' });

    doc.end();
  }

  // 2. Tạo file ZIP chứa tất cả QR Code (dạng ảnh PNG)
  async generateAllQrZip(tables: TableMock[], res: Response) {
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Nén mức cao nhất
    });

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename=All-QR-Codes.zip',
    });

    archive.pipe(res);

    // Duyệt qua danh sách bàn và thêm file vào zip
    for (const table of tables) {
      // Tạo buffer ảnh PNG từ token
      const buffer = await QRCode.toBuffer(table.qr_token, { width: 500 });

      // Thêm vào file zip với tên: Table-1.png
      archive.append(buffer, { name: `Table-${table.table_number}.png` });
    }

    await archive.finalize();
  }
}
