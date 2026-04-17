import { ApiProperty } from '@nestjs/swagger';

export class AuthTokenResponseDto {
  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6ImFsZXhAZXhhbXBsZS5jb20iLCJmaXJzdE5hbWUiOiJBbGV4IiwibGFzdE5hbWUiOiJTbWl0aCIsImlhdCI6MTcxMzM1MDAwMCwiZXhwIjoxNzEzMzUzNjAwfQ.example-signature',
  })
  accessToken: string;

  @ApiProperty({ example: '3600' })
  expiresIn: string;
}
