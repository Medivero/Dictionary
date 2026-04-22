import { IForm } from '../../components/types';
import { http } from '../http';

export default async function getDictionaryFromBff() {
  try {
    const resp = await http.get('api/dictionary');
    const data: { dictionary: IForm[] } = await resp.data;
    return data;
  } catch (err) {
    console.log(err);
    return { dictionary: [] };
  }
}
