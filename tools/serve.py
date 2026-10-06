"""Serve the player for the live preview without browser caching (every reload gets the current
sources): .venv/Scripts/python tools/serve.py [port]"""
import http.server
import sys


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


http.server.ThreadingHTTPServer(('127.0.0.1', int(sys.argv[1]) if len(sys.argv) > 1 else 4176), NoCache).serve_forever()
