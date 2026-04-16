import axios from 'axios';
import { IForm } from '../../components/types';
import { API_URL } from '../../constants/config';

export default async function editWordBff(form: IForm) {
  try {
    const resp = await axios.patch(API_URL + 'api/dictionary', form);
    const data = resp.data;
    return data;
  } catch (err) {
    console.log(err);
    return {};
  }
}
