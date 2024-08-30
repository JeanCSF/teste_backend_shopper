import { IsString, IsOptional, Validate } from 'class-validator';
import { IsInCaseInsensitiveValidator } from '../validators/is-in-case-insensitive.validator';

export class ListMeasuresDto {
  readonly customerCode?: string;

  @IsOptional()
  @Validate(IsInCaseInsensitiveValidator, [['WATER', 'GAS']])
  measure_type?: string;
}
