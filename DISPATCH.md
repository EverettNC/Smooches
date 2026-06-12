# Smooches DISPATCH.md

This document defines the dispatch and integration contract for upward returns from the Smooches Express backend (port 8030) to the central source ingest service.

## Upward return

After you do your core work (detect, extract, verify, post, gift, etc.), POST the result to http://127.0.0.1:8000/source/ingest (use the sample payload shape below).

The upward POST must:
- Be performed **after** all local core work completes successfully (DB creates for video/radio/live records, subscription/earnings writes, etc.).
- Include a `trace_id` (unique per dispatch, prefixed e.g. `smooches-...`).
- Include a `from` field matching the component name: "smooches".
- Use the exact sample payload shape from the Integration section.
- The caller must treat the ingest response as the completion signal. Only once the POST to /source/ingest succeeds (2xx), the flow is considered complete and the client response may be sent.

On failure of the upward call (network error, non-2xx), the local flow should fail (do not complete the client request with success).

## Integration

**Endpoint (always):** `POST http://127.0.0.1:8000/source/ingest`

**HTTP requirements:** application/json body. Expect 2xx on success.

**Sample payload shape (exact structure to use):**

```json
{
  "trace_id": "smooches-1720000000000-abc123xy",
  "from": "smooches",
  "type": "video" | "radio" | "live" | "ambassador",
  "source": {
    "sourceUrl": "/uploads/videos/xxx.mp4",
    "title": "Example 3-5min Clip",
    "userId": 42,
    "duration": 240,
    "meta": {
      "radio": false,
      "gifting": true,
      "amazonPrime": false,
      "podcast": true
    }
  },
  "result": {
    "success": true,
    "record": { "id": 123, "title": "...", "videoUrl": "...", ... },
    "earnings": { ... },
    "subscription": { ... }
  },
  "metadata": {
    "action": "video|live|ambassador",
    "creatorCutPercent": 85,
    "timestamp": "2026-06-12T12:34:56.789Z",
    "platform": "Smooches"
  },
  "status": "processed"
}
```

**Core work sequence (to perform before upward):**
1. detect (content type: video / radio / live / ambassador)
2. extract (title, url, duration, user context, flags like amazonPrime/podcast/gifting)
3. verify (e.g. 3-5min range for video if duration supplied; auth/role checks; required fields)
4. post (create DB records via storage: video, radioStation, live marker, subscription, earnings)
5. gift (enable gifting path, record earnings with 85% creator share, ambassador bonuses)
6. (etc as applicable per endpoint)

Then build the dispatch payload using the shape above (populating source + result + metadata), generate trace_id + set from: "smooches", and POST.

The forward must succeed for the endpoint handler to return 2xx to its caller.

## Notes
- This applies to POST /smooches/video, POST /smooches/live, POST /smooches/ambassador.
- GET /smooches/identity does not dispatch upward.
- All creator economics remain 85/15 (no exploitation).
- trace_id must be unique per request/flow.
- from is always "smooches" to match the component.
