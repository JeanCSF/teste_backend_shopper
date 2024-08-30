import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from "class-validator";

@ValidatorConstraint({ name: 'IsInCaseInsensitive', async: true })
export class IsInCaseInsensitiveValidator implements ValidatorConstraintInterface {
    validate(text: string, args: ValidationArguments) {
        const [allowedValues] = args.constraints;
        return allowedValues
        .map((allowedValue: string) => allowedValue.toLowerCase())
        .includes(text.toLowerCase());
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        const [allowedValues] = validationArguments.constraints;
        return `measure value must be one of the following: ${allowedValues.join(', ')}`;
    }
}