import { ConfigService } from '@nestjs/config';

export const getEnv = (name: string, configService: ConfigService) => {
  const value = configService.get<string>(name);
  if (!value) throw new Error(`переменная окружения ${name} не задана`);

  return value;
};

export const getIntEnv = (name: string, configService: ConfigService) => {
  const value = Number(getEnv(name, configService));
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(
      `переменная окружения ${name} должна быть положительным целым числом`,
    );
  }

  return value;
};
