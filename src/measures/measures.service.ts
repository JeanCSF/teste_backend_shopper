import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { MeasureEntity } from './measure.entity';
import { CreateMeasureDto } from './dto/create-measure.dto';
import { ConfirmMeasureDto } from './dto/confirm-measure.dto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { ListMeasuresDto } from './dto/list-measures.dto';

@Injectable()
export class MeasuresService {
  constructor(
    @InjectRepository(MeasureEntity)
    private readonly measuresRepository: Repository<MeasureEntity>,
  ) {}

  async createMeasure(measureDTO: CreateMeasureDto): Promise<CreateMeasureDto> {
    if (
      await this.monthCheck(
        measureDTO.customer_code,
        measureDTO.measure_datetime,
        measureDTO.measure_type.toUpperCase(),
      )
    ) {
      throw new ConflictException({
        error_code: 'DOUBLE_REPORT',
        message:
          'already have a measure of this type for this customer in this month',
      });
    }

    const imageName = await this.saveImage(
      measureDTO.customer_code,
      measureDTO.image,
      measureDTO.measure_datetime,
      measureDTO.measure_type,
    );
    measureDTO.image_url = `/images/${imageName}`;

    const mimeType = measureDTO.image.split(';')[0].split(':')[1];
    const measureValue = await this.geminiCheck(mimeType, imageName);
    measureDTO.measure_value = parseInt(measureValue);
    measureDTO.measure_type = measureDTO.measure_type.toUpperCase();

    const createdMeasure = await this.measuresRepository.save(measureDTO);
    return createdMeasure;
  }

  private async saveImage(
    customerCode: string,
    base64Image: string,
    measureDatetime: string,
    measureType: string,
  ): Promise<string> {
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const imageType = base64Image.split(';')[0].split('/')[1];
    const month = new Date(measureDatetime).getMonth() + 1;
    const year = new Date(measureDatetime).getFullYear();
    const imageName = `customer-${customerCode}_${month.toString().padStart(2, '0')}-${year}_${measureType.toLowerCase()}.${imageType}`;

    const imageBuffer = Buffer.from(base64Data, 'base64');
    const imagePath = `./uploads/${imageName}`;
    require('fs').writeFileSync(imagePath, imageBuffer);

    return imageName;
  }

  private async geminiCheck(
    mimeType: string,
    imageName: string,
  ): Promise<string> {
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

    const uploadResponse = await fileManager.uploadFile(
      `./uploads/${imageName}`,
      {
        mimeType: mimeType,
      },
    );

    const measureValue = await this.getMeasureValue(uploadResponse);
    return measureValue;
  }

  private async getMeasureValue(uploadResponse: any): Promise<string> {
    async function retryOperation(
      operation: () => Promise<any>,
      retries: number,
      delay: number,
    ): Promise<any> {
      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          return await operation();
        } catch (error) {
          if (attempt < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        }
      }
    }

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
      });

      const result = await retryOperation(
        () =>
          model.generateContent([
            {
              fileData: {
                mimeType: uploadResponse.file.mimeType,
                fileUri: uploadResponse.file.uri,
              },
            },
            {
              text: 'This image displays a numerical reading of water/gas consumption in cubic meters for a specific month. Please accurately extract and return the exact integer value shown in the meter display, ignoring any surrounding text or symbols.',
            },
          ]),
        4,
        3000,
      );

      const measureValue = result.response.text().replace(/\D/g, '');
      return measureValue;
    } catch (error) {
      return '0';
    }
  }

  private async monthCheck(
    customerCode: string,
    isoDate: string,
    measureType: string,
  ) {
    const measureDatetime = new Date(isoDate);
    const month = measureDatetime.getMonth() + 1;
    const year = measureDatetime.getFullYear();

    const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const lastDayOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const checkMeasureMonth = await this.measuresRepository.findOne({
      where: {
        customer_code: customerCode,
        measure_datetime: Between(firstDayOfMonth, lastDayOfMonth),
        measure_type: measureType,
      },
    });

    return checkMeasureMonth;
  }

  async confirmMeasure(
    confirmMeasureDTO: ConfirmMeasureDto,
  ): Promise<ConfirmMeasureDto> {
    const dbMeasure = await this.findOne(confirmMeasureDTO.measure_uuid);
    if (!dbMeasure) {
      throw new NotFoundException({
        error_code: 'MEASURE_NOT_FOUND',
        message: 'measure for this uuid does not exist',
      });
    }

    if (dbMeasure.has_confirmed) {
      throw new ConflictException({
        error_code: 'CONFIRMATION_DUPLICATE',
        message: 'measure for this uuid has already been confirmed',
      });
    }

    dbMeasure.measure_value = confirmMeasureDTO.confirmed_value;
    dbMeasure.has_confirmed = true;
    await this.measuresRepository.save(dbMeasure);
    return confirmMeasureDTO;
  }

  private async findOne(id: string): Promise<MeasureEntity> {
    const measure = await this.measuresRepository.findOne({
      where: { measure_uuid: id },
    });

    return measure;
  }

  async findMeasuresByCustomer(
    listMeasuresDto: ListMeasuresDto,
  ): Promise<MeasureEntity[]> {
    const { customerCode, measure_type } = listMeasuresDto;
    const whereConditions: any = {
      customer_code: customerCode,
    };

    if (measure_type) {
      whereConditions.measure_type = measure_type.toUpperCase();
    }

    const measures = await this.measuresRepository.find({
      where: whereConditions,
    });

    if (measures.length === 0) {
      throw new NotFoundException({
        error_code: 'MEASURES_NOT_FOUND',
        message: 'measures for this customer does not exist',
      });
    }

    return measures;
  }
}
