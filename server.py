#!/usr/bin/env python3
"""
==============================================================================
ANITUBE FLASK STREAMING BACKEND & DYNAMIC PAGE SERVER
Author: AniTube Dev Team
Description: Python Flask server with dynamic page rendering, route handlers,
             HLS video streaming support, JSON APIs, and LAN Wi-Fi sharing.
==============================================================================
"""

import os
import socket
import sys
from flask import Flask, send_from_directory, jsonify, request

# Fix Windows Terminal UTF-8 Output Encoding
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Initialize Flask App with static folder set to current directory
app = Flask(__name__, static_folder='.', static_url_path='')

# Configuration
PORT = 5000
HOST = "0.0.0.0"

# Fun Quotes & Mock DB
FUN_QUOTES = [
    "Solo Leveling is #1 no cap!",
    "Serving anime to your phone faster than Flying Raijin!",
    "Demon Slayer animation carrying our server bandwidth!"
]

ANITUBE_MOCK_DB = {
    "shows": [
        {"id": "solo-leveling", "title": "Solo Leveling: Arise", "rating": 9.8, "episodes": 12, "genre": "Action, Fantasy"},
        {"id": "demon-slayer", "title": "Demon Slayer: Kimetsu no Yaiba", "rating": 9.2, "episodes": 55, "genre": "Action, Supernatural"},
        {"id": "jujutsu-kaisen", "title": "Jujutsu Kaisen", "rating": 9.5, "episodes": 47, "genre": "Dark Fantasy, Action"},
        {"id": "one-piece", "title": "One Piece", "rating": 9.6, "episodes": 1090, "genre": "Adventure, Action"}
    ],
    "shorts": [
        {"id": "short-1", "title": "Sung Jinwoo Leveling Up Epic Aura", "anime": "Solo Leveling", "likes": "245K"},
        {"id": "short-2", "title": "Muichiro Tokito Mist Breathing 7th Form", "anime": "Demon Slayer", "likes": "189K"},
        {"id": "short-3", "title": "Gojo Satoru Domain Expansion", "anime": "Jujutsu Kaisen", "likes": "520K"}
    ]
}

# --- CORS & CROSS-DEVICE HEADERS ---
@app.after_request
def add_cors_and_streaming_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Range'
    response.headers['Cache-Control'] = 'no-cache, must-revalidate'
    return response

# --- DYNAMIC PAGE RENDERING ROUTES ---
@app.route('/')
def render_home_page():
    return send_from_directory('.', 'index.html')

@app.route('/watch')
@app.route('/player')
def render_player_page():
    return send_from_directory('.', 'player.html')

@app.route('/shorts')
def render_shorts_page():
    return send_from_directory('.', 'shorts.html')

@app.route('/search')
def render_search_page():
    return send_from_directory('.', 'search.html')

@app.route('/watchlist')
def render_watchlist_page():
    return send_from_directory('.', 'watchlist.html')

@app.route('/downloads')
def render_downloads_page():
    return send_from_directory('.', 'downloads.html')

@app.route('/profile')
def render_profile_page():
    return send_from_directory('.', 'profile.html')

# --- DYNAMIC JSON API ENDPOINTS ---
@app.route('/api/v1/status')
def api_status():
    import random
    return jsonify({
        "status": "online",
        "vibe": "100% W",
        "quote": random.choice(FUN_QUOTES),
        "message": "AniTube Python Flask Server is running smoothly!"
    })

@app.route('/api/v1/anime')
def api_anime_list():
    return jsonify(ANITUBE_MOCK_DB["shows"])

@app.route('/api/v1/shorts')
def api_shorts_list():
    return jsonify(ANITUBE_MOCK_DB["shorts"])

@app.route('/api/v1/search')
def api_search():
    q = request.args.get('q', '').lower()
    if not q:
        return jsonify(ANITUBE_MOCK_DB["shows"])
    filtered = [s for s in ANITUBE_MOCK_DB["shows"] if q in s["title"].lower() or q in s["genre"].lower()]
    return jsonify(filtered)

# Static Asset Fallback
@app.route('/<path:filename>')
def serve_static_asset(filename):
    return send_from_directory('.', filename)

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        try:
            return socket.gethostbyname(socket.gethostname())
        except Exception:
            return "127.0.0.1"

if __name__ == '__main__':
    local_ip = get_local_ip()
    
    print("\n" + "=" * 65)
    print(" [+] ANITUBE PYTHON FLASK STREAMING SERVER IS LIVE! ")
    print(" Streaming anime straight to your phone, tablet & TV ")
    print("=" * 65)
    print(f" [+] Local Access (This PC)   : http://localhost:{PORT}/")
    print(f" [+] Network Access (Other Devices): http://{local_ip}:{PORT}/")
    print(f" [+] API Status Endpoint       : http://{local_ip}:{PORT}/api/v1/status")
    print("=" * 65)
    print(" Press Ctrl+C to stop the server.\n")

    app.run(host=HOST, port=PORT, debug=False)
