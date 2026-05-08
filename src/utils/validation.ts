import { plainToInstance, type ClassConstructor } from 'class-transformer';
import { validate, type ValidationError } from 'class-validator';

export type FieldError = { property: string; messages: string[] };

export function formatValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): FieldError[] {
  return errors.flatMap((err) => {
    const property = parentPath ? `${parentPath}.${err.property}` : err.property;
    const ownMessages = err.constraints ? Object.values(err.constraints) : [];
    const childMessages =
      err.children?.length ? formatValidationErrors(err.children, property) : [];
    if (ownMessages.length > 0) {
      return [{ property, messages: ownMessages }, ...childMessages];
    }
    return childMessages.length > 0
      ? childMessages
      : [{ property, messages: ['Invalid value'] }];
  });
}

export async function validateDto<T extends object>(
  DtoClass: ClassConstructor<T>,
  plain: object,
): Promise<{ dto: T; errors: FieldError[] }> {
  const dto = plainToInstance(DtoClass, plain, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  });
  const errors = await validate(dto, {
    whitelist: true,
    forbidUnknownValues: false,
  });
  return { dto, errors: formatValidationErrors(errors) };
}
