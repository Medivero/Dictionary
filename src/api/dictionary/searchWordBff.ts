import { http } from '../http';

export default async function searchWordBff(substring: string) {
  try {
    const resp = await http.get(`api/dictionary/${substring}`);
    const data = await resp.data;
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
}
