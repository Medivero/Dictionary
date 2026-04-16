export interface IWord {
  name: string;
  translate: string;
  id: number;
}

export interface IDictionary {
  dictionary: IWord[];
}
