# Fintech Service API

A robust financial API built with Django REST Framework, focused on managing users, accounts, and transactions with atomicity and advanced analytics.

## Database Schema

### `User` (Django Built-in)
- `id`: Internal ID
- `email`: User's email (also used as username)
- `created_at`: Join date

### `Account`
- `id`: primary key
- `user_id`: ForeignKey to `User`
- `currency`: USD, EUR, or UZS
- `balance`: current balance (Decimal)
- Indices: `user_id`

### `Transaction`
- `id`: primary key
- `account_id`: ForeignKey to `Account`
- `type`: `deposit`, `withdraw`, `transfer_in`, `transfer_out`
- `amount`: Transaction amount
- `status`: `pending`, `success`, `failed`
- `created_at`: Datetime of transaction
- Indices: `account_id`, `created_at`

## Analytical Queries

The analytics endpoint (`GET /api/users/{id}/analytics`) uses Django's ORM (which translates to SQL) to perform aggregations over a specified date range.

### Performance & Scalability
For 100k+ transactions, the following optimizations are implemented:
1. **Indexing**: `Transaction` table has indices on `account_id` and `created_at` to ensure fast filtering and grouping.
2. **Aggregations**: Instead of fetching all records, we use `SUM`, `AVG`, `MAX`, and `GROUP BY` at the database level.
3. **Atomic Transfers**: We use `select_for_update()` to lock account rows during transfers and withdrawals, preventing race conditions (lost updates) even under high concurrent load.

### Key Logic:
- **Balance conversion**: Total balance is calculated by summing all user accounts, converted to USD using hardcoded exchange rates.
- **Atomicity**: Transfers are wrapped in `transaction.atomic()` blocks with row-level locking on both accounts involved.

## Setup

1. Install dependencies:
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt psycopg2-binary
   ```
2. Configure PostgreSQL in `project/settings.py` (currently set to SQLite for demo simplicity).
3. Run migrations:
   ```bash
   python manage.py migrate
   ```
4. Run tests:
   ```bash
   python manage.py test app.tests
   ```
