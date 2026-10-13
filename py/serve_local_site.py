"""Serve this project locally so browser Canvas exports remain available."""

from __future__ import annotations

import http.server
import socket
import webbrowser
from pathlib import Path


HOST = "127.0.0.1"
START_PORT = 8000


def available_port() -> int:
    for port in range(START_PORT, START_PORT + 100):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
            if probe.connect_ex((HOST, port)) != 0:
                return port
    raise RuntimeError("找不到可用的本機連接埠（8000 到 8099）。")


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    port = available_port()
    handler = lambda *args, **kwargs: http.server.SimpleHTTPRequestHandler(
        *args, directory=project_root, **kwargs
    )
    server = http.server.ThreadingHTTPServer((HOST, port), handler)
    url = f"http://{HOST}:{port}/"

    print(f"已開啟本機網站：{url}")
    print("請保持此視窗開啟；按 Ctrl+C 可停止網站。")
    webbrowser.open_new_tab(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n本機網站已停止。")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
