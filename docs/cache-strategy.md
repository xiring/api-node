# Cache Strategy

- Layer: Redis via `CacheService`
- Patterns:
  - Cache-aside (`getOrSet`) for expensive reads
  - `set`/`get` with JSON payload, metadata, and TTL
  - Hash helpers (`hset`, `hget`, `hgetall`)
  - Tag invalidation (`invalidateByTags`) for grouped cache
  - Global clear and stats
- Keys: namespaced with `CACHE_PREFIX` (default `ecommerce_api`)
- TTLs: default 3600s unless specified; report refresh tokens use dedicated TTL

```mermaid
flowchart LR
  SRV[Service] -->|getOrSet(key, fetch, ttl)| CS[CacheService]
  CS --> REDIS[(Redis)]
  CS -->|miss| FETCH[Fetch from DB]
  FETCH --> CS
  CS --> SRV

  subgraph Invalidation
    A[Invalidate by keys] --> CS
    B[Invalidate by tags] --> CS
  end
```

## Usage Examples
- Read-through caching for list endpoints
- Warm-up jobs via queue for critical keys
- Tagging entities: e.g., tag `warehouses` to invalidate after mutations

