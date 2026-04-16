import { useWindowSize } from 'react-use';
import { Typography } from '@mui/material';
import { Header } from '../../components/Header/Header.js';
import { SearchComponent } from '../../components/SearchComponent/SearchComponent.js';
import { TableComponent } from '../../components/Table/TableComponent/TableComponent.js';

export function MainPage() {
  const { width } = useWindowSize();
  if (width < 500) {
    return (
      <>
        <main>
          <Header></Header>
          <TableComponent></TableComponent>
          <SearchComponent></SearchComponent>
        </main>
      </>
    );
  } else {
    return (
      <>
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography>
            Данное приложение не поддерживается на экранах с шириной больше 500
            пикселей
          </Typography>
        </div>
      </>
    );
  }
}
