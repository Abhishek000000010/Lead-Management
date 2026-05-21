
# Prowider Mini Lead Distribution System

A full-stack lead generation and distribution system built for the Prowider Full Stack Developer Assignment.

This project simulates a simplified lead distribution platform where customers submit service enquiries, leads are stored in a database, and each lead is automatically assigned to providers based on mandatory rules, fair allocation, and provider quota limits.

---

## Live Demo

https://lead-management-lemon.vercel.app/

---

## GitHub Repository

https://github.com/Abhishek000000010/Lead-Management

---

## Project Name

Lead-Management

---

## Tech Stack

- Next.js
- TypeScript
- MongoDB Atlas
- Mongoose
- Tailwind CSS
- Vercel

---

## Routes

| Route | Description |
|---|---|
| `/` | Home page with navigation |
| `/request-service` | Customer service enquiry form |
| `/dashboard` | Provider dashboard |
| `/test-tools` | Testing panel for webhook and concurrency |

---

## Features

### Customer Service Request

Customers can submit a service enquiry with:

- Name
- Phone number
- City
- Service type
- Description

After submission:

- The lead is saved in MongoDB.
- Provider assignment is triggered automatically.
- The dashboard updates automatically.

---

## Duplicate Lead Rule

The same phone number cannot create another lead for the same service.

Allowed:

```txt
9999999999 -> Service 1
9999999999 -> Service 2
````

Not allowed:

```txt
9999999999 -> Service 1 again
```

This rule is enforced at the database level using a compound unique index:

```txt
phone + serviceId
```

---

## Provider Assignment Rules

Each lead must be assigned to exactly 3 unique providers.

### Mandatory Assignment Rules

| Service   | Mandatory Provider        |
| --------- | ------------------------- |
| Service 1 | Provider 1                |
| Service 2 | Provider 5                |
| Service 3 | Provider 1 and Provider 4 |

### Fair Allocation Pools

| Service   | Provider Pool              |
| --------- | -------------------------- |
| Service 1 | Providers 2, 3, 4          |
| Service 2 | Providers 6, 7, 8          |
| Service 3 | Providers 2, 3, 5, 6, 7, 8 |

---

## Fair Allocation Algorithm

After mandatory providers are selected, remaining provider slots are filled using a round-robin allocation system.

The round-robin pointer is stored in the database using the `AllocationState` collection.

This ensures that:

* Allocation is fair over time.
* Provider selection is not random.
* Allocation state persists after server restart.
* The same provider is not repeatedly favored.

Basic flow:

```txt
1. Validate serviceId
2. Create lead inside MongoDB transaction
3. Add mandatory providers if quota is available
4. Read round-robin pointer from AllocationState
5. Fill remaining slots from the fair provider pool
6. Skip providers already selected
7. Skip providers whose quota is full
8. Assign exactly 3 providers
9. Save lead assignments
10. Update provider usedQuota
11. Update AllocationState pointer
```

---

## Provider Quota

Each provider has a monthly quota of 10 leads.

```txt
monthlyQuota = 10
usedQuota = number of currently counted assigned leads
remainingQuota = monthlyQuota - usedQuota
```

A provider cannot receive more leads when `usedQuota` reaches `monthlyQuota`.

The quota reset webhook resets `usedQuota` to 0.

Old leads and assignments are not deleted during quota reset. They remain visible as historical assigned leads.

---

## Concurrency Handling

Lead creation and provider assignment are handled inside MongoDB transactions.

The system uses:

* MongoDB session transactions
* Atomic provider quota updates
* Conditional quota increment using `usedQuota < monthlyQuota`
* Retry logic for transient MongoDB write conflict errors
* Database-level unique indexes

This helps the system work correctly when multiple leads are created at the same time.

The `/test-tools` page includes a button to generate 10 leads concurrently for testing.

Expected result:

```txt
successCount: 10
failedCount: 0
```

---

## Real-Time Dashboard Updates

The provider dashboard displays:

* Provider name
* Current quota used
* Remaining quota
* Total assigned leads
* Assigned leads list

The dashboard automatically refreshes using polling every 2 seconds.

This allows newly assigned leads to appear without manually refreshing the page.

---

## Webhook Simulation

The project includes a webhook simulation endpoint:

```txt
POST /api/webhook/reset-quota
```

This simulates a payment gateway confirming provider subscription renewal.

When the webhook is processed successfully:

```txt
All provider usedQuota values are reset to 0.
```

---

## Webhook Idempotency

Webhook idempotency is handled using the `WebhookEvent` collection.

Each webhook request contains an `eventKey`.

If the same `eventKey` is received again, the system does not process the reset again.

Example:

```txt
Attempt 1 -> Quota successfully reset
Attempt 2 -> Webhook already processed
Attempt 3 -> Webhook already processed
```

This prevents duplicate effects from repeated webhook calls.

---

## Test Tools

The `/test-tools` page includes three actions:

### 1. Reset Provider Quota

Calls the quota reset webhook with a unique event key.

### 2. Webhook 3x Idempotency Test

Calls the webhook 3 times with the same event key.

Expected result:

```txt
First call resets quota.
Second and third calls return already processed.
```

### 3. Generate 10 Leads

Creates 10 leads concurrently to test:

* Concurrency handling
* Fair allocation
* Quota limits
* Assignment correctness

Each generated lead should be assigned to exactly 3 providers.

---

## Database Models

### Service

```txt
serviceId
name
```

### Provider

```txt
providerId
name
monthlyQuota
usedQuota
```

### Lead

```txt
name
phone
city
serviceId
description
createdAt
```

Unique index:

```txt
phone + serviceId
```

### LeadAssignment

```txt
leadId
providerId
createdAt
```

Unique index:

```txt
leadId + providerId
```

### AllocationState

```txt
serviceId
pointerIndex
```

### WebhookEvent

```txt
eventKey
type
processedAt
```

Unique index:

```txt
eventKey
```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Abhishek000000010/Lead-Management.git
cd Lead-Management
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
```

### 4. Seed the database

```bash
npm run seed
```

This inserts:

* 3 services
* 8 providers
* 3 allocation states

### 5. Run the development server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

## Deployment

The project is deployed using Vercel.

Live URL:

```txt
https://lead-management-lemon.vercel.app/
```

Required environment variable:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
```

After deployment, test these routes:

```txt
/
```

```txt
/request-service
```

```txt
/dashboard
```

```txt
/test-tools
```

---

## Important Notes

* MongoDB Atlas is used as the database.
* Leads are persisted in the database.
* Provider assignments are persisted in the database.
* No in-memory storage is used.
* No JSON file database is used.
* No SQLite is used.
* Provider allocation is not random.
* Quota reset does not delete historical leads.
* Dashboard shows historical leads and current quota separately.

---

## Assignment Checklist

* [x] Next.js frontend
* [x] MongoDB database
* [x] Customer request form
* [x] Duplicate lead prevention
* [x] Mandatory provider assignment
* [x] Fair round-robin allocation
* [x] Provider monthly quota
* [x] Exactly 3 providers per lead
* [x] Real-time dashboard updates
* [x] Webhook quota reset
* [x] Webhook idempotency
* [x] Concurrent lead generation test
* [x] Live deployment


