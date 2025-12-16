import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateTableDto {
  @IsString()
  table_number: string;

  @IsInt()
  @Min(1)
  @Max(20)
  capacity: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
