import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export class InvalidatedRefreshTokenError extends Error {}

@Injectable()
export class RefreshTokenIdsStorage
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private redisClient: Redis;
  constructor(private configService: ConfigService) {}
  onApplicationBootstrap() {
    this.redisClient = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
    });
  }

  onApplicationShutdown(signal?: string) {
    return this.redisClient.quit();
  }

  async insert(user_id: number, tokenId: string): Promise<void> {
    await this.redisClient.set(this.getKey(user_id), tokenId);
  }

  async validate(user_id: number, tokenId: string): Promise<boolean> {
    const storedId = await this.redisClient.get(this.getKey(user_id));
    if (storedId !== tokenId) {
      throw new InvalidatedRefreshTokenError();
    }
    return storedId === tokenId;
  }

  async invalidate(user_id: number): Promise<void> {
    await this.redisClient.del(this.getKey(user_id));
  }

  private getKey(user_id: number): string {
    return `user-${user_id}`;
  }
}
