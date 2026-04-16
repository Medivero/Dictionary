import axios from 'axios';
import { LIGNVA_TRANSLATE_API_URL } from '../constants/apis';

export const makeTranslateRequest = async (text: string) => {
  try {
    const resp = await axios.get(LIGNVA_TRANSLATE_API_URL + `en/ru/${text}`);
    const data = await resp.data;
    return data;
  } catch (err) {
    console.log(err);
  }
};
