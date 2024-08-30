import { Test, TestingModule } from '@nestjs/testing';
import { MeasuresController } from './measures.controller';
import { MeasuresService } from './measures.service';
import { CreateMeasureDto } from './dto/create-measure.dto';
import { Response } from 'express';
import { ConfirmMeasureDto } from './dto/confirm-measure.dto';
import { BadRequestException } from '@nestjs/common';
import { ListMeasuresDto } from './dto/list-measures.dto';

describe('MeasuresController', () => {
  let measuresController: MeasuresController;
  let measuresService: MeasuresService;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeasuresController],
      providers: [
        {
          provide: MeasuresService,
          useValue: {
            createMeasure: jest.fn().mockResolvedValue({
              image_url: 'some-image-url',
              measure_value: 123,
              measure_uuid: 'some-uuid',
            }),
            confirmMeasure: jest.fn().mockResolvedValue({
              success: true,
            }),
            findMeasuresByCustomer: jest.fn().mockResolvedValue({
              customer_code: 'customer123',
              measures: [
                {
                  measure_uuid: 'some-uuid',
                  measure_datetime: new Date().toISOString(),
                  measure_type: 'WATER',
                  has_confirmed: true,
                  image_url: 'some-image-url',
                },
              ],
            }),
          },
        },
      ],
    }).compile();

    measuresController = module.get<MeasuresController>(MeasuresController);
    measuresService = module.get<MeasuresService>(MeasuresService);
  });

  it('should be defined', () => {
    expect(measuresController).toBeDefined();
    expect(measuresService).toBeDefined();
  });

  describe('createMeasure', () => {
    const createMeasureDTO: CreateMeasureDto = {
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
      customer_code: 'customer123',
      measure_datetime: new Date().toISOString(),
      measure_type: 'WATER',
      has_confirmed: true,
    };

    it('should create a measure and return the response', async () => {
      await measuresController.createMeasure(mockResponse, createMeasureDTO);

      expect(measuresService.createMeasure).toHaveBeenCalledWith(
        createMeasureDTO,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        image_url: 'some-image-url',
        measure_value: 123,
        measure_uuid: 'some-uuid',
      });
    });

    it('should throw an exception', () => {
      jest
        .spyOn(measuresService, 'createMeasure')
        .mockRejectedValueOnce(new BadRequestException());

      expect(
        measuresController.createMeasure(mockResponse, createMeasureDTO),
      ).rejects.toThrow();
    });
  });

  describe('confirmMeasure', () => {
    const confirmMeasureDTO: ConfirmMeasureDto = {
      measure_uuid: 'some-uuid',
      confirmed_value: 123,
    };
    
    it('should confirm a measure and return the response', async () => {
      await measuresController.confirmMeasure(mockResponse, confirmMeasureDTO);

      expect(measuresService.confirmMeasure).toHaveBeenCalledWith(
        confirmMeasureDTO,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it('should throw an exception', () => {
      jest
        .spyOn(measuresService, 'confirmMeasure')
        .mockRejectedValueOnce(new BadRequestException());

      expect(
        measuresController.confirmMeasure(mockResponse, confirmMeasureDTO),
      ).rejects.toThrow();
    });
  });

  describe('findMeasuresByCustomer', () => {
    const customerCode = 'customer123';
    const listMeasuresDto = {
      measure_type: 'WATER',
    };

    const mockMeasures = [
      {
        measure_uuid: 'some-uuid',
        measure_datetime: new Date().toISOString(),
        measure_type: 'WATER',
        has_confirmed: true,
        image_url: 'some-image-url',
      },
    ];

    it('should find measures by customer and return the response', async () => {
      jest
        .spyOn(measuresService, 'findMeasuresByCustomer')
        .mockResolvedValue(mockMeasures);

      await measuresController.findMeasuresByCustomer(
        mockResponse,
        customerCode,
        listMeasuresDto,
      );

      expect(measuresService.findMeasuresByCustomer).toHaveBeenCalledWith({
        ...listMeasuresDto,
        customerCode: customerCode,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        customer_code: customerCode,
        measures: mockMeasures,
      });
    });

    it('should throw an exception', async () => {
      jest
        .spyOn(measuresService, 'findMeasuresByCustomer')
        .mockRejectedValueOnce(new BadRequestException());

      await expect(
        measuresController.findMeasuresByCustomer(
          mockResponse,
          customerCode,
          listMeasuresDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
