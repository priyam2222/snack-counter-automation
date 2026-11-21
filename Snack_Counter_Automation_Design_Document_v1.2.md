SNACK COUNTER AUTOMATION

Software Architecture, Solution Design
& Future Roadmap

Version 1.2  |  Updated MVP design  |  21 November 2026

## 1. Executive Summary

Snack Counter Automation is an internal web application designed to coordinate snack-counter replenishment across office locations. Employees can report low stock, volunteers can take responsibility for fulfilling requests, and HR can review submitted purchase and receipt information.

The project combines a Node.js, TypeScript and Express backend, a PostgreSQL database managed through Prisma, and a React + TypeScript web interface built with Vite. The backend exposes REST endpoints for office, volunteer and refill-request operations. The frontend provides a dashboard-oriented interface for viewing operational information and initiating the main request workflows.

The current project is an MVP foundation. The backend, database schema and migrations, seeded office and volunteer records, and React dashboard have been created. The application has been run locally and the source code has been pushed to GitHub. Full production security, genuine user authentication, role-based authorization, secure receipt-file storage, budget enforcement, automated notifications and production deployment remain future work.

This document distinguishes the current implementation from proposed enhancements. The source code and Prisma migrations remain authoritative for exact implementation details.

## 2. Problem Statement

Snack replenishment across multiple offices can become difficult to coordinate when low-stock reports, volunteer assignments, purchases, receipts and reimbursement decisions are handled through informal messages or disconnected records.

The application aims to provide one place to:

Record snack-counter refill requests and their current status.

Associate each request with an office and requester.

Allow eligible volunteers from the same office to claim requests.

Record purchase amounts and receipt references.

Capture HR review outcomes and remarks.

Maintain persistent operational records in PostgreSQL.

## 3. Project Objectives and Scope

### 3.1 MVP objectives

1. Maintain office and volunteer records.

2. Create and retrieve refill requests.

3. Support the request lifecycle from opening through HR review.

4. Apply office and volunteer eligibility rules during request fulfilment.

5. Record purchase and receipt-submission information.

6. Record an HR approval or rejection outcome.

7. Expose core operations through REST APIs.

8. Provide a browser-based React interface for the main operational areas.

### 3.2 Outside the current MVP scope

The following capabilities are not represented as completed features:

Production-grade authentication and identity federation.

Enforced role-based authorization for employees, volunteers, HR and administrators.

Direct reimbursement or payment processing.

Secure receipt file upload, storage and access management.

OCR or automated receipt validation.

Enforced monthly budgets and financial accounting.

Email, SMS or push notifications.

Integration with live inventory systems.

High availability, disaster recovery and production monitoring.

## 4. Users and Roles

| Role | Responsibility | Intended capabilities |

| Employee / Requester | Reports low stock | Create and track refill requests |

| Volunteer | Replenishes stock | View eligible requests, claim requests, submit purchase and receipt details |

| HR Reviewer | Reviews reimbursement evidence | Review purchase information and approve or reject submissions with remarks |

| Administrator | Maintains reference data | Manage office and volunteer records |



Security distinction: These are product roles and workflow responsibilities. They do not mean that production authentication or server-enforced role permissions are currently available. The current UI is an MVP interface and must not be treated as a secure multi-user identity system.

## 5. Current Implementation Overview

### 5.1 Backend

The backend is built with Node.js, TypeScript and Express. It separates route handling, application services and database access. The available API areas cover:

Health check.

Office listing and office lookup.

Volunteer listing, volunteer lookup and office-specific volunteer listing.

Refill-request listing, lookup and office-specific listing.

Refill-request creation.

Request claiming.

Purchase-detail submission.

Receipt-reference submission.

HR review.

### 5.2 Database

PostgreSQL is used for persistent storage, with Prisma providing schema management, migrations and database access. The project has an initial schema and applied migrations. Seed data has been added for two offices and four volunteers:

Oslo (OSL)

Bengaluru (BLR)

The Prisma schema and migrations define the exact field types, nullability, enum values and relationships.

### 5.3 Frontend

The frontend is a React + TypeScript single-page application created with Vite. It includes navigation areas for:

Dashboard

Requests

Volunteers

Offices

HR Review

The dashboard is intended to provide an overview of requests and operational data. The interface uses the backend through the Vite development proxy.

Verification note: The frontend has been created and displayed locally. A successful page render alone does not prove that every API-backed workflow has been tested end to end. The final acceptance checks in Section 16 should be completed before describing the full workflow as verified.

## 6. System Architecture


## System architecture and end-to-end workflow

```mermaid
flowchart LR
    U["People / Roles<br/>Employee • Volunteer • HR"]
    FE["Web dashboard<br/>React + TypeScript + Vite"]
    API["REST API<br/>Node.js + Express"]
    SVC["Application services<br/>Validation • workflow rules • error handling"]
    ORM["Prisma ORM<br/>Schema + database access"]
    DB[("PostgreSQL<br/>Office • Volunteer • RefillRequest")]

    U -->|"uses"| FE
    FE -->|"HTTP / JSON"| API
    API -->|"invokes"| SVC
    SVC --> ORM
    ORM --> DB

    subgraph FLOW["Refill request lifecycle"]
      direction LR
      A["1. Report<br/>Employee creates request"]
      B["2. Claim<br/>Volunteer claims open request"]
      C["3. Purchase<br/>Volunteer buys items"]
      D["4. Receipt<br/>Receipt details submitted"]
      E["5. HR review<br/>Approve or reject"]
      A --> B --> C --> D --> E
    end

    SVC -. "validates and persists each transition" .-> FLOW
```

**Persisted status progression:** `OPEN` → `CLAIMED` → `PURCHASED` → `RECEIPT_SUBMITTED` → `COMPLETED` or `CANCELLED`.

Each step calls the backend API; service-layer rules are checked and Prisma persists the updated request. In the current MVP, secure receipt file upload, authentication, and role-based authorization remain future production-hardening work.


Figure 1. System layers and the refill-request workflow from employee report through HR review.

### 6.1 Presentation layer

React and TypeScript provide the browser interface. Vite supports local development and frontend builds. The UI displays data and submits user actions to the backend API. Business rules, database access and secrets remain on the server.

### 6.2 API layer

Express exposes JSON endpoints, receives requests from the frontend, invokes application services and returns responses.

### 6.3 Service layer

Application services contain business operations and workflow checks. Keeping these rules outside route handlers makes the backend easier to maintain and test.

### 6.4 Persistence layer

PostgreSQL stores office, volunteer and refill-request records. Prisma manages the schema and provides database access.

## 7. Technology Stack

| Layer | Technology | Purpose |

| Runtime | Node.js | Server runtime |

| Language | TypeScript | Backend and frontend application code |

| API framework | Express | REST API |

| Database | PostgreSQL | Relational data persistence |

| ORM | Prisma | Data access, schema and migrations |

| Frontend | React | Browser user interface |

| Frontend language | TypeScript | Typed UI code |

| Build tooling | Vite | Frontend development and build |

| Styling | Tailwind CSS and project CSS | UI styling |

| Icons | Lucide React | Interface icons |

| Validation dependency | Zod | Input validation support |

| Test dependencies | Vitest and Supertest | Automated testing support |



The presence of a dependency does not by itself mean that comprehensive validation or automated test coverage has been completed.

## 8. Core Data Model

The application is centred on three main entities.

### 8.1 Office

Represents an office location.

Typical attributes include:

id: unique office identifier.

name: office name.

country: office country.

currency: currency code.

monthlyBudget: configured monthly snack budget, where represented in the schema.

An office is associated with multiple volunteers and refill requests.

### 8.2 Volunteer

Represents a volunteer associated with an office.

Typical attributes include:

id: unique volunteer identifier.

name: volunteer name.

email: email address.

officeId: office relationship.

isActive: eligibility flag.

A volunteer belongs to an office and may report or claim requests subject to workflow rules.

### 8.3 RefillRequest

Represents a request to replenish a snack counter.

Typical attributes include:

id: unique request identifier.

officeId: associated office.

reportedBy: requester reference.

description: replenishment details.

status: operational workflow state.

claimedBy: assigned volunteer, when claimed.

claimedAt: claim timestamp.

createdAt: creation timestamp.

purchasedAt: purchase timestamp, where recorded.

purchaseAmount: submitted purchase amount.

receiptReference: receipt identifier or reference.

hrStatus: HR decision state, where configured.

hrRemarks: reviewer comments, where recorded.

Implementation note: These descriptions are conceptual. The checked-in Prisma schema and migrations are the source of truth for the exact model.

## 9. Refill Request Lifecycle

The intended request lifecycle is:

OPEN
  |
  | Volunteer claims request
  v
CLAIMED
  |
  | Assigned volunteer submits purchase details
  v
PURCHASED
  |
  | Assigned volunteer submits receipt details
  v
RECEIPT_SUBMITTED
  |                         |
  | HR approves             | HR rejects
  v                         v
COMPLETED                 CANCELLED

| Current state | Action | Next state | Intended rule |

| OPEN | Claim | CLAIMED | Active volunteer from the same office |

| CLAIMED | Submit purchase | PURCHASED | Assigned volunteer |

| PURCHASED | Submit receipt | RECEIPT_SUBMITTED | Assigned volunteer |

| RECEIPT_SUBMITTED | Approve | COMPLETED | Authorized HR reviewer |

| RECEIPT_SUBMITTED | Reject | CANCELLED | Authorized HR reviewer |



Invalid state transitions should be rejected by the backend.

Known design limitation: In the current workflow, HR rejection maps to CANCELLED. A future version should separate operational fulfilment status from reimbursement status. A rejected reimbursement does not necessarily mean that the snack replenishment itself should be cancelled.

## 10. REST API Overview

The backend exposes the following route areas. Confirm exact route registration and request payloads in src/app.ts before using this table as a formal external API contract.

| Method | Endpoint | Purpose |

| GET | /health | Health check |

| GET | /offices | List offices |

| GET | /offices/:id | Retrieve an office |

| GET | /volunteers | List volunteers |

| GET | /volunteers/:id | Retrieve a volunteer |

| GET | /volunteers/office/:officeId | List volunteers by office |

| GET | /refill-requests | List requests |

| GET | /refill-requests/:id | Retrieve a request |

| GET | /refill-requests/office/:officeId | List requests by office |

| POST | /refill-requests | Create a request |

| POST | /refill-requests/:id/claim | Claim a request |

| POST | /refill-requests/:id/purchase | Submit purchase details |

| POST | /refill-requests/:id/receipt | Submit receipt details |

| POST | /refill-requests/:id/hr-review | Record an HR decision |



A future API revision may introduce a version prefix such as /api/v1.

### 10.1 Illustrative request payloads

Create a request:

{
  "officeId": "BLR",
  "reportedBy": "VOL001",
  "description": "Snack counter is running low on snacks"
}

Claim a request:

{
  "volunteerId": "VOL002"
}

Submit purchase details:

{
  "volunteerId": "VOL002",
  "amount": 1250,
  "receiptReference": "RECEIPT-2026-001"
}

Submit an HR decision:

{
  "approved": true,
  "remarks": "Receipt reviewed and approved"
}

These examples are illustrative. Actual field names and validation rules must match the implemented route handlers and service code.

## 11. Frontend Structure

The current single-page application is organized around the following areas.

### Dashboard

Summary of request activity.

Office and volunteer information.

Recent requests and status information, where returned by the API.

### Requests

View refill requests.

Create a new request.

Access request actions exposed by the interface.

### Volunteers

View volunteer records and their office associations.

### Offices

View office records and volunteer counts.

### HR Review

Present requests for review.

Provide approve/reject actions and remarks where supported by the interface.

The interface is an operational MVP. A future version should provide dedicated, authenticated experiences for each role rather than relying on demo defaults or client-side selections.

## 12. Validation and Business Rules

The backend should enforce the following rules:

Required identifiers and descriptions must be present.

Referenced office and volunteer records must exist.

Requester and volunteer office associations must be valid.

Inactive volunteers must not be allowed to claim requests.

A request can only be claimed while it is open and unclaimed.

Purchase amounts must be valid positive monetary values.

Only the assigned volunteer may submit purchase and receipt details.

HR review must occur only after receipt submission.

Clients must not be allowed to set arbitrary workflow states.

Frontend validation improves usability but does not replace server-side validation.

## 13. Error Handling

The API should use predictable HTTP status codes and safe error messages.

| Status | Meaning |

| 200 | Successful read or update |

| 201 | Resource created |

| 400 | Invalid request or state transition |

| 401 | Authentication required |

| 403 | User lacks permission |

| 404 | Resource not found |

| 409 | Conflict, such as an already-claimed request |

| 500 | Unexpected server error |



A consistent error response should include a stable error code and a safe message. Stack traces, credentials and database internals should not be exposed to clients.

## 14. Security and Privacy

Before production use, the application should:

1. Implement authentication.

2. Enforce role-based authorization on the server.

3. Derive the acting user's identity from a trusted session or token instead of trusting a browser-supplied volunteerId.

4. Validate and normalize all input.

5. Keep credentials in environment variables or a managed secret store.

6. Ensure .env files and credentials are excluded from source control.

7. Use HTTPS in deployed environments.

8. Add rate limiting, request-size limits and secure HTTP headers.

9. Record an audit trail for claims, purchases, receipt submissions and HR decisions.

Protect uploaded receipt files and their access URLs.

Current status: Local environment configuration and an example environment file are part of the project setup. Full authentication, authorization, audit logging, secure receipt-file handling and production hardening are not established as complete.

## 15. Reliability and Concurrency

Two volunteers may attempt to claim the same request at nearly the same time. The backend should use a conditional database update or transaction that only succeeds while the request remains OPEN and unclaimed. A competing request should receive a conflict response.

Additional reliability practices include:

Use database foreign keys and constraints.

Use transactions for multi-step state changes.

Store timestamps consistently in UTC.

Log unexpected failures with request identifiers.

Test simultaneous claims and invalid state transitions.

Define and test claim-expiry behaviour.

If claim expiry is checked only when another volunteer attempts to claim a request, that is lazy expiry—not a background scheduler. A future implementation should make the chosen behaviour explicit.

## 16. Testing and Acceptance Criteria

The project includes testing dependencies, but the existence of those dependencies is not evidence that all tests have been written or passed.

Recommended test coverage:

| Test level | Coverage |

| Unit | Service validation and state transitions |

| API integration | Payloads, status codes and database behaviour |

| Database | Relations, constraints and migrations |

| Concurrency | Competing claims |

| Frontend | Forms, loading/error states and view behaviour |

| End-to-end | Create → claim → purchase → receipt → HR review |



### MVP acceptance checklist

[ ] Offices can be retrieved from the API and displayed in the UI.

[ ] Volunteers can be retrieved from the API and displayed in the UI.

[ ] A valid refill request can be created and persisted.

[ ] A volunteer from another office cannot claim a request.

[ ] An inactive volunteer cannot claim a request.

[ ] Only one volunteer can claim an open request.

[ ] Only the assigned volunteer can submit purchase and receipt details.

[ ] HR review is blocked before receipt submission.

[ ] An approved request reaches COMPLETED.

[ ] A rejected request reaches the configured rejection outcome.

[ ] Invalid identifiers and invalid transitions return safe errors.

[ ] The frontend can complete the intended workflow through the backend API.

## 17. Deployment and Configuration

### 17.1 Local development

Backend, from the project root:

npm install
npx prisma generate
npx prisma migrate dev
npm run dev

Frontend, from the frontend directory:

npm install
npm run dev

The current local development setup uses the backend on port 3000 and the Vite frontend on its development port (typically 5173). The frontend development proxy forwards API requests to the backend.

### 17.2 Environment configuration

Example placeholders:

DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
PORT=3000

Never put real database credentials in documentation or commit a real .env file.

### 17.3 Proposed production topology

A practical initial deployment could use:

A static hosting service for the React production build.

An application hosting service for the Node.js API.

A managed PostgreSQL database.

Environment-specific frontend API configuration.

A controlled Prisma migration process during releases.

HTTPS and managed secrets.

The hosting provider and final deployment design remain decisions for a future release.

## 18. Operations and Monitoring

Recommended production capabilities include:

Structured application logs.

Health and readiness checks.

Error tracking.

Database connection and query monitoring.

Latency and error-rate metrics.

Audit history for important business actions.

PostgreSQL backup and restore procedures.

Documented deployment and rollback steps.

These are recommendations, not claims that the capabilities are already configured.

## 19. Risks and Mitigations

| Risk | Potential impact | Recommended mitigation |

| Missing authentication | Unauthorized access or actions | Add authentication and server-side authorization before production |

| Duplicate claims | Conflicting assignments | Use atomic conditional updates and concurrency tests |

| Invalid workflow changes | Incorrect request state | Centralize and test transition rules |

| Receipt reference without file evidence | Weak purchase verification | Add secure receipt upload and access controls |

| Budget not enforced | Overspending | Add transaction-safe budget checks and reporting |

| HR rejection mapped to cancellation | Ambiguous operational and financial outcome | Separate fulfilment and reimbursement statuses |

| API/UI contract drift | Broken frontend workflows | Maintain API schemas and integration tests |

| Missing operational monitoring | Slow detection of failures | Add logs, metrics, alerts and recovery procedures |



## 20. Future Development Roadmap

The following roadmap is a proposed sequence. It is not a statement that these enhancements have already been implemented.

### Phase 1 — Security and access control

Add login and logout.

Define employee, volunteer, HR reviewer and administrator permissions.

Enforce permissions in backend middleware and service operations.

Derive user identity from authenticated sessions or tokens.

Protect administrative and HR actions.

Expected outcome: Users can access only the operations permitted by their role.

### Phase 2 — Receipt management and reimbursement workflow

Support secure receipt image/PDF uploads.

Store files in protected object storage.

Validate file type and size.

Separate request fulfilment status from reimbursement status.

Preserve HR decisions and reviewer remarks.

Expected outcome: Purchase evidence and reimbursement decisions are more reliable and traceable.

### Phase 3 — Budget management and reporting

Enforce office-level monthly budgets.

Track committed and completed spend.

Provide monthly expenditure summaries.

Add configurable budget thresholds and warnings.

Expected outcome: Offices gain visibility and control over snack expenditure.

### Phase 4 — Notifications and automation

Notify relevant volunteers when requests are opened.

Notify requesters when request status changes.

Remind volunteers about outstanding claims.

Implement an explicit scheduled claim-expiry process if required.

Expected outcome: Less manual follow-up and faster request fulfilment.

### Phase 5 — Auditability, quality and observability

Record who performed each important action and when.

Expand unit, integration, concurrency and end-to-end tests.

Add structured logs, error monitoring and operational alerts.

Document database backup and restore procedures.

Expected outcome: Improved accountability, maintainability and operational confidence.

### Phase 6 — Production deployment and ongoing improvement

Select hosting providers and production environments.

Configure managed database, secrets and HTTPS.

Automate build, test and deployment workflows.

Add release and rollback procedures.

Monitor usage and gather feedback from office users.

Expected outcome: A maintainable application that can be operated beyond local development.

## 21. Assumptions and Open Decisions

The current design assumes:

Each volunteer belongs to one office.

Each refill request belongs to one office.

The current model represents the requester using a volunteer reference.

Volunteers claim requests only for their own office.

HR review follows receipt submission.

The following decisions remain open for future design:

Identity provider and authentication approach.

Final role and permission model.

Receipt storage provider and retention policy.

Budget enforcement and approval policy.

Whether rejected reimbursement should leave fulfilment completed.

Claim-expiry duration and scheduling mechanism.

Hosting provider, deployment topology and operational ownership.

## 22. Conclusion

Snack Counter Automation establishes an MVP foundation for coordinating snack replenishment across office locations. It combines a TypeScript and Express backend, PostgreSQL persistence through Prisma, and a React-based dashboard. The system's core domain is organized around offices, volunteers and refill requests, with a defined workflow for claiming requests, recording purchases, submitting receipt details and capturing HR review outcomes.

The current implementation provides a base for demonstration and further development. Before production use, the application should gain authenticated access, server-enforced role permissions, secure receipt handling, stronger financial controls, auditability, comprehensive automated testing and a managed deployment process.

The roadmap in this document provides a practical path from the current MVP toward a more secure, reliable and maintainable application.

Document maintenance: Update this document whenever the database schema, API contract, workflow, security model or deployment architecture changes. The checked-in source code and Prisma migrations take precedence over this design document when describing exact implementation behaviour.
