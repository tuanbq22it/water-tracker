import React, { useEffect, useState } from 'react';
import './App.css';

type Entry = {
  id: string;
  time: string;
  amount: number;
};

const STORAGE_TOTAL_KEY = 'water_total';
const STORAGE_HISTORY_KEY = 'water_history';
const DAILY_GOAL = 2000; // ml, UI goal

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function saveToStorage(key: string, value: string) {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.set({ key, value });
  } catch (e) {
    // graceful fallback: use localStorage
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      // ignore
    }
  }
}

async function getFromStorage(key: string) {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    const res = await Preferences.get({ key });
    return res.value;
  } catch (e) {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }
}

async function tryHaptic() {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    if (Haptics && Haptics.impact) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  } catch (e) {
    // ignore if not available
    try {
      // fallback vibration API
      if (navigator && 'vibrate' in navigator) {
        // 20ms pulse
        (navigator as any).vibrate?.(20);
      }
    } catch {
      // ignore
    }
  }
}

function App() {
  const [total, setTotal] = useState<number>(0);
  const [history, setHistory] = useState<Entry[]>([]);
  const [view, setView] = useState<'main' | 'history'>('main');

  useEffect(() => {
    (async () => {
      const t = await getFromStorage(STORAGE_TOTAL_KEY);
      const h = await getFromStorage(STORAGE_HISTORY_KEY);
      if (t) {
        const n = parseInt(t, 10);
        if (!isNaN(n)) setTotal(n);
      }
      if (h) {
        try {
          const parsed = JSON.parse(h) as Entry[];
          setHistory(parsed);
        } catch {
          setHistory([]);
        }
      }
    })();
  }, []);

  const addWater = async (amount: number) => {
    await tryHaptic();
    const newTotal = total + amount;
    const entry: Entry = { id: String(Date.now()), time: new Date().toISOString(), amount };
    const newHistory = [entry, ...history];
    setTotal(newTotal);
    setHistory(newHistory);
    await saveToStorage(STORAGE_TOTAL_KEY, String(newTotal));
    await saveToStorage(STORAGE_HISTORY_KEY, JSON.stringify(newHistory));
  };

  const clearAll = async () => {
    setTotal(0);
    setHistory([]);
    await saveToStorage(STORAGE_TOTAL_KEY, '0');
    await saveToStorage(STORAGE_HISTORY_KEY, JSON.stringify([]));
  };

  const percent = Math.min(100, Math.round((total / DAILY_GOAL) * 100));

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Water Tracker</h1>
        <nav className="tabs">
          <button className={view === 'main' ? 'active' : ''} onClick={() => setView('main')}>Main</button>
          <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>History</button>
        </nav>
      </header>

      {view === 'main' && (
        <main className="main-screen">
          <div className="card center">
            <div className="progress-wrap">
              <svg className="progress-ring" width="180" height="180" viewBox="0 0 160 160">
                <circle className="ring-bg" cx="80" cy="80" r="60" fill="none" strokeWidth="10" />
                <circle
                  className="ring-fg"
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  strokeWidth="10"
                  strokeDasharray={Math.PI * 2 * 60}
                  strokeDashoffset={Math.PI * 2 * 60 * (1 - percent / 100)}
                />
                <text x="50%" y="48%" dominantBaseline="middle" textAnchor="middle" className="ring-text">
                  {total}ml
                </text>
                <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" className="ring-subtext">
                  {percent}% of goal
                </text>
              </svg>
            </div>

            <div className="quick-buttons">
              <button onClick={() => addWater(100)}>+100ml</button>
              <button onClick={() => addWater(200)}>+200ml</button>
              <button onClick={() => addWater(300)}>+300ml</button>
            </div>
            <div className="goal-line">Goal: {DAILY_GOAL}ml • {percent}%</div>
          </div>
        </main>
      )}

      {view === 'history' && (
        <main className="history-screen">
          <div className="card list-card">
            <div className="list-header">
              <h2>History</h2>
              <div>
                <button className="small" onClick={() => setHistory([]) as any & Promise<void>}>
                  Clear visible
                </button>
                <button className="small danger" onClick={clearAll}>Reset All</button>
              </div>
            </div>
            {history.length === 0 ? (
              <p className="muted">No entries yet. Add water from Main.</p>
            ) : (
              <ul className="history-list">
                {history.map((e) => (
                  <li key={e.id} className="history-item">
                    <div className="time">{formatTime(e.time)}</div>
                    <div className="amount">+{e.amount}ml</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      )}

      {/*<footer className="app-footer">
        <small>Simple Water Tracker • Data stored locally</small>
      </footer>*/}
    </div>
  );
}

export default App;
