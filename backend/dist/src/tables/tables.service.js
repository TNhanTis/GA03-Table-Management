"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TablesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TablesService = class TablesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTableDto) {
        const existingTable = await this.prisma.table.findUnique({
            where: { table_number: createTableDto.table_number },
        });
        if (existingTable) {
            throw new common_1.ConflictException(`Table with number ${createTableDto.table_number} already exists`);
        }
        return await this.prisma.table.create({
            data: {
                ...createTableDto,
                status: 'active',
            },
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.location) {
            where.location = filters.location;
        }
        const sortBy = filters?.sortBy || 'table_number';
        const sortOrder = filters?.sortOrder || 'asc';
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        return await this.prisma.table.findMany({
            where,
            orderBy,
        });
    }
    async findOne(id) {
        const table = await this.prisma.table.findUnique({
            where: { id },
        });
        if (!table) {
            throw new common_1.NotFoundException(`Table with ID ${id} not found`);
        }
        return table;
    }
    async update(id, updateTableDto) {
        await this.findOne(id);
        if (updateTableDto.table_number) {
            const existingTable = await this.prisma.table.findUnique({
                where: { table_number: updateTableDto.table_number },
            });
            if (existingTable && existingTable.id !== id) {
                throw new common_1.ConflictException(`Table with number ${updateTableDto.table_number} already exists`);
            }
        }
        return await this.prisma.table.update({
            where: { id },
            data: updateTableDto,
        });
    }
    async updateStatus(id, status) {
        await this.findOne(id);
        return await this.prisma.table.update({
            where: { id },
            data: { status },
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.table.delete({
            where: { id },
        });
    }
    async getLocations() {
        const tables = await this.prisma.table.findMany({
            where: {
                location: {
                    not: null,
                },
            },
            select: {
                location: true,
            },
            distinct: ['location'],
        });
        return tables.map((t) => t.location).filter((loc) => loc !== null);
    }
};
exports.TablesService = TablesService;
exports.TablesService = TablesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TablesService);
//# sourceMappingURL=tables.service.js.map