import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../decorators/public.decorator';
import { AuthTokenResponseDto } from '../dto/auth-token-response.dto';
import { IssueTokenDto } from '../dto/issue-token.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('auth')
@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Issue a JWT access token for a validated user payload',
  })
  @ApiCreatedResponse({
    description: 'JWT access token issued successfully.',
    type: AuthTokenResponseDto,
  })
  async issueToken(
    @Body() issueTokenDto: IssueTokenDto,
  ): Promise<AuthTokenResponseDto> {
    return await this.authService.issueToken(issueTokenDto);
  }
}
