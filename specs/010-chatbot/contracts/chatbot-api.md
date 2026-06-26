# API Contract: Chatbot (UC11)

**Base path**: `/api/v1/chatbot`

**Authentication**: All endpoints require `authenticate` middleware (Bearer token).

---

## POST /api/v1/chatbot/messages

Send a message to the chatbot and receive a response.

**Headers**:
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

**Request Body**:

```json
{
  "message": "string (1-500 chars, required)",
  "conversationHistory": [
    {
      "role": "user" | "assistant",
      "content": "string"
    }
  ]
}
```

| Field                | Type     | Required | Constraints            | Description                                    |
|----------------------|----------|----------|------------------------|------------------------------------------------|
| message              | string   | yes      | 1-500 chars, non-empty | The user's question                            |
| conversationHistory  | array    | no       | max 20 entries         | Previous messages in the current session        |
| conversationHistory[].role | string | yes  | "user" or "assistant"  | Who sent the message                           |
| conversationHistory[].content | string | yes | non-empty           | Message content                                |

**Success Response** `200 OK`:

```json
{
  "data": {
    "response": "string",
    "conversationId": "uuid (if persistence enabled)",
    "remainingMessages": 18
  }
}
```

| Field              | Type    | Description                                      |
|--------------------|---------|--------------------------------------------------|
| response           | string  | The chatbot's answer                             |
| conversationId     | string? | UUID of saved conversation (null if not persisted)|
| remainingMessages  | number  | Messages remaining today (out of 20)             |

**Error Responses**:

| Status | Code                  | Condition                              |
|--------|-----------------------|----------------------------------------|
| 401    | UNAUTHORIZED          | Missing or invalid auth token          |
| 400    | VALIDATION_ERROR      | Message empty or exceeds 500 chars     |
| 400    | READ_ONLY_VIOLATION   | Message detected as data modification request |
| 429    | RATE_LIMIT_EXCEEDED   | 20 daily messages exhausted            |
| 503    | PROVIDER_UNAVAILABLE  | AI provider timeout or unreachable     |

**Error Response Body**:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Bạn đã hết lượt hỏi chatbot hôm nay (20/20). Vui lòng thử lại vào ngày mai."
  }
}
```

---

## GET /api/v1/chatbot/status

Check the user's current chatbot usage status (remaining messages today).

**Headers**:
- `Authorization: Bearer <token>` (required)

**Success Response** `200 OK`:

```json
{
  "data": {
    "remainingMessages": 15,
    "dailyLimit": 20,
    "resetAt": "2026-06-27T00:00:00+07:00"
  }
}
```

| Field              | Type    | Description                                         |
|--------------------|---------|-----------------------------------------------------|
| remainingMessages  | number  | Messages remaining today                            |
| dailyLimit         | number  | Total daily limit (20)                              |
| resetAt            | string  | ISO 8601 datetime of next reset (midnight Asia/HCM) |
