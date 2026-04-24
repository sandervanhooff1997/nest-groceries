import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GroceryItemUnit } from '../enums/grocery-item-unit.enum';

export class ItemOverrideDto {
  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  id: string;

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

export class DuplicateShoppingListDto {
  @ApiPropertyOptional({
    description:
      'Optional list of item IDs to duplicate. If omitted, all items are duplicated.',
    type: String,
    isArray: true,
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  itemIds?: string[];

  @ApiPropertyOptional({
    description: 'Per-item quantity/unit overrides applied during duplication.',
    type: () => ItemOverrideDto,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemOverrideDto)
  itemOverrides?: ItemOverrideDto[];
}
