import {
  applyDecorators,
  Controller,
  type ControllerOptions,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

export function ApiController(): ClassDecorator;
export function ApiController(prefix: string | string[]): ClassDecorator;
export function ApiController(options: ControllerOptions): ClassDecorator;
export function ApiController(
  prefixOrOptions?: string | string[] | ControllerOptions,
): ClassDecorator {
  if (prefixOrOptions === undefined) {
    return applyDecorators(Controller(), ApiBearerAuth());
  }

  if (typeof prefixOrOptions === 'string' || Array.isArray(prefixOrOptions)) {
    return applyDecorators(Controller(prefixOrOptions), ApiBearerAuth());
  }

  return applyDecorators(Controller(prefixOrOptions), ApiBearerAuth());
}
