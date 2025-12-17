import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { Table } from '@prisma/client';
export declare class TablesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTableDto: CreateTableDto): Promise<Table>;
    findAll(filters?: {
        status?: string;
        location?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<Table[]>;
    findOne(id: string): Promise<Table>;
    update(id: string, updateTableDto: UpdateTableDto): Promise<Table>;
    updateStatus(id: string, status: string): Promise<Table>;
    remove(id: string): Promise<void>;
    getLocations(): Promise<string[]>;
}
