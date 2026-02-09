import { Module } from '@nestjs/common';
import { DummyService } from './dummy.service';
import { DummyController } from './dummy.controller';
import { DummyRepository } from './dummy.repository';

@Module({
  controllers: [DummyController],
  providers: [DummyService, DummyRepository],
})
export class DummyModule {}
