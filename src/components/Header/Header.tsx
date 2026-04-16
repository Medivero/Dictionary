import { useSelector } from 'react-redux';
import styles from './styles.module.css';
import { useEffect, useState } from 'react';
import { Snackbar, Typography } from '@mui/material';
import { INotifications } from '../../features/notifications/notificationSlicer';
import { IForm } from '../types';

export function Header() {
  const notifications: INotifications = useSelector(
    (state: any) => state.notifications,
  );
  const history: IForm[] =
    useSelector((state: any) => state.dictionary.dictionary) || [];

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
        <Typography>Количество слов в словаре: {history.length}</Typography>
        <Snackbar
          open={open}
          autoHideDuration={3000}
          message={notifications.last.text}
        ></Snackbar>
      </header>
    </>
  );
}
