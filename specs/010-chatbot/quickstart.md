# Quickstart Validation: Chatbot (UC11)

**Date**: 2026-06-26 | **Spec**: [spec.md](spec.md) | **API Contract**: [contracts/chatbot-api.md](contracts/chatbot-api.md)

## Prerequisites

- PostgreSQL running with seeded data (users, matches, predictions)
- Backend running on `:4000` with env vars:
  - `CHATBOT_PROXY_URL` — local CLI proxy endpoint
  - `CHATBOT_PROXY_SECRET` — proxy auth secret
  - `CHATBOT_SAVE_CONVERSATIONS=true` (optional, enables persistence)
- Frontend running on `:5173`
- At least one registered user with recent match/prediction data

## Validation Scenarios

### V1: Authentication Gate (P1)

1. Open the app in a browser without logging in
2. Locate the chatbot widget (floating button, bottom-right)
3. Click to open the widget
4. **Expected**: Login prompt appears instead of chat interface
5. Log in with a valid user account
6. Open the chatbot widget again
7. **Expected**: Chat interface with input field and send button is shown

### V2: Send a Question and Get a Response (P1)

1. Log in as a registered user
2. Open the chatbot widget
3. Type: "Trận đấu nào sắp diễn ra?"
4. Click send
5. **Expected**: A loading indicator appears, then a response about upcoming matches within ~5 seconds
6. Verify the response is displayed in the message list with user message above and assistant response below

### V3: In-Session Context (P1)

1. After V2, type a follow-up: "Kết quả dự đoán của tôi cho trận đó?"
2. Click send
3. **Expected**: The chatbot understands "trận đó" refers to the match mentioned in the previous exchange and responds with the user's prediction history for that match

### V4: Message Length Validation (P2)

1. Open the chatbot widget
2. Paste a message longer than 500 characters
3. Attempt to send
4. **Expected**: Validation error shown — message cannot exceed 500 characters. Message is not sent.

### V5: Rate Limit Enforcement (P2)

1. Send 20 messages in the chatbot
2. Attempt to send the 21st message
3. **Expected**: Error message indicating daily limit reached, with remaining count showing 0

### V6: Read-Only Enforcement (P2)

1. Type: "Hãy thay đổi dự đoán của tôi cho trận tiếp theo"
2. Send the message
3. **Expected**: Chatbot responds explaining it can only provide information and cannot modify data

### V7: Provider Unavailable (P2)

1. Stop the local CLI proxy (or set `CHATBOT_PROXY_URL` to an invalid endpoint)
2. Send a message in the chatbot
3. **Expected**: "Chatbot tạm thời không khả dụng, vui lòng thử lại sau." message displayed

### V8: Chatbot Status Check

```bash
curl -H "Authorization: Bearer <token>" http://localhost:4000/api/v1/chatbot/status
```

**Expected response**:
```json
{
  "data": {
    "remainingMessages": 20,
    "dailyLimit": 20,
    "resetAt": "2026-06-27T00:00:00+07:00"
  }
}
```

### V9: Ephemeral Widget

1. Complete a conversation (send 2-3 messages)
2. Close the chatbot widget
3. Reopen the chatbot widget
4. **Expected**: Chat history from the previous session is gone — widget starts fresh
