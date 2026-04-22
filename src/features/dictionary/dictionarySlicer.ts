import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IDictionartyWords, IForm } from '../../components/types';
import addWord from '../../api/dictionary/addWord';
import getDictionaryFromBff from '../../api/dictionary/getDictionaryFromBff';
import deleteWordBff from '../../api/dictionary/deleteWordBff';
import editWordBff from '../../api/dictionary/editWord';
import { toUpperCaseFirstLetter } from '../../utils/toUpperCaseFirstLetter';
import searchWordBff from '../../api/dictionary/searchWordBff';

const initialState: IDictionartyWords = {
  storage: [],
  search: '',
  loaded: false,
};

export const fetchDictionary = createAsyncThunk<{ dictionary: IForm[] }, void>(
  'dictionary/fetchDictionary',
  async () => {
    const dictionary = await getDictionaryFromBff();
    return dictionary;
  },
);

export const addWordThunk = createAsyncThunk<IForm, IForm>(
  'dictionary/addItem',
  async (word) => {
    word.name = toUpperCaseFirstLetter(word.name);
    word.translate = toUpperCaseFirstLetter(word.translate);
    const newWord = await addWord(word);
    return newWord;
  },
);

export const deleteWord = createAsyncThunk<number, number>(
  'dictionary/deleteWord',
  async (id) => {
    const idWord = await deleteWordBff(id);
    return idWord;
  },
);

export const editWord = createAsyncThunk<IForm, IForm>(
  'dictionary/editWord',
  async (word) => {
    const newWord = await editWordBff(word);
    return newWord;
  },
);

export const searchWordThunk = createAsyncThunk<IForm[], string>(
  'dictionary/searchWordThunk',
  async (substring) => {
    const newDictionary = await searchWordBff(substring);
    return newDictionary;
  },
);

export const dictionaryHistorySlice = createSlice({
  name: 'dictionaryHistory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        fetchDictionary.fulfilled,
        (
          state: IDictionartyWords,
          action: PayloadAction<{ dictionary: IForm[] }>,
        ) => {
          state.storage = action.payload.dictionary;
          state.loaded = true;
        },
      )
      .addCase(
        addWordThunk.fulfilled,
        (state: IDictionartyWords, action: PayloadAction<IForm>) => {
          state.storage.unshift(action.payload);
        },
      )
      .addCase(
        deleteWord.fulfilled,
        (state: IDictionartyWords, action: PayloadAction<number>) => {
          state.storage = state.storage.filter(
            (word) => word.id !== action.payload,
          );
        },
      )
      .addCase(
        editWord.fulfilled,
        (state: IDictionartyWords, action: PayloadAction<IForm>) => {
          state.storage = state.storage.map((word) => {
            if (word.id === action.payload.id) {
              return action.payload;
            }
            return word;
          });
        },
      )
      .addCase(
        searchWordThunk.fulfilled,
        (state: IDictionartyWords, action: PayloadAction<IForm[]>) => {
          state.storage = action.payload;
        },
      );
  },
});
