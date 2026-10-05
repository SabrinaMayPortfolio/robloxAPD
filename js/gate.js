/* Password gate for the portfolio. Client-side only: it keeps casual visitors out, not determined ones. */
(() => {
  const KEY = 'sm-portfolio-pass';
  const HASH = 'e9b0ce41';
  const hash = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16); };
  let stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  if (stored === HASH) return;
  // Same-origin embeds (live prototype frames) inherit the parent page's gate.
  try { if (window.self !== window.top && window.top.location.origin === location.origin) return; } catch (e) {}

  const root = document.documentElement;
  root.classList.add('sm-locked');
  const css = `
html.sm-locked, html.sm-locked body { overflow: hidden !important; background: #5BB4F0; }
html.sm-locked body > *:not(#sm-gate) { visibility: hidden !important; }
#sm-gate {
  position: fixed; inset: 0; z-index: 2147483000; overflow: hidden; isolation: isolate;
  display: grid; place-items: center; padding: 1.5rem 1.25rem 32vh;
  background: linear-gradient(to bottom, #5BB4F0 0%, #D6EEFB 52%, #C3CBD8 60%);
  font-family: "Plus Jakarta Sans", "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif; color: #0B1220;
  transition: opacity 0.45s ease, transform 0.45s ease;
}
#sm-gate.is-leaving { opacity: 0; transform: scale(1.02); }
#sm-gate *, #sm-gate *::before, #sm-gate *::after { box-sizing: border-box; margin: 0; }
.smg-clouds { position: absolute; inset: 0 0 40% 0; z-index: -1; pointer-events: none; }
.smg-cloud {
  position: absolute; left: var(--x); top: var(--y); width: var(--w); aspect-ratio: 3 / 1;
  background:
    radial-gradient(closest-side, #fff 55%, rgb(255 255 255 / 0)) 0% 72% / 46% 70% no-repeat,
    radial-gradient(closest-side, #fff 55%, rgb(255 255 255 / 0)) 38% 0% / 50% 100% no-repeat,
    radial-gradient(closest-side, #fff 55%, rgb(255 255 255 / 0)) 100% 66% / 44% 76% no-repeat,
    radial-gradient(closest-side, #fff 60%, rgb(255 255 255 / 0)) 50% 100% / 92% 55% no-repeat;
  filter: blur(3px); opacity: var(--o, 0.9);
  animation: smg-drift var(--dur, 200s) linear infinite; animation-delay: calc(var(--dur, 200s) * -0.5);
}
@keyframes smg-drift { from { transform: translateX(-100vw); } to { transform: translateX(100vw); } }
.smg-ground {
  position: absolute; left: 0; right: 0; bottom: 0; height: 42%; z-index: -1; overflow: hidden; pointer-events: none;
  --tile-size: 76px; --block: calc(var(--tile-size) * 4);
  background: linear-gradient(to bottom, #C3CBD8, #A0AABB 45%);
  perspective: 900px; perspective-origin: 50% 100px;
}
.smg-ground::after {
  content: ""; position: absolute; inset: 0 0 auto 0; height: 38%; z-index: 2;
  background: linear-gradient(to bottom, #C3CBD8 0%, rgb(195 203 216 / 0.85) 20%, rgb(195 203 216 / 0.4) 60%, rgb(195 203 216 / 0) 100%);
}
.smg-plane {
  position: absolute; left: -150%; right: -150%; bottom: -140px; height: 3200px;
  transform-origin: 50% calc(100% - 140px); transform: rotateX(72deg);
  background-color: #A7B1C2;
  background-image:
    linear-gradient(90deg, transparent calc(100% - 3px), #6C788E calc(100% - 3px)),
    linear-gradient(180deg, transparent calc(100% - 3px), #6C788E calc(100% - 3px)),
    linear-gradient(90deg, transparent calc(100% - 2px), #8792A6 calc(100% - 2px)),
    linear-gradient(180deg, transparent calc(100% - 2px), #8792A6 calc(100% - 2px)),
    linear-gradient(90deg, rgb(255 255 255 / 0.25) 1px, transparent 1px),
    linear-gradient(180deg, rgb(255 255 255 / 0.25) 1px, transparent 1px),
    conic-gradient(#939EB1 25%, transparent 0 50%, #939EB1 0 75%, transparent 0);
  background-size:
    var(--block) var(--block), var(--block) var(--block),
    var(--tile-size) var(--tile-size), var(--tile-size) var(--tile-size),
    var(--tile-size) var(--tile-size), var(--tile-size) var(--tile-size),
    calc(var(--block) * 2) calc(var(--block) * 2);
  background-position: left bottom;
}
.smg-card {
  position: relative; width: 100%; max-width: 25rem; display: grid; gap: 1.25rem;
  padding: 2rem 1.75rem 1.75rem; border-radius: 20px; background: #fff;
  box-shadow: 0 18px 40px rgb(16 24 40 / 0.14), 0 6px 12px rgb(16 24 40 / 0.08);
}
.smg-card::after {
  content: ""; position: absolute; left: 6%; right: 6%; bottom: -26px; height: 30px; z-index: -1;
  background: radial-gradient(closest-side, rgb(55 66 92 / 0.3), rgb(55 66 92 / 0)); filter: blur(4px);
}
.smg-eyebrow {
  font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-weight: 600; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: #1D4ED8;
}
.smg-title {
  margin-top: 0.5rem; font-family: "Bricolage Grotesque", "Arial Black", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-weight: 800; font-size: clamp(1.75rem, 1.3rem + 1.6vw, 2.25rem); line-height: 1.02; letter-spacing: -0.02em; color: #0B1220;
}
.smg-form { display: grid; gap: 0.5rem; }
.smg-label { font-weight: 600; font-size: 0.875rem; color: #1A2740; }
.smg-row { display: flex; gap: 0.5rem; }
.smg-input {
  flex: 1; min-width: 0; min-height: 48px; padding: 0 0.95rem; border-radius: 12px;
  border: 1.5px solid #C9D2E3; background: #F7F9FC; color: #0B1220; font: inherit; font-size: 1rem;
}
.smg-input:focus { outline: none; border-color: #1D4ED8; box-shadow: 0 0 0 3px rgb(29 78 216 / 0.22); background: #fff; }
.smg-input[aria-invalid="true"] { border-color: #C93D2F; }
.smg-btn {
  min-height: 48px; padding: 0 1.25rem; border: 0; border-radius: 12px; cursor: pointer;
  background: #0B1220; color: #fff; font: inherit; font-weight: 700; font-size: 1rem;
}
.smg-btn:hover { background: #1A2740; }
.smg-btn:focus-visible { outline: 3px solid #1D4ED8; outline-offset: 2px; }
.smg-error { min-height: 1.25rem; font-size: 0.875rem; font-weight: 600; color: #B42318; }
.smg-shake { animation: smg-shake 0.35s ease; }
@keyframes smg-shake { 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
.smg-avatar {
  position: absolute; z-index: 1; left: 50%; translate: -50% 0; bottom: var(--ab);
  height: var(--ah); aspect-ratio: 330 / 470; pointer-events: none;
}
.smg-avatar img { display: block; width: 100%; height: 100%; }
.smg-bubble {
  position: absolute; right: 80%; bottom: 66%; width: max-content; max-width: min(16rem, 38vw);
  padding: 0.8rem 1rem; border-radius: 18px; background: #fff; color: #0B1220;
  font-weight: 700; font-size: 0.95rem; line-height: 1.35; text-wrap: balance;
  box-shadow: 0 10px 24px rgb(16 24 40 / 0.14), 0 2px 6px rgb(16 24 40 / 0.08);
  transform-origin: 100% 100%; animation: smg-pop 0.5s cubic-bezier(.2, 1.4, .4, 1) 0.35s both;
}
.smg-bubble::after {
  content: ""; position: absolute; right: -12px; bottom: 4px; width: 24px; height: 20px; background: #fff;
  clip-path: polygon(0 0, 100% 80%, 10% 100%);
}
@keyframes smg-pop { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
#sm-gate { --ah: min(520px, 50vh); --ab: 9vh; }
/* Card sits 110px above the top of her head (head top is 21.7% down the avatar image) */
.smg-card {
  position: absolute; z-index: 2; left: 50%; translate: -50% 0;
  width: min(25rem, calc(100% - 2.5rem));
  bottom: calc(var(--ab) + var(--ah) * 0.783 + 110px);
}
@media (max-width: 48rem) {
  #sm-gate { --ah: min(400px, 42vh); --ab: 6vh; }
  .smg-bubble { max-width: min(12rem, 44vw); font-size: 0.85rem; padding: 0.65rem 0.8rem; }
}
@media (max-width: 48rem) {
  .smg-ground { --tile-size: 56px; perspective: 700px; perspective-origin: 50% 80px; height: 36%; }
  .smg-plane { transform: rotateX(64deg); }
}
@media (prefers-reduced-motion: reduce) {
  .smg-cloud { animation: none; transform: none; }
  .smg-shake { animation: none; }
  .smg-bubble { animation: none; }
  #sm-gate { transition: none; }
}`;
  const style = document.createElement('style');
  style.id = 'sm-gate-style';
  style.textContent = css;
  (document.head || root).appendChild(style);

  const build = () => {
    const gate = document.createElement('div');
    gate.id = 'sm-gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-labelledby', 'smg-title');
    gate.innerHTML = `
      <div class="smg-clouds" aria-hidden="true">
        <span class="smg-cloud" style="--x: 5%; --y: 14%; --w: 15rem; --dur: 210s"></span>
        <span class="smg-cloud" style="--x: 60%; --y: 8%; --w: 20rem; --dur: 260s; --o: 0.85"></span>
        <span class="smg-cloud" style="--x: 82%; --y: 40%; --w: 12rem; --dur: 180s"></span>
        <span class="smg-cloud" style="--x: 30%; --y: 52%; --w: 17rem; --dur: 240s; --o: 0.7"></span>
      </div>
      <div class="smg-ground" aria-hidden="true"><div class="smg-plane"></div></div>
      <div class="smg-avatar">
        <img src="images/sab-avatar.svg" width="330" height="470" alt="" decoding="async">
        <p class="smg-bubble">Howdy, are you here for Sabrina's Portfolio?</p>
      </div>
      <div class="smg-card">
        <div>
          <p class="smg-eyebrow"><br></p>
          <h1 id="smg-title" class="smg-title">Enter the password to continue.</h1>
        </div>
        <form class="smg-form" novalidate>
          <label class="smg-label" for="smg-input">Password</label>
          <div class="smg-row">
            <input id="smg-input" class="smg-input" type="password" name="password" autocomplete="current-password" autocapitalize="off" spellcheck="false" required aria-describedby="smg-error">
            <button class="smg-btn" type="submit">Enter</button>
          </div>
          <p id="smg-error" class="smg-error" role="alert" aria-live="assertive"></p>
        </form>
      </div>`;
    document.body.appendChild(gate);
    const form = gate.querySelector('form');
    const input = gate.querySelector('input');
    const error = gate.querySelector('.smg-error');
    const card = gate.querySelector('.smg-card');
    input.focus();
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (hash('sm-portfolio:' + input.value.trim().toLowerCase()) === HASH) {
        try { localStorage.setItem(KEY, HASH); } catch (err) {}
        root.classList.remove('sm-locked');
        gate.classList.add('is-leaving');
        const done = () => { gate.remove(); style.remove(); };
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) done(); else setTimeout(done, 460);
        const skip = document.querySelector('.skip-link');
        if (skip) skip.focus({ preventScroll: true });
      } else {
        input.setAttribute('aria-invalid', 'true');
        error.textContent = "That password didn't work. Try again.";
        card.classList.remove('smg-shake'); void card.offsetWidth; card.classList.add('smg-shake');
        input.select();
      }
    });
    input.addEventListener('input', () => { input.removeAttribute('aria-invalid'); error.textContent = ''; });
  };
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
