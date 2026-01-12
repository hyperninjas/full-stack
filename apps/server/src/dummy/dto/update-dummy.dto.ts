import { PartialType } from '@nestjs/swagger';
import { CreateDummyDto } from './create-dummy.dto';

export class UpdateDummyDto extends PartialType(CreateDummyDto) {}
