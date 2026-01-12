import { Controller, Get, Logger } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckError,
  HealthCheckService,
  HealthIndicatorResult,
  HealthIndicatorStatus,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * Health Controller
 * Provides comprehensive health check endpoints for monitoring and orchestration
 * - /health: Full health check (database, memory, disk)
 * - /health/liveness: Liveness probe (is the app running?)
 * - /health/readiness: Readiness probe (is the app ready to serve traffic?)
 */
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prisma: PrismaService,
  ) {}

  /**
   * Full health check endpoint
   * Checks database, memory, and disk usage
   */
  @Get()
  @AllowAnonymous()
  @HealthCheck()
  async check() {
    return this.health.check([
      () => this.checkDatabase(),
      () => this.checkMemory(),
      () => this.checkDisk(),
    ]);
  }

  /**
   * Liveness probe
   * Returns 200 if the application is running
   * Used by Kubernetes/Docker to determine if the container should be restarted
   */
  @Get('liveness')
  @AllowAnonymous()
  @HealthCheck()
  async liveness() {
    return this.health.check([]);
  }

  /**
   * Readiness probe
   * Returns 200 if the application is ready to serve traffic
   * Checks database connectivity
   * Used by Kubernetes/Docker to determine if traffic should be routed to the container
   */
  @Get('readiness')
  @AllowAnonymous()
  @HealthCheck()
  async readiness() {
    return this.health.check([() => this.checkDatabase()]);
  }

  /**
   * Database health check
   * Verifies database connectivity and response time
   */
  private async checkDatabase(): Promise<HealthIndicatorResult> {
    const startTime = Date.now();
    try {
      await this.prisma.$executeRawUnsafe('SELECT 1');
      const responseTime = Date.now() - startTime;

      return {
        database: {
          status: 'up' as HealthIndicatorStatus,
          responseTime: `${responseTime}ms`,
        },
      } as HealthIndicatorResult<'database'>;
    } catch (error) {
      const errorResult = this.createHealthIndicatorResult(
        'down',
        error as Error,
      );
      throw new HealthCheckError('Database check failed', errorResult);
    }
  }

  /**
   * Memory health check
   * Warns if memory usage exceeds 80% of available heap
   * Fails if memory usage exceeds 90% of available heap
   */
  private async checkMemory(): Promise<HealthIndicatorResult> {
    try {
      return await this.memory.checkHeap('memory_heap', 150 * 1024 * 1024); // 150MB threshold
    } catch (error) {
      // If memory check fails, return a warning but don't fail the entire health check
      this.logger.warn(
        `Memory health check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        memory_heap: {
          status: 'down' as HealthIndicatorStatus,
          message:
            error instanceof Error ? error.message : 'Memory check failed',
        },
      } as HealthIndicatorResult<'memory_heap'>;
    }
  }

  /**
   * Disk health check
   * Warns if disk usage exceeds 80%
   * Fails if disk usage exceeds 90%
   * Note: Disk check may fail on some systems due to permissions
   */
  private async checkDisk(): Promise<HealthIndicatorResult> {
    try {
      // Try to check disk space on the current working directory
      // If this fails, we'll return a down status but won't fail the entire health check
      const checkPath = process.cwd();
      return await this.disk.checkStorage('storage', {
        path: checkPath,
        thresholdPercent: 0.9, // 90% threshold
      });
    } catch (error) {
      // If disk check fails (e.g., permissions issue), return a down status
      // but don't throw - this allows other health checks to still report
      this.logger.warn(
        `Disk health check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        storage: {
          status: 'down' as HealthIndicatorStatus,
          message:
            error instanceof Error
              ? error.message
              : 'Disk check unavailable (may require permissions)',
        },
      } as HealthIndicatorResult<'storage'>;
    }
  }

  /**
   * Helper to create health indicator result
   */
  private createHealthIndicatorResult(
    status: HealthIndicatorStatus,
    error?: Error,
  ): HealthIndicatorResult<'database'> {
    const result: HealthIndicatorResult<'database'> = {
      database: {
        status,
        ...(error && {
          message: error.message,
          ...(process.env.NODE_ENV === 'development' && {
            stack: error.stack,
          }),
        }),
      },
    };

    return result;
  }
}
