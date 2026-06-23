import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Reads the active agency from the `x-agency-id` request header (set by the
 * frontend from the selected agency/role). Returns undefined when absent.
 */
export const CurrentAgencyId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number | undefined => {
    const req = ctx.switchToHttp().getRequest();
    const raw = req.headers['x-agency-id'];
    const value = Array.isArray(raw) ? raw[0] : raw;
    const id = value != null ? Number(value) : NaN;
    return Number.isFinite(id) && id > 0 ? id : undefined;
  },
);
