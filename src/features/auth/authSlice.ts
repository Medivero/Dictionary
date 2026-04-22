import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { clearToken, getToken, setToken } from '../../api/http';
import * as authApi from '../../api/auth/authApi';

export interface IAuthState {
  token: string | null;
  user: authApi.AuthUser | null;
  status: 'idle' | 'loading' | 'ready';
  error: string | null;
}

const initialState: IAuthState = {
  token: null,
  user: null,
  status: 'idle',
  error: null,
};

export const initAuth = createAsyncThunk<
  { token: string; user: authApi.AuthUser } | null
>('auth/init', async () => {
  const token = getToken();
  if (!token) return null;
  try {
    const resp = await authApi.me();
    return { token, user: resp.user };
  } catch {
    clearToken();
    return null;
  }
});

export const loginThunk = createAsyncThunk<
  { token: string; user: authApi.AuthUser },
  { username: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ username, password }, { rejectWithValue }) => {
  try {
    const resp = await authApi.login(username, password);
    setToken(resp.token);
    return resp;
  } catch (e: any) {
    const message =
      e?.response?.data?.message ?? 'Не удалось выполнить вход';
    return rejectWithValue(message);
  }
});

export const registerThunk = createAsyncThunk<
  { token: string; user: authApi.AuthUser },
  { username: string; password: string },
  { rejectValue: string }
>('auth/register', async ({ username, password }, { rejectWithValue }) => {
  try {
    const resp = await authApi.register(username, password);
    setToken(resp.token);
    return resp;
  } catch (e: any) {
    const message =
      e?.response?.data?.message ?? 'Не удалось зарегистрироваться';
    return rejectWithValue(message);
  }
});

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
  } catch {
    // ignore
  } finally {
    clearToken();
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{ token: string; user: authApi.AuthUser }>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.status = 'ready';
      state.error = null;
    },
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
      state.error = null;
      state.status = 'ready';
      clearToken();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initAuth.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(initAuth.fulfilled, (state, action) => {
        state.status = 'ready';
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
        } else {
          state.token = null;
          state.user = null;
        }
      })
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'ready';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'ready';
        state.error = action.payload ?? 'Не удалось выполнить вход';
      })
      .addCase(registerThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.status = 'ready';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = 'ready';
        state.error = action.payload ?? 'Не удалось зарегистрироваться';
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.error = null;
      });
  },
});

export const { setAuth, clearAuth } = authSlice.actions;

