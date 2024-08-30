import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

@Catch(BadRequestException, ConflictException, NotFoundException)
export class ValidationExceptionFilterFilter implements ExceptionFilter {
  catch(
    exception: BadRequestException | ConflictException | NotFoundException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let customResponse: any;

    if (exception instanceof BadRequestException) {
      customResponse = {
        error_code: exceptionResponse['error_code']
          ? exceptionResponse['error_code']
          : 'INVALID_DATA',
        error_description: exceptionResponse['message'],
      };
    }

    if (exception instanceof ConflictException) {
      customResponse = {
        error_code: exceptionResponse['error_code'],
        error_description: exceptionResponse['message'],
      };
    }

    if (exception instanceof NotFoundException) {
      customResponse = {
        error_code: exceptionResponse['error_code']
          ? exceptionResponse['error_code']
          : 404,
        error_description: exceptionResponse['message'],
      };
    }

    response.status(status).json(customResponse);
  }
}
