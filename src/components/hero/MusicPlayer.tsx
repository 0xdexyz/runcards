import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { tracks } from '../../content';
import { GenerativePlayer } from '../../lib/audio';
import { useCopy } from '../../lib/i18n';

export default function MusicPlayer() {
  const t = useCopy();
  const [playing, setPlaying] = useState(false);
  const [track, setTrack] = useState(0);
  const [hover, setHover] = useState(false);
  const player = useRef<GenerativePlayer | null>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const puck = useRef<HTMLSpanElement>(null);

  useEffect(() => () => player.current?.dispose(), []);

  useEffect(() => {
    if (!playing) return;
    const tick = () => {
      const p = player.current?.progress() ?? 0;
      if (fill.current) fill.current.style.transform = `scaleX(${p})`;
      if (puck.current) puck.current.style.left = `${p * 100}%`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [playing]);

  const start = (index: number) => {
    player.current ??= new GenerativePlayer();
    void player.current.play(tracks[index].id);
    setTrack(index);
    setPlaying(true);
  };

  const toggle = () => {
    if (playing) {
      player.current?.pause();
      setPlaying(false);
    } else start(track);
  };

  const expanded = playing || hover;

  return (
    <div
      className={`player${expanded ? ' is-expanded' : ''}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="player__track" aria-hidden="true">
        <span className="player__line" />
        <span className="player__fill" ref={fill} />
        <span className="player__puck" ref={puck} />
      </div>
      <button
        type="button"
        className={`player__toggle${playing ? ' is-playing' : ''}`}
        aria-label={playing ? t.a11y.pause : t.a11y.play}
        aria-pressed={playing}
        onClick={toggle}
      >
        <span className="player__icon" />
      </button>
      <button type="button" className="player__label" onClick={toggle}>
        {playing ? tracks[track].title : t.hero.play}
      </button>
      <div className="player__list">
        {tracks.map((tr, i) => (
          <button
            key={tr.id}
            type="button"
            className={`player__item${playing && i === track ? ' is-active' : ''}`}
            tabIndex={expanded ? 0 : -1}
            onClick={() => start(i)}
          >
            <span className="player__item-line" />
            <span>{tr.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
