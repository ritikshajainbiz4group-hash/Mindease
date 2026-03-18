## FASTAPI

### Structure & Modules
Organize by features (auth, users, items, etc.); use APIRouter per module.
  
app/
├── core/               # Core configurations, services, shared logic
│   ├── auth/           # Auth helpers and token logic
│   │   ├── dependencies.py
│   │   └── jwt_handler.py
│   ├── aws/            # AWS integrations (e.g., S3)
│   │   └── s3_service.py
│   ├── config/         # Pydantic-based settings
│   │   └── settings.py
│   ├── schemas/        # Shared base schemas (common Pydantic models)
│   │   └── base.py
│   ├── services/       # Shared utilities/services (e.g., email, jwt)
│   │   └── email_service.py
│   ├── utils/          # Helper utilities
│   │   └── helpers.py
│   └── database.py     # Database configuration
├── features/           # Feature-based routing and logic
│   ├── auth/           # Authentication feature
│   │   ├── repository.py
│   │   ├── router.py
│   │   └── schemas.py
│   └── category/       # Category management feature
│       ├── repository.py
│       ├── router.py
│       └── schemas.py
├── models/             # SQLAlchemy ORM models per domain
│   ├── user.py
│   └── category.py
└── main.py             # Entry point for the FastAPI app

### Endpoints & Docs
Routes: lowercase with hyphens/underscores (/get-user-info).  
Add docstrings + tags/summary/description for OpenAPI.

```python
router = APIRouter(prefix="/users", tags=["users"])

@router.get("/{user_id}", summary="Get user", description="Fetch user by ID")
async def get_user(user_id: str) -> UserOut: ...
```

### Data Models & Validation
⚠️ Use Pydantic models for request/response schemas; validate all inputs.  
Use typing for type hints; leverage Field for constraints/defaults.

### Error Handling
Raise HTTPException with proper status codes and messages.  
Add custom exception handlers for domain errors; return consistent error payloads.

### Performance & Async
⚠️ Use async def for I/O-bound routes; use async DB drivers where possible.  
Use FastAPI dependencies for DB session lifecycle; ensure sessions close reliably.

### Security & CORS
Implement JWT/OAuth2 where authentication is needed.  
Configure CORS explicitly; only allow trusted origins/methods/headers.  
Sanitize input; prevent SQL injection via ORM/parameterized queries.

### Package Verification (for audits/reviews)
For each dependency, record usage mapping, version, and status (in-use/outdated/unused).
Package: python-jose 

- Used in: app/auth/token.py (Line 12) 
- Version: 3.3.0 
- Status: ✅ In Use | ❌ Outdated 
