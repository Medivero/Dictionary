import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MainPage } from './pages/Main';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchDictionary } from './features/dictionary/dictionarySlicer';
import { AppDispatch } from './app/store';

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
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
