// Minimal Express-server: server statiske filer (public/) og en API-endpoint
// der bruger solveren i src/solver.js + ordlisten i assets/.
// Koer: npm install && npm start  ->  http://localhost:3000

const express = require('express');
const path = require('path');
const fs = require('fs');
const zlib = require('zlib');
const S = require('./src/solver.js');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Byg ordbogen en gang ved opstart (dekomprimer + filtrer blacklist)
let dict = null;
function loadDict() {
  if (dict) return dict;
  const gz = fs.readFileSync(path.join(__dirname, 'assets', 'da_words.txt.gz'));
  const words = zlib.gunzipSync(gz).toString('utf8').split('\n').filter(Boolean);
  const blpath = path.join(__dirname, 'assets', 'blacklist.txt');
  const ban = new Set();
  if (fs.existsSync(blpath)) {
    fs.readFileSync(blpath, 'utf8').split('\n').forEach(w => w.trim() && ban.add(w.trim().toLowerCase()));
  }
  dict = S.makeDict(words.filter(w => !ban.has(w)));
  return dict;
}

// POST /api/solve  { board: "15x15-kode med | som separator", rack: "abcdef*", limit: 15 }
app.post('/api/solve', (req, res) => {
  try {
    const { board: boardCode, rack, limit } = req.body;
    if (!boardCode || !rack) {
      return res.status(400).json({ error: 'board og rack er paakraevet' });
    }
    const rows = boardCode.trim().split('|');
    if (rows.length !== 15 || rows.some(r => r.length !== 15)) {
      return res.status(400).json({ error: 'brætkoden skal vaere 15 raekker a 15 tegn adskilt af |' });
    }
    const board = S.emptyBoard();
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 15; x++) {
        const ch = rows[y][x];
        if (ch !== '.') board[y][x] = { ch: ch.toLowerCase(), blank: ch !== ch.toLowerCase() };
      }
    }
    const d = loadDict();
    const moves = S.findMoves(board, rack, d, limit || 15);
    res.json({ moves });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'noget gik galt paa serveren' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Wordfeud-hjaelper koerer paa http://localhost:${PORT}`));
