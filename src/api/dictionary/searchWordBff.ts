import axios from 'axios';
import { API_URL } from '../../constants/config';

export default async function searchWordBff(substring: string) {
  try {
    const resp = await axios.get(API_URL + `api/dictionary/${substring}`);
    const data = await resp.data;
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
}
