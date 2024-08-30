import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'Base64Image', async: true })
export class Base64ImageValidator implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    if (typeof text !== 'string') {
      return false;
    }

    const regex =
      /^data:image\/(png|jpeg|webp|heic|heif);base64,[a-zA-Z0-9+/=]+$/;

    if (!regex.test(text)) {
      return false;
    }

    try {
      const base64Data = text.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      return buffer.length > 0;
    } catch (error) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid base64 image';
  }
}
