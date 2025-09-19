# Rate Limiting and Slow Down

```mermaid
flowchart LR
  C[Client] --> RL[express-rate-limit]
  RL --> SD[express-slow-down]
  SD --> API[Routes]
  subgraph slow-down v2 config
    A[delayAfter]
    B[delayMs(used, req) -> (used-delayAfter)*500]
    Cc[maxDelayMs]
  end
```
