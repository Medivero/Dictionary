import { Button, CircularProgress, Paper, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './activity-page.module.css';
import { getActivity, UserActivityEntry } from '../../api/activity/getActivity';

function startOfDayTs(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function keyFromTs(ts: number) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function monthTitle(year: number, monthIndex: number) {
  const d = new Date(year, monthIndex, 1);
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function toMondayIndex(jsDay: number) {
  // JS: 0=Sun..6=Sat => 0=Mon..6=Sun
  return (jsDay + 6) % 7;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const ActivityPage = () => {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<UserActivityEntry[]>([]);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth()); // 0..11
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getActivity()
      .then((data) => {
        if (!mounted) return;
        setEntries(data.user_activity_dates ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setEntries([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, UserActivityEntry[]>();
    for (const e of entries) {
      const k = keyFromTs(e.date);
      const arr = map.get(k) ?? [];
      arr.push(e);
      map.set(k, arr);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => a.date - b.date);
      map.set(k, arr);
    }
    return map;
  }, [entries]);

  useEffect(() => {
    if (selectedKey) return;
    // auto select "today" if has activity; else first active day in month; else null
    const todayKey = keyFromTs(Date.now());
    if (grouped.has(todayKey)) {
      setSelectedKey(todayKey);
      return;
    }
    const monthKeyPrefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}-`;
    const first = [...grouped.keys()].find((k) => k.startsWith(monthKeyPrefix));
    if (first) setSelectedKey(first);
  }, [grouped, monthIndex, selectedKey, year]);

  const monthCells = useMemo(() => {
    const first = new Date(year, monthIndex, 1);
    const firstWeekday = toMondayIndex(first.getDay());
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const prevMonthDays = new Date(year, monthIndex, 0).getDate();
    const cells: Array<{
      ts: number;
      day: number;
      inMonth: boolean;
      key: string;
    }> = [];

    // leading (prev month)
    for (let i = 0; i < firstWeekday; i++) {
      const day = prevMonthDays - (firstWeekday - 1 - i);
      const d = new Date(year, monthIndex - 1, day);
      const ts = startOfDayTs(d.getTime());
      cells.push({ ts, day, inMonth: false, key: keyFromTs(ts) });
    }

    // current month
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, monthIndex, day);
      const ts = startOfDayTs(d.getTime());
      cells.push({ ts, day, inMonth: true, key: keyFromTs(ts) });
    }

    // trailing (next month) to full weeks (42 cells)
    while (cells.length % 7 !== 0) {
      const last = cells[cells.length - 1];
      const d = new Date(last.ts);
      d.setDate(d.getDate() + 1);
      const ts = startOfDayTs(d.getTime());
      cells.push({
        ts,
        day: d.getDate(),
        inMonth: false,
        key: keyFromTs(ts),
      });
    }
    while (cells.length < 42) {
      const last = cells[cells.length - 1];
      const d = new Date(last.ts);
      d.setDate(d.getDate() + 1);
      const ts = startOfDayTs(d.getTime());
      cells.push({
        ts,
        day: d.getDate(),
        inMonth: false,
        key: keyFromTs(ts),
      });
    }

    return cells;
  }, [monthIndex, year]);

  const selectedEntries = selectedKey ? grouped.get(selectedKey) ?? [] : [];

  const prevMonth = () => {
    const m = monthIndex - 1;
    if (m < 0) {
      setMonthIndex(11);
      setYear((y) => y - 1);
    } else {
      setMonthIndex(m);
    }
    setSelectedKey(null);
  };

  const nextMonth = () => {
    const m = monthIndex + 1;
    if (m > 11) {
      setMonthIndex(0);
      setYear((y) => y + 1);
    } else {
      setMonthIndex(m);
    }
    setSelectedKey(null);
  };

  return (
    <div className={styles.Container}>
      <Paper className={styles.Card}>
        <div className={styles.HeaderRow}>
          <div>
            <Typography variant="h6">Активность</Typography>
            <Typography className={styles.Meta}>
              Записи берутся из `user_activity_dates` в базе.
            </Typography>
          </div>
          <Button component={Link} to="/" variant="outlined" color="inherit">
            Назад
          </Button>
        </div>

        {loading ? (
          <div style={{ marginTop: '12px' }}>
            <CircularProgress />
          </div>
        ) : (
          <>
            <div className={styles.CalendarHeader}>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={prevMonth}
              >
                ←
              </Button>
              <Typography fontWeight={'bold'}>
                {monthTitle(year, monthIndex)}
              </Typography>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={nextMonth}
              >
                →
              </Button>
            </div>

            <div className={styles.Grid}>
              {WEEKDAYS.map((w) => (
                <div key={w} className={styles.Weekday}>
                  {w}
                </div>
              ))}
              {monthCells.map((c) => {
                const count = grouped.get(c.key)?.length ?? 0;
                const selected = selectedKey === c.key;
                return (
                  <div
                    key={c.key}
                    className={[
                      styles.Cell,
                      !c.inMonth ? styles.CellMuted : '',
                      selected ? styles.CellSelected : '',
                    ].join(' ')}
                    onClick={() => setSelectedKey(c.key)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.CellTop}>
                      <span>{c.day}</span>
                      {count > 0 && <span className={styles.Badge}>{count}</span>}
                    </div>
                    <div style={{ fontSize: '11px', color: 'gray' }}>
                      {count > 0 ? 'есть активность' : ''}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '12px' }}>
              <Typography fontWeight={'bold'}>
                {selectedKey ? `День: ${selectedKey}` : 'Выберите день'}
              </Typography>
              {selectedEntries.length === 0 ? (
                <Typography className={styles.Meta}>
                  Нет активности за выбранный день.
                </Typography>
              ) : (
                <div className={styles.List}>
                  {selectedEntries.map((e, i) => (
                    <div className={styles.ListItem} key={`${e.date}-${i}`}>
                      <Typography>{e.updated_word}</Typography>
                      <Typography className={styles.Meta}>
                        {new Date(e.date).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </Paper>
    </div>
  );
};

