import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class GroceryItemDto {
  @ApiProperty({ example: 'Milk' })
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

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  purchased?: boolean;

  @ApiPropertyOptional({ example: 'fruits_vegetables' })
  @IsOptional()
  @IsString()
  category?: string;
}

export class CreateShoppingListDto {
  @ApiProperty({ example: 'Weekly groceries' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: () => GroceryItemDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroceryItemDto)
  items: GroceryItemDto[];

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isTemplate?: boolean;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  @IsOptional()
  @IsString()
  fromTemplateId?: string;

  @ApiPropertyOptional({
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fromTemplateIds?: string[];
}
