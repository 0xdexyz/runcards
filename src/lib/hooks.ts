import { useEffect, useState } from 'react';

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [query]);
  return matches;
}

export interface Grid {
  cols: number;
  rows: number;
}

/** Square-ish cell grid that covers the viewport; `colsFor` picks the column count per width. */
export function useViewportGrid(colsFor: (width: number) => number): Grid {
  const compute = (): Grid => {
    const cols = colsFor(window.innerWidth);
    const size = window.innerWidth / cols;
    return { cols, rows: Math.ceil(window.innerHeight / size) };
  };
  const [grid, setGrid] = useState(compute);
  useEffect(() => {
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const next = compute();
        setGrid((prev) => (prev.cols === next.cols && prev.rows === next.rows ? prev : next));
      }, 150);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
    // colsFor is a pure function of width, so it is read once per resize.
  }, []);
  return grid;
}
