import {
  applyDecorators,
  Controller,
  type ControllerOptions,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../guards/authenticated.guard';

export function ApiController(): ClassDecorator;
export function ApiController(prefix: string | string[]): ClassDecorator;
export function ApiController(options: ControllerOptions): ClassDecorator;
export function ApiController(
  prefixOrOptions?: string | string[] | ControllerOptions,
): ClassDecorator {
  if (prefixOrOptions === undefined) {
    return applyDecorators(Controller(), UseGuards(AuthenticatedGuard));
  }

  if (typeof prefixOrOptions === 'string' || Array.isArray(prefixOrOptions)) {
    return applyDecorators(
      Controller(prefixOrOptions),
      UseGuards(AuthenticatedGuard),
    );
  }

  return applyDecorators(
    Controller(prefixOrOptions),
    UseGuards(AuthenticatedGuard),
  );
}
