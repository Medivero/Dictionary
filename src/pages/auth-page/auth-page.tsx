import { Button, Input, Typography } from '@mui/material';
import styles from './auth-page.module.css';
import cn from 'classnames';

import { useEffect, useState } from 'react';

export const AuthPage = () => {
  const [visibleState, setVisibleState] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setVisibleState(true);
      console.log('1');
    }, 1000);
  }, []);

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
          <Typography fontWeight={'small'} style={{ color: 'gray' }}>
            Войдите в свой аккаунт
          </Typography>
          <form>
            <Typography fontWeight={'bold'}>Электронная почта</Typography>
            <Input
              placeholder="you@example.com"
              disableUnderline
              fullWidth={true}
            ></Input>
            <Typography fontWeight={'bold'}>Пароль</Typography>
            <Input
              type="password"
              placeholder="password"
              disableUnderline
              fullWidth={true}
            ></Input>

            <Button
              sx={{
                bgcolor: 'black',
                color: 'white',
                borderRadius: '12px',
                padding: '10px',
              }}
              className={styles.Button}
            >
              Войти
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
