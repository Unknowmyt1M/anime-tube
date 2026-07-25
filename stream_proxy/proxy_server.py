"""
=============================================================================
AniTube Stream Proxy & Dynamic Link Refresher
=============================================================================
This server automatically resolves direct CloudDL / GD Mirror Bot links,
handles HTTP 302 redirects to get fresh active video URLs, and proxies
byte ranges for seamless HTML5 video streaming and seeking without expiry issues.
"""

import re
import requests
from flask import Flask, request, Response, jsonify
from flask_cors import CORS

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
        'message': 'AniTube Stream Proxy & Link Refresher is active!',
        'health_check': 'http://localhost:5005/health',
        'stream_endpoint': 'http://localhost:5005/stream?url=<ENCODED_URL>'
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'active',
        'service': 'AniTube Stream Proxy & Link Refresher',
        'version': '1.0.0'
    })

@app.route('/stream', methods=['GET'])
def stream_video():
    """
    Proxies video playback with HTTP Range support for HTML5 seeking.
    Query Params:
      - url: Target direct download or GD mirror URL
      - fid: (Optional) File ID parameter
    """
    target_url = request.args.get('url')
    fid = request.args.get('fid')

    if not target_url and fid:
        target_url = f"https://gdmirrorbot.nl/clouddl?fid={fid}"

    if not target_url:
        return jsonify({'error': 'Missing url or fid parameter'}), 400

    # Resolve fresh working target URL (handles redirects & refreshed tokens)
    fresh_url = resolve_fresh_url(target_url)

    # Forward Range headers for seeking
    headers = {}
    range_header = request.headers.get('Range', None)
    if range_header:
        headers['Range'] = range_header

    try:
        req = session.get(fresh_url, headers=headers, stream=True, timeout=15)
        
        # Build response headers for HTML5 Video element
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
    print("[AniTube Proxy] Stream Proxy & Link Refresher running on http://localhost:5005")
    app.run(host='0.0.0.0', port=5005, debug=True)
