export const createNumValidationErrorMessage = ({ property }) => {
  return `Параметр ${property} не соответствует числовому типу`;
};

export const createAuthCodeErrorMessage = () =>
  `Проверочный код авторизации не соответствует числовому типу`;

export const createStrNumValidationErrorMessage = ({ property }) => {
  return `Параметр ${property} не является номерным типа string`;
};

export const createStrValidationErrorMessage = ({ property }) => {
  return `Некорректный параметр ${property}`;
};

export const createArrValidationErrorMessage = ({ property }) => {
  return `Параметр ${property} не является массивом`;
};

export const createStrValidationPhoneErrorMessage = () =>
  'Некорректный формат мобильного номера телефона. Ожидается номер телефона в международном формате.';

export const transformNumValue = ({ value }) => parseInt(value, 10);

export const transformQueryAttrsValue = ({ value }) =>
  Array.isArray(value) ? value : [value];

export const transformOrderListValue = ({ value }: { value: string }) =>
  value.toLocaleLowerCase() === 'desc' ? 'desc' : 'asc';

export const validPhoneDeep = (phone: string): boolean => {
  const patterns = [
    /^(\d)\1{5,}/,
    /^7\d*0{5,}/,
    /^7\d*1{5,}/,
    /^7123456789/,
    /^7987654321/,
  ];

  let isValid = true;

  patterns.forEach((pattern) => {
    if (pattern.test(phone)) {
      isValid = false;
      return;
    }
  });

  return isValid;
};
