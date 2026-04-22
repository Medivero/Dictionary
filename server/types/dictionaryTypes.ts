export interface IWord {
  name: string;
  translate: string;
  id: number;
}

export interface IUserDictionaryEntry {
  word: string;
  translate: string;
  created_at: number;
  updated_at: number;
}

export interface IUserActivityEntry {
  date: number;
  updated_word: string;
}

export interface IUserDb {
  id: string;
  username: string;
  password: string;
  created_at: number;
  updated_at: number;
  user_dictionary: IUserDictionaryEntry[];
  user_activity_dates: IUserActivityEntry[];
}

export interface IDictionary {
  users: IUserDb[];
}
