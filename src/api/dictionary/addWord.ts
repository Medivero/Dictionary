import axios from 'axios';
import { IForm } from '../../components/types';
import { API_URL } from '../../constants/config';

export default async function addWord(form: IForm) {
  try {
    const response = await axios.post(API_URL + 'api/dictionary/add', form);
    const data = await response.data;
    console.log(data);
    return data;
  } catch (err) {
    console.log(err);
  }
}
