import {
  IsString,
  IsNotEmpty,
  IsISO8601,
  Validate,
} from 'class-validator';
import { Base64ImageValidator } from '../validators/base64-image.validator';
import { IsInCaseInsensitiveValidator } from '../validators/is-in-case-insensitive.validator';
export class CreateMeasureDto {
  measure_uuid?: string;
  measure_value?: number;
  image_url?: string;

  @IsString({ message: 'image has to be a string' })
  @IsNotEmpty({ message: 'image is required' })
  @Validate(Base64ImageValidator, {
    message: 'The image given is not a valid base64 image',
  })
  readonly image: string;

  @IsString({ message: 'customer code has to be a string' })
  @IsNotEmpty({ message: 'customer code is required' })
  readonly customer_code: string;

  @IsISO8601(
    {},
    {
      message:
        'measure datetime has to be in ISO8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)',
    },
  )
  @IsNotEmpty({ message: 'measure datetime is required' })
  readonly measure_datetime: string;

  @IsString({ message: 'measure type has to be a string' })
  @IsNotEmpty({ message: 'measure type is required' })
  @Validate(IsInCaseInsensitiveValidator, [['WATER', 'GAS']])
  measure_type: string;

  readonly has_confirmed?: boolean;
}
