import * as yup from 'yup';

export const generateValidationScheme = () => {
  const validation = yup.object({
    name: yup.string().required('Поле не должно быть пустым'),

    translate: yup
      .string()
      .required('Поле не должно быть пустым')
      .test((value) => value.trim() !== ''),
  });
  return validation;
};
