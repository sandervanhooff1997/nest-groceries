import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class IssueTokenDto {
  @ApiProperty({
    description: 'MongoDB user identifier to embed in the token subject',
    example: '507f1f77bcf86cd799439011',
  })
  @Transform(({ value }) => trimString(value))
  @IsMongoId()
  userId: string;

  @ApiProperty({ example: 'alex@example.com' })
  @Transform(({ value }) => trimString(value))
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Alex' })
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;
}
