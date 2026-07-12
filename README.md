# EcoSphere ESG Management Platform

EcoSphere is an organization-level ESG management platform built for the Odoo Hackathon 2026.

It supports:

- Organization registration and employee onboarding
- Organization join codes
- Admin approval of employee accounts
- Role-based and department-based dashboard access
- Nine department dashboards
- Carbon activity logging
- Rule-based CO₂e calculation
- Organization-wide carbon analytics
- 1-day, 7-day, 28-day, and 1-year emission views

---

## 1. Technology Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- Prisma ORM 7
- MySQL / MariaDB
- Better Auth
- Recharts

---

## 2. Prerequisites

Install these before starting:

- Node.js 20 or newer
- npm
- Git
- MySQL or MariaDB
- XAMPP is acceptable for local MySQL/MariaDB
- phpMyAdmin is optional but recommended

Verify installation:

```powershell
node --version
npm --version
git --version
```

---

## 3. Clone the Repository

```powershell
git clone https://github.com/rawat-is-here/odoo-cannonbolt-round-I.git
cd odoo-cannonbolt-round-I
```

Install dependencies:

```powershell
npm install
```

---

## 4. Create the Local Database

Start MySQL or MariaDB.

When using XAMPP:

1. Open XAMPP Control Panel.
2. Start **MySQL**.
3. Open phpMyAdmin.
4. Create a database named:

```text
odoo_hackathon_base
```

SQL alternative:

```sql
CREATE DATABASE odoo_hackathon_base;
```

A dedicated database user is recommended:

```sql
CREATE USER 'odoo_app'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';

GRANT ALL PRIVILEGES
ON odoo_hackathon_base.*
TO 'odoo_app'@'localhost';

FLUSH PRIVILEGES;
```

Do not use the example password in a real environment.

---

## 5. Configure Environment Variables

Create a local `.env` file in the project root.

PowerShell:

```powershell
Copy-Item .env.example .env
```

When `.env.example` is not present, create `.env` manually.

Example:

```env
DATABASE_URL="mysql://odoo_app:YOUR_PASSWORD@localhost:3306/odoo_hackathon_base"

DB_HOST="localhost"
DB_PORT="3306"
DB_USER="odoo_app"
DB_PASSWORD="YOUR_PASSWORD"
DB_NAME="odoo_hackathon_base"

BETTER_AUTH_SECRET="replace-this-with-a-long-random-secret"
BETTER_AUTH_URL="http://localhost:3000"
```

Important:

- Never commit `.env`.
- Every teammate needs their own `.env`.
- `localhost` refers to the current computer.
- A teammate cannot access another teammate's local MySQL server through `localhost`.
- For a shared remote database, privately share the hosted connection details and never commit them.

Generate a random Better Auth secret:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Place the generated value in:

```env
BETTER_AUTH_SECRET="generated-value"
```

---

## 6. Verify Prisma Configuration

The project uses:

```text
prisma/schema.prisma
prisma.config.ts
src/lib/prisma.ts
```

The environment variable names in `.env` must match the names read by `prisma.config.ts` and `src/lib/prisma.ts`.

Typical runtime variables are:

```env
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```

Prisma CLI usually uses:

```env
DATABASE_URL
```

---

## 7. Apply the Database Schema

Run these commands from the project root:

```powershell
npx prisma format
npx prisma validate
npx prisma db push
npx prisma generate
```

Expected results:

```text
The schema is valid
Your database is now in sync with your Prisma schema
Generated Prisma Client
```

This project uses `prisma db push` for hackathon development.

Do not use `prisma migrate dev` unless the database user has permission to create a shadow database.

---

## 8. Seed Emission Factors

The carbon calculation system requires emission-factor data.

Run:

```powershell
npx tsx .\prisma\seed-transport-factors.ts
npx tsx .\prisma\seed-department-factors.ts
```

Expected output:

```text
Transport emission factors seeded successfully.
Seeded department emission factors.
```

Verify in phpMyAdmin:

```sql
SELECT
  departmentCode,
  COUNT(*) AS factorCount
FROM emission_factor
WHERE status = 'ACTIVE'
GROUP BY departmentCode
ORDER BY departmentCode;
```

Expected department codes:

```text
ADMIN
COMP
ESG
FIN
HR
MFG
PUR
TRN
WH
```

Verify Transport factors:

```sql
SELECT
  activityCode,
  factorValue,
  departmentCode,
  status
FROM emission_factor
WHERE departmentCode = 'TRN';
```

---

## 9. Run the Development Server

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

Important routes:

```text
/
/login
/register/organization
/register/employee
/onboarding/organization
/onboarding/join
/pending-approval
/dashboard
/dashboard/admin
/dashboard/employees
```

Department routes:

```text
/dashboard/administration
/dashboard/hr
/dashboard/finance
/dashboard/purchase
/dashboard/manufacturing
/dashboard/transport
/dashboard/warehouse
/dashboard/compliance
/dashboard/sustainability
```

---

## 10. Run a Production Build

Before submission or deployment:

```powershell
npm run build
```

A successful build should complete:

```text
Compiled successfully
Finished TypeScript
Generating static pages
Finalizing page optimization
```

To run the production build locally:

```powershell
npm start
```

---

## 11. Organization Workflow

### Create an organization

1. Open:

```text
http://localhost:3000/register/organization
```

2. Create the administrator account.
3. Complete organization onboarding.
4. The system creates common departments.
5. The organization receives a unique join code.
6. The administrator becomes:

```text
role = ORG_ADMIN
status = ACTIVE
```

### Join as an employee

1. Open:

```text
http://localhost:3000/register/employee
```

2. Create an employee account.
3. Enter the organization's join code.
4. The backend validates the code in the database.
5. The employee becomes:

```text
role = EMPLOYEE
status = PENDING
departmentId = null
```

6. The employee is redirected to:

```text
/pending-approval
```

### Approve an employee

1. Sign in as the organization administrator.
2. Open:

```text
/dashboard/employees
```

3. Select the employee.
4. Assign:
   - Department
   - Role
   - Designation
   - Employee code
5. Set status to:

```text
ACTIVE
```

6. Save.

After refresh or the next sign-in, the employee is redirected to the correct department dashboard.

---

## 12. Role-Based Access Control

Supported roles:

```text
ORG_ADMIN
DEPARTMENT_MANAGER
EMPLOYEE
```

### ORG_ADMIN

Can:

- View organization-wide analytics
- Approve employees
- Assign departments and roles
- Access every department dashboard
- View carbon emissions across the organization

### DEPARTMENT_MANAGER

Can:

- Access only the assigned department
- View department-level records
- View records submitted by department employees

### EMPLOYEE

Can:

- Access only the assigned department
- Submit permitted carbon activities
- View their own records

Server-side authorization checks:

- Session exists
- User is `ACTIVE`
- User belongs to an organization
- User has an assigned department
- Requested department matches the user's department
- Queries are scoped by `organizationId`
- Department queries are scoped by `departmentId`

---

## 13. Carbon Activity Workflow

### Transport example

A Transport employee can submit:

- Truck registration or identifier
- Truck type
- Load transported in kg
- Distance in km
- Number of trips
- Origin
- Destination
- Activity date
- Notes

The backend calculates:

```text
loadTonnes = loadKg ÷ 1000
tonneKilometres = loadTonnes × distanceKm × tripCount
co2eAmount = tonneKilometres × emissionFactor
```

Example:

```text
Load: 5000 kg
Distance: 200 km
Trips: 2
Heavy diesel factor: 0.08 kgCO₂e/tonne-km
```

Calculation:

```text
Load tonnes = 5000 ÷ 1000 = 5
Tonne-km = 5 × 200 × 2 = 2000
CO₂e = 2000 × 0.08 = 160 kgCO₂e
```

The browser does not provide the final CO₂e value.

The server:

1. Validates the employee and department.
2. Fetches the active emission factor.
3. Calculates CO₂e.
4. Stores the raw input.
5. Stores the factor snapshot.
6. Stores the calculated result.

---

## 14. Admin Carbon Analytics

The organization administrator can view:

- Total emissions
- Carbon record count
- Average emissions per record
- Scope 1 emissions
- Scope 2 emissions
- Scope 3 emissions
- Department breakdown
- Timeline graph

Supported graph ranges:

```text
1 Day
7 Days
28 Days
1 Year
```

All admin analytics queries are filtered using the logged-in administrator's:

```text
organizationId
```

Records from another organization are not included.

---

## 15. Database Tables

Important tables:

```text
user
session
account
verification
organization
department
emission_factor
carbon_record
```

Verify Carbon records:

```sql
SELECT
  activityName,
  activityAmount,
  activityUnit,
  factorValue,
  co2eAmount,
  co2eUnit,
  status,
  occurredAt
FROM carbon_record
ORDER BY createdAt DESC
LIMIT 20;
```

---

## 16. Common Setup Problems

### `404` on a page

Clear the Next.js cache:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

Check the production route list:

```powershell
npm run build
```

### Access denied for MySQL

Example:

```text
Access denied for user 'username'@'localhost'
```

Check:

```env
DB_USER
DB_PASSWORD
DATABASE_URL
```

Make sure MySQL is running and the database user has privileges.

### Seed script uses the wrong MySQL user

Add this at the top of the seed file:

```ts
import "dotenv/config";
```

Then run:

```powershell
npx tsx .\prisma\seed-transport-factors.ts
```

### No active emission factor

Run:

```powershell
npx tsx .\prisma\seed-transport-factors.ts
npx tsx .\prisma\seed-department-factors.ts
```

Verify:

```sql
SELECT *
FROM emission_factor
WHERE status = 'ACTIVE';
```

### Prisma Studio error on older MariaDB

Older MariaDB versions may not support functions used internally by Prisma Studio.

Use phpMyAdmin instead.

`prisma db push`, Prisma Client, and the application may still work normally.

### Port 3000 is already in use

Run on another port:

```powershell
npm run dev -- -p 3001
```

Then update:

```env
BETTER_AUTH_URL="http://localhost:3001"
```

---

## 17. Full Setup Command Summary

```powershell
git clone https://github.com/rawat-is-here/odoo-cannonbolt-round-I.git
cd odoo-cannonbolt-round-I

npm install

Copy-Item .env.example .env

npx prisma format
npx prisma validate
npx prisma db push
npx prisma generate

npx tsx .\prisma\seed-transport-factors.ts
npx tsx .\prisma\seed-department-factors.ts

npm run build
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 18. Security Notes

- Never commit `.env`.
- Never expose database passwords in screenshots or messages.
- Never trust CO₂e values received from the browser.
- Calculate emissions on the server.
- Validate every activity amount and date.
- Filter every query by `organizationId`.
- Filter department data by `departmentId`.
- Check `status`, `role`, and department on every protected page and API.
- Do not rely only on hidden links or frontend redirects for authorization.

---

## 19. Hackathon Disclaimer

The seeded emission factors are hackathon demonstration values.

For production or regulatory reporting:

- Replace demo factors with verified official factors.
- Store factor source, year, region, and version.
- Add evidence uploads and approval workflows.
- Add factor validity dates.
- Add audit logs.
- Add recalculation and reporting controls.

---

## 20. Repository

```text
https://github.com/rawat-is-here/odoo-cannonbolt-round-I
```
