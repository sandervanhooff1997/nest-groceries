import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

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

  @ApiPropertyOptional({ example: 'liters' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  purchased?: boolean;
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
}
