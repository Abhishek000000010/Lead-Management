# Prowider Mini Lead Distribution System 🚀

A highly-concurrent, backend-focused lead allocation engine built with **Next.js (App Router)** and **MongoDB**. 

This system dynamically distributes incoming service requests (leads) to a network of providers based on strict business rules, fair round-robin pooling, and monthly quotas—all while guaranteeing atomic data integrity under heavy traffic.

---

## 🌟 Key Features

- **Atomic Lead Allocation Engine**: Guarantees exactly 3 unique providers are assigned to every lead, safely rolling back if quotas are exhausted.
- **Concurrency & Transaction Safety**: Uses strict MongoDB Session Transactions and deterministic retry logic (`WriteConflict` catching) to seamlessly handle heavy concurrent writes without data loss.
- **Fair Round-Robin Distribution**: Maintains an persistent `AllocationState` pointer to ensure leads are distributed fairly across the available provider pool.
- **Real-Time Dashboard**: A sleek, auto-polling provider dashboard to monitor quota consumption (`usedQuota` / `monthlyQuota`) and view assigned leads.
- **Idempotent Webhooks**: Secure webhook endpoints for administrative tasks (like quota resets) that safely ignore duplicate events using a `WebhookEvent` registry.
- **Stress-Testing Suite**: Built-in `/test-tools` UI to rapidly fire concurrent requests and validate transaction safety.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, React 19)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas)
- **ORM**: [Mongoose](https://mongoosejs.com/) (using advanced `$expr` queries and transactions)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Typography**: Plus Jakarta Sans & JetBrains Mono

---

## ⚙️ Core Allocation Logic

When a lead is submitted:
1. **Validation**: Checks for valid service IDs and unique constraints (`phone` + `serviceId`).
2. **Transaction Start**: Opens a MongoDB session.
3. **Mandatory Providers**: Attempts to assign to prioritized providers for the requested service (if they have quota).
4. **Round-Robin Pool**: Iterates through the remaining fair-pool providers starting from a saved `pointerIndex`, assigning until exactly 3 providers are found.
5. **Atomic Quota Increment**: Provider quotas are incremented safely. If a provider's `usedQuota >= monthlyQuota`, they are skipped.
6. **Commit or Rollback**: If 3 providers are successfully assigned, the transaction is committed, and the new round-robin pointer is saved. If fewer than 3 providers are available, the transaction is completely aborted.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A running MongoDB Replica Set (required for transactions) or MongoDB Atlas cluster.

### 1. Clone the repository
```bash
git clone https://github.com/Abhishek000000010/Lead-Management.git
cd Lead-Management
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
```

### 4. Seed the Database
Populate the database with initial Services, Providers, and Allocation Pointers:
```bash
npm run seed
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗂 Project Structure

```text
├── scripts/
│   └── seed.ts                     # Database initialization script
├── src/
│   ├── app/
│   │   ├── api/                    # Next.js API Routes (Backend)
│   │   ├── dashboard/              # Real-time Quota Dashboard
│   │   ├── request-service/        # Lead Submission Form
│   │   ├── test-tools/             # Concurrency & Webhook Testing UI
│   │   ├── layout.tsx              # Root Layout & Global Navbar
│   │   └── page.tsx                # Homepage Landing
│   ├── components/
│   │   └── Navbar.tsx              # Client-side Navigation Component
│   ├── lib/
│   │   ├── allocation.ts           # 🧠 Core Transactional Allocation Engine
│   │   └── db.ts                   # Mongoose Connection Utility
│   └── models/
│       ├── AllocationState.ts      # Tracks round-robin pointers
│       ├── Lead.ts                 # Lead schema
│       ├── LeadAssignment.ts       # Lead <-> Provider mapping
│       ├── Provider.ts             # Provider schema (quotas)
│       ├── Service.ts              # Service definitions
│       └── WebhookEvent.ts         # Idempotency lock schema
```

---

## 🧪 Testing

Navigate to the `/test-tools` page to run automated load tests:
1. **Reset Quota**: Fires a webhook with a unique Event Key to reset all `usedQuota` back to 0.
2. **Webhook 3x (Idempotency)**: Fires 3 sequential webhook requests utilizing the exact same Event Key to guarantee that the database safely ignores duplicated administrative commands.
3. **Generate 10 Leads**: Fires 10 lead creation POST requests simultaneously via `Promise.all`. This aggressively tests the `WriteConflict` retry-mechanism and transaction atomicity.

---

*Designed & Developed for seamless lead allocation and uncompromised data integrity.*
