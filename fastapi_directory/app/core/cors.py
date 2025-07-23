from fastapi.middleware.cors import CORSMiddleware

def setup_cors(app):
    # Allow only frontend origin for CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://192.168.1.33",
            "http://SiebelError.ru"
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
