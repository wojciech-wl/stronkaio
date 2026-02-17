# Asystent IO — Backend Premium Specification (v1.0)

**Service Name:** `asystent-io-premium-api`  
**Current Version:** 0.1.0  
**Last Updated:** February 1, 2026  
**Status:** Production-Ready (Dish Analysis Live)  
**Region:** europe-west1 (GDPR Compliant)  
**Author:** Backend Team  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Service Architecture](#2-service-architecture)
3. [Technology Stack](#3-technology-stack)
4. [API Endpoints](#4-api-endpoints)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Multi-Pass Analysis Pipeline](#6-multi-pass-analysis-pipeline)
7. [Deterministic Scoring Engine](#7-deterministic-scoring-engine)
8. [Infrastructure & Deployment](#8-infrastructure--deployment)
9. [Configuration Management](#9-configuration-management)
10. [Error Handling & Observability](#10-error-handling--observability)
11. [Security & Privacy](#11-security--privacy)
12. [Testing Strategy](#12-testing-strategy)
13. [File Structure](#13-file-structure)
14. [Commands Reference](#14-commands-reference)
15. [Development Workflow](#15-development-workflow)
16. [Production Operations](#16-production-operations)
17. [Future Roadmap](#17-future-roadmap)

---

## 1. Executive Summary

### What Does This Service Do?

**Asystent IO Premium Scan Service** is a Cloud Run microservice that provides AI-powered food analysis for users with insulin resistance and type 2 diabetes. It analyzes photos of prepared dishes and restaurant menus to:

1. **Identify food components** using Vertex AI vision models
2. **Estimate nutritional values** (carbs, fiber, protein, fat)
3. **Calculate Glycemic Load (GL)** ranges
4. **Generate IO suitability scores** (0-100 scale)
5. **Provide actionable insights** (reasons + tips)

### Key Features

- ✅ **Dish Photo Analysis** — Live (multimodal Gemini 2.5 Flash)
- 🚧 **Menu Photo Analysis** — Planned (PR15+)
- 🔒 **Premium-gated** — Firestore entitlement checks
- 🛡️ **Kill Switch** — Firebase Remote Config feature flags
- ⚡ **Idempotent** — Retry-safe with request caching
- 📊 **Observable** — Structured JSON logging for Cloud Logging
- 🌍 **GDPR-compliant** — EU region, privacy-first design

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Fail-Closed** | Auth/Premium/Flags errors deny access |
| **Deterministic** | Same input → same score (no LLM in scoring) |
| **Transparent** | All penalties/bonuses documented |
| **Privacy-First** | Images never persisted, minimal logging |
| **Production-Ready** | Comprehensive tests, monitoring, error handling |

---

## 2. Service Architecture

### High-Level System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MOBILE APP (Flutter)                                │
│                      Asystent IO Premium Client                             │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 │ HTTPS (TLS 1.2+)
                                 │ Authorization: Bearer <Firebase ID Token>
                                 │ X-Idempotency-Key: <UUID>
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLOUD RUN (GCP)                                     │
│                    asystent-io-premium-api                                  │
│                     Region: europe-west1                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                       FastAPI Application                             │ │
│  │                      (Python 3.11 + uvicorn)                          │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                    │                                        │
│                      ┌──────────────┼──────────────┐                        │
│                      │              │              │                        │
│                      ▼              ▼              ▼                        │
│         ┌─────────────────┐ ┌─────────────┐ ┌─────────────┐               │
│         │   Auth Layer    │ │  Premium    │ │   Feature   │               │
│         │   (Firebase)    │ │  Checker    │ │   Flags     │               │
│         │   ID Token      │ │  (Firestore)│ │  (Remote    │               │
│         │   Verify        │ │             │ │   Config)   │               │
│         └─────────────────┘ └─────────────┘ └─────────────┘               │
│                      │              │              │                        │
│                      └──────────────┼──────────────┘                        │
│                                     │                                        │
│                                     ▼                                        │
│                      ┌───────────────────────────────┐                      │
│                      │    Request Guards             │                      │
│                      │  - Idempotency Check          │                      │
│                      │  - Image Validation           │                      │
│                      │  - Size Limits                │                      │
│                      └───────────────────────────────┘                      │
│                                     │                                        │
│                                     ▼                                        │
│                      ┌───────────────────────────────┐                      │
│                      │   Dish Analysis Pipeline      │                      │
│                      │                               │                      │
│                      │   1. Multimodal LLM Pass      │                      │
│                      │      (Vision + Reasoning)     │                      │
│                      │                               │                      │
│                      │   2. Deterministic Scoring    │                      │
│                      │      (Pure Logic, NO LLM)     │                      │
│                      │                               │                      │
│                      └───────────────────────────────┘                      │
│                                     │                                        │
└─────────────────────────────────────┼────────────────────────────────────────┘
                                      │
                                      │
                 ┌────────────────────┼────────────────────┐
                 │                    │                    │
                 ▼                    ▼                    ▼
    ┌─────────────────────┐  ┌───────────────┐  ┌─────────────────┐
    │   Vertex AI         │  │  Firestore    │  │ Firebase        │
    │   Gemini 2.5 Flash  │  │  Premium DB   │  │ Remote Config   │
    │   (europe-west1)    │  │               │  │  Feature Flags  │
    └─────────────────────┘  └───────────────┘  └─────────────────┘
```

### Request Flow (Dish Analysis)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    POST /v1/analyze/dish Flow                               │
└─────────────────────────────────────────────────────────────────────────────┘

1. REQUEST RECEIVED
   ├─ Headers: Authorization: Bearer <token>, X-Idempotency-Key: <uuid>
   └─ Body: multipart/form-data with image (max 500KB)

2. MIDDLEWARE
   ├─ CorrelationMiddleware → Set request_id, trace_id
   └─ RequestLoggingMiddleware → Log request start

3. KILL SWITCH CHECK (require_service_available)
   ├─ Fetch flags from Remote Config (cached 5min)
   ├─ Check premium_scan_enabled=true AND maintenance_mode=false
   └─ If OFF → 503 Service Unavailable

4. AUTHENTICATION (get_current_user)
   ├─ Extract Bearer token from Authorization header
   ├─ Verify Firebase ID token (auto-refreshed public keys)
   ├─ Extract UserContext (uid, email)
   └─ If invalid → 401 Unauthorized

5. PREMIUM CHECK (require_premium_user)
   ├─ Query Firestore: users/{uid}/premium
   ├─ Cache result for 5 minutes
   ├─ Verify is_premium=true AND expires_at > now
   └─ If not premium → 403 Forbidden

6. REQUEST GUARDS (validate_analyze_request)
   ├─ Validate X-Idempotency-Key (UUID v4 format)
   ├─ Check idempotency cache (uid, endpoint, key)
   ├─ If cached → return 200 with cached response + X-Idempotency-Cache: HIT
   ├─ Validate Content-Type: multipart/form-data
   ├─ Validate image size ≤500KB
   ├─ Validate image type (jpeg/png/webp)
   └─ If invalid → 400/413/415

7. DISH PIPELINE EXECUTION
   ├─ DishPipeline.run(image_bytes)
   │  │
   │  ├─ PASS 1: Multimodal LLM (Vision + Reasoning)
   │  │  ├─ Build prompt with vision + reasoning instructions
   │  │  ├─ Encode image as base64
   │  │  ├─ POST to Vertex AI generateContent API
   │  │  ├─ Parse response → DishLLMAnalysis (Pydantic model)
   │  │  └─ Extract structured JSON from LLM output
   │  │
   │  └─ PASS 2: Deterministic Scoring
   │     ├─ ScoringCalculator.calculate_score(llm_analysis)
   │     ├─ Calculate GL estimate (from LLM ranges)
   │     ├─ Apply penalty rules (GL, protein, fiber, fat, carbs)
   │     ├─ Classify bucket (green/yellow/red)
   │     ├─ Generate reasons (text keys for i18n)
   │     ├─ Generate tips (text keys for i18n)
   │     └─ Return ScoringResult
   │
   └─ Cache response in idempotency cache (5min TTL)

8. RESPONSE
   ├─ 200 OK
   ├─ Headers: X-Request-ID, X-Idempotency-Cache: MISS
   └─ Body: JSON with io_score, bucket, gl_estimate, reasons, tips

9. ERROR HANDLING
   ├─ Vertex timeout → 504 Gateway Timeout
   ├─ Vertex rate limit → 429 Too Many Requests
   ├─ Vertex unavailable → 503 Service Unavailable
   ├─ Pipeline validation error → 422 Unprocessable Entity
   ├─ Auth error → 401 Unauthorized
   ├─ Premium error → 403 Forbidden
   └─ All errors logged with structured fields

10. LOGGING & MONITORING
    ├─ Request start/end with latency
    ├─ Gate rejections (kill switch, auth, premium)
    ├─ Pipeline stage latencies
    ├─ Vertex API call metrics
    └─ Error details (type, code, message)
```

---

## 3. Technology Stack

### Core Framework

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Python | 3.11 | Modern, type-safe, Cloud Run compatible |
| **Web Framework** | FastAPI | 0.115.6 | Async, OpenAPI docs, validation |
| **Server** | Uvicorn | 0.34.0 | ASGI server for production |
| **Validation** | Pydantic | 2.10.4 | Data validation & serialization |
| **Multipart** | python-multipart | latest | File upload support |

### GCP Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **Cloud Run** | Serverless container hosting | 2Gi RAM, 2 CPU, europe-west1 |
| **Vertex AI** | Gemini 2.5 Flash LLM | europe-west1, REST API |
| **Firebase Auth** | ID token verification | Admin SDK, public key caching |
| **Firestore** | Premium entitlement DB | Native mode, read-only access |
| **Remote Config** | Feature flags + kill switch | REST API, 5min cache |
| **Cloud Logging** | Structured JSON logs | Auto-ingested from stdout |
| **Secret Manager** | (Future) API keys | Not yet used |

### Authentication

| Component | Implementation | Details |
|-----------|---------------|---------|
| **Method** | Firebase ID Tokens | Industry-standard JWT |
| **SDK** | firebase-admin | 6.2.0+ |
| **Transport** | Authorization: Bearer | HTTP header |
| **Caching** | Public key auto-refresh | Handled by SDK |
| **Validation** | Signature + expiry | Fail-closed on errors |

### AI/ML

| Component | Details |
|-----------|---------|
| **Model** | Gemini 2.5 Flash |
| **Endpoint** | Vertex AI REST API |
| **Region** | europe-west1 (GDPR) |
| **Auth** | Application Default Credentials (ADC) |
| **Timeout** | 20s read, 5s connect |
| **Retry** | Configurable (default: no retry in DEV) |
| **Input** | Multimodal (text + image base64) |
| **Output** | Structured JSON (enforced via prompting) |

### Development Tools

| Tool | Purpose |
|------|---------|
| **pytest** | Testing framework |
| **httpx** | FastAPI TestClient |
| **PowerShell** | Deployment scripts (Windows-native) |
| **gcloud CLI** | Cloud Run deployment |
| **uv/pip** | Package management |

---

## 4. API Endpoints

### Endpoint Overview

| Method | Endpoint | Auth | Premium | Kill Switch | Idempotency | Status |
|--------|----------|------|---------|-------------|-------------|--------|
| `GET` | `/v1/health` | ❌ | ❌ | ❌ | ❌ | ✅ Live |
| `POST` | `/v1/analyze/dish` | ✅ | ✅ | ✅ | ✅ | ✅ Live |
| `POST` | `/v1/analyze/menu` | ✅ | ✅ | ✅ | ✅ | 🚧 Stub (501) |
| `GET` | `/v1/config` | ✅ | ✅ | ✅ | ❌ | ✅ Live |

### 4.1 Health Check

**Endpoint:** `GET /v1/health`

**Purpose:** Cloud Run startup/liveness probes

**Auth:** None (public)

**Response (Ready):**
```json
{
  "status": "healthy",
  "service": "asystent-io-premium-api",
  "version": "0.1.0"
}
```

**Response (Starting):**
```json
{
  "status": "starting",
  "service": "asystent-io-premium-api",
  "version": "0.1.0"
}
```

**Status Codes:**
- `200` — Service ready
- `503` — Service starting (probes will retry)

**Implementation:**
```python
# main.py
@app.get("/v1/health")
async def health_check():
    if not is_ready():
        return JSONResponse(
            status_code=503,
            content={"status": "starting", ...}
        )
    return {"status": "healthy", ...}
```

---

### 4.2 Dish Analysis

**Endpoint:** `POST /v1/analyze/dish`

**Purpose:** Analyze dish photo for IO suitability

**Headers:**
```
Authorization: Bearer <Firebase ID Token>
X-Idempotency-Key: <UUID v4>
Content-Type: multipart/form-data
```

**Request Body:**
```
Content-Type: multipart/form-data
--boundary
Content-Disposition: form-data; name="image"; filename="dish.jpg"
Content-Type: image/jpeg

<binary image data, max 500KB>
--boundary--
```

**Success Response (200):**
```json
{
  "status": "success",
  "analysis": {
    "io_score": 45,
    "bucket": "yellow",
    "gl_estimate": {
      "min": 28,
      "max": 42,
      "mid": 35,
      "display": "28–42"
    },
    "confidence": "medium",
    "reasons": [
      {"type": "negative", "text_key": "reason_high_gl"},
      {"type": "positive", "text_key": "reason_adequate_protein"},
      {"type": "negative", "text_key": "reason_low_fiber"}
    ],
    "tips": [
      {"text_key": "tip_swap_refined_carbs"},
      {"text_key": "tip_add_vegetables"}
    ]
  },
  "metadata": {
    "analysis_version": "1.0.0",
    "model_version": "gemini-2.5-flash",
    "processing_time_ms": 2847
  }
}
```

**Response Headers:**
```
X-Request-ID: <correlation ID>
X-Idempotency-Cache: MISS|HIT
```

**Error Responses:**

| Code | Scenario | Response |
|------|----------|----------|
| `400` | Missing idempotency key | `{"error_code": "MISSING_FIELD", "detail": "..."}` |
| `400` | Invalid UUID format | `{"error_code": "INVALID_FORMAT", "detail": "..."}` |
| `401` | No auth token | `{"error_code": "MISSING_AUTH", "detail": "..."}` |
| `401` | Invalid/expired token | `{"error_code": "INVALID_TOKEN", "detail": "..."}` |
| `403` | Not premium | `{"error_code": "PREMIUM_REQUIRED", "detail": "..."}` |
| `413` | Image too large (>500KB) | `{"error_code": "PAYLOAD_TOO_LARGE", "detail": "..."}` |
| `415` | Wrong content type | `{"error_code": "UNSUPPORTED_MEDIA_TYPE", "detail": "..."}` |
| `422` | Pipeline validation error | `{"error_code": "VALIDATION_ERROR", "detail": "..."}` |
| `429` | Vertex rate limit | `{"error_code": "RATE_LIMIT", "detail": "..."}` |
| `503` | Kill switch ON | `{"error_code": "SERVICE_UNAVAILABLE", "detail": "..."}` |
| `503` | Vertex unavailable | `{"error_code": "UPSTREAM_UNAVAILABLE", "detail": "..."}` |
| `504` | Vertex timeout | `{"error_code": "UPSTREAM_TIMEOUT", "detail": "..."}` |

**Implementation:**
```python
# main.py
@app.post("/v1/analyze/dish")
async def analyze_dish_endpoint(
    request: Request,
    image: UploadFile = File(...),
    user: UserContext = Depends(get_current_user),
    _premium: None = Depends(require_premium_user),
    _service: None = Depends(require_service_available),
    ctx: AnalyzeRequestContext = Depends(validate_analyze_request),
) -> JSONResponse:
    # Check idempotency cache
    if ctx.cached_response:
        return JSONResponse(
            content=ctx.cached_response,
            headers={"X-Idempotency-Cache": "HIT"}
        )
    
    # Read image
    image_bytes = await image.read()
    
    # Run pipeline
    pipeline = DishPipeline(vertex_client=VertexClient())
    result = pipeline.run(image_bytes)
    
    # Calculate score
    score_result = calculate_dish_score(result.llm_result.data)
    
    # Build response
    response_data = {
        "status": "success",
        "analysis": {
            "io_score": score_result.io_score,
            "bucket": score_result.bucket.value,
            "gl_estimate": score_result.gl_estimate.dict(),
            "confidence": score_result.confidence,
            "reasons": score_result.reasons,
            "tips": score_result.tips,
        },
        "metadata": {...}
    }
    
    # Cache response
    ctx.cache_response(response_data)
    
    return JSONResponse(
        content=response_data,
        headers={"X-Idempotency-Cache": "MISS"}
    )
```

---

### 4.3 Menu Analysis

**Endpoint:** `POST /v1/analyze/menu`

**Status:** Stub (returns 501 Not Implemented)

**Future:** PR15+ will implement full menu analysis pipeline

---

### 4.4 Client Config

**Endpoint:** `GET /v1/config`

**Purpose:** Fetch feature flags for mobile client

**Response:**
```json
{
  "dish_analysis_enabled": true,
  "menu_analysis_enabled": false,
  "max_image_size_kb": 500
}
```

---

## 5. Authentication & Authorization

### 5.1 Firebase Authentication

**Flow:**

1. **Mobile App** → User signs in → Firebase SDK returns ID token
2. **Mobile App** → Includes token in `Authorization: Bearer <token>` header
3. **Backend** → Extracts token → Calls `firebase_admin.auth.verify_id_token()`
4. **Firebase SDK** → Verifies signature using cached public keys
5. **Backend** → Extracts `UserContext` (uid, email) → Proceeds or rejects

**Implementation:**

```python
# auth/firebase.py

def init_firebase() -> bool:
    """Initialize Firebase Admin SDK with default credentials."""
    global _firebase_app
    try:
        _firebase_app = firebase_admin.initialize_app(
            options={"projectId": GCP_PROJECT}
        )
        return True
    except Exception as e:
        logger.error(f"Firebase init failed: {e}")
        return False

def verify_token(token: str) -> UserContext:
    """Verify Firebase ID token and extract user context."""
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return UserContext(
            uid=decoded_token["uid"],
            email=decoded_token.get("email"),
            email_verified=decoded_token.get("email_verified", False),
            claims=decoded_token,
        )
    except Exception as e:
        logger.warning(f"Token verification failed: {e}")
        raise AuthError("Invalid or expired token")
```

**Dependency:**

```python
# auth/dependencies.py

async def get_current_user(request: Request) -> UserContext:
    """FastAPI dependency to extract and verify user from request."""
    auth_header = request.headers.get("Authorization", "")
    
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = auth_header[7:]  # Remove "Bearer "
    
    try:
        user = verify_token(token)
        return user
    except AuthError as e:
        raise HTTPException(status_code=401, detail=str(e))
```

**E2E Testing Override:**

For local testing without Firebase credentials:

```python
# config.py
ALLOW_DEBUG_E2E_TOKEN = os.environ.get("ALLOW_DEBUG_E2E_TOKEN", "false").lower() == "true"
DEBUG_E2E_TOKEN = "DEBUG_E2E_TOKEN"

# auth/dependencies.py (excerpt)
if ALLOW_DEBUG_E2E_TOKEN and token == DEBUG_E2E_TOKEN:
    logger.warning("DEBUG E2E TOKEN ACCEPTED - NON-PROD ONLY")
    return UserContext(uid="debug-e2e-user-id", email="debug@e2e.test")
```

**⚠️ WARNING:** `ALLOW_DEBUG_E2E_TOKEN=true` MUST NEVER be set in production!

---

### 5.2 Premium Entitlement Check

**Firestore Schema:**

```
users/
  {uid}/
    premium/
      is_premium: boolean
      expires_at: timestamp
      product_id: string (optional)
```

**Check Logic:**

```python
# premium/firestore_client.py

def get_premium_entitlement(uid: str) -> PremiumEntitlement:
    """Fetch premium entitlement from Firestore."""
    client = get_firestore_client()
    doc_ref = client.collection("users").document(uid).collection("premium").document("subscription")
    doc = doc_ref.get()
    
    if not doc.exists:
        return PremiumEntitlement(is_premium=False)
    
    data = doc.to_dict()
    return PremiumEntitlement(
        is_premium=data.get("is_premium", False),
        expires_at=data.get("expires_at"),
        product_id=data.get("product_id"),
    )
```

**Caching:**

```python
# premium/cache.py

class PremiumCache:
    """In-memory cache for premium entitlements (5min TTL)."""
    
    def __init__(self, ttl_seconds: int = 300):
        self._cache: Dict[str, Tuple[PremiumEntitlement, float]] = {}
        self._ttl = ttl_seconds
        self._lock = Lock()
    
    def get(self, uid: str) -> Optional[PremiumEntitlement]:
        with self._lock:
            if uid in self._cache:
                entitlement, cached_at = self._cache[uid]
                if time.time() - cached_at < self._ttl:
                    return entitlement
                del self._cache[uid]
        return None
    
    def set(self, uid: str, entitlement: PremiumEntitlement):
        with self._lock:
            self._cache[uid] = (entitlement, time.time())
```

**Dependency:**

```python
# premium/dependencies.py

_premium_cache = PremiumCache()

async def require_premium_user(user: UserContext = Depends(get_current_user)):
    """Require active premium subscription."""
    
    # Check cache first
    cached = _premium_cache.get(user.uid)
    if cached and cached.is_active():
        return
    
    # Fetch from Firestore
    try:
        entitlement = get_premium_entitlement(user.uid)
        _premium_cache.set(user.uid, entitlement)
        
        if not entitlement.is_active():
            log_gate_rejection("premium_required", user.uid)
            raise HTTPException(status_code=403, detail="Premium subscription required")
    
    except FirestoreError:
        # Fail-closed: Firestore errors deny access
        log_gate_rejection("premium_check_failed", user.uid)
        raise HTTPException(status_code=403, detail="Unable to verify premium status")
```

---

### 5.3 Feature Flags & Kill Switch

**Firebase Remote Config Schema:**

```json
{
  "premium_scan_enabled": true,
  "dish_analysis_enabled": true,
  "menu_analysis_enabled": false,
  "maintenance_mode": false,
  "use_flash_model": true,
  "max_requests_per_minute": 100,
  "max_daily_requests": 1000
}
```

**Fetch Logic (REST API):**

```python
# flags/remote_config.py

def _fetch_from_remote_config(self) -> Dict[str, Any]:
    """Fetch flags from Firebase Remote Config via REST API."""
    access_token = self._get_access_token()
    
    response = requests.get(
        REMOTE_CONFIG_URL,
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=self.fetch_timeout_seconds,
    )
    
    if response.status_code != 200:
        raise Exception(f"Remote Config fetch failed: {response.status_code}")
    
    data = response.json()
    parameters = data.get("parameters", {})
    
    # Parse parameter values
    flags = {}
    for key, param in parameters.items():
        default_value = param.get("defaultValue", {})
        value = default_value.get("value", "")
        
        # Type conversion
        if value.lower() in ("true", "false"):
            flags[key] = value.lower() == "true"
        elif value.isdigit():
            flags[key] = int(value)
        else:
            flags[key] = value
    
    return flags
```

**Dependency:**

```python
# flags/dependencies.py

_flags_client = FeatureFlagClient()

async def require_service_available():
    """Require service to be enabled (kill switch check)."""
    flags = _flags_client.get_flags()
    
    if flags.get("maintenance_mode", False):
        log_gate_rejection("maintenance_mode", None)
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")
    
    if not flags.get("premium_scan_enabled", False):
        log_gate_rejection("kill_switch", None)
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")
```

**DEV Override:**

```python
# config.py
DEV_OVERRIDE_FLAGS = os.environ.get("DEV_OVERRIDE_FLAGS", "false").lower() == "true"

if DEV_OVERRIDE_FLAGS:
    DEFAULT_FLAGS = {
        "premium_scan_enabled": True,  # All features enabled locally
        "dish_analysis_enabled": True,
        "maintenance_mode": False,
    }
else:
    DEFAULT_FLAGS = {
        "premium_scan_enabled": False,  # Fail-closed in production
        "dish_analysis_enabled": False,
        "maintenance_mode": False,
    }
```

---

### 5.4 Request Guards (Idempotency)

**Purpose:** Prevent duplicate processing of retry requests

**Implementation:**

```python
# guards/idempotency.py

class IdempotencyCache:
    """In-memory cache for idempotent requests (5min TTL)."""
    
    def __init__(self, ttl_seconds: int = 300):
        self._cache: Dict[str, Tuple[dict, float]] = {}
        self._ttl = ttl_seconds
        self._lock = Lock()
    
    def make_key(self, uid: str, endpoint: str, idempotency_key: str) -> str:
        """Generate cache key from (uid, endpoint, idempotency_key)."""
        return f"{uid}:{endpoint}:{idempotency_key}"
    
    def get(self, cache_key: str) -> Optional[dict]:
        with self._lock:
            if cache_key in self._cache:
                response, cached_at = self._cache[cache_key]
                if time.time() - cached_at < self._ttl:
                    return response
                del self._cache[cache_key]
        return None
    
    def set(self, cache_key: str, response: dict):
        with self._lock:
            self._cache[cache_key] = (response, time.time())
```

**Dependency:**

```python
# guards/dependencies.py

_idempotency_cache = IdempotencyCache()

@dataclass
class AnalyzeRequestContext:
    idempotency_key: str
    cache_key: str
    cached_response: Optional[dict] = None
    
    def cache_response(self, response: dict):
        _idempotency_cache.set(self.cache_key, response)

async def validate_analyze_request(
    request: Request,
    user: UserContext = Depends(get_current_user),
) -> AnalyzeRequestContext:
    """Validate analyze request and check idempotency cache."""
    
    # Extract idempotency key
    idempotency_key = request.headers.get("X-Idempotency-Key", "")
    if not idempotency_key:
        raise HTTPException(status_code=400, detail="Missing required header: X-Idempotency-Key")
    
    # Validate UUID v4 format
    try:
        uuid.UUID(idempotency_key, version=4)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid X-Idempotency-Key: must be valid UUID v4")
    
    # Check cache
    cache_key = _idempotency_cache.make_key(user.uid, request.url.path, idempotency_key)
    cached = _idempotency_cache.get(cache_key)
    
    return AnalyzeRequestContext(
        idempotency_key=idempotency_key,
        cache_key=cache_key,
        cached_response=cached,
    )
```

---

## 6. Multi-Pass Analysis Pipeline

### 6.1 Simplified Architecture (Current)

**PR12:** Simplified to single multimodal pass (Vision + Reasoning combined)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DISH ANALYSIS PIPELINE                              │
└─────────────────────────────────────────────────────────────────────────────┘

INPUT: image_bytes (JPEG/PNG/WebP, max 500KB)

     │
     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   PASS: Multimodal LLM (Vision + Reasoning)                 │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Prompt Builder (prompts/llm_dish.py)                                  │ │
│  │                                                                        │ │
│  │  System Context:                                                       │ │
│  │  - "You are a nutrition analysis assistant"                            │ │
│  │  - "Analyze this dish for insulin resistance impact"                   │ │
│  │  - "Provide EDUCATIONAL information only (NO medical advice)"          │ │
│  │                                                                        │ │
│  │  Task Instructions:                                                    │ │
│  │  1. Identify visible food components                                  │ │
│  │  2. Estimate portion sizes (small/medium/large)                        │ │
│  │  3. Assess GI category (low/medium/high)                               │ │
│  │  4. Estimate carbs, fiber per component                                │ │
│  │  5. Analyze meal composition (protein/fiber/fat adequacy)              │ │
│  │  6. Estimate total Glycemic Load range [min, max]                     │ │
│  │                                                                        │ │
│  │  Output Format: Structured JSON matching DishLLMAnalysis schema       │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                        │
│                                    ▼                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Vertex AI Client (vertex/client.py)                                  │ │
│  │                                                                        │ │
│  │  Method: analyze_image_vision_with_text()                             │ │
│  │  Endpoint: Vertex AI generateContent (REST API)                       │ │
│  │  Model: gemini-2.5-flash (configurable)                               │ │
│  │  Region: europe-west1                                                 │ │
│  │  Auth: ADC (Application Default Credentials)                           │ │
│  │  Timeout: 20s read, 5s connect                                        │ │
│  │  Retry: Configurable (default: no retry in DEV)                       │ │
│  │                                                                        │ │
│  │  Request:                                                              │ │
│  │  {                                                                     │ │
│  │    "contents": [{                                                      │ │
│  │      "role": "user",                                                   │ │
│  │      "parts": [                                                        │ │
│  │        {"text": "<PROMPT>"},                                           │ │
│  │        {"inlineData": {"mimeType": "image/jpeg",                       │ │
│  │                        "data": "<BASE64>"}}                            │ │
│  │      ]                                                                 │ │
│  │    }],                                                                 │ │
│  │    "generationConfig": {                                               │ │
│  │      "temperature": 0.1,                                               │ │
│  │      "maxOutputTokens": 4096                                           │ │
│  │    }                                                                   │ │
│  │  }                                                                     │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                        │
│                                    ▼                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Response Parser (dish_pipeline/orchestrator.py)                      │ │
│  │                                                                        │ │
│  │  1. Extract JSON from Vertex response                                 │ │
│  │     - Handle markdown code blocks: ```json ... ```                    │ │
│  │     - Find JSON object: {...}                                         │ │
│  │     - Parse JSON with error handling                                  │ │
│  │                                                                        │ │
│  │  2. Validate against DishLLMAnalysis schema (Pydantic)                │ │
│  │     - component_analysis: list of ComponentAnalysis                   │ │
│  │     - meal_composition: MealComposition                                │ │
│  │     - estimated_gl_range: [min, max]                                  │ │
│  │     - gl_confidence: float (0.0-1.0)                                  │ │
│  │                                                                        │ │
│  │  3. Return PassResult(success=True, data=DishLLMAnalysis)             │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
     │
     ▼
OUTPUT: PipelineResult(success=True, llm_result=PassResult)
```

### 6.2 Schema Definitions

**DishLLMAnalysis (prompts/schemas.py):**

```python
class ComponentAnalysis(BaseModel):
    """Analysis of a single food component."""
    name: str
    estimated_carbs_g: Tuple[float, float]  # [min, max]
    fiber_g: Tuple[float, float]            # [min, max]
    io_impact: IOImpact                     # positive | neutral | negative
    reasoning: str                          # max 100 chars

class MealComposition(BaseModel):
    """Overall meal composition assessment."""
    protein_adequacy: str                   # low | adequate | good | high
    fiber_adequacy: str                     # low | adequate | good
    fat_quality: Quality                    # poor | neutral | good
    vegetable_presence: bool
    refined_carbs_dominant: bool

class DishLLMAnalysis(BaseModel):
    """Complete LLM analysis output."""
    component_analysis: List[ComponentAnalysis]
    meal_composition: MealComposition
    estimated_gl_range: Tuple[float, float]  # [min_GL, max_GL]
    gl_confidence: float                     # 0.0 - 1.0
```

**Enums:**

```python
class IOImpact(str, Enum):
    POSITIVE = "positive"   # Good for IO (low GI, high fiber)
    NEUTRAL = "neutral"     # Neutral impact
    NEGATIVE = "negative"   # Bad for IO (high GI, refined carbs)

class Quality(str, Enum):
    POOR = "poor"           # Trans fats, processed oils
    NEUTRAL = "neutral"     # Mixed or unknown
    GOOD = "good"           # Healthy fats (MUFA, omega-3)
```

### 6.3 Error Handling

**Pipeline Errors:**

```python
# dish_pipeline/errors.py

class DishPipelineError(Exception):
    """Base exception for pipeline errors."""
    pass

class DishPipelineUpstreamError(DishPipelineError):
    """Vertex AI API error (propagated for HTTP mapping)."""
    def __init__(self, message: str, vertex_error: VertexError):
        super().__init__(message)
        self.vertex_error = vertex_error

class DishPipelineValidationError(DishPipelineError):
    """Validation error (LLM output doesn't match schema)."""
    def __init__(self, message: str, pass_name: str):
        super().__init__(message)
        self.pass_name = pass_name
```

**Vertex AI Errors:**

```python
# vertex/exceptions.py

class VertexError(Exception):
    """Base Vertex AI error."""
    pass

class VertexAuthError(VertexError):
    """Authentication/authorization error (401/403)."""
    pass

class VertexInvalidRequestError(VertexError):
    """Invalid request (400)."""
    pass

class VertexRateLimitError(VertexError):
    """Rate limit exceeded (429)."""
    pass

class VertexTimeoutError(VertexError):
    """Request timeout."""
    pass

class VertexUnavailableError(VertexError):
    """Service unavailable (503)."""
    pass
```

**HTTP Error Mapping (main.py):**

```python
try:
    result = pipeline.run(image_bytes)
except DishPipelineUpstreamError as e:
    vertex_error = e.vertex_error
    
    if isinstance(vertex_error, VertexTimeoutError):
        raise HTTPException(status_code=504, detail="Upstream service timeout")
    
    if isinstance(vertex_error, VertexRateLimitError):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    if isinstance(vertex_error, VertexUnavailableError):
        raise HTTPException(status_code=503, detail="Upstream service unavailable")
    
    raise HTTPException(status_code=500, detail="Upstream service error")

except DishPipelineValidationError as e:
    raise HTTPException(status_code=422, detail=str(e))
```

---

## 7. Deterministic Scoring Engine

### 7.1 Design Principles

**CRITICAL:** Scoring is 100% deterministic and LLM-free.

| Principle | Implementation |
|-----------|----------------|
| **Deterministic** | Same LLM output → same score |
| **Transparent** | All rules documented & testable |
| **No LLM** | Pure logic (no GPT/Gemini in scoring) |
| **Conservative** | Penalize risks, reward safety |
| **Traceable** | Each penalty/bonus logged |

### 7.2 Scoring Algorithm

**Input:** `DishLLMAnalysis` (from LLM pass)  
**Output:** `ScoringResult` (score, bucket, reasons, tips)

**Algorithm:**

```
1. Start with base score: 100
2. Calculate GL estimate (use LLM's [min, max] range)
3. Apply penalties:
   a. GL penalty (0-40 points)
   b. Protein adequacy penalty (0-15 points)
   c. Fiber adequacy penalty (0-15 points)
   d. Fat quality penalty (0-10 points)
   e. Vegetable absence penalty (0-10 points)
   f. Refined carbs dominance penalty (0-15 points)
   g. IO impact penalty (0-30 points, from negative components)
4. Clamp score to [0, 100]
5. Classify bucket:
   - Green (OK): 80-100
   - Yellow (Neutral): 40-79
   - Red (Risk): 0-39
6. Adjust confidence based on LLM confidence
7. Generate reasons (i18n text keys)
8. Generate tips (i18n text keys)
```

**Implementation:**

```python
# scoring/calculator.py

class ScoringCalculator:
    def calculate_score(self, analysis: DishLLMAnalysis) -> ScoringResult:
        # 1. Calculate GL
        gl_estimate = self._calculate_gl(analysis)
        
        # 2. Start with base score
        score = SCORE_BASE  # 100
        penalties: dict[str, int] = {}
        
        # 3a. GL penalty
        gl_penalty = self._calculate_gl_penalty(gl_estimate.mid)
        if gl_penalty > 0:
            penalties["gl"] = gl_penalty
            score -= gl_penalty
        
        # 3b. Protein penalty
        protein_penalty = PROTEIN_PENALTY.get(
            analysis.meal_composition.protein_adequacy, 0
        )
        if protein_penalty > 0:
            penalties["protein"] = protein_penalty
            score -= protein_penalty
        
        # 3c. Fiber penalty
        fiber_penalty = FIBER_PENALTY.get(
            analysis.meal_composition.fiber_adequacy, 0
        )
        if fiber_penalty > 0:
            penalties["fiber"] = fiber_penalty
            score -= fiber_penalty
        
        # 3d. Fat quality penalty
        fat_penalty = FAT_PENALTY.get(
            analysis.meal_composition.fat_quality.value, 0
        )
        if fat_penalty > 0:
            penalties["fat"] = fat_penalty
            score -= fat_penalty
        
        # 3e. Vegetable absence
        if not analysis.meal_composition.vegetable_presence:
            penalties["vegetables"] = VEGETABLE_ABSENT_PENALTY  # 10
            score -= VEGETABLE_ABSENT_PENALTY
        
        # 3f. Refined carbs
        if analysis.meal_composition.refined_carbs_dominant:
            penalties["refined_carbs"] = REFINED_CARBS_PENALTY  # 15
            score -= REFINED_CARBS_PENALTY
        
        # 3g. IO impact (negative components)
        io_penalty = self._calculate_io_penalty(analysis.component_analysis)
        if io_penalty > 0:
            penalties["io_impact"] = io_penalty
            score -= io_penalty
        
        # 4. Clamp score
        score = max(SCORE_MIN, min(SCORE_MAX, score))  # [0, 100]
        
        # 5. Classify bucket
        bucket = self._classify_bucket(score)
        
        # 6. Adjust confidence
        confidence = self._adjust_confidence(analysis.gl_confidence, gl_estimate)
        
        # 7-8. Generate reasons and tips
        reasons = self._generate_reasons(penalties, gl_estimate)
        tips = self._generate_tips(penalties, bucket, analysis.meal_composition)
        
        return ScoringResult(
            io_score=score,
            bucket=bucket,
            gl_estimate=gl_estimate,
            confidence=confidence,
            reasons=reasons,
            tips=tips,
        )
```

### 7.3 Penalty Rules

**GL Penalty (scoring/rules.py):**

```python
GL_LOW_THRESHOLD = 10      # GL < 10 is low
GL_MEDIUM_THRESHOLD = 20   # GL 10-19 is medium, ≥20 is high

GL_PENALTY_LOW = 0         # No penalty for low GL
GL_PENALTY_MEDIUM = 10     # -10 points for medium GL
GL_PENALTY_HIGH_BASE = 20  # Base penalty for high GL
GL_PENALTY_HIGH_INCREMENT = 2  # +2 per 10 GL above 20
MAX_GL_PENALTY = 40        # Cap at -40 points

def _calculate_gl_penalty(gl_mid: float) -> int:
    if gl_mid < GL_LOW_THRESHOLD:
        return GL_PENALTY_LOW
    
    if gl_mid < GL_MEDIUM_THRESHOLD:
        return GL_PENALTY_MEDIUM
    
    # High GL: base + increment
    excess_gl = gl_mid - GL_MEDIUM_THRESHOLD
    increments = int(excess_gl / 10)
    penalty = GL_PENALTY_HIGH_BASE + (increments * GL_PENALTY_HIGH_INCREMENT)
    return min(penalty, MAX_GL_PENALTY)
```

**Protein Penalty:**

```python
PROTEIN_PENALTY = {
    "low": 15,      # Inadequate protein
    "adequate": 5,  # Minimal protein
    "good": 0,      # Good protein
    "high": 0,      # Excellent protein
}
```

**Fiber Penalty:**

```python
FIBER_PENALTY = {
    "low": 15,      # Inadequate fiber
    "adequate": 5,  # Minimal fiber
    "good": 0,      # Good fiber
}
```

**Fat Quality Penalty:**

```python
FAT_PENALTY = {
    "poor": 10,     # Trans fats, processed oils
    "neutral": 0,   # Mixed or unknown
    "good": 0,      # Healthy fats
}
```

**Other Penalties:**

```python
VEGETABLE_ABSENT_PENALTY = 10    # No vegetables detected
REFINED_CARBS_PENALTY = 15       # Refined carbs dominate meal
```

**IO Impact Penalty:**

```python
IO_IMPACT_WEIGHT = {
    "positive": 0,   # No penalty
    "neutral": 0,    # No penalty
    "negative": 10,  # -10 per negative component
}
MAX_IO_IMPACT_PENALTY = 30  # Cap at -30 total

def _calculate_io_penalty(components: List[ComponentAnalysis]) -> int:
    negative_count = sum(
        1 for c in components if c.io_impact == IOImpact.NEGATIVE
    )
    penalty = negative_count * IO_IMPACT_WEIGHT["negative"]
    return min(penalty, MAX_IO_IMPACT_PENALTY)
```

### 7.4 Bucket Classification

```python
BUCKET_GREEN_THRESHOLD = 80   # ≥80 = Green (OK)
BUCKET_YELLOW_THRESHOLD = 40  # 40-79 = Yellow (Neutral)
# <40 = Red (Risk)

def _classify_bucket(score: int) -> Bucket:
    if score >= BUCKET_GREEN_THRESHOLD:
        return Bucket.GREEN
    if score >= BUCKET_YELLOW_THRESHOLD:
        return Bucket.YELLOW
    return Bucket.RED
```

### 7.5 Reason & Tip Generation

**Reasons (i18n text keys):**

```python
def _generate_reasons(
    penalties: dict[str, int],
    gl_estimate: GLEstimate,
) -> List[dict]:
    reasons = []
    
    if "gl" in penalties:
        if gl_estimate.mid >= 20:
            reasons.append({"type": "negative", "text_key": REASON_HIGH_GL})
        else:
            reasons.append({"type": "negative", "text_key": REASON_MEDIUM_GL})
    
    if "protein" in penalties:
        reasons.append({"type": "negative", "text_key": REASON_LOW_PROTEIN})
    
    if "fiber" in penalties:
        reasons.append({"type": "negative", "text_key": REASON_LOW_FIBER})
    
    if "fat" in penalties:
        reasons.append({"type": "negative", "text_key": REASON_POOR_FAT})
    
    if "vegetables" in penalties:
        reasons.append({"type": "negative", "text_key": REASON_NO_VEGETABLES})
    
    if "refined_carbs" in penalties:
        reasons.append({"type": "negative", "text_key": REASON_REFINED_CARBS})
    
    if "io_impact" in penalties:
        reasons.append({"type": "negative", "text_key": REASON_NEGATIVE_COMPONENTS})
    
    return reasons
```

**Tips (i18n text keys):**

```python
def _generate_tips(
    penalties: dict[str, int],
    bucket: Bucket,
    composition: MealComposition,
) -> List[dict]:
    tips = []
    
    if bucket == Bucket.RED:
        tips.append({"text_key": TIP_REDUCE_PORTION})
    
    if "refined_carbs" in penalties:
        tips.append({"text_key": TIP_SWAP_REFINED})
    
    if "vegetables" in penalties:
        tips.append({"text_key": TIP_ADD_VEGETABLES})
    
    if "fiber" in penalties:
        tips.append({"text_key": TIP_ADD_FIBER})
    
    if "protein" in penalties:
        tips.append({"text_key": TIP_ADD_PROTEIN})
    
    if len(tips) == 0 and bucket == Bucket.YELLOW:
        tips.append({"text_key": TIP_BALANCE_MEAL})
    
    return tips[:3]  # Max 3 tips
```

**Text Keys (defined in scoring/rules.py):**

```python
# Reasons
REASON_HIGH_GL = "reason_high_gl"
REASON_MEDIUM_GL = "reason_medium_gl"
REASON_LOW_PROTEIN = "reason_low_protein"
REASON_LOW_FIBER = "reason_low_fiber"
REASON_POOR_FAT = "reason_poor_fat"
REASON_NO_VEGETABLES = "reason_no_vegetables"
REASON_REFINED_CARBS = "reason_refined_carbs"
REASON_NEGATIVE_COMPONENTS = "reason_negative_components"

# Tips
TIP_REDUCE_PORTION = "tip_reduce_portion"
TIP_SWAP_REFINED = "tip_swap_refined_carbs"
TIP_ADD_VEGETABLES = "tip_add_vegetables"
TIP_ADD_FIBER = "tip_add_fiber"
TIP_ADD_PROTEIN = "tip_add_protein"
TIP_BALANCE_MEAL = "tip_balance_meal"
```

**Mobile app** uses these keys for i18n (PL/EN translations in Flutter).

---

## 8. Infrastructure & Deployment

### 8.1 Cloud Run Configuration

**Service Name:** `asystent-io-premium-api-dev` (DEV) / `asystent-io-premium-api` (PROD)

**Region:** `europe-west1` (GDPR compliance)

**Resources:**

```yaml
memory: 2Gi
cpu: 2
concurrency: 1              # 1 request per container (CPU-intensive LLM calls)
timeout: 60s                # Max request timeout
min-instances: 0            # Scale to zero (DEV), 2 (PROD for warmth)
max-instances: 100          # Auto-scale up to 100 containers
cpu-boost: true             # CPU boost during startup
```

**Health Probes:**

```yaml
startup:
  path: /v1/health
  initialDelaySeconds: 0
  timeoutSeconds: 3
  periodSeconds: 3
  failureThreshold: 3

liveness:
  path: /v1/health
  timeoutSeconds: 3
  periodSeconds: 15
```

**Deployment Command:**

```bash
gcloud run deploy asystent-io-premium-api-dev \
  --source . \
  --region europe-west1 \
  --project asystent-io-484912 \
  --allow-unauthenticated \
  --memory=2Gi \
  --cpu=2 \
  --min-instances=0 \
  --max-instances=100 \
  --concurrency=1 \
  --timeout=60s \
  --cpu-boost \
  --set-env-vars="$(cat .env.dev.local | grep -v '^#' | tr '\n' ',')"
```

### 8.2 Service Accounts & IAM

**Default Service Account:**

Cloud Run uses default compute service account:
```
PROJECT_NUMBER-compute@developer.gserviceaccount.com
```

**Required Roles:**

| Role | Purpose |
|------|---------|
| `roles/aiplatform.user` | Vertex AI API access |
| `roles/datastore.user` | Firestore read access |
| `roles/firebase.viewer` | Firebase Auth & Remote Config |
| `roles/logging.logWriter` | Cloud Logging write |

**Grant Permissions:**

```bash
# Get project number
PROJECT_NUMBER=$(gcloud projects describe asystent-io-484912 --format="value(projectNumber)")

# Service account email
SA_EMAIL="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Grant Vertex AI access
gcloud projects add-iam-policy-binding asystent-io-484912 \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/aiplatform.user"

# Grant Firestore access
gcloud projects add-iam-policy-binding asystent-io-484912 \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/datastore.user"

# Grant Firebase access
gcloud projects add-iam-policy-binding asystent-io-484912 \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/firebase.viewer"
```

### 8.3 Environment Variables

**Deployment Methods:**

1. **PowerShell Script** (Recommended for DEV):

```powershell
# deploy-dev.ps1
.\deploy-dev.ps1
```

2. **Direct gcloud command:**

```bash
gcloud run services update asystent-io-premium-api-dev \
  --region europe-west1 \
  --set-env-vars="GCP_PROJECT=asystent-io-484912,VERTEX_REGION=europe-west1,LOG_LEVEL=INFO"
```

3. **YAML descriptor:**

```yaml
# service.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: asystent-io-premium-api-dev
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "0"
        autoscaling.knative.dev/maxScale: "100"
    spec:
      containerConcurrency: 1
      timeoutSeconds: 60
      containers:
      - image: gcr.io/asystent-io-484912/premium-api:latest
        env:
        - name: GCP_PROJECT
          value: "asystent-io-484912"
        - name: VERTEX_REGION
          value: "europe-west1"
        - name: LOG_LEVEL
          value: "INFO"
```

**Configuration File:**

```bash
# .env.dev.local (NOT committed to git)
GCP_PROJECT=asystent-io-484912
VERTEX_REGION=europe-west1
VERTEX_PRIMARY_MODEL=gemini-2.5-flash
VERTEX_FALLBACK_MODEL=gemini-2.5-flash
VERTEX_TEMPERATURE=0.1
VERTEX_MAX_OUTPUT_TOKENS=4096
VERTEX_CONNECT_TIMEOUT=5.0
VERTEX_READ_TIMEOUT=20.0
LOG_LEVEL=INFO
RETRY_MAX_ATTEMPTS=1
RETRY_ON_TIMEOUT=false
DEV_OVERRIDE_FLAGS=true
ALLOW_DEBUG_E2E_TOKEN=true
```

**Template:**

```bash
# .env.dev.local.template (committed to git as reference)
GCP_PROJECT=asystent-io-484912
VERTEX_REGION=europe-west1
LOG_LEVEL=INFO
DEV_OVERRIDE_FLAGS=true
ALLOW_DEBUG_E2E_TOKEN=true
```

---

## 9. Configuration Management

### 9.1 Configuration Hierarchy

```
config.py (defaults) → Environment Variables → .env.dev.local (local dev only)
```

**Priority:** ENV vars > config.py defaults

### 9.2 Key Configuration Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `GCP_PROJECT` | `asystent-io-484912` | GCP project ID |
| `VERTEX_REGION` | `europe-west1` | Vertex AI region |
| `VERTEX_PRIMARY_MODEL` | `gemini-2.5-flash` | LLM model |
| `VERTEX_TEMPERATURE` | `0.1` | Generation temperature |
| `VERTEX_MAX_OUTPUT_TOKENS` | `4096` | Max output tokens |
| `VERTEX_CONNECT_TIMEOUT` | `5.0` | HTTPS connect timeout |
| `VERTEX_READ_TIMEOUT` | `20.0` | Response read timeout |
| `RETRY_MAX_ATTEMPTS` | `1` | Max retry attempts |
| `RETRY_ON_TIMEOUT` | `false` | Retry on timeout |
| `LOG_LEVEL` | `INFO` | Logging level |
| `DEV_OVERRIDE_FLAGS` | `false` | Enable all features locally |
| `ALLOW_DEBUG_E2E_TOKEN` | `false` | Accept debug token for E2E tests |
| `MAX_IMAGE_SIZE_BYTES` | `512000` | Max image size (500KB) |
| `PREMIUM_CACHE_TTL_SECONDS` | `300` | Premium cache TTL |
| `FLAGS_REFRESH_INTERVAL_SECONDS` | `300` | Feature flags cache TTL |

### 9.3 Feature Flags (Remote Config)

**Default Values (Fail-Closed):**

```python
# config.py
DEFAULT_FLAGS = {
    "premium_scan_enabled": False,      # Fail-closed
    "dish_analysis_enabled": False,     # Fail-closed
    "menu_analysis_enabled": False,     # Fail-closed
    "use_flash_model": True,            # Prefer cheaper model
    "max_requests_per_minute": 5,       # Conservative limit
    "max_daily_requests": 50,           # Conservative limit
    "maintenance_mode": False,          # Allow requests
}
```

**DEV Override (Local Only):**

```python
if DEV_OVERRIDE_FLAGS:
    DEFAULT_FLAGS = {
        "premium_scan_enabled": True,   # All features enabled
        "dish_analysis_enabled": True,
        "menu_analysis_enabled": True,
        "max_requests_per_minute": 100,
        "max_daily_requests": 1000,
        "maintenance_mode": False,
    }
```

**Firebase Remote Config UI:**

1. Go to: https://console.firebase.google.com/project/asystent-io-484912/config
2. Add parameters:
   - `premium_scan_enabled` → boolean → `true`
   - `dish_analysis_enabled` → boolean → `true`
   - `maintenance_mode` → boolean → `false`
3. Publish changes
4. Backend caches for 5 minutes

---

## 10. Error Handling & Observability

### 10.1 Structured Logging

**Format:** JSON (Cloud Logging compatible)

**Fields:**

```json
{
  "severity": "INFO|WARNING|ERROR",
  "message": "Human-readable message",
  "logger": "asystent-io-premium-api",
  "request_id": "uuid-correlation-id",
  "logging.googleapis.com/trace": "projects/asystent-io-484912/traces/trace-id",
  "path": "/v1/analyze/dish",
  "method": "POST",
  "status_code": 200,
  "latency_ms": 2847,
  "user_id_prefix": "abc123...",
  "error_type": "VertexTimeoutError",
  "error_message": "Request timeout after 20s"
}
```

**Implementation:**

```python
# core/logging.py

class StructuredFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_obj = {
            "severity": self.SEVERITY_MAP.get(record.levelno, "INFO"),
            "message": record.getMessage(),
            "logger": record.name,
        }
        
        # Add request correlation
        request_id = request_id_ctx.get()
        if request_id:
            log_obj["request_id"] = request_id
        
        trace_id = trace_id_ctx.get()
        if trace_id:
            log_obj["logging.googleapis.com/trace"] = \
                f"projects/asystent-io-484912/traces/{trace_id}"
        
        # Add extra fields
        if hasattr(record, "extra_fields"):
            log_obj.update(record.extra_fields)
        
        return json.dumps(log_obj, default=str)
```

**Usage:**

```python
from core.logging import get_logger

logger = get_logger(__name__)

logger.info("Request started", extra={
    "path": "/v1/analyze/dish",
    "method": "POST",
    "user_id_prefix": user.uid[:8],
})
```

### 10.2 Request Correlation

**Middleware:**

```python
# middleware/correlation.py

class CorrelationMiddleware:
    async def __call__(self, request: Request, call_next):
        # Generate or extract request ID
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Extract trace ID from Cloud Run
        trace_header = request.headers.get("X-Cloud-Trace-Context", "")
        trace_id = trace_header.split("/")[0] if trace_header else None
        request.state.trace_id = trace_id
        
        # Set context vars for logging
        request_id_ctx.set(request_id)
        trace_id_ctx.set(trace_id)
        
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        
        return response
```

### 10.3 Gate Rejection Logging

**Purpose:** Track why requests are rejected (for monitoring)

```python
# core/logging.py

def log_gate_rejection(gate_name: str, uid: Optional[str]):
    """Log structured gate rejection for monitoring."""
    logger = get_logger("asystent-io-premium-api")
    logger.warning(
        f"Gate rejection: {gate_name}",
        extra={
            "gate_name": gate_name,
            "user_id_prefix": uid[:8] if uid else None,
            "event_type": "gate_rejection",
        }
    )
```

**Usage:**

```python
# flags/dependencies.py
if not flags.get("premium_scan_enabled"):
    log_gate_rejection("kill_switch", None)
    raise HTTPException(status_code=503, detail="Service unavailable")

# premium/dependencies.py
if not entitlement.is_active():
    log_gate_rejection("premium_required", user.uid)
    raise HTTPException(status_code=403, detail="Premium required")
```

### 10.4 Monitoring Queries (Cloud Logging)

**All requests:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="asystent-io-premium-api-dev"
severity>=INFO
```

**Gate rejections:**
```
jsonPayload.event_type="gate_rejection"
```

**Errors:**
```
severity>=ERROR
```

**Slow requests (>5s):**
```
jsonPayload.latency_ms>5000
```

**Vertex timeouts:**
```
jsonPayload.error_type="VertexTimeoutError"
```

---

## 11. Security & Privacy

### 11.1 Security Principles

| Principle | Implementation |
|-----------|----------------|
| **No Secrets in Code** | All credentials via ENV or ADC |
| **Fail-Closed** | Errors deny access (auth/premium/flags) |
| **Minimal Logging** | No PII, no images, no nutrition values |
| **Image Privacy** | Never persisted, in-memory only |
| **Token Expiry** | Firebase tokens auto-verified |
| **HTTPS Only** | TLS 1.2+ enforced by Cloud Run |

### 11.2 Data Privacy

**What We Log:**

- ✅ Request ID (correlation)
- ✅ User ID prefix (first 8 chars, e.g., `abc12345...`)
- ✅ Error types (no stack traces with user data)
- ✅ Latency metrics
- ✅ Gate rejection events

**What We DON'T Log:**

- ❌ Full user IDs
- ❌ Email addresses
- ❌ Firebase tokens
- ❌ Image data (base64 or binary)
- ❌ Exact nutrition values
- ❌ Exact scores (only buckets: green/yellow/red)
- ❌ LLM prompts or outputs (in production logs)

**Image Handling:**

```python
# Images are NEVER persisted
async def analyze_dish_endpoint(...):
    image_bytes = await image.read()  # In-memory
    result = pipeline.run(image_bytes)  # In-memory
    # image_bytes is garbage-collected after response
```

### 11.3 Rate Limiting (Future)

**Current Status:** Not implemented (relying on Cloud Run concurrency limits)

**Planned (PR16+):**

- Per-user rate limits (Firestore-backed)
- Daily quota tracking
- 429 Too Many Requests response

---

## 12. Testing Strategy

### 12.1 Test Structure

```
tests/
├── test_health.py                 # Health endpoint tests
├── test_auth.py                   # Auth dependency tests
├── test_premium.py                # Premium check tests
├── test_flags.py                  # Feature flags tests
├── test_guards.py                 # Request guards (idempotency)
├── test_analyze_dish.py           # Dish endpoint E2E tests
├── test_dish_pipeline.py          # Pipeline orchestration tests
├── test_scoring_calculator.py     # Deterministic scoring tests
└── test_vertex_client.py          # Vertex AI client tests
```

### 12.2 Running Tests

**All tests:**
```bash
pytest
```

**Specific test file:**
```bash
pytest tests/test_scoring_calculator.py
```

**With coverage:**
```bash
pytest --cov=. --cov-report=html
```

**Watch mode (continuous):**
```bash
pytest-watch
```

### 12.3 Test Categories

**Unit Tests:**
- `test_scoring_calculator.py` — Deterministic scoring logic
- `test_guards.py` — Idempotency cache, validators
- `test_auth.py` — Token verification logic

**Integration Tests:**
- `test_dish_pipeline.py` — Pipeline orchestration
- `test_vertex_client.py` — Vertex AI REST API calls

**E2E Tests:**
- `test_analyze_dish.py` — Full endpoint flow (mocked Vertex/Firebase)
- `test_health.py` — Health check endpoint

### 12.4 Mocking Strategy

**Firebase:**
```python
@pytest.fixture
def mock_firebase():
    with patch("firebase_admin.get_app"):
        with patch("firebase_admin.initialize_app"):
            yield
```

**Vertex AI:**
```python
@pytest.fixture
def mock_vertex_success():
    with patch.object(VertexClient, "analyze_image_vision_with_text") as mock:
        mock.return_value = {
            "component_analysis": [...],
            "meal_composition": {...},
            "estimated_gl_range": [20, 30],
            "gl_confidence": 0.8,
        }
        yield mock
```

**Firestore:**
```python
@pytest.fixture
def mock_premium_active():
    with patch("premium.firestore_client.get_premium_entitlement") as mock:
        mock.return_value = PremiumEntitlement(
            is_premium=True,
            expires_at=datetime.now(timezone.utc) + timedelta(days=30),
        )
        yield mock
```

### 12.5 E2E Test Example

```python
# tests/test_analyze_dish.py

def test_analyze_dish_success(
    client,
    mock_vertex_success,
    mock_premium_active,
    mock_flags_enabled,
):
    """Test successful dish analysis flow."""
    
    # Arrange
    headers = {
        "Authorization": "Bearer DEBUG_E2E_TOKEN",
        "X-Idempotency-Key": str(uuid.uuid4()),
    }
    files = {
        "image": ("dish.jpg", BytesIO(b"\xff\xd8\xff\xe0..."), "image/jpeg"),
    }
    
    # Act
    response = client.post("/v1/analyze/dish", headers=headers, files=files)
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "io_score" in data["analysis"]
    assert data["analysis"]["bucket"] in ["green", "yellow", "red"]
    assert response.headers["X-Idempotency-Cache"] == "MISS"
```

---

## 13. File Structure

```
backend-premium/
├── main.py                         # FastAPI app entry point
├── config.py                       # Environment-based configuration
├── requirements.txt                # Python dependencies
├── Dockerfile                      # Cloud Run container
├── pytest.ini                      # Pytest configuration
├── .env.dev.local.template         # ENV template for local dev
├── .env.dev.local                  # Actual ENV values (gitignored)
├── .gitignore                      # Git ignore rules
│
├── README.md                       # User-facing documentation
├── BACKEND_PREMIUM_SPEC.md         # This file (dev onboarding)
├── OBSERVABILITY_README.md         # Logging & monitoring guide
├── OBSERVABILITY_EXPLAINED.md      # Structured logging rationale
├── OBSERVABILITY_CHECKLIST.md      # Pre-deployment observability checks
│
├── deploy-dev.ps1                  # PowerShell deployment script
├── test-loop.ps1                   # Continuous test runner
├── test-menu.ps1                   # Interactive test menu
│
├── auth/                           # Firebase Authentication
│   ├── __init__.py
│   ├── firebase.py                 # Firebase Admin SDK init
│   └── dependencies.py             # FastAPI auth dependencies
│
├── premium/                        # Premium Entitlement Checks
│   ├── __init__.py
│   ├── firestore_client.py         # Firestore client for premium DB
│   ├── cache.py                    # In-memory premium cache
│   ├── service.py                  # Premium check logic
│   └── dependencies.py             # FastAPI premium dependencies
│
├── flags/                          # Feature Flags & Kill Switch
│   ├── __init__.py
│   ├── remote_config.py            # Firebase Remote Config client
│   ├── service.py                  # Feature flag service
│   └── dependencies.py             # FastAPI flag dependencies
│
├── guards/                         # Request Guards (Idempotency)
│   ├── __init__.py
│   ├── idempotency.py              # Idempotency cache
│   ├── validators.py               # Request validators (image, UUID)
│   └── dependencies.py             # FastAPI guard dependencies
│
├── dish_pipeline/                  # Dish Analysis Pipeline
│   ├── __init__.py
│   ├── orchestrator.py             # Multi-pass orchestration
│   ├── llm_multimodal.py           # Multimodal LLM pass
│   ├── repair.py                   # LLM output repair logic
│   ├── types.py                    # Pipeline data types
│   └── errors.py                   # Pipeline-specific exceptions
│
├── menu_pipeline/                  # Menu Analysis Pipeline (future)
│   ├── __init__.py
│   └── orchestrator.py             # Menu-specific orchestration
│
├── prompts/                        # LLM Prompts & Schemas
│   ├── __init__.py
│   ├── vision_dish.py              # Vision pass prompt builder
│   ├── llm_dish.py                 # LLM pass prompt builder
│   ├── schemas.py                  # Pydantic schemas (dish)
│   ├── vision_menu.py              # Menu vision prompts (future)
│   ├── llm_menu.py                 # Menu LLM prompts (future)
│   └── schemas_menu.py             # Menu schemas (future)
│
├── scoring/                        # Deterministic Scoring Engine
│   ├── __init__.py
│   ├── calculator.py               # Main scoring calculator
│   ├── rules.py                    # Penalty/bonus rules & constants
│   ├── models.py                   # Scoring output models
│   ├── menu_calculator.py          # Menu scoring (future)
│   └── menu_models.py              # Menu scoring models (future)
│
├── vertex/                         # Vertex AI Client
│   ├── __init__.py
│   ├── client.py                   # REST API client (sync)
│   ├── credentials.py              # ADC token management
│   ├── exceptions.py               # Vertex-specific exceptions
│   └── retry.py                    # Retry logic with backoff
│
├── middleware/                     # Middleware Components
│   ├── __init__.py
│   └── correlation.py              # Request correlation middleware
│
├── core/                           # Core Utilities
│   ├── __init__.py
│   ├── logging.py                  # Structured JSON logging
│   ├── errors.py                   # Error models & codes
│   └── json_utils.py               # JSON extraction utilities
│
├── docs/                           # Technical Documentation
│   └── vertex_contract.md          # Vertex AI API contract
│
└── tests/                          # Test Suite
    ├── __init__.py
    ├── conftest.py                 # Pytest fixtures
    ├── test_health.py
    ├── test_auth.py
    ├── test_premium.py
    ├── test_flags.py
    ├── test_guards.py
    ├── test_analyze_dish.py
    ├── test_dish_pipeline.py
    ├── test_scoring_calculator.py
    ├── test_vertex_client.py
    └── README.md                   # Test documentation
```

---

## 14. Commands Reference

### 14.1 Local Development

**Setup:**
```bash
cd backend-premium
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # macOS/Linux
pip install -r requirements.txt
```

**Run Locally:**
```bash
# Default port 8080
uvicorn main:app --reload --host 0.0.0.0 --port 8080

# Custom port
PORT=8000 uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Test Health:**
```bash
curl http://localhost:8080/v1/health
```

**API Docs:**
- Swagger UI: http://localhost:8080/docs
- ReDoc: http://localhost:8080/redoc

### 14.2 Testing

**Run All Tests:**
```bash
pytest
```

**Run Specific Test:**
```bash
pytest tests/test_scoring_calculator.py::test_calculate_score_high_gl
```

**Run with Coverage:**
```bash
pytest --cov=. --cov-report=html
# Open htmlcov/index.html in browser
```

**Continuous Testing:**
```powershell
# PowerShell
.\test-loop.ps1

# Or manually with pytest-watch
pytest-watch
```

**Interactive Test Menu:**
```powershell
.\test-menu.ps1
```

### 14.3 Deployment

**Deploy to Cloud Run (DEV):**

```powershell
# Using PowerShell script (recommended)
.\deploy-dev.ps1
```

```bash
# Or manual gcloud command
gcloud run deploy asystent-io-premium-api-dev \
  --source . \
  --region europe-west1 \
  --project asystent-io-484912 \
  --allow-unauthenticated \
  --memory=2Gi \
  --cpu=2 \
  --min-instances=0 \
  --max-instances=100 \
  --concurrency=1 \
  --timeout=60s \
  --cpu-boost
```

**Update ENV Vars Only:**

```powershell
.\deploy-dev.ps1
```

**View Logs:**

```bash
# Stream logs
gcloud run services logs tail asystent-io-premium-api-dev \
  --region europe-west1 \
  --project asystent-io-484912

# View in Cloud Console
https://console.cloud.google.com/run/detail/europe-west1/asystent-io-premium-api-dev/logs
```

**Check Service Status:**

```bash
gcloud run services describe asystent-io-premium-api-dev \
  --region europe-west1 \
  --project asystent-io-484912
```

### 14.4 Debugging

**Check ENV Vars:**

```bash
gcloud run services describe asystent-io-premium-api-dev \
  --region europe-west1 \
  --format="value(spec.template.spec.containers[0].env)"
```

**Test Endpoint (DEV):**

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe asystent-io-premium-api-dev \
  --region europe-west1 \
  --format='value(status.url)')

# Health check
curl $SERVICE_URL/v1/health

# Analyze dish (with debug token)
curl -X POST $SERVICE_URL/v1/analyze/dish \
  -H "Authorization: Bearer DEBUG_E2E_TOKEN" \
  -H "X-Idempotency-Key: $(uuidgen)" \
  -F "image=@test_dish.jpg"
```

---

## 15. Development Workflow

### 15.1 Adding a New Endpoint

1. **Define endpoint in main.py:**

```python
@app.post("/v1/analyze/new-feature")
async def analyze_new_feature(
    request: Request,
    user: UserContext = Depends(get_current_user),
    _premium: None = Depends(require_premium_user),
    _service: None = Depends(require_service_available),
) -> JSONResponse:
    # Implementation
    pass
```

2. **Create pipeline module:**

```
new_feature_pipeline/
├── __init__.py
├── orchestrator.py
├── types.py
└── errors.py
```

3. **Add prompts:**

```
prompts/
├── vision_new_feature.py
├── llm_new_feature.py
└── schemas_new_feature.py
```

4. **Add tests:**

```
tests/
├── test_analyze_new_feature.py
└── test_new_feature_pipeline.py
```

5. **Update documentation:**

- Add endpoint to this spec
- Update README.md
- Add API docs in main.py

### 15.2 Modifying Scoring Rules

1. **Update rules in scoring/rules.py:**

```python
# Add new penalty
NEW_PENALTY = 15

# Update penalty map
PENALTY_MAP["new_category"] = NEW_PENALTY
```

2. **Update calculator in scoring/calculator.py:**

```python
def calculate_score(self, analysis: DishLLMAnalysis) -> ScoringResult:
    # Add new penalty logic
    if condition:
        penalties["new_category"] = NEW_PENALTY
        score -= NEW_PENALTY
```

3. **Add reason/tip keys in scoring/rules.py:**

```python
REASON_NEW_CATEGORY = "reason_new_category"
TIP_NEW_CATEGORY = "tip_new_category"
```

4. **Update tests in tests/test_scoring_calculator.py:**

```python
def test_new_penalty():
    analysis = create_analysis_with_new_condition()
    result = calculator.calculate_score(analysis)
    assert result.io_score == expected_score
    assert any(r["text_key"] == REASON_NEW_CATEGORY for r in result.reasons)
```

5. **Update mobile app i18n:**

- Add `reason_new_category` and `tip_new_category` to Flutter i18n files

### 15.3 Changing LLM Prompts

1. **Update prompt builder:**

```python
# prompts/llm_dish.py
def build_llm_prompt(vision_output: dict) -> str:
    # Modify instructions
    task_instructions = """
    NEW INSTRUCTIONS HERE
    """
    
    # Update JSON schema if needed
    json_schema = """
    {
      "new_field": "string"
    }
    """
```

2. **Update schema:**

```python
# prompts/schemas.py
class DishLLMAnalysis(BaseModel):
    new_field: str  # Add new field
```

3. **Update pipeline to handle new schema:**

```python
# dish_pipeline/orchestrator.py
# JSON extraction already handles new fields automatically
```

4. **Update scoring to use new field:**

```python
# scoring/calculator.py
def calculate_score(self, analysis: DishLLMAnalysis) -> ScoringResult:
    # Use new_field
    if analysis.new_field == "some_value":
        # Apply logic
```

5. **Add tests:**

```python
# tests/test_dish_pipeline.py
def test_new_field_extraction():
    # Mock Vertex response with new_field
    # Verify parsing
```

### 15.4 Adding a Feature Flag

1. **Add default in config.py:**

```python
DEFAULT_FLAGS = {
    "new_feature_enabled": False,  # Fail-closed
}
```

2. **Add to Firebase Remote Config:**

- Go to Firebase Console → Remote Config
- Add parameter: `new_feature_enabled` → boolean → `false`
- Publish

3. **Use in dependency:**

```python
# flags/dependencies.py
async def require_new_feature():
    flags = _flags_client.get_flags()
    if not flags.get("new_feature_enabled", False):
        raise HTTPException(status_code=503, detail="Feature not enabled")
```

4. **Apply to endpoint:**

```python
@app.post("/v1/new-feature")
async def new_feature_endpoint(
    _feature: None = Depends(require_new_feature),
):
    # Implementation
```

---

## 16. Production Operations

### 16.1 Deployment Checklist

Before deploying to production:

- [ ] All tests pass (`pytest`)
- [ ] E2E tests pass with real Vertex AI (integration env)
- [ ] Feature flags configured in Firebase Remote Config
- [ ] ENV vars reviewed (NO `DEV_OVERRIDE_FLAGS=true`, NO `ALLOW_DEBUG_E2E_TOKEN=true`)
- [ ] Cloud Run min-instances set to 2 (for warmth)
- [ ] Monitoring dashboards configured
- [ ] Alert policies created (error rate, latency)
- [ ] Documentation updated (README, this spec)
- [ ] Mobile app updated to handle new response format (if changed)

### 16.2 Monitoring

**Key Metrics:**

| Metric | Target | Alert |
|--------|--------|-------|
| Request latency (p99) | <5s | >10s |
| Error rate | <1% | >5% |
| Vertex timeout rate | <2% | >10% |
| Gate rejection rate | <5% | >20% |
| Container startup time | <10s | >30s |

**Monitoring Queries:**

**Request latency p99:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="asystent-io-premium-api"
jsonPayload.latency_ms
| DISTRIBUTION latency_ms BY 99th PERCENTILE
```

**Error rate:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="asystent-io-premium-api"
severity>=ERROR
| RATE
```

**Vertex timeouts:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="asystent-io-premium-api"
jsonPayload.error_type="VertexTimeoutError"
| COUNT
```

### 16.3 Incident Response

**High Error Rate:**

1. Check Cloud Logging for error details
2. Check Vertex AI status: https://status.cloud.google.com/
3. Check Firebase status: https://status.firebase.google.com/
4. Enable maintenance mode via Remote Config: `maintenance_mode=true`
5. Investigate root cause
6. Deploy fix
7. Disable maintenance mode

**High Latency:**

1. Check Vertex AI region performance
2. Check Cloud Run container scaling (may need more instances)
3. Check LLM prompt complexity (may need optimization)
4. Consider enabling retry on timeout (if disabled)

**Feature Flag Emergency Disable:**

1. Go to Firebase Console → Remote Config
2. Set `premium_scan_enabled=false` or `dish_analysis_enabled=false`
3. Publish immediately (takes effect within 5 minutes due to cache)

---

## 17. Future Roadmap

### 17.1 Planned Features

| Feature | Status | Priority | PR |
|---------|--------|----------|-----|
| Dish Analysis | ✅ Live | P0 | PR12 |
| Menu Analysis | 🚧 Planned | P1 | PR15+ |
| Rate Limiting | 🚧 Planned | P1 | PR16 |
| User Quota Tracking | 🚧 Planned | P2 | PR17 |
| Batch Analysis | 🚧 Planned | P2 | PR18 |
| ML-based GI Estimation | 🔬 Research | P3 | TBD |

### 17.2 Technical Debt

| Item | Priority | Notes |
|------|----------|-------|
| Retry logic | P1 | Currently disabled in DEV |
| Idempotency persistence | P2 | In-memory only (lost on container restart) |
| Cache eviction policy | P2 | LRU or TTL+size limit |
| Structured error responses | P2 | Standardize error format across all endpoints |
| OpenAPI schema validation | P3 | Auto-generate from Pydantic models |

### 17.3 Performance Optimizations

| Optimization | Impact | Complexity |
|--------------|--------|------------|
| Prompt caching (Vertex AI) | High | Low |
| Image preprocessing (resize) | Medium | Medium |
| Parallel LLM calls (multi-dish menu) | High | High |
| GPU-accelerated inference | High | Very High |
| Model quantization | Medium | High |

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **ADC** | Application Default Credentials (GCP auth method) |
| **Cloud Run** | GCP serverless container platform |
| **DEV_OVERRIDE_FLAGS** | Local dev mode (bypasses Remote Config) |
| **Fail-Closed** | On error, deny access (secure default) |
| **Firestore** | GCP NoSQL database (premium entitlements) |
| **GL** | Glycemic Load (GI × carbs / 100) |
| **GI** | Glycemic Index (blood sugar impact) |
| **Idempotency** | Retry-safe requests (same result for duplicate calls) |
| **IO** | Insulin resistance (Polish: Insulinooporność) |
| **Kill Switch** | Remote Config flag to disable service |
| **LLM** | Large Language Model (Gemini 2.5 Flash) |
| **Multimodal** | Vision + Text input to LLM |
| **Premium** | Paid subscription tier |
| **Remote Config** | Firebase feature flags service |
| **Vertex AI** | GCP managed AI platform |

---

## Appendix B: Key Files Reference

**Entry Points:**
- [main.py](main.py) — FastAPI application
- [config.py](config.py) — Configuration management

**Authentication:**
- [auth/firebase.py](auth/firebase.py) — Firebase Admin SDK
- [auth/dependencies.py](auth/dependencies.py) — Auth dependencies

**Premium Checks:**
- [premium/firestore_client.py](premium/firestore_client.py) — Firestore client
- [premium/dependencies.py](premium/dependencies.py) — Premium dependencies

**Feature Flags:**
- [flags/remote_config.py](flags/remote_config.py) — Remote Config client
- [flags/dependencies.py](flags/dependencies.py) — Flag dependencies

**Dish Pipeline:**
- [dish_pipeline/orchestrator.py](dish_pipeline/orchestrator.py) — Pipeline orchestration
- [dish_pipeline/llm_multimodal.py](dish_pipeline/llm_multimodal.py) — Multimodal LLM pass

**Prompts:**
- [prompts/llm_dish.py](prompts/llm_dish.py) — LLM prompt builder
- [prompts/schemas.py](prompts/schemas.py) — Pydantic schemas

**Scoring:**
- [scoring/calculator.py](scoring/calculator.py) — Scoring engine
- [scoring/rules.py](scoring/rules.py) — Penalty rules

**Vertex AI:**
- [vertex/client.py](vertex/client.py) — REST API client
- [vertex/credentials.py](vertex/credentials.py) — ADC management

**Core:**
- [core/logging.py](core/logging.py) — Structured logging
- [core/errors.py](core/errors.py) — Error models

**Deployment:**
- [Dockerfile](Dockerfile) — Container config
- [deploy-dev.ps1](deploy-dev.ps1) — Deployment script

**Tests:**
- [tests/test_analyze_dish.py](tests/test_analyze_dish.py) — E2E tests
- [tests/test_scoring_calculator.py](tests/test_scoring_calculator.py) — Scoring tests

---

## Appendix C: Common Issues & Solutions

### Issue: Firebase Auth Error "Invalid token"

**Symptoms:** 401 responses, logs show "Token verification failed"

**Causes:**
- Token expired (1 hour TTL)
- Wrong project ID in token
- Firebase Admin SDK not initialized

**Solutions:**
1. Check token expiry on client side
2. Verify `GCP_PROJECT` matches Firebase project
3. Check Cloud Run service account has `firebase.viewer` role

### Issue: Vertex AI Timeout

**Symptoms:** 504 responses, logs show "VertexTimeoutError"

**Causes:**
- Image too large (slow base64 encoding)
- Vertex AI regional latency spike
- LLM prompt too complex

**Solutions:**
1. Increase `VERTEX_READ_TIMEOUT` (default 20s → 30s)
2. Enable retry: `RETRY_ON_TIMEOUT=true`
3. Check Vertex AI status page
4. Reduce prompt complexity

### Issue: Premium Check Always Fails

**Symptoms:** 403 responses, logs show "Premium subscription required"

**Causes:**
- Firestore document missing
- Incorrect Firestore schema
- Service account lacks `datastore.user` role

**Solutions:**
1. Verify Firestore document exists: `users/{uid}/premium/subscription`
2. Check schema: `is_premium=true`, `expires_at` (timestamp)
3. Grant Firestore access to service account

### Issue: Feature Flags Not Updating

**Symptoms:** Changes in Remote Config not reflected in service

**Causes:**
- Cache TTL not expired (5 minutes)
- Remote Config not published
- Service account lacks `firebase.viewer` role

**Solutions:**
1. Wait 5 minutes for cache refresh
2. Verify Remote Config published in Firebase Console
3. Restart Cloud Run service to force cache clear

---

**End of Document**

---

**Version History:**

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-01 | Initial comprehensive specification |

**Maintainers:**
- Backend Team (backend-premium)
- Mobile Team (Flutter integration)

**Contact:**
- Slack: #asystent-io-backend
- Email: backend@asystent.io

**Related Documents:**
- [projektv0.1.0.md](../projektv0.1.0.md) — Flutter app specification
- [planllm.md](../planllm.md) — LLM design document
- [README.md](README.md) — Quick start guide
- [OBSERVABILITY_README.md](OBSERVABILITY_README.md) — Logging guide
