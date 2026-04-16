import { Input } from '@mui/material';
import styles from './styles.module.css';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { searchWordThunk } from '../../features/dictionary/dictionarySlicer';
import { AppDispatch } from '../../app/store';

export function SearchComponent() {
  const [searchString, setSearchString] = useState<string>('');
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(searchWordThunk(searchString));
  }, [searchString]);
  return (
    <>
      <div className={styles.SearchContainer}>
        <form style={{ width: '100%' }}>
          <Input
            name="searchString"
            value={searchString}
            onChange={(value: any) => {
              setSearchString(value.target?.value);
            }}
            placeholder="Поиск"
            disableUnderline
            sx={{ width: '100%' }}
          ></Input>
        </form>
      </div>
    </>
  );
}
