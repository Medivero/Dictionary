import axios from 'axios';
import { API_URL } from '../../constants/config';

export default async function deleteWordBff(id: number) {
  try {
    const resp = await axios.delete(API_URL + `api/dictionary/${id}`);
    const data = resp.data;
    return data;
  } catch (error) {
    console.log(error);
  }
}
