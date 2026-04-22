import { http } from '../http';

export default async function translateWordBff(name: string) {
  try {
    const resp = await http.get(`api/word/translate/${name}`);
    const data = resp.data;
    return data;
  } catch (err) {
    console.log(err);
    return '';
  }
}
