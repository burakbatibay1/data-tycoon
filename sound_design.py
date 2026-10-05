"""
DATA TYCOON — prosedürel ses tasarımı (v7.5)
Tüm sesler bu betikle üretilir; dış kaynak/lisans gerekmez.
  python3 tools/sound_design.py  ->  *.mp3 (44.1 kHz stereo)
Ortam sesleri 60 sn, kendi içinde boşluksuz döngü (eşit güçlü çapraz geçiş).
"""
import numpy as np, subprocess, os, sys
from scipy import signal

SR = 44100
rng = np.random.default_rng(7)
OUT = next((a for a in sys.argv[1:] if not a.startswith("--")), ".")

# ---------------- yardımcılar ----------------
def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], btype="band", output="sos")
    return signal.sosfilt(sos, x, axis=0)
def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f / (SR / 2), output="sos"), x, axis=0)
def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f / (SR / 2), btype="high", output="sos"), x, axis=0)
def pink(n):
    w = rng.standard_normal(n); f = np.fft.rfft(w); k = np.arange(len(f)); k[0] = 1
    return np.fft.irfft(f / np.sqrt(k), n)
def brown(n):
    b = np.cumsum(rng.standard_normal(n)); return hp(b - b.mean(), 20)
def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
def db(v): return 10 ** (v / 20)
def norm_rms(x, target_db): return x * (db(target_db) / rms(x))
def env_ad(n, a, d):  # attack/decay saniye
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / max(d, 1e-4)); return e
def smooth_rand(n, rate_hz, lo, hi):  # yavaş rastgele eğri
    pts = max(4, int(n / SR * rate_hz) + 3); v = rng.uniform(lo, hi, pts)
    return np.interp(np.linspace(0, pts - 1, n), np.arange(pts), v)
def pan(mono, p):  # p: -1 sol, +1 sağ (eşit güç)
    a = (p + 1) * np.pi / 4; return np.stack([mono * np.cos(a), mono * np.sin(a)], 1)
def stereo_decorr(n, gen):
    return np.stack([gen(n), gen(n)], 1)
def add_at(buf, snd, t0):
    i = int(t0 * SR); j = min(len(buf), i + len(snd));
    if i < len(buf): buf[i:j] += snd[: j - i]
def reverb(x, secs=1.1, wet=0.18, damp=5000):
    n = int(secs * SR); t = np.arange(n) / SR
    ir = np.stack([rng.standard_normal(n), rng.standard_normal(n)], 1) * np.exp(-t * 6.5 / secs)[:, None]
    ir = lp(ir, damp); ir /= np.sqrt(np.sum(ir ** 2, 0, keepdims=True))
    if x.ndim == 1: x = np.stack([x, x], 1)
    y = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], 1)
    return x * (1 - wet) + y * wet
def seamless(x, xf=3.0):
    """Son xf saniyeyi başa eşit güçle karıştırıp döngü dikişini yok eder."""
    k = int(xf * SR); head, body, tail = x[:k], x[k:-k], x[-k:]
    a = np.sin(np.linspace(0, np.pi / 2, k))[:, None]; b = np.cos(np.linspace(0, np.pi / 2, k))[:, None]
    return np.concatenate([head * a + tail * b, body], 0)
def write_mp3(name, x, kbps=160, peak_db=-1.0):
    if x.ndim == 1: x = np.stack([x, x], 1)
    pk = np.max(np.abs(x));
    if pk > db(peak_db): x = x * (db(peak_db) / pk)
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()
    path = os.path.join(OUT, name)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "libmp3lame", "-b:a", f"{kbps}k", path], input=pcm, check=True)
    print(f"{name:24s} {len(x)/SR:5.1f} sn  rms {20*np.log10(rms(x)):6.1f} dBFS  {os.path.getsize(path)//1024} KB")

# ---------------- ofis bileşenleri ----------------
def keystroke(heavy=False):
    n = int(0.09 * SR); click = bp(rng.standard_normal(n), 1800, 6500) * env_ad(n, 0.0004, 0.006)
    thock = bp(rng.standard_normal(n), 140, 420) * env_ad(n, 0.0015, 0.022 if not heavy else 0.04)
    return click * rng.uniform(0.5, 1.0) + thock * (1.6 if heavy else 0.9) * rng.uniform(0.6, 1.0)
def typing_burst(dist):
    keys = rng.integers(6, 34); t = 0.0; parts = []
    for _ in range(keys):
        parts.append((t, keystroke(heavy=rng.random() < 0.12)))
        t += rng.uniform(0.07, 0.19) + (rng.uniform(0.25, 0.6) if rng.random() < 0.08 else 0)
    out = np.zeros(int((t + 0.2) * SR))
    for t0, s in parts: add_at(out, s, t0)
    out = lp(out, 7000 - dist * 3800) * (1.0 - dist * 0.65)
    return out
def mouse_click():
    n = int(0.05 * SR); s = bp(rng.standard_normal(n), 2500, 7000) * env_ad(n, 0.0003, 0.004)
    out = np.zeros(int(0.2 * SR)); add_at(out, s, 0)
    if rng.random() < 0.35: add_at(out, s * 0.8, rng.uniform(0.09, 0.14))
    return out * 0.5
def cup_clink():
    n = int(0.6 * SR); t = np.arange(n) / SR; f0 = rng.uniform(1900, 2600)
    s = sum(a * np.sin(2 * np.pi * f0 * m * t) * np.exp(-t * d) for a, m, d in [(1, 1, 18), (.5, 1.62, 26), (.3, 2.71, 34)])
    return s * env_ad(n, 0.001, 0.25) * 0.18
def paper_rustle():
    n = int(rng.uniform(0.35, 0.8) * SR)
    return bp(rng.standard_normal(n), 2200, 9000) * signal.windows.tukey(n, 0.6) * smooth_rand(n, 18, 0.2, 1.0) * 0.22
def murmur(n, level_db):
    """Uzak konuşma: biçimlendirici filtreli gürültü + hece zarfı; anlaşılmaz."""
    out = np.zeros(n); t = 0.0
    while t < n / SR:
        dur = rng.uniform(1.6, 4.5); m = int(dur * SR); i0 = int(t * SR)
        src = rng.standard_normal(m); f1 = rng.uniform(420, 700); f2 = rng.uniform(1100, 1700)
        v = bp(src, f1 * .8, f1 * 1.2) + 0.6 * bp(src, f2 * .85, f2 * 1.15)
        syl = np.clip(np.sin(2 * np.pi * rng.uniform(3.2, 5.2) * np.arange(m) / SR + rng.uniform(0, 6)), 0, 1) ** 1.5
        v *= syl * signal.windows.tukey(m, 0.3)
        j = min(n, i0 + m); out[i0:j] += v[: j - i0]
        t += dur + rng.uniform(0.6, 3.5)
    return norm_rms(lp(out, 2200), level_db)

def office(night=False, secs=63):
    n = int(secs * SR)
    room = stereo_decorr(n, lambda m: lp(pink(m), 900 if night else 1300)); room = norm_rms(room, -42 if night else -40)
    hvac = brown(n); hvac = bp(hvac, 60, 320) * smooth_rand(n, 0.08, 0.85, 1.0)
    t = np.arange(n) / SR; hum = 0.35 * np.sin(2 * np.pi * 59.7 * t) + 0.18 * np.sin(2 * np.pi * 119.4 * t)
    hvac = norm_rms(hvac + hum * rms(hvac), -41 if night else -43)
    x = room + pan(hvac, 0.0)
    if not night:
        x += pan(murmur(n, -47), -0.45) + pan(murmur(n, -49), 0.55)
    else:
        traffic = norm_rms(lp(brown(n), 180) * smooth_rand(n, 0.12, 0.4, 1.0), -44); x += pan(traffic, 0.25)
    # olaylar
    def scatter(rate_per_min, make, pan_range, start=1.2):
        t0 = start
        while t0 < secs - 3:
            s = make()
            add_at(x, pan(s, rng.uniform(*pan_range)), t0)
            t0 += rng.exponential(60 / rate_per_min)
    scatter(5 if night else 11, lambda: typing_burst(rng.uniform(0.0, 0.25)) * db(-23), (-0.35, 0.1), start=1.0)   # yakın klavye
    scatter(2 if night else 9, lambda: typing_burst(rng.uniform(0.55, 0.9)) * db(-28), (0.2, 0.8))                # uzak klavye
    scatter(1 if night else 4, lambda: mouse_click() * db(-22), (-0.3, 0.2))
    if not night:
        scatter(1.2, lambda: cup_clink() * db(-14), (-0.8, 0.8)); scatter(1.5, lambda: paper_rustle() * db(-18), (-0.6, 0.6))
    x = reverb(x, 0.9, 0.12, 4500)
    return seamless(x, 3.0)

# ---------------- hava ----------------
def rain(secs=63):
    n = int(secs * SR)
    bed = stereo_decorr(n, lambda m: bp(pink(m), 220, 4800)) + 0.5 * stereo_decorr(n, lambda m: bp(brown(m), 90, 400)) * 0.02; bed *= smooth_rand(n, 0.15, 0.75, 1.0)[:, None]
    bed = norm_rms(bed, -27)
    # cama vuran damlalar
    drops = np.zeros((n, 2)); cnt = int(secs * 38)
    for _ in range(cnt):
        m = int(0.03 * SR); f = rng.uniform(1300, 4800)
        d = bp(rng.standard_normal(m), f * .7, min(f * 1.4, 20000)) * env_ad(m, 0.0002, rng.uniform(0.002, 0.008)) * rng.uniform(0.2, 1.0)
        add_at(drops, pan(d, rng.uniform(-0.9, 0.9)), rng.uniform(0, secs - 0.05))
    drops = norm_rms(drops, -35)
    # pervaz/denizlik üzerine iri damlalar
    sill = np.zeros((n, 2))
    for _ in range(int(secs * 3.2)):
        m = int(0.08 * SR); d = bp(rng.standard_normal(m), 500, 1600) * env_ad(m, 0.001, 0.02)
        add_at(sill, pan(d, rng.uniform(-0.6, 0.6)), rng.uniform(0, secs - 0.1))
    sill = norm_rms(sill, -38)
    # oluk damlası (tonal, ritmik)
    gut = np.zeros((n, 2)); t0 = 0.4
    while t0 < secs - 1:
        m = int(0.25 * SR); tt = np.arange(m) / SR; f = rng.uniform(1150, 1500)
        pl = np.sin(2 * np.pi * f * tt * (1 - 0.25 * tt)) * np.exp(-tt * 28) * 0.5
        add_at(gut, pan(pl, 0.7), t0); t0 += rng.uniform(1.0, 1.7)
    gut = norm_rms(gut, -44)
    # uzak gök gürültüsü (tek, yumuşak)
    th = np.zeros((n, 2)); m = int(7 * SR); r = lp(brown(m), 110) * env_ad(m, 0.9, 2.2)
    add_at(th, pan(norm_rms(r, -31) * 1.0, -0.3), 34.0)
    x = bed + drops + sill + gut + th
    x = lp(x, 5600, 3)  # cam arkasından dinleniyor
    return seamless(reverb(x, 0.8, 0.10, 6000), 3.0)

def wind(secs=63):
    n = int(secs * SR); gust = smooth_rand(n, 0.22, 0.25, 1.0) ** 1.6
    src = stereo_decorr(n, lambda m: 0.6 * pink(m) + 0.4 * brown(m) * 0.05)
    out = np.zeros_like(src); hop = 2048
    for i in range(0, n, hop):  # zamanla değişen bant geçiren (rüzgârın "nefesi")
        g = gust[i]; lo = 120 + 260 * g; hi = 500 + 1600 * g
        seg = src[max(0, i - 4096): i + hop]
        y = bp(seg, lo, hi)[-min(hop, n - i):]; out[i: i + len(y)] = y
    out *= (0.25 + gust)[:, None]
    t = np.arange(n) / SR; wh_f = 760 + 340 * gust
    whistle = np.sin(2 * np.pi * np.cumsum(wh_f) / SR) * (gust ** 3) * 0.6
    rattle = np.zeros((n, 2))
    for _ in range(int(secs * 0.25)):
        m = int(0.12 * SR); d = bp(rng.standard_normal(m), 90, 260) * env_ad(m, 0.002, 0.03)
        add_at(rattle, pan(d, rng.uniform(-0.4, 0.4)), rng.uniform(0, secs - 0.2))
    x = norm_rms(out, -26) + pan(norm_rms(whistle, -46), 0.35) + norm_rms(rattle, -40)
    return seamless(reverb(lp(x, 6500), 1.0, 0.12), 3.0)

# ---------------- arayüz efektleri ----------------
def bell(f, dur, partials=((1, 1, 3.2), (.42, 2.76, 6), (.22, 5.4, 9), (.12, 8.9, 13)), attack=0.004):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * m * t + rng.uniform(0, 6)) * np.exp(-t * d) for a, m, d in partials)
    return s * np.minimum(1, t / attack)
def mallet(f, dur=0.9):
    return bell(f, dur, ((1, 1, 6), (.25, 3.9, 14), (.08, 9.2, 30)), 0.002)
def place(parts, total):
    out = np.zeros(int(total * SR))
    for t0, s, g in parts: add_at(out, s * g, t0)
    return out
def fx(x, wet=0.22, secs=1.4): return reverb(x, secs, wet, 7000)

def sfx_all():
    A = {}
    A["notification.mp3"] = fx(place([(0, mallet(1046.5, .8), .55), (.11, mallet(1567.98, 1.0), .5)], 1.4), .2)
    A["success.mp3"] = fx(place([(0, bell(523.25, 1.4), .32), (.09, bell(659.25, 1.4), .3), (.18, bell(783.99, 1.6), .32), (.27, bell(1046.5, 1.8), .26)], 2.2), .28, 1.8)
    t = np.arange(int(.32 * SR)) / SR
    tone = lambda f: (np.sin(2 * np.pi * f * t) + .25 * np.sin(2 * np.pi * 2 * f * t)) * env_ad(len(t), .01, .12) * (1 + .15 * np.sin(2 * np.pi * 9 * t))
    A["warning.mp3"] = fx(place([(0, tone(466.16), .4), (.2, tone(369.99), .4)], .9), .15)
    A["elevator-ding.mp3"] = fx(place([(0, bell(1318.5, 2.4, ((1, 1, 1.6), (.35, 2.0, 2.8), (.2, 3.0, 4.5), (.1, 4.2, 6))), .45)], 2.6), .25, 2.0)
    # terfi: sıcak akor kabarması + yükselen pırıltı
    n = int(3.6 * SR); tt = np.arange(n) / SR; sw = np.minimum(1, tt / 1.1) * np.exp(-np.maximum(0, tt - 1.6) / 1.1)
    chord = sum(np.sin(2 * np.pi * f * tt) * a for f, a in [(261.63, .5), (329.63, .4), (392.0, .4), (493.88, .25), (587.33, .2)])
    pad = lp(chord * sw, 2500) * .35
    sparkle = place([(.35 + i * .11, bell(f, 1.6), .16) for i, f in enumerate([523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98])], 3.6)
    A["promotion.mp3"] = fx(pad[: len(sparkle)] + sparkle, .3, 2.2)
    # olay: gergin ama tiz olmayan nabız + alçak drone
    n = int(3.2 * SR); tt = np.arange(n) / SR
    pulse = sum(lp(signal.square(2 * np.pi * f * tt) * 0.3, 1800) * ((tt % .8) < .32) * ((tt >= st) & (tt < st + .8)) for f, st in [(587.33, 0), (440, .8), (587.33, 1.6)])
    drone = lp(brown(n), 140) * .8 * env_ad(n, .3, 2.0)
    A["incident.mp3"] = fx(pulse * np.minimum(1, tt / .01) * .55 + norm_rms(drone, -26), .18)
    n = int(.06 * SR); A["click.mp3"] = place([(0, bp(rng.standard_normal(n), 1500, 6000) * env_ad(n, .0005, .006), .35)], .12)
    return A

if __name__ == "__main__" and "--rain-only" in sys.argv:
    write_mp3("rain-window.mp3", norm_rms(rain(), -24), 160); sys.exit()
if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    write_mp3("office-day.mp3", norm_rms(office(False), -27), 160)
    write_mp3("office-night.mp3", norm_rms(office(True), -30), 160)
    write_mp3("rain-window.mp3", norm_rms(rain(), -24), 160)
    write_mp3("wind-window.mp3", norm_rms(wind(), -25), 160)
    for k, v in sfx_all().items(): write_mp3(k, v, 192, -1.5)
