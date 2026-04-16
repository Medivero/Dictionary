import {
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import styles from './styles.module.css';
import { useSelector } from 'react-redux';
import { IDictionartyWords } from '../../types';
import SAD_FACE from '/src/assets/icons/sad-face.svg';
import { TableRowComponent } from '../TableRowComponent';
import { IState } from '../../types/types';

export function TableComponent() {
  const dictionary: IDictionartyWords =
    useSelector((state: IState) => state.dictionary) ?? [];

  return (
    <>
      {dictionary.loaded ? (
        <>
          <TableContainer
            sx={{
              paddingLeft: '5px',
              paddingRight: '5px',
              boxSizing: 'border-box',
            }}
            component={Paper}
          >
            <Table
              sx={{ width: '100%', paddingLeft: '5px', paddingRight: '5px' }}
            >
              <TableHead>
                <TableRow className={styles.TableHeadCellBorder}>
                  <TableCell className={styles.TableRowCellInput}>
                    Слово
                  </TableCell>
                  <TableCell className={styles.TableRowCellInput}>
                    Перевод
                  </TableCell>
                  <TableCell className={styles.TableRowCellInput}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRowComponent
                  isNewWord={true}
                  id={0}
                  cellName=""
                  cellTranslate=""
                />
                {dictionary.storage?.map((item) => (
                  <TableRowComponent
                    isNewWord={false}
                    key={item.id}
                    cellName={item.name}
                    id={item.id}
                    cellTranslate={item.translate}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <div>
            {dictionary.storage.length === 0 && (
              <Typography className={styles.TypographyNoHistory}>
                <img src={SAD_FACE} width={100} alt="" />
                <span>Словарь пуст!</span>
                <span>Добавьте какое-то слово!</span>
              </Typography>
            )}
          </div>
        </>
      ) : (
        <CircularProgress></CircularProgress>
      )}
    </>
  );
}
