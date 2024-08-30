import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res
} from '@nestjs/common';
import { MeasuresService } from './measures.service';
import { Response } from 'express';
import { CreateMeasureDto } from './dto/create-measure.dto';
import { ConfirmMeasureDto } from './dto/confirm-measure.dto';
import { ListMeasuresDto } from './dto/list-measures.dto';

@Controller()
export class MeasuresController {
  constructor(private readonly measuresService: MeasuresService) {}

  @Post('upload')
  async createMeasure(
    @Res() response: Response,
    @Body() createMeasureDTO: CreateMeasureDto,
  ) {
    const createdMeasure =
      await this.measuresService.createMeasure(createMeasureDTO);

    return response.status(201).json({
      image_url: createdMeasure.image_url,
      measure_value: createdMeasure.measure_value,
      measure_uuid: createdMeasure.measure_uuid,
    });
  }

  @Patch('confirm')
  async confirmMeasure(
    @Res() response: Response,
    @Body() confirmMeasureDTO: ConfirmMeasureDto,
  ) {
    await this.measuresService.confirmMeasure(confirmMeasureDTO);

    return response.status(200).json({ success: true });
  }

  @Get(':customerCode/list')
  async findMeasuresByCustomer(
    @Res() response: Response,
    @Param('customerCode') customerCode: string,
    @Query() listMeasuresDto: ListMeasuresDto,
  ) {
    const measures = await this.measuresService.findMeasuresByCustomer({
      ...listMeasuresDto,
      customerCode,
    });

    const formatedMeasures = measures.map((measure) => {
      return {
        measure_uuid: measure.measure_uuid,
        measure_datetime: measure.measure_datetime,
        measure_type: measure.measure_type,
        has_confirmed: measure.has_confirmed,
        image_url: measure.image_url,
      };
    });

    return response.status(200).json({
      customer_code: customerCode,
      measures: formatedMeasures,
    });
  }
}
