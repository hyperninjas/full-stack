import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  HealthCheckError,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @AllowAnonymous()
  @HealthCheck()
  async check() {
    const x = await this.prisma.user.findMany();
    console.log(x);
    return this.health.check([
      () =>
        this.http.pingCheck(
          'server',
          'http://localhost:4000/api/auth/reference',
        ),
      () => this.checkDatabase(),
    ]);
  }

  private async checkDatabase(): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$executeRawUnsafe('SELECT 1');
      return { database: { status: 'up' } };
    } catch (error) {
      throw new HealthCheckError('Database check failed', error as Error);
    }
  }
}
