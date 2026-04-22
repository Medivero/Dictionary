import { IForm } from '../../components/types';
import { http } from '../http';

export default async function editWordBff(form: IForm) {
  try {
    const resp = await http.patch('api/dictionary', form);
    const data = resp.data;
    return data;
  } catch (err) {
    console.log(err);
    return {};
  }
}
