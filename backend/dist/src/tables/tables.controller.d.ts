import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
export declare class TablesController {
    private readonly tablesService;
    constructor(tablesService: TablesService);
    create(createTableDto: CreateTableDto): Promise<{
        id: string;
        table_number: string;
        capacity: number;
        location: string | null;
        description: string | null;
        status: string;
        qr_token: string | null;
        qr_token_created_at: Date | null;
        created_at: Date;
        updated_at: Date;
    }>;
    findAll(status?: string, location?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        id: string;
        table_number: string;
        capacity: number;
        location: string | null;
        description: string | null;
        status: string;
        qr_token: string | null;
        qr_token_created_at: Date | null;
        created_at: Date;
        updated_at: Date;
    }[]>;
    getLocations(): Promise<string[]>;
    findOne(id: string): Promise<{
        id: string;
        table_number: string;
        capacity: number;
        location: string | null;
        description: string | null;
        status: string;
        qr_token: string | null;
        qr_token_created_at: Date | null;
        created_at: Date;
        updated_at: Date;
    }>;
    update(id: string, updateTableDto: UpdateTableDto): Promise<{
        id: string;
        table_number: string;
        capacity: number;
        location: string | null;
        description: string | null;
        status: string;
        qr_token: string | null;
        qr_token_created_at: Date | null;
        created_at: Date;
        updated_at: Date;
    }>;
    updateStatus(id: string, updateStatusDto: UpdateStatusDto): Promise<{
        id: string;
        table_number: string;
        capacity: number;
        location: string | null;
        description: string | null;
        status: string;
        qr_token: string | null;
        qr_token_created_at: Date | null;
        created_at: Date;
        updated_at: Date;
    }>;
    remove(id: string): Promise<void>;
}
