import { useEffect, useState } from 'react';

// ذاكرة مؤقتة بسيطة على مستوى الجلسة لتقليل عدد قراءات Firestore أثناء التنقل بين الصفحات.
const data = new Map();
const inflight = new Map();

export function invalidateCache() {
  data.clear();
}

export function useCachedFetch(key, fetcher, ttl = 120000) {
  const hit = data.get(key);
  const fresh = Boolean(hit) && Date.now() - hit.at < ttl;
  const [state, setState] = useState({ loading: !fresh, error: null, value: fresh ? hit.value : null });

  useEffect(() => {
    if (fresh) {
      setState({ loading: false, error: null, value: hit.value });
      return undefined;
    }
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    let p = inflight.get(key);
    if (!p) {
      p = fetcher()
        .then((v) => {
          data.set(key, { value: v, at: Date.now() });
          return v;
        })
        .finally(() => inflight.delete(key));
      inflight.set(key, p);
    }
    p.then(
      (v) => alive && setState({ loading: false, error: null, value: v }),
      (e) => alive && setState({ loading: false, error: e, value: null }),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
