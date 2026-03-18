# Backend — Package Verification

Tracks every dependency: where it is used, pinned version, and current status.

| Package | Version | Used In | Purpose | Status |
|---|---|---|---|---|
| `fastapi` | 0.111.0 | `app/main.py`, all routers | Web framework, routing, dependency injection | ✅ In Use |
| `uvicorn[standard]` | 0.29.0 | Runtime (`uvicorn app.main:app`) | ASGI server | ✅ In Use |
| `sqlalchemy` | 2.0.29 | `app/core/database.py`, all models & repositories | ORM, session management, query builder | ✅ In Use |
| `alembic` | 1.13.1 | `migrations/env.py`, `alembic.ini` | Database schema migrations | ✅ In Use |
| `pydantic` | 2.7.1 | All `schemas.py` files, `app/core/schemas/base.py` | Request/response validation, serialization | ✅ In Use |
| `pydantic-settings` | 2.2.1 | `app/core/config/settings.py` | Settings management from `.env` | ✅ In Use |
| `pydantic[email]` | 2.7.1 | `app/features/auth/schemas.py` (EmailStr) | Email field validation | ✅ In Use |
| `python-jose[cryptography]` | 3.3.0 | `app/core/auth/jwt_handler.py` (lines 5, 26–38) | JWT encode/decode, token verification | ✅ In Use |
| `passlib[bcrypt]` | 1.7.4 | `app/core/utils/helpers.py` (lines 5, 12–16) | Password hashing and verification | ✅ In Use |
| `python-multipart` | 0.0.9 | FastAPI form parsing (required by FastAPI for form data) | Multipart/form-data support | ✅ In Use |
| `boto3` | 1.34.87 | `app/core/aws/s3_service.py` (line 1) | AWS S3 file upload/delete/presigned URLs | ✅ In Use |
| `httpx` | 0.27.0 | Future: OAuth2 / webhook HTTP calls | Async HTTP client | ⏳ Reserved |

## Dev / Runtime Notes

- `uvicorn[standard]` includes `websockets` and `httptools` for better performance.
- `pydantic[email]` installs `email-validator`; required for `EmailStr` fields.
- `python-jose[cryptography]` installs `cryptography` backend for RS256/HS256.
- `passlib[bcrypt]` installs `bcrypt`; uses work factor 12 by default.
- `boto3` is optional at startup — S3 calls fail gracefully when `AWS_S3_BUCKET` is empty.
- `httpx` is not yet wired to a route but is included per architecture plan for external HTTP calls.

## Updating This File

Run `pip list --outdated` in the virtual environment and update the **Status** column:
- ✅ **In Use** — actively imported and called
- ⏳ **Reserved** — declared but not yet wired
- ❌ **Outdated** — a newer version is available; upgrade after testing
- 🗑️ **Unused** — safe to remove
