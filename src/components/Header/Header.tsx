import { useSelector } from 'react-redux';
import styles from './styles.module.css';
import { useEffect, useState } from 'react';
import { Button, Snackbar, Typography } from '@mui/material';
import { INotifications } from '../../features/notifications/notificationSlicer';
import { IForm } from '../types';
import { IState } from '../types/types';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../app/store';
import { logoutThunk } from '../../features/auth/authSlice';
import { Link } from 'react-router-dom';

export function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const notifications: INotifications = useSelector(
    (state: IState) => state.notifications,
  );
  const history: IForm[] = useSelector(
    (state: IState) => state.dictionary.storage,
  );
  const username = useSelector((state: IState) => state.auth.user?.username);

  const [open, setOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isMounted) {
      setOpen(true);
      setTimeout(() => {
        setOpen(false);
      }, 1500);
    } else {
      setIsMounted(true);
    }
  }, [notifications]);

  return (
    <>
      <header className={styles.Header}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <Typography>Количество слов в словаре: {history.length}</Typography>
          <div className={styles.HeaderContainer}>
            <Typography style={{ color: 'gray' }}>{username}</Typography>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              onClick={() => dispatch(logoutThunk())}
            >
              Выйти
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              component={Link}
              to="/training"
            >
              Тренировка
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              component={Link}
              to="/activity"
            >
              Активность
            </Button>
          </div>
        </div>
        <Snackbar
          open={open}
          autoHideDuration={3000}
          message={notifications.last.text}
        ></Snackbar>
      </header>
    </>
  );
}
