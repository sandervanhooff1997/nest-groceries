import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class ReorderGroceryItemsDto {
  @ApiProperty({
    description: 'All item IDs in the desired order (must include every item)',
    example: ['64b1f...', '64b2a...'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  itemIds: string[];
}
