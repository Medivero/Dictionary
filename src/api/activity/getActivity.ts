import { http } from '../http';

export type UserActivityEntry = { date: number; updated_word: string };

export async function getActivity() {
  const resp = await http.get<{ user_activity_dates: UserActivityEntry[] }>(
    'api/activity',
  );
  return resp.data;
}

