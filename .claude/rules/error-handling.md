---
paths:
  - "src/shared/api/**"
  - "src/features/*/api/**"
---

# Error Handling

- Use typed error classes with codes, not generic `Error("something went wrong")`.
- Never swallow errors silently. Log or rethrow with context about what operation failed.
- Handle every rejected promise. No floating (unhandled) async calls.
- Axios errors: extract `error.response.data` for API errors; handle network errors separately.
- Retry transient errors (network timeouts) with exponential backoff in axios interceptors. Fail fast on 401/403/422.
- Surface errors to UI via TanStack Query `error` state, not console.log.
