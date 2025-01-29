/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import { Transform } from 'class-transformer';
import { registerDecorator, ValidationOptions } from 'class-validator';

export function Trim(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    Transform(({ value }) => {
      if (typeof value === 'string') {
        return value?.trim();
      }
    })(object, propertyName);

    registerDecorator({
      name: 'Trim',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate() {
          return true;
        },
      },
    });
  };
}
