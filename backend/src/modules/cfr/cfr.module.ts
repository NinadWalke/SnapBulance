import { Module } from '@nestjs/common';
import { CfrController } from './cfr.controller';
import { CfrService } from './cfr.service';

@Module({
  controllers: [CfrController],
  providers: [CfrService]
})
export class CfrModule {}
