import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MainPage } from './pages/main-page';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchDictionary } from './features/dictionary/dictionarySlicer';
import { AppDispatch } from './app/store';
import { AuthPage } from './pages/auth-page';

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchDictionary());
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path={'/'} element={<MainPage />}></Route>
          <Route path={'/auth'} element={<AuthPage />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
