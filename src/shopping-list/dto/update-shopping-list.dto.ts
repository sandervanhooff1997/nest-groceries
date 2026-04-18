import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { GroceryItemUnit } from '../enums/grocery-item-unit.enum';

class UpdateGroceryItemDto {
  @ApiPropertyOptional({ example: 'Milk' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({
    example: GroceryItemUnit.LITER,
    enum: GroceryItemUnit,
  })
  @IsOptional()
  @IsEnum(GroceryItemUnit)
  unit?: GroceryItemUnit;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  purchased?: boolean;
}

export class UpdateShoppingListDto {
  @ApiPropertyOptional({ example: 'Weekend groceries' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ type: () => UpdateGroceryItemDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateGroceryItemDto)
  items?: UpdateGroceryItemDto[];
}
