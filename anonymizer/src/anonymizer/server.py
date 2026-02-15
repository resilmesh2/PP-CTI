# Copyright (C) 2025 Ekam Puri Nieto (UMU), Antonio Skarmeta Gomez
# (UMU), Jorge Bernal Bernabe (UMU), Juan Hernandez Acosta (UMU).
#
# See LICENSE file in the project root for details.

from sanic import Blueprint, Sanic
from sanic.response import empty
from sanic.request import Request
from sanic import HTTPResponse

from anonymizer import bg_anonymizer
from anonymizer.debug import bg_debug
from anonymizer.tasks.initialization import initialize_server, shutdown_server


def anonymizer() -> Sanic:
    app = Sanic('Anonymizer')

    bp_main = Blueprint.group(bg_debug, bg_anonymizer, url_prefix='/api')

    ALLOWED_ORIGINS = [
        "http://localhost:3100", 
        "http://localhost:3000",
        "http://resilmesh-tap-ppcti-frontend:3000",
        "http://resilmesh-tap-ppcti-frontend:3001"
    ]

    def _get_allowed_origin(request: Request) -> str:
        origin = request.headers.get("origin")
        if origin in ALLOWED_ORIGINS:
            return origin
        return ALLOWED_ORIGINS[0]

    # Handle preflight OPTIONS requests
    @app.middleware('request')
    def _options_preflight(request: Request) -> HTTPResponse | None:
        if request.method == 'OPTIONS':
            resp = empty(204)
            resp.headers['Access-Control-Allow-Origin'] = _get_allowed_origin(request)

            resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
            resp.headers['Access-Control-Allow-Headers'] = '*'
            return resp

        return None

    # Ensure CORS headers are present on every response
    @app.on_response
    def handle_cors(request: Request, response: HTTPResponse) -> None:
        response.headers['Access-Control-Allow-Origin'] = _get_allowed_origin(request)
        response.headers.setdefault('Access-Control-Allow-Methods',
                                    'GET, '
                                    'POST, '
                                    'OPTIONS')
        response.headers.setdefault('Access-Control-Allow-Headers', '*')

    app.blueprint(bp_main)
    app.before_server_start(initialize_server)
    app.before_server_stop(shutdown_server)

    return app

