# Report Export (Async Pipeline)

```mermaid
flowchart LR
  C[Client] -->|POST /reports/export| API[Express Route]
  API --> V[Validate Payload]
  V --> Q[QueueService addJob(report-export)]
  Q --> RQ[(Redis / Bull queue)]
  subgraph Worker
    J[report-export Job] --> RS[ReportService]
    RS --> DB[(Postgres/Prisma)]
    RS --> FS[(reports/ CSV file)]
    J --> RQ
  end
  RQ -->|completed| API2[GET /reports/:jobId/status]
  API2 --> C
  C -->|GET /reports/:jobId/download| DL[Download]
  DL --> FS
```
