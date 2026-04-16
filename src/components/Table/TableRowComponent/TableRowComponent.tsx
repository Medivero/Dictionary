import { Button, Input, TableCell, TableRow } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import styles from './styles.module.css';
import {
  addWordThunk,
  deleteWord,
  editWord,
} from '../../../features/dictionary/dictionarySlicer';
import { sendNotification } from '../../../features/notifications/notificationSlicer';
import SAVE_ICON from '/src/assets/icons/4856668.png';
import REMOVE_ICON from '/src/assets/icons/matt-icons_cancel.svg';
import { generateValidationScheme } from '../utils/validationScheme';
import { AppDispatch } from '../../../app/store';
import { useEffect } from 'react';
import translateWordBff from '../../../api/dictionary/translateWordBff';
export function TableRowComponent({
  cellName,
  cellTranslate,
  id,
  isNewWord,
}: {
  isNewWord: boolean;
  id: number;
  cellName: string;
  cellTranslate: string;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const formik = useFormik({
    initialValues: {
      name: cellName,
      translate: cellTranslate,
      id: id,
    },
    onSubmit: (values) => {
      if (isNewWord) {
        dispatch(addWordThunk(values));
        formik.resetForm();
        dispatch(
          sendNotification({
            text: 'Слово сохранено!',
            type: 'message',
          }),
        );
      } else {
        dispatch(editWord(values));
        dispatch(
          sendNotification({
            text: 'Слово изменено!',
            type: 'message',
          }),
        );
      }
    },
    validateOnChange: true,
    validateOnMount: true,
    validationSchema: generateValidationScheme(),
  });

  useEffect(() => {
    if (!isNewWord) return;
    const timeout = setTimeout(async () => {
      if (formik.values.name !== '' && formik.values.name.trim() !== ' ') {
        const resp = await translateWordBff(formik.values.name);
        formik.setFieldValue('translate', resp.translation);
      } else {
        formik.setFieldValue('translate', '');
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [formik.values.name]);
  const handleDelete = () => {
    dispatch(deleteWord(id));
  };
  return (
    <>
      <TableRow className={styles.TableBodyCellBorder}>
        <TableCell sx={{ padding: '0', paddingLeft: '5px' }}>
          <form onSubmit={formik.handleSubmit}>
            <Input
              name="name"
              placeholder={isNewWord ? 'Слово' : ''}
              disableUnderline={true}
              autoComplete="off"
              onChange={formik.handleChange}
              className={styles.TableRowCellInput}
              value={formik.values.name}
            ></Input>
          </form>
        </TableCell>
        <TableCell sx={{ padding: '0', paddingLeft: '5px' }}>
          <form onSubmit={formik.handleSubmit}>
            <Input
              placeholder={isNewWord ? 'Перевод' : ''}
              name="translate"
              autoComplete="off"
              disabled
              disableUnderline={true}
              onChange={formik.handleChange}
              className={styles.TableRowCellInput}
              value={formik.values.translate}
            ></Input>
          </form>
        </TableCell>
        <TableCell
          sx={{
            padding: '0',
            display: 'flex',
            gap: '0px',
            alignItems: 'center',
          }}
        >
          <Button
            sx={{
              margin: 0,
              width: 'fit-content',
              minWidth: '0px',
              height: 'fit-content',
            }}
            onClick={() => formik.handleSubmit()}
            className={styles.ButtonSubmit}
            type="submit"
          >
            <img src={SAVE_ICON} width={30}></img>
          </Button>
          <Button
            onClick={() => handleDelete()}
            sx={{
              margin: 0,
              width: 'fit-content',
              minWidth: '0px',
              height: 'fit-content',
            }}
          >
            <img src={REMOVE_ICON} width={20}></img>
          </Button>
        </TableCell>
      </TableRow>
    </>
  );
}
