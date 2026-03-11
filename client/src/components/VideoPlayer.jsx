import { useState, useRef, useEffect } from 'react';

export default function VideoPlayer({ src, subtitles, title, onProgress }) {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [muted, setMuted] = useState(false);
    const lastReported = useRef(0);

    const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

    const handleTime = () => {
        const v = videoRef.current;
        if (!v) return;
        const pct = (v.currentTime / v.duration) * 100;
        setProgress(pct);
        setCurrentTime(v.currentTime);
        [25, 50, 75, 100].forEach(ms => {
            if (pct >= ms && lastReported.current < ms) {
                lastReported.current = ms;
                onProgress?.({ percentage: ms, currentTime: v.currentTime, duration: v.duration });
            }
        });
    };

    const toggle = () => {
        const v = videoRef.current;
        if (!v) return;
        v.paused ? (v.play(), setPlaying(true)) : (v.pause(), setPlaying(false));
    };

    const seek = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        videoRef.current.currentTime = ((e.clientX - r.left) / r.width) * videoRef.current.duration;
    };

    const toggleFs = () => {
        !document.fullscreenElement ? containerRef.current?.requestFullscreen() : document.exitFullscreen();
    };

    useEffect(() => {
        const h = (e) => {
            if (e.code === 'Space') { e.preventDefault(); toggle(); }
            if (e.code === 'KeyM') setMuted(m => !m);
            if (e.code === 'KeyF') toggleFs();
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, []);

    return (
        <div ref={containerRef} className="relative group rounded-xl overflow-hidden bg-black max-w-4xl mx-auto">
            <video ref={videoRef} src={src} muted={muted} onTimeUpdate={handleTime}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                onClick={toggle} className="w-full aspect-video cursor-pointer" crossOrigin="anonymous" playsInline>
                {subtitles?.map((s, i) => (
                    <track key={i} kind="subtitles" src={s.src} srcLang={s.lang} label={s.label} default={i === 0} />
                ))}
            </video>
            {!playing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <button onClick={toggle} className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center" aria-label="Play">
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </button>
                </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                {title && <div className="text-white text-sm font-medium mb-2">{title}</div>}
                <div className="w-full h-1.5 bg-gray-600 rounded-full cursor-pointer mb-3 focus:outline-none focus:ring-2 focus:ring-[var(--g1)]" onClick={seek} role="button" tabIndex={0} aria-label="Seek Video" onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && seek(e)}>
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-3">
                        <button onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>{playing ? '⏸' : '▶️'}</button>
                        <button onClick={() => setMuted(!muted)} aria-label={muted ? 'Unmute' : 'Mute'}>{muted ? '🔇' : '🔊'}</button>
                        <span>{fmt(currentTime)} / {fmt(duration)}</span>
                    </div>
                    <button onClick={toggleFs} aria-label="Fullscreen">⛶</button>
                </div>
            </div>
        </div>
    );
}
