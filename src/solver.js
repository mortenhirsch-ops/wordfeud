// Wordfeud-løser (dansk) — kerne-logik
// Bræt: 15x15, standard Wordfeud-layout. Brikværdier: officielle danske (wordfeud.com/wf/help/)

const N = 15;

const LETTER_VALUES = {
  a:1, b:3, c:8, d:2, e:1, f:3, g:3, h:4, i:3, j:4, k:3, l:2, m:4,
  n:1, o:2, p:4, r:1, s:2, t:2, u:3, v:4, x:8, y:4, z:9, 'æ':4, 'ø':4, 'å':4
};

const ALPHABET = Object.keys(LETTER_VALUES);

// Standard Wordfeud-bræt, øverste venstre kvart (spejles)
const QUARTER = [
  '3l -- -- -- 3w -- -- 2l',
  '-- 2l -- -- -- 3l -- --',
  '-- -- 2w -- -- -- 2l --',
  '-- -- -- 3l -- -- -- 2w',
  '3w -- -- -- 2w -- 2l --',
  '-- 3l -- -- -- 3l -- --',
  '-- -- 2l -- 2l -- -- --',
  '2l -- -- 2w -- -- -- ss',
].map(r => r.split(' '));

function buildBonus() {
  const b = [];
  for (let y = 0; y < N; y++) {
    b.push([]);
    for (let x = 0; x < N; x++) {
      const qy = y < 8 ? y : 14 - y;
      const qx = x < 8 ? x : 14 - x;
      const c = QUARTER[qy][qx];
      let lm = 1, wm = 1;
      if (c[1] === 'l') lm = +c[0];
      else if (c[1] === 'w') wm = +c[0];
      b[y].push({ lm, wm });
    }
  }
  return b;
}
const BONUS = buildBonus();

// Ordbog
function makeDict(words) {
  const set = new Set(words);
  const byLen = [];
  for (let l = 0; l <= N; l++) byLen.push([]);
  words.forEach((w, i) => { if (w.length <= N) byLen[w.length].push(i); });
  // indeks: (len, pos, bogstav) -> ord-indekser
  const li = {}; ALPHABET.forEach((c, i) => li[c] = i);
  const idx = new Map();
  words.forEach((w, i) => {
    if (w.length > N) return;
    for (let p = 0; p < w.length; p++) {
      const k = (w.length * 16 + p) * 32 + li[w[p]];
      let a = idx.get(k);
      if (!a) { a = []; idx.set(k, a); }
      a.push(i);
    }
  });
  return { words, set, byLen, idx, li };
}

// board: 15x15 array af {ch: 'a'|null, blank: bool}
function emptyBoard() {
  return Array.from({ length: N }, () => Array.from({ length: N }, () => ({ ch: null, blank: false })));
}

function boardIsEmpty(board) {
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (board[y][x].ch) return false;
  return true;
}

// rack: streng, '*' = blank, fx "abcde*å"
function parseRack(rack) {
  const counts = {}; let blanks = 0;
  for (const c of rack.toLowerCase()) {
    if (c === '*') blanks++;
    else if (LETTER_VALUES[c] != null) counts[c] = (counts[c] || 0) + 1;
  }
  return { counts, blanks };
}

function findMoves(board, rackStr, dict, limit = 25) {
  const rack = parseRack(rackStr);
  const rackSize = Object.values(rack.counts).reduce((a, b) => a + b, 0) + rack.blanks;
  if (rackSize === 0) return [];
  const empty = boardIsEmpty(board);
  const results = [];

  // hjælpe-funktion: hent celle på linje
  for (const horiz of [true, false]) {
    for (let li = 0; li < N; li++) {
      // linje li: celler (x,y)
      const cell = i => horiz ? board[li][i] : board[i][li];
      const bonus = i => horiz ? BONUS[li][i] : BONUS[i][li];

      // krydstjek pr. tom celle: tilladte bogstaver + basisscore + om der ER et krydsord
      const cross = [];
      for (let i = 0; i < N; i++) {
        const c = cell(i);
        if (c.ch) { cross.push(null); continue; }
        // perpendikulær linje
        let pre = '', preScore = 0, suf = '', sufScore = 0;
        const pcell = j => horiz ? board[j][i] : board[i][j];
        const pos = li; // index på den perpendikulære linje
        for (let j = pos - 1; j >= 0 && pcell(j).ch; j--) { const cc = pcell(j); pre = cc.ch + pre; preScore += cc.blank ? 0 : LETTER_VALUES[cc.ch]; }
        for (let j = pos + 1; j < N && pcell(j).ch; j++) { const cc = pcell(j); suf += cc.ch; sufScore += cc.blank ? 0 : LETTER_VALUES[cc.ch]; }
        if (!pre && !suf) { cross.push({ any: true, base: 0, has: false }); continue; }
        const allowed = new Set();
        for (const ch of ALPHABET) if (dict.set.has(pre + ch + suf)) allowed.add(ch);
        cross.push({ any: false, allowed, base: preScore + sufScore, has: true });
      }

      // ankre: tomme celler nabo til en brik (i alle retninger) — eller centrum på tomt bræt
      const anchor = [];
      for (let i = 0; i < N; i++) {
        const c = cell(i);
        if (c.ch) { anchor.push(false); continue; }
        if (empty) { anchor.push(horiz ? (li === 7 && i === 7) : (li === 7 && i === 7)); continue; }
        let a = (i > 0 && cell(i - 1).ch) || (i < N - 1 && cell(i + 1).ch);
        if (!a && cross[i] && cross[i].has) a = true;
        anchor.push(!!a);
      }

      // slots
      for (let start = 0; start < N - 1; start++) {
        if (start > 0 && cell(start - 1).ch) continue; // ord skal starte rent
        for (let len = 2; len <= N - start; len++) {
          const end = start + len - 1;
          if (end < N - 1 && cell(end + 1).ch) { continue; } // skal også ende rent — men længere len kan stadig være ok
          // tæl
          let tiles = 0, fixed = [], hasAnchor = false;
          let ok = true;
          for (let i = start; i <= end; i++) {
            const c = cell(i);
            if (c.ch) fixed.push([i, c.ch]);
            else {
              tiles++;
              if (anchor[i]) hasAnchor = true;
              if (!cross[i].any && cross[i].allowed.size === 0) { ok = false; break; }
            }
          }
          if (!ok) continue;
          if (tiles === 0 || tiles > rackSize || tiles > 7) continue;
          if (!hasAnchor && fixed.length === 0) continue;
          if (empty && tiles < 2) continue;

          // kandidat-ord
          let cands;
          if (fixed.length > 0) {
            // brug den sjældneste (pos,bogstav)-liste
            let best = null;
            for (const [i, ch] of fixed) {
              const k = (len * 16 + (i - start)) * 32 + dict.li[ch];
              const a = dict.idx.get(k) || [];
              if (!best || a.length < best.length) best = a;
              if (best.length === 0) break;
            }
            cands = best;
          } else {
            cands = dict.byLen[len];
          }
          if (!cands || cands.length === 0) continue;

          outer:
          for (const wi of cands) {
            const w = dict.words[wi];
            // tjek faste bogstaver
            for (const [i, ch] of fixed) if (w[i - start] !== ch) continue outer;
            // tjek krydstjek + saml behov
            const need = {};
            for (let i = start; i <= end; i++) {
              if (cell(i).ch) continue;
              const ch = w[i - start];
              const cr = cross[i];
              if (!cr.any && !cr.allowed.has(ch)) continue outer;
              need[ch] = (need[ch] || 0) + 1;
            }
            // rack-tjek
            let blanksNeeded = 0;
            for (const ch in need) {
              const have = rack.counts[ch] || 0;
              if (need[ch] > have) blanksNeeded += need[ch] - have;
            }
            if (blanksNeeded > rack.blanks) continue;

            // scoring med optimal blank-placering
            const { score, blanksAt } = scoreMove(w, start, li, horiz, board, rack, need);
            results.push({ word: w, x: horiz ? start : li, y: horiz ? li : start, horiz, score, tiles, blanksAt });
          }
        }
      }
    }
  }

  results.sort((a, b) => b.score - a.score || a.word.localeCompare(b.word));
  // dedup (samme ord, samme plads)
  const seen = new Set(); const out = [];
  for (const r of results) {
    const k = r.word + ':' + r.x + ':' + r.y + ':' + r.horiz;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
    if (out.length >= limit) break;
  }
  return out;
}

function scoreMove(w, start, li, horiz, board, rack, need) {
  const cell = i => horiz ? board[li][i] : board[i][li];
  const bonus = i => horiz ? BONUS[li][i] : BONUS[i][li];

  // hvilke positioner skal have blanks? For hvert bogstav hvor behov > beholdning:
  // vælg positioner med lavest vægt (lm * (samlet ordmult + evt. krydsmult))
  // Først: beregn ordmultiplikator
  let wm = 1;
  for (let i = start; i < start + w.length; i++) if (!cell(i).ch) wm *= bonus(i).wm;

  const blanksAt = new Set();
  for (const ch in need) {
    const have = rack.counts[ch] || 0;
    const nb = need[ch] - have;
    if (nb <= 0) continue;
    // positioner med dette bogstav (nye brikker)
    const ps = [];
    for (let i = start; i < start + w.length; i++) {
      if (cell(i).ch || w[i - start] !== ch) continue;
      const b = bonus(i);
      const cr = crossInfo(i, li, horiz, board);
      const weight = b.lm * (wm + (cr.has ? b.wm : 0));
      ps.push([i, weight]);
    }
    ps.sort((a, b) => a[1] - b[1]); // lavest vægt først → blank dér
    for (let k = 0; k < nb; k++) blanksAt.add(ps[k][0]);
  }

  let wordScore = 0, total = 0, tiles = 0;
  for (let i = start; i < start + w.length; i++) {
    const c = cell(i);
    const ch = w[i - start];
    if (c.ch) { wordScore += c.blank ? 0 : LETTER_VALUES[ch]; continue; }
    tiles++;
    const b = bonus(i);
    const v = blanksAt.has(i) ? 0 : LETTER_VALUES[ch];
    wordScore += v * b.lm;
    const cr = crossInfo(i, li, horiz, board);
    if (cr.has) total += (cr.base + v * b.lm) * b.wm;
  }
  total += wordScore * wm;
  if (tiles >= 7) total += 40;
  return { score: total, blanksAt: [...blanksAt] };
}

function crossInfo(i, li, horiz, board) {
  // krydsordsinfo for celle på (linje li, pos i)
  const pcell = j => horiz ? board[j][i] : board[i][j];
  const pos = li;
  let base = 0, has = false;
  for (let j = pos - 1; j >= 0 && pcell(j).ch; j--) { has = true; base += pcell(j).blank ? 0 : LETTER_VALUES[pcell(j).ch]; }
  for (let j = pos + 1; j < N && pcell(j).ch; j++) { has = true; base += pcell(j).blank ? 0 : LETTER_VALUES[pcell(j).ch]; }
  return { has, base };
}

if (typeof module !== 'undefined') {
  module.exports = { LETTER_VALUES, BONUS, makeDict, emptyBoard, findMoves, parseRack, N };
}
if (typeof window !== 'undefined') {
  window.WFSolver = { LETTER_VALUES, BONUS, makeDict, emptyBoard, findMoves, parseRack, N };
}
