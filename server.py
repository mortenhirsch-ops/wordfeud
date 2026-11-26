"""Serve the Wordfeud app and persist its game boards in a JSON file."""

import json
import os
import tempfile
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("WORDFEUD_DATA_DIR", "/data"))
DATA_FILE = DATA_DIR / "games.json"
MAX_BODY_BYTES = 1024 * 1024


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        request_path = self.path.split("?", 1)[0]
        if request_path == "/api/games":
            self.send_json(self.read_games())
            return
        if request_path in ("/", "/index.html"):
            super().do_GET()
            return
        self.send_error(404)

    def do_PUT(self):
        if self.path.split("?", 1)[0] != "/api/games":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_BODY_BYTES:
                self.send_error(413, "Invalid request size")
                return
            store = json.loads(self.rfile.read(length))
            if not self.valid_store(store):
                self.send_error(400, "Invalid game data")
                return
            DATA_DIR.mkdir(parents=True, exist_ok=True)
            with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=DATA_DIR, delete=False) as tmp:
                json.dump(store, tmp, ensure_ascii=False, separators=(",", ":"))
                tmp.flush()
                os.fsync(tmp.fileno())
                temp_name = tmp.name
            os.replace(temp_name, DATA_FILE)
            self.send_json({"ok": True})
        except (ValueError, OSError, json.JSONDecodeError):
            self.send_error(400, "Could not save game data")

    @staticmethod
    def valid_store(store):
        return (
            isinstance(store, dict)
            and isinstance(store.get("games"), list)
            and 1 <= len(store["games"]) <= 500
            and all(
                isinstance(game, dict)
                and isinstance(game.get("id"), str)
                and isinstance(game.get("name"), str)
                and isinstance(game.get("board"), list)
                and isinstance(game.get("rack", ""), str)
                for game in store["games"]
            )
            and isinstance(store.get("activeId"), str)
        )

    @staticmethod
    def read_games():
        try:
            with DATA_FILE.open(encoding="utf-8") as data:
                store = json.load(data)
            if Handler.valid_store(store):
                return store
        except (OSError, ValueError, json.JSONDecodeError):
            pass
        return {"games": [], "activeId": None}

    def send_json(self, value):
        payload = json.dumps(value, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(payload)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"Wordfeud server listening on port {port}", flush=True)
    server.serve_forever()
