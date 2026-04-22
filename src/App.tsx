import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MainPage } from './pages/main-page';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchDictionary } from './features/dictionary/dictionarySlicer';
import { AppDispatch } from './app/store';
import { AuthPage } from './pages/auth-page';
import { initAuth } from './features/auth/authSlice';
import { useSelector } from 'react-redux';
import { IState } from './components/types/types';
import { TrainingPage } from './pages/training-page';
import { ActivityPage } from './pages/activity-page';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: IState) => state.auth);
  const isAuthed = Boolean(auth.user);

  useEffect(() => {
    dispatch(initAuth());
  }, []);

  useEffect(() => {
    if (auth.status === 'ready' && isAuthed) {
      dispatch(fetchDictionary());
    }
  }, [auth.status, isAuthed]);

  if (auth.status !== 'ready') {
    return null;
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path={'/'}
            element={isAuthed ? <MainPage /> : <Navigate to="/auth" replace />}
          ></Route>
          <Route
            path={'/training'}
            element={
              isAuthed ? <TrainingPage /> : <Navigate to="/auth" replace />
            }
          ></Route>
          <Route
            path={'/activity'}
            element={
              isAuthed ? <ActivityPage /> : <Navigate to="/auth" replace />
            }
          ></Route>
          <Route
            path={'/auth'}
            element={isAuthed ? <Navigate to="/" replace /> : <AuthPage />}
          ></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
