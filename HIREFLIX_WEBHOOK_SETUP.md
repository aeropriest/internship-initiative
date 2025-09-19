# Hireflix Webhook Setup Guide

## 🔗 Public Webhook URL
```
https://3c6d5e35f4d9.ngrok-free.app/api/webhooks/hireflix
```

## 📋 Webhook Configuration for Hireflix

### Required Events
- `interview.status-change` - **Primary event for completion detection**
- `interview.finish` - **Legacy support for completion**

### Optional Events (for monitoring)
- `interview.started` - When candidate starts the interview
- `interview.recording` - When candidate is recording
- `interview.uploaded` - When video is uploaded

## 🎯 What the Webhook Does

### 1. **Comprehensive Logging**
- Logs ALL incoming events with full payload analysis
- Tracks interview progress in real-time
- Provides detailed debugging information

### 2. **Interview Completion Processing**
When `interview.status-change` with `status: "completed"` is received:
- ✅ Updates Manatal candidate with interview results
- ✅ Sends branded completion email via Resend
- ✅ Stores video URLs and interview metadata

### 3. **Manatal Integration**
Updates candidate custom fields with:
```json
{
  "hireflix_interview_id": "interview_id",
  "hireflix_interview_status": "completed",
  "hireflix_video_url": "public_video_url",
  "hireflix_share_url": "short_share_url",
  "interview_completed_at": "timestamp",
  "application_stage": "video_interview_complete",
  "ready_for_review": true,
  "webhook_processed_at": "timestamp"
}
```

### 4. **Branded Email**
- Sends completion email with social sharing buttons
- Encourages candidates to share their achievement
- Uses Global Internship Initiative branding

## 🧪 Testing

### Health Check
```bash
curl https://3c6d5e35f4d9.ngrok-free.app/api/webhooks/hireflix
```

### Test Completion Event
```bash
curl -X POST https://3c6d5e35f4d9.ngrok-free.app/api/webhooks/hireflix \
  -H "Content-Type: application/json" \
  -d '{
    "event": "interview.status-change",
    "data": {
      "id": "test_interview_123",
      "externalId": "YOUR_CANDIDATE_ID",
      "status": "completed",
      "completed": 1234567890000,
      "candidate": {
        "name": "Test Candidate",
        "email": "test@example.com"
      },
      "position": {
        "name": "Test Position"
      },
      "url": {
        "public": "https://example.com/video"
      }
    }
  }'
```

## 📊 Monitoring

### Console Logs
The webhook provides extensive logging:
- 📡 Request details (headers, body, etc.)
- 🔍 Complete payload analysis
- 📝 Event processing steps
- ✅ Success/error status for each operation

### Log Format
```
================================================================================
🔔 HIREFLIX WEBHOOK RECEIVED AT 2025-09-19T02:25:58.433Z
================================================================================
📡 Request Details:
   Method: POST
   URL: https://3c6d5e35f4d9.ngrok-free.app/api/webhooks/hireflix
   Headers: {...}

📥 Reading request body...
📄 Raw body length: 456 characters
📄 Raw body preview: {"event":"interview.status-change"...

🔍 COMPLETE PAYLOAD ANALYSIS:
📋 Full Payload: {...}
📊 Payload Keys: ["event", "data", "date"]
📋 Event Type: interview.status-change

🎬 INTERVIEW OBJECT FOUND:
   Interview ID: test_interview_123
   Status: completed
   Video URL: https://app.hireflix.com/test-video-url
   ...

🔄 PROCESSING INTERVIEW COMPLETION
==================================================
👤 Candidate: Test Candidate (test@example.com)
🎬 Interview ID: test_interview_123
🆔 Candidate ID: 124014816
📹 Video URL: https://app.hireflix.com/test-video-url

📝 UPDATING MANATAL WITH INTERVIEW RESULTS
📤 Manatal update data: {...}
📊 Manatal API response: 200 OK
✅ Manatal candidate updated successfully via webhook

📧 SENDING BRANDED COMPLETION EMAIL
📤 Sending email via Resend...
   To: test@example.com
   From: Global Internship Initiative <onboarding@resend.dev>
📥 Resend API response status: 200
✅ Branded completion email sent successfully via webhook

✅ Interview completion processing finished
🔚 Webhook processing completed at 2025-09-19T02:25:58.688Z
================================================================================
```

## 🔧 Setup in Hireflix

1. **Login to Hireflix Dashboard**
2. **Go to Webhooks/Integrations Section**
3. **Add New Webhook**
   - URL: `https://3c6d5e35f4d9.ngrok-free.app/api/webhooks/hireflix`
   - Method: `POST`
   - Events: `interview.status-change`, `interview.finish`
4. **Test the webhook** using the test payload above
5. **Monitor logs** in your application console

## 🚨 Important Notes

- **ngrok URL**: This URL is temporary and changes when ngrok restarts
- **Production**: Replace with your permanent domain when deploying
- **Security**: Consider adding webhook signature verification for production
- **Rate Limits**: The webhook handles all events gracefully
- **Error Handling**: Webhook always returns 200 OK to prevent retries

## 🎯 Final Webhook URL for Hireflix

**Copy this URL and add it to your Hireflix webhook configuration:**

```
https://3c6d5e35f4d9.ngrok-free.app/api/webhooks/hireflix
```
