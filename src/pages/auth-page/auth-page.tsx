import { Button, Input, Typography } from '@mui/material';
import styles from './auth-page.module.css';
import cn from 'classnames';

import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../app/store';
import { IState } from '../../components/types/types';
import { loginThunk, registerThunk } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const validationSchema = yup.object({
  username: yup
    .string()
    .min(3, 'Минимум 3 символа')
    .max(32, 'Максимум 32 символа')
    .required('Введите username'),

  password: yup
    .string()
    .min(8, 'Минимум 8 символов')
    .max(128, 'Максимум 128 символов')
    .required('Введите пароль'),
});

export const AuthPage = () => {
  const [visibleState, setVisibleState] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: IState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setVisibleState(true);
    }, 1000);
  }, []);

  const formik = useFormik({
    initialValues: {
      password: '',
      username: '',
    },
    onSubmit: async (values) => {
      const username = values.username.trim().toLowerCase();
      if (mode === 'login') {
        const res = await dispatch(
          loginThunk({ username, password: values.password }),
        );
        if (loginThunk.fulfilled.match(res)) {
          navigate('/');
        }
      } else {
        const res = await dispatch(
          registerThunk({ username, password: values.password }),
        );
        if (registerThunk.fulfilled.match(res)) {
          navigate('/');
        }
      }
    },
    validationSchema: validationSchema,
  });

  return (
    <div className={styles.Auth}>
      <div className={styles.AuthContainer}>
        <Typography variant="h5" fontWeight={'medium'}>
          Добро пожаловать
        </Typography>
        <div
          className={cn(styles.FormContainer, {
            [styles.Visible]: visibleState,
          })}
        >
          <Typography fontWeight={'light'} style={{ color: 'gray' }}>
            {mode === 'login' ? 'Войдите в свой аккаунт' : 'Создайте аккаунт'}
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <Typography fontWeight={'bold'}>Username</Typography>
            <Input
              placeholder="demo"
              disableUnderline
              {...formik.getFieldProps('username')}
              fullWidth={true}
              error={Boolean(formik.touched.username && formik.errors.username)}
            />
            <Typography fontWeight={'bold'}>Пароль</Typography>
            <Input
              {...formik.getFieldProps('password')}
              type="password"
              placeholder="password"
              disableUnderline
              fullWidth={true}
              error={Boolean(formik.touched.password && formik.errors.password)}
            />
            <Button
              sx={{
                bgcolor: 'black',
                color: 'white',
                borderRadius: '12px',
                padding: '10px',
              }}
              type="submit"
              className={styles.Button}
              disabled={auth.status === 'loading'}
            >
              {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </Button>
            <Button
              sx={{
                borderRadius: '12px',
                padding: '10px',
                marginTop: '10px',
              }}
              type="button"
              variant="text"
              onClick={() =>
                setMode((m) => (m === 'login' ? 'register' : 'login'))
              }
              disabled={auth.status === 'loading'}
            >
              {mode === 'login'
                ? 'Нет аккаунта? Регистрация'
                : 'Уже есть аккаунт? Войти'}
            </Button>
            <Typography color="red">
              {auth.error ||
                formik.errors.username ||
                formik.errors.password ||
                ''}
            </Typography>
          </form>
        </div>
      </div>
    </div>
  );
};
