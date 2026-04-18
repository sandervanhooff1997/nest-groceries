import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsMongoId, IsOptional } from 'class-validator';

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
}
