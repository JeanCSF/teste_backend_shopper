import { IsString, IsNotEmpty, IsInt, IsUUID } from 'class-validator';
export class ConfirmMeasureDto {
  @IsUUID('4', { message: 'measure uuid has to be a valid uuid' })
  @IsString({ message: 'measure uuid has to be a string' })
  @IsNotEmpty({ message: 'measure uuid is required' })
  measure_uuid: string;

  @IsInt({ message: 'confirmed value has to be an integer' })
  @IsNotEmpty({ message: 'confirmed value is required' })
  confirmed_value: number;
}
