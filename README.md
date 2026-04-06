# 🔥 CORSe API  
### Documentation v1.0

---

## 1. Overview

**CORSe** is a pentesting API built to serve controlled test payload files for **Remote File Inclusion (RFI)**, **Out-of-Band** testing, logging captured requests and more.

Payloads are organised by technology:

- PHP  
- ASP  
- JSP  
- Python  
- Perl  
- ColdFusion  
- Shell  

The API serves files over clean RESTful paths — **no query parameters**.

Every request is logged with full metadata, including:

- Client IP address  
- Full headers  
- Request timing  
- Subdomain detection  
- Fragment detection  

The architecture is modular and designed for future expansion with additional attack modules.

---

## 2. Setup

### Prerequisites

- Node.js >= 18

### Installation

```bash
npm install
```

### Development (Auto-Reload with Nodemon)

```bash
npm run dev
```

### Production

```bash
npm start
```

### Environment Variables (`.env`)

| Variable   | Description | Default |
|------------|------------|----------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| LOG_LEVEL | Winston log level | debug |
| DOMAIN | Domain used for subdomain detection in logs | localhost |

---

## 3. Endpoints

---

### 3.1 Health Check

**Endpoint**

```
GET /
```

Returns a JSON message confirming the API is running.

**Request**

```bash
curl http://localhost:3000/
```

**Response**

```json
{
  "message": "Let's hack the planet!"
}
```

---

### 3.2 Serve RFI Test Payload

**Endpoint**

```
GET /rfi/:technology/:filename
```

Serves a test payload file from:

```
files/<technology>/
```

Everything is specified in the path. No query parameters are used.

#### Path Parameters

| Parameter | Description |
|-----------|------------|
| `:technology` | php, asp, jsp, python, perl, coldfusion, shell |
| `:filename` | File name matching allowed extension |

#### Supported Extensions

| Technology | Extensions |
|------------|------------|
| php | .php |
| asp | .asp, .aspx |
| jsp | .jsp |
| python | .py |
| perl | .pl, .cgi |
| coldfusion | .cfm |
| shell | .sh |

**Example**

```bash
curl http://localhost:3000/rfi/php/info.php
```

**Response**

- `200 OK` – File content streamed with correct `Content-Type`

**Error Responses**

| Status | Meaning |
|--------|--------|
| 400 | Invalid technology / filename / extension |
| 404 | File not found |

---

### 3.3 Live Log Stream (Server-Sent Events)

**Endpoint**

```
GET /logs/stream
```

Provides a real-time stream of all server logs using **Server-Sent Events (SSE)**.

Any log entry written to disk is also pushed to connected clients.

**Request**

```bash
curl -N http://localhost:3000/logs/stream
```

**Response**

Continuous stream format:

```
data: {json_log}
```

---

## 4. File Payloads

Payload files are stored under:

```
files/
├── php/
├── asp/
├── jsp/
├── python/
├── perl/
├── coldfusion/
└── shell/
```

### Adding a New Payload

1. Place the file in the correct technology directory.  
2. Ensure the extension matches the allowed extensions.  
3. Access it via:

```
GET /rfi/<technology>/<filename>
```

### Adding a New Technology

1. Add the technology and its extensions to `TECH_MAP` in:
   ```
   utils/file_registry.js
   ```
2. Add a content-type mapping in:
   ```
   controllers/rfi.controller.js
   ```
3. Create the directory under `files/`.  
4. Add payload files.

---

## 5. Logging

All requests are logged automatically with full metadata.

### Log Files (under `logs/`)

| File | Description |
|------|------------|
| combined.log | All log entries (rotated at 5MB, 5 files kept) |
| error.log | Error-level entries only (rotated at 5MB, 3 files kept) |

### Each Log Entry Includes

- Timestamp  
- HTTP method and full URL  
- Client IP address  
- Host, Origin, Referer, User-Agent headers  
- Subdomain detection (if domain configured)  
- Fragment detection (from Referer header)  
- Request body preview (capped at 1 KB)  
- Response status code  
- Latency in milliseconds  

### Configuring Log Level

Set in `.env`:

```env
LOG_LEVEL=error
```

Supported values:

```
error, warn, info, http, verbose, debug, silly
```

### Using the Logger in New Modules

```js
import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("my_module");

log.info("Something happened", { key: "value" });
```

---

## 6. Security

CORSe  includes:

- Helmet for secure HTTP headers  
- Strict path parameter validation against:
  - Path traversal  
  - LFI / RFI attempts  
  - Null byte injection  
  - Hidden files  
  - Extension mismatches  
- Path sandboxing to ensure resolved paths stay within `files/`  
- IP-based rate limiting middleware (`ip_rate_limit`)  
- CORS support  
- Global error handler that returns safe responses and logs stack traces  

---

## 7. Project Structure

```
CORSe/
├── server.js
├── package.json
├── .env
│
├── controllers/
│   ├── normal.controller.js
│   ├── rfi.controller.js
│   └── logs.controller.js
│
├── routes/
│   ├── normal.route.js
│   ├── rfi.route.js
│   └── logs.route.js
│
├── middleware/
│   ├── ip_rate_limit.js
│   ├── request_logger.js
│   ├── validate_path.js
│   └── error_handler.js
│
├── utils/
│   ├── env.js
│   ├── logger.js
│   └── file_registry.js
│
├── files/
│   ├── php/
│   ├── asp/
│   ├── jsp/
│   ├── python/
│   ├── perl/
│   ├── coldfusion/
│   └── shell/
│
└── logs/
```

---

## Author

**0xd0**
