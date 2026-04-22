import {
  Button,
  Input,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styles from './training-page.module.css';
import { IState } from '../../components/types/types';
import { IForm } from '../../components/types';
import { similarityPercent } from '../../utils/similarity';

type ResultKind = 'correct' | 'almost' | 'wrong';

function shuffle<T>(items: T[]) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function calcIterations(n: number) {
  if (n <= 0) return 0;
  return Math.max(1, Math.ceil(Math.log2(n)));
}

export const TrainingPage = () => {
  const dictionary = useSelector((state: IState) => state.dictionary);
  const username = useSelector((state: IState) => state.auth.user?.username);

  const n = dictionary.storage.length;
  const iterations = useMemo(() => calcIterations(n), [n]);

  const [phase, setPhase] = useState<'idle' | 'question' | 'result' | 'done'>(
    'idle',
  );
  const [questions, setQuestions] = useState<IForm[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<{
    kind: ResultKind;
    percent: number;
  } | null>(null);
  const [stats, setStats] = useState({ correct: 0, almost: 0, wrong: 0 });

  const current = questions[index];

  const start = () => {
    const selected = shuffle(dictionary.storage).slice(0, iterations);
    setQuestions(selected);
    setIndex(0);
    setAnswer('');
    setResult(null);
    setStats({ correct: 0, almost: 0, wrong: 0 });
    setPhase(selected.length > 0 ? 'question' : 'done');
  };

  const submit = () => {
    if (!current) return;
    const percent = similarityPercent(answer, current.name);
    const kind: ResultKind =
      percent === 100 ? 'correct' : percent >= 70 ? 'almost' : 'wrong';
    setResult({ kind, percent });
    setStats((s) => ({
      correct: s.correct + (kind === 'correct' ? 1 : 0),
      almost: s.almost + (kind === 'almost' ? 1 : 0),
      wrong: s.wrong + (kind === 'wrong' ? 1 : 0),
    }));
    setPhase('result');
  };

  const next = () => {
    const nextIndex = index + 1;
    if (nextIndex >= questions.length) {
      setPhase('done');
      return;
    }
    setIndex(nextIndex);
    setAnswer('');
    setResult(null);
    setPhase('question');
  };

  if (!dictionary.loaded) {
    return (
      <div className={styles.Container}>
        <CircularProgress />
      </div>
    );
  }

  if (iterations === 0) {
    return (
      <div className={styles.Container}>
        <Paper className={styles.Card}>
          <Typography variant="h6">Тренировка</Typography>
          <Typography className={styles.Meta}>
            Словарь пуст — добавьте слова, чтобы начать тренировку.
          </Typography>
          <div className={styles.Controls}>
            <Button component={Link} to="/" variant="outlined" color="inherit">
              На главную
            </Button>
          </div>
        </Paper>
      </div>
    );
  }

  return (
    <div className={styles.Container}>
      <Paper className={styles.Card}>
        <div className={styles.Row}>
          <div>
            <Typography variant="h6">Тренировка</Typography>
            <Typography className={styles.Meta}>
              {username ? `Пользователь: ${username}` : ''} · Вопросов:{' '}
              {iterations} (n={n})
            </Typography>
          </div>
          <Button component={Link} to="/" variant="outlined" color="inherit">
            Назад
          </Button>
        </div>

        {phase === 'idle' && (
          <div style={{ marginTop: '12px' }}>
            <Typography>
              Вопрос: перевод с русского на английский (введите слово).
            </Typography>
            <div className={styles.Controls}>
              <Button
                variant="contained"
                sx={{ bgcolor: 'black' }}
                onClick={start}
              >
                Начать
              </Button>
            </div>
          </div>
        )}

        {phase !== 'idle' && phase !== 'done' && current && (
          <div style={{ marginTop: '12px' }}>
            <Typography className={styles.Meta}>
              {index + 1} / {questions.length}
            </Typography>
            <Typography variant="h5" style={{ marginTop: '8px' }}>
              {current.translate}
            </Typography>

            <div style={{ marginTop: '12px' }}>
              <Typography fontWeight={'bold'}>Ваш ответ (англ.)</Typography>
              <Input
                value={answer}
                onChange={(e) => setAnswer((e.target as any).value)}
                placeholder="Введите перевод на английском"
                disableUnderline
                fullWidth={true}
                disabled={phase === 'result'}
              />
            </div>

            {phase === 'question' && (
              <div className={styles.Controls}>
                <Button
                  variant="contained"
                  sx={{ bgcolor: 'black' }}
                  onClick={submit}
                  disabled={answer.trim().length === 0}
                >
                  Проверить
                </Button>
              </div>
            )}

            {phase === 'result' && result && (
              <div style={{ marginTop: '12px' }}>
                <Typography fontWeight={'bold'}>
                  {result.kind === 'correct'
                    ? 'Правильно'
                    : result.kind === 'almost'
                      ? 'Почти'
                      : 'Неверно'}
                  {` (${result.percent}%)`}
                </Typography>
                {result.kind !== 'correct' && (
                  <Typography className={styles.Meta}>
                    Правильное написание: {current.name}
                  </Typography>
                )}
                <div className={styles.Controls}>
                  <Button
                    variant="contained"
                    sx={{ bgcolor: 'black' }}
                    onClick={next}
                  >
                    Следующее слово
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {phase === 'done' && (
          <div style={{ marginTop: '12px' }}>
            <Typography variant="h6">Тренировка завершена</Typography>
            <Typography className={styles.Meta}>
              Правильно: {stats.correct} · Почти: {stats.almost} · Неверно:{' '}
              {stats.wrong}
            </Typography>
            <div className={styles.Controls}>
              <Button
                variant="contained"
                sx={{ bgcolor: 'black' }}
                onClick={start}
              >
                Начать заново
              </Button>
              <Button component={Link} to="/" variant="outlined" color="inherit">
                На главную
              </Button>
            </div>
          </div>
        )}
      </Paper>
    </div>
  );
};

