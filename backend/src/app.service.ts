import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    // Trả về một Object JSON thay vì string
    return {
      message: 'Xin chào! Đây là dữ liệu từ NestJS Backend',
      status: 'success',
      timestamp: new Date().toISOString(),
    };
  }
}
