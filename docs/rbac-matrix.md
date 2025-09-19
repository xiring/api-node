# RBAC Matrix

Roles: ADMIN, MANAGER, USER (Vendor/User)

Scope rules:
- ADMIN: full organization scope
- MANAGER: scoped to assigned org subset (warehouses/vendors as applicable)
- USER: vendor-level scope; data access limited to own vendor where applicable

## Endpoints and Permissions

| Area | Endpoint | Action | ADMIN | MANAGER | USER |
|------|----------|--------|-------|---------|------|
| Auth | POST /api/auth/register | Register | ✅ | ✅ | ✅ |
| Auth | POST /api/auth/login | Login | ✅ | ✅ | ✅ |
| Auth | GET /api/auth/profile | Read self | ✅ | ✅ | ✅ |
| Warehouses | GET /api/warehouses | List | ✅ | ✅ | ❌ |
| Warehouses | GET /api/warehouses/:id | Read | ✅ | ✅ | ❌ |
| Warehouses | POST /api/warehouses | Create | ✅ | ✅ | ❌ |
| Warehouses | PUT /api/warehouses/:id | Update | ✅ | ✅ | ❌ |
| Warehouses | DELETE /api/warehouses/:id | Delete | ✅ | ❌ | ❌ |
| Vendors | GET /api/vendors | List | ✅ | ✅ | ❌ |
| Vendors | GET /api/vendors/:id | Read | ✅ | ✅ | ❌ |
| Vendors | POST /api/vendors | Create | ✅ | ✅ | ❌ |
| Vendors | PUT /api/vendors/:id | Update | ✅ | ✅ | ❌ |
| Vendors | DELETE /api/vendors/:id | Delete | ✅ | ❌ | ❌ |
| Fares | GET /api/fares | List | ✅ | ✅ | ✅ |
| Fares | POST /api/fares | Create | ✅ | ✅ | ❌ |
| Fares | PUT /api/fares/:id | Update | ✅ | ✅ | ❌ |
| Fares | DELETE /api/fares/:id | Delete | ✅ | ❌ | ❌ |
| Orders | GET /api/orders | List | ✅ | ✅ | ✅ (scoped) |
| Orders | GET /api/orders/:id | Read | ✅ | ✅ | ✅ (scoped) |
| Orders | POST /api/orders | Create | ✅ | ✅ | ✅ (scoped) |
| Orders | PUT /api/orders/:id | Update | ✅ | ✅ | ✅ (scoped to own) |
| Orders | DELETE /api/orders/:id | Delete | ✅ | ✅ | ❌ |
| Shipments | GET /api/shipments | List | ✅ | ✅ | ✅ (scoped) |
| Shipments | GET /api/shipments/:id | Read | ✅ | ✅ | ✅ (scoped) |
| Shipments | POST /api/shipments | Create | ✅ | ✅ | ❌ |
| Shipments | PUT /api/shipments/:id | Update | ✅ | ✅ | ❌ |
| Shipments | DELETE /api/shipments/:id | Delete | ✅ | ❌ | ❌ |
| Security | GET /api/security/* | Read | ✅ | ❌ | ❌ |
| Security | POST /api/security/cleanup | Maintain | ✅ | ❌ | ❌ |
| Reports | POST /api/reports/export | Export | ✅ | ✅ | ❌ |
| Reports | GET /api/reports/:jobId/* | Read | ✅ | ✅ | ❌ |
| Dashboard | GET /api/dashboard/summary | Read | ✅ | ✅ | ✅ (scoped) |
| Dashboard | GET /api/dashboard/trends | Read | ✅ | ✅ | ✅ (scoped) |

Notes:
- “Scoped” for USER means filtered by `vendorId`.
- Manager scoping depends on business rules (e.g., allowed warehouses/vendors).
- Security endpoints are admin-only.
