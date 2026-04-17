import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Connection } from 'mongoose';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  @ApiOperation({ summary: 'Check application health' })
  @ApiOkResponse({
    description: 'Returns application health status',
    schema: {
      example: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'ok',
        },
      },
    },
  })
  async checkHealth() {
    if (!this.connection.db) {
      throw new ServiceUnavailableException(
        'Database connection is unavailable',
      );
    }

    await this.connection.db.admin().ping();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'ok',
      },
    };
  }
}
