import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { GroceryItemUnit } from '../enums/grocery-item-unit.enum';

export class UpdateGroceryItemDto {
  @ApiPropertyOptional({ example: 'Milk' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ enum: GroceryItemUnit })
  @IsOptional()
  @IsEnum(GroceryItemUnit)
  unit?: GroceryItemUnit;
}
