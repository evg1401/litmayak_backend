import { AppLogger } from '@/logger/logger.service';
import { RolesService } from '@/roles/roles.service';
import {
  AbilityBuilder,
  AnyMongoAbility,
  createMongoAbility,
} from '@casl/ability';
import { Permissions } from '@models';
import { Injectable } from '@nestjs/common';

type PermissionAction = 'can' | 'cannot';

interface LoadedPermission {
  action: string | string[];
  subject: string | string[];
  fields?: string | string[];
  conditions?: Record<string, unknown>;
  type: PermissionAction;
}

@Injectable()
export class AbilityFactory {
  constructor(
    private readonly logger: AppLogger,
    protected rolesService: RolesService,
  ) {}

  async defineAbility(
    roleId: number,
    userId: number,
  ): Promise<AnyMongoAbility> {
    try {
      const permissions = (await this.rolesService.getRolePermissions(roleId))
        .map((permission) => this.normalizePermission(permission, userId))
        .filter((permission): permission is LoadedPermission =>
          Boolean(permission),
        );

      const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

      const groupedPermissions = this.groupPermissions(permissions);

      groupedPermissions.can.forEach((perm) => {
        this.applyPermission(can, perm);
      });

      groupedPermissions.cannot.forEach((perm) => {
        this.applyPermission(cannot, perm);
      });

      return build();
    } catch (error) {
      this.logger.debug(error);
      return this.createEmptyAbility();
    }
  }

  private groupPermissions(permissions: LoadedPermission[]): {
    can: LoadedPermission[];
    cannot: LoadedPermission[];
  } {
    return permissions.reduce(
      (acc, perm) => {
        if (perm.type === 'can') {
          acc.can.push(perm);
        } else if (perm.type === 'cannot') {
          acc.cannot.push(perm);
        } else {
          // this.logger.warn(`Unknown permission type: ${perm.type}`);
        }
        
        return acc;
      },
      { can: [], cannot: [] } as {
        can: LoadedPermission[];
        cannot: LoadedPermission[];
      },
    );
  }

  private applyPermission(
    method: (
      action: string | string[],
      subject: string | string[],
      fieldsOrConditions?: string | string[] | Record<string, unknown>,
      conditions?: Record<string, unknown>,
    ) => void,
    permission: LoadedPermission,
  ): void {
    try {
      const { action, subject, fields, conditions } = permission;

      if (!action || !subject) {
        this.logger.warn(
          `не определены параметры доступа: ${JSON.stringify(permission)}`,
        );
        return;
      }

      if (fields && conditions) {
        method(action, subject, fields, conditions);
      } else if (fields) {
        method(action, subject, fields);
      } else if (conditions) {
        method(action, subject, conditions);
      } else {
        method(action, subject);
      }
    } catch (error) {
      this.logger.error(
        `Ошибка при применении прав доступа: ${JSON.stringify(permission)}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private normalizePermission(
    permission: Permissions,
    userId: number,
  ): LoadedPermission | null {
    const plainPermission = this.toPlainPermission(permission);

    if (
      !plainPermission.action ||
      !plainPermission.subject ||
      !this.isPermissionAction(plainPermission.type)
    ) {
      return null;
    }

    return {
      action: plainPermission.action,
      subject: plainPermission.subject,
      type: plainPermission.type,
      fields: this.parseStringList(plainPermission.fields),
      conditions: this.parseConditions(plainPermission.conditions, userId),
    };
  }

  private toPlainPermission(permission: Permissions): Record<string, any> {
    if (typeof permission.toJSON === 'function') {
      return permission.toJSON();
    }

    return permission as unknown as Record<string, any>;
  }

  private isPermissionAction(type: unknown): type is PermissionAction {
    return type === 'can' || type === 'cannot';
  }

  private parseStringList(value: unknown): string | string[] | undefined {
    if (!value) {
      return undefined;
    }

    const parsed = typeof value === 'string' ? this.parseJson(value) : value;

    if (Array.isArray(parsed)) {
      const values = parsed
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean);

      return values.length > 0 ? values : undefined;
    }

    if (typeof parsed !== 'string') {
      return undefined;
    }

    const normalizedValue = parsed.trim();

    if (!normalizedValue) {
      return undefined;
    }

    if (normalizedValue.includes(',')) {
      const values = normalizedValue
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      return values.length > 0 ? values : undefined;
    }

    return normalizedValue;
  }

  private parseConditions(
    conditions: unknown,
    userId: number,
  ): Record<string, unknown> | undefined {
    if (!conditions) {
      return undefined;
    }

    const parsed =
      typeof conditions === 'string' ? this.parseJson(conditions) : conditions;
    const conditionObject = this.buildConditionObject(parsed, userId);

    return Object.keys(conditionObject).length > 0
      ? conditionObject
      : undefined;
  }

  private parseJson(value: string): unknown {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return undefined;
    }

    try {
      return JSON.parse(trimmedValue);
    } catch {
      return trimmedValue;
    }
  }

  private buildConditionObject(
    conditions: unknown,
    userId: number,
  ): Record<string, unknown> {
    if (typeof conditions === 'string') {
      const conditionField = conditions.trim();

      return conditionField ? { [conditionField]: userId } : {};
    }

    if (Array.isArray(conditions)) {
      return {};
    }

    if (typeof conditions === 'object' && conditions !== null) {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(conditions)) {
        result[key] = this.replaceConditionValue(value, userId);
      }
      return result;
    }

    return {};
  }

  private replaceConditionValue(value: unknown, userId: number): unknown {
    if (value === '${userId}') {
      return userId;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.replaceConditionValue(item, userId));
    }

    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).reduce(
        (acc, [key, item]) => ({
          ...acc,
          [key]: this.replaceConditionValue(item, userId),
        }),
        {} as Record<string, unknown>,
      );
    }

    return value;
  }

  private createEmptyAbility(): AnyMongoAbility {
    return new AbilityBuilder(createMongoAbility).build();
  }
}
