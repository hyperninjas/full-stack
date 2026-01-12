import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '../generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool, PoolConfig } from 'pg';
import 'dotenv/config';

/**
 * Prisma Service with Enhanced Connection Pooling
 * - Configurable min/max connections
 * - Proper lifecycle management
 * - Connection error handling
 * - Health check integration
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private pool: Pool;

  constructor() {
    // Get connection pool configuration
    const poolMin = parseInt(process.env.DATABASE_POOL_MIN || '5', 10);
    const poolMax = parseInt(process.env.DATABASE_POOL_MAX || '20', 10);
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Configure connection pool
    const poolConfig: PoolConfig = {
      connectionString,
      min: poolMin,
      max: poolMax,
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established
    };

    // Create pool and adapter before calling super()
    const pool = new Pool(poolConfig);
    const adapter = new PrismaPg(pool);
    super({ adapter });

    // Now we can assign to this.pool
    this.pool = pool;

    // Handle pool errors
    this.pool.on('error', (err) => {
      this.logger.error('Unexpected database pool error:', err);
    });

    // Handle pool connection events
    this.pool.on('connect', () => {
      this.logger.debug('New database connection established');
    });

    this.pool.on('remove', () => {
      this.logger.debug('Database connection removed from pool');
    });

    this.logger.log(
      `Database connection pool initialized (min: ${poolMin}, max: ${poolMax})`,
    );
  }

  async onModuleInit() {
    try {
      // Test connection on module initialization
      await this.$connect();
      this.logger.log('Database connection established successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      // Close Prisma connection first (this may close the pool)
      await this.$disconnect();

      // Only close pool if it exists
      // $disconnect() might have already closed it, so we catch the error
      if (this.pool) {
        try {
          await this.pool.end();
        } catch (poolError) {
          // Ignore errors if pool is already closed
          if (
            poolError instanceof Error &&
            poolError.message.includes('Called end on pool more than once')
          ) {
            this.logger.debug(
              'Pool already closed, ignoring duplicate close attempt',
            );
          } else {
            throw poolError;
          }
        }
      }

      this.logger.log('Database connections closed successfully');
    } catch (error) {
      this.logger.error('Error closing database connections:', error);
    }
  }

  /**
   * Get pool statistics for monitoring
   */
  getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }
}

const prisma = new PrismaService();
export default prisma;
