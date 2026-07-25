"""
=============================================================================
AniTube Stream Proxy & Unified Anime/Movie Scrapers API
=============================================================================
This server automatically resolves direct CloudDL / GD Mirror Bot links,
extracts active anime & movie stream sources via scrapers/anime_movie_scrapers.py,
and proxies byte ranges for seamless HTML5 video streaming and seeking.
"""

import sys
import os
import requests
from flask import Flask, request, Response, jsonify
from flask_cors import CORS

# Add scrapers path to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'scrapers')))
try:
    from anime_movie_scrapers import UnifiedAnimeMovieExtractor
except ImportError:
    UnifiedAnimeMovieExtractor = None

app = Flask(__name__)
CORS(app)

# Session for handling connection pooling
session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
})

def resolve_fresh_url(initial_url):
    """
    Follows HTTP 302 redirects to obtain the final active CDN media URL.
    """
    try:
        response = session.head(initial_url, allow_redirects=True, timeout=10)
        return response.url
    except Exception as e:
        print(f"[Proxy Error] Failed to resolve fresh URL: {e}")
        return initial_url

@app.route('/', methods=['GET'])
def root_index():
    return jsonify({
        'status': 'online',
        'message': 'AniTube Stream Proxy & Anime/Movie Scraper API is active!',
        'endpoints': {
            'health': 'http://localhost:5005/health',
            'stream': 'http://localhost:5005/stream?url=<ENCODED_URL>',
            'search': 'http://localhost:5005/api/search?q=<QUERY>',
            'extract': 'http://localhost:5005/api/extract?id=<ANIME_ID>&ep=<EPISODE_NUM>'
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'active',
        'service': 'AniTube Stream Proxy & Scraper API',
        'version': '1.1.0'
    })

@app.route('/api/search', methods=['GET'])
def api_search():
    query = request.args.get('q', '')
    if not query:
        return jsonify({'error': 'Missing query parameter q'}), 400
    
    if UnifiedAnimeMovieExtractor:
        results = UnifiedAnimeMovieExtractor.search_all(query)
        return jsonify({'query': query, 'count': len(results), 'results': results})
    else:
        return jsonify({'error': 'Scraper module unavailable'}), 500

@app.route('/api/extract', methods=['GET'])
def api_extract():
    anime_id = request.args.get('id', 'solo-leveling')
    ep_num = int(request.args.get('ep', 1))
    
    if UnifiedAnimeMovieExtractor:
        streams = UnifiedAnimeMovieExtractor.get_streams(anime_id, ep_num)
        return jsonify({'anime_id': anime_id, 'episode': ep_num, 'streams': streams})
    else:
        return jsonify({'error': 'Scraper module unavailable'}), 500

@app.route('/stream', methods=['GET'])
def stream_video():
    target_url = request.args.get('url')
    fid = request.args.get('fid')

    if not target_url and fid:
        target_url = f"https://gdmirrorbot.nl/clouddl?fid={fid}"

    if not target_url:
        return jsonify({'error': 'Missing url or fid parameter'}), 400

    fresh_url = resolve_fresh_url(target_url)

    headers = {}
    range_header = request.headers.get('Range', None)
    if range_header:
        headers['Range'] = range_header

    try:
        req = session.get(fresh_url, headers=headers, stream=True, timeout=15)
        
        resp_headers = {
            'Content-Type': req.headers.get('Content-Type', 'video/mp4'),
            'Accept-Ranges': 'bytes',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Range, Content-Type',
            'Access-Control-Expose-Headers': 'Content-Range, Content-Length'
        }

        if 'Content-Range' in req.headers:
            resp_headers['Content-Range'] = req.headers['Content-Range']
        if 'Content-Length' in req.headers:
            resp_headers['Content-Length'] = req.headers['Content-Length']

        status_code = req.status_code

        def generate():
            for chunk in req.iter_content(chunk_size=1024 * 64):
                if chunk:
                    yield chunk

        return Response(generate(), status=status_code, headers=resp_headers)

    except Exception as e:
        print(f"[Stream Error] Failed to stream from target: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("[AniTube Proxy] Stream Proxy & Scraper API running on http://localhost:5005")
    app.run(host='0.0.0.0', port=5005, debug=True)
