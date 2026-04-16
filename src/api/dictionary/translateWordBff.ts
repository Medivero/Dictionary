import axios from 'axios';
import { API_URL } from '../../constants/config';

export default async function translateWordBff(name: string) {
  try {
    const resp = await axios.get(API_URL + `api/word/translate/${name}`);
    const data = resp.data;
    return data;
  } catch (err) {
    console.log(err);
    return '';
  }
}
