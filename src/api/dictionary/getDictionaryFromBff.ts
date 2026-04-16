import axios from 'axios';
import { API_URL } from '../../constants/config';
import { IForm } from '../../components/types';

export default async function getDictionaryFromBff() {
  try {
    const resp = await axios.get(API_URL + 'api/dictionary');
    const data: IForm[] = await resp.data;
    return data;
  } catch (err) {
    console.log(err);
    return [];
  }
}
