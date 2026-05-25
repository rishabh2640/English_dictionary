## Context

To provide users with an English dictionary feature, we need a technical solution that fetches dictionary data efficiently and displays it in a clean, user-friendly interface. We will rely on a free external API to avoid hosting large dictionary databases ourselves.

## Goals / Non-Goals

**Goals:**
- Provide fast, real-time dictionary search capabilities.
- Display comprehensive word data including definitions, parts of speech, synonyms, and phonetics.
- Gracefully handle errors and "word not found" scenarios.

**Non-Goals:**
- Offline support (no local database caching).
- User authentication or tracking "saved" words (can be added in future iterations).

## Decisions

- **Dictionary API Provider:** We will use the [Free Dictionary API](https://dictionaryapi.dev/).
  - *Rationale:* It is free, requires no API key, and provides rich structured JSON responses containing everything we need (phonetics, meanings, synonyms).
  - *Alternatives considered:* Merriam-Webster API (requires an API key and has usage limits).

- **Search Implementation & Prefetching:**
  - *Rationale:* Implement an autocomplete dropdown that provides as-you-type suggestions. We will aggressively prefetch the top predicted word's definition before the user even presses "Enter". This provides a perceived zero-latency experience without needing an offline database.
  - *Caching Strategy:* We will cache API responses in memory or `localStorage` to avoid duplicate requests for the same word.
  - *Rate Limiting Prevention:* We will use a debounce function (e.g., 200-300ms) on the typing input so we don't bombard the API on every single keystroke.

## Risks / Trade-offs

- **Risk:** Rate limiting or downtime from the Free Dictionary API.
  - *Mitigation:* Implement robust error handling to show a friendly error message if the API is unreachable.
- **Risk:** Variations in API response structure (e.g., some words might lack phonetics).
  - *Mitigation:* Use optional chaining and fallback UI states (e.g., hiding the phonetics section if none is provided).
