let ctx: AudioContext | null = null;

/** Desbloquea el audio en iOS (hay que llamarlo dentro de un toque). */
export function prepararAudio() {
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  } catch {
    ctx = null;
  }
}

export function pitido() {
  if (!ctx) return;
  const t = ctx.currentTime;
  [0, 0.22].forEach((d, i) => {
    const o = ctx!.createOscillator();
    const g = ctx!.createGain();
    o.frequency.value = i ? 1175 : 880;
    g.gain.setValueAtTime(0.0001, t + d);
    g.gain.exponentialRampToValueAtTime(0.25, t + d + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.18);
    o.connect(g).connect(ctx!.destination);
    o.start(t + d);
    o.stop(t + d + 0.2);
  });
  try {
    navigator.vibrate?.([120, 80, 120]);
  } catch {
    /* iOS no vibra */
  }
}

let lock: WakeLockSentinel | null = null;
export async function mantenerPantalla(on: boolean) {
  try {
    if (on && 'wakeLock' in navigator && !lock) {
      lock = await navigator.wakeLock.request('screen');
      lock.addEventListener('release', () => (lock = null));
    } else if (!on && lock) {
      await lock.release();
      lock = null;
    }
  } catch {
    lock = null;
  }
}
