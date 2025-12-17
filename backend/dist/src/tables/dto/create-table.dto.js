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
exports.CreateTableDto = void 0;
const class_validator_1 = require("class-validator");
class CreateTableDto {
    table_number;
    capacity;
    location;
    description;
}
exports.CreateTableDto = CreateTableDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Table number is required' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Table number must not exceed 50 characters' }),
    __metadata("design:type", String)
], CreateTableDto.prototype, "table_number", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'Capacity must be an integer' }),
    (0, class_validator_1.Min)(1, { message: 'Capacity must be at least 1' }),
    (0, class_validator_1.Max)(20, { message: 'Capacity must not exceed 20' }),
    __metadata("design:type", Number)
], CreateTableDto.prototype, "capacity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100, { message: 'Location must not exceed 100 characters' }),
    __metadata("design:type", String)
], CreateTableDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTableDto.prototype, "description", void 0);
//# sourceMappingURL=create-table.dto.js.map