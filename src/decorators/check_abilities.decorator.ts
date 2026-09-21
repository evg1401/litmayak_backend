import { SetMetadata } from '@nestjs/common';

export interface RequiredRule {
  action: string;
  subject: string;
}

export const CHECK_ABILITIES_KEY = 'check_abilities';

export const CheckAbilities = (...requirements: RequiredRule[]) =>
  SetMetadata(CHECK_ABILITIES_KEY, requirements);