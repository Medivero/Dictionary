import { http } from '../http';

export default async function deleteWordBff(id: number) {
  try {
    const resp = await http.delete(`api/dictionary/${id}`);
    const data = resp.data;
    return data;
  } catch (error) {
    console.log(error);
  }
}
