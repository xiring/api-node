# Cache Taxonomy

## Key Prefixes
- Global prefix: `${CACHE_PREFIX}:` (default `ecommerce_api:`)
- Entities:
  - `warehouses:list:<params>`
  - `warehouses:detail:<id>`
  - `vendors:list:<params>`
  - `vendors:detail:<id>`
  - `fares:list:<params>`
  - `orders:list:<params>`
  - `orders:detail:<id>`
  - `shipments:list:<params>`
  - `shipments:detail:<id>`
- Tags set: `tags:<tagName>` contains member keys for invalidation

## TTLs
- Default: 3600s
- Lists: 600–1800s
- Details: 1800–3600s
- Reports: generated files not cached in Redis; stored in `reports/`
- Refresh tokens: TTL from `REFRESH_TOKEN_TTL_SECONDS`

## Tag Map (examples)
- warehouses → tag `warehouses`
- vendors → tag `vendors`
- fares → tag `fares`
- orders → tag `orders`
- shipments → tag `shipments`

## Invalidation Triggers
- Create/Update/Delete of entity → invalidate corresponding detail key and list keys
- Use `invalidateByTags(["warehouses"])` post-mutation to clear related lists
- Cache warming: optionally enqueue jobs to warm critical keys

## Conventions
- Serialize value as JSON with `{ data, timestamp, ttl }`
- Use stable param serialization for list keys (sorted query params)
