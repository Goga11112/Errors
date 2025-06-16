from fastapi.middleware.cors import CORSMiddleware

def setup_cors(app):
    # Temporary allow all origins for testing CORS issues
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
