import { IForm } from '../../components/types';
import { http } from '../http';

export default async function addWord(form: IForm) {
  try {
    const response = await http.post('api/dictionary/add', form);
    const data = await response.data;
    return data;
  } catch (err) {
    console.log(err);
  }
}
