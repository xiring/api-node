# Deployment Topology

```mermaid
flowchart LR
  subgraph Cloud/Infra
    LB[Load Balancer]
    API[API Server(s)]
    REDIS[(Redis)]
    DB[(PostgreSQL)]
    FS[(reports/ storage)]
    SMTP[(SMTP Provider)]
  end

  Clients --- LB
  LB --- API
  API --- DB
  API --- REDIS
  API --- FS
  API --- SMTP
```
