# RevoBank Backend API

Backend API untuk simulasi sistem perbankan menggunakan NestJS + Prisma + PostgreSQL.

API ini melayani 2 jenis pengguna:

- `CUSTOMER`: mengelola akun sendiri, melihat profil, deposit/withdraw/transfer.
- `ADMIN`: akses lebih luas untuk monitoring data user/account/transaction.

## Tech Stack

- NestJS
- Prisma ORM
- PostgreSQL
- JWT (access token + refresh token)
- Swagger OpenAPI
- Jest (unit/e2e)

## API Base URL & Docs

- Base URL local: `http://localhost:9000/api/v1`
- Swagger UI: `http://localhost:9000/docs`

## Standard Response Envelope

Semua response mengikuti format global envelope.

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request successful",
  "data": {},
  "error": null,
  "timestamp": "2026-04-16T10:00:00.000Z",
  "path": "/api/v1/auth/profile",
  "requestId": "uuid"
}
```

## Folder Structure (Important Only)

```text
.
├── prisma
│   ├── migrations
│   ├── schema.prisma
│   └── seed.ts
├── src
│   ├── auth
│   │   ├── decorators
│   │   ├── dto
│   │   ├── guards
│   │   ├── strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.repository.ts
│   ├── common
│   │   ├── envelope
│   │   ├── filters
│   │   └── interceptors
│   ├── modules
│   │   ├── users
│   │   │   ├── dto
│   │   │   ├── users.controller.ts
│   │   │   └── users.service.ts
│   │   ├── user-profile
│   │   │   ├── dto
│   │   │   ├── user-profile.controller.ts
│   │   │   ├── user-profile.service.ts
│   │   │   └── user-profile.repository.ts
│   │   ├── accounts
│   │   │   ├── dto
│   │   │   ├── accounts.controller.ts
│   │   │   ├── accounts.service.ts
│   │   │   └── accounts.repository.ts
│   │   └── transactions
│   │       ├── dto
│   │       ├── transactions.controller.ts
│   │       ├── transactions.service.ts
│   │       └── transactions.repository.ts
│   ├── prisma
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── middleware
│   ├── app.module.ts
│   └── main.ts
├── .env.example
└── package.json
```

## Module Overview, DTO, dan Flow

### 1. Auth Module

File utama:

- `src/auth/auth.controller.ts`
- `src/auth/auth.service.ts`
- `src/auth/auth.repository.ts`

DTO:

- `RegisterDto`: register user baru.
- `LoginDto`: login user.

Flow:

1. Register cek email unik -> hash password -> simpan user -> generate access/refresh token.
2. Login validasi email/password -> generate access/refresh token.
3. Refresh token pakai guard `jwt-refresh` -> issue access token baru.
4. Logout menghapus `hashedRefreshToken` agar refresh token lama invalid.

### 2. User Profile Module

File utama:

- `src/modules/user-profile/user-profile.controller.ts`
- `src/modules/user-profile/user-profile.service.ts`
- `src/modules/user-profile/user-profile.repository.ts`

DTO:

- `UpdateUserProfileDto`: update field profile non-sensitif (`name`, `phoneNumber`, `dateOfBirth`).

Flow:

1. Ambil `userId` dari JWT.
2. GET profile mengambil data `users` + `user_profiles`.
3. PATCH profile update `users.name` dan `user_profiles` (upsert).

### 3. Users Module

File utama:

- `src/modules/users/users.controller.ts`
- `src/modules/users/users.service.ts`

DTO:

- `CreateUserDto`: create user oleh admin.
- `UpdateUserDto`: update user (partial).

Flow:

1. Endpoint manajemen user khusus role `ADMIN`.
2. Operasi yang tersedia: create, list, detail by ID, update, delete.
3. Password selalu di-hash saat create/update.
4. Response user tidak menampilkan field sensitif seperti `password` dan `hashedRefreshToken`.
5. Endpoint `/users` saat ini juga terkena middleware API key.

### 4. Accounts Module

File utama:

- `src/modules/accounts/accounts.controller.ts`
- `src/modules/accounts/accounts.service.ts`
- `src/modules/accounts/accounts.repository.ts`

DTO:

- `CreateAccountDto`: create account (`accountNumber`, optional `balance`).
- `UpdateAccountDto`: update account (partial).

Flow:

1. Customer/admin create account.
2. Customer hanya bisa lihat account miliknya.
3. Admin bisa lihat semua account.
4. `accountNumber` tidak boleh diubah setelah account dibuat.

### 5. Transactions Module

File utama:

- `src/modules/transactions/transactions.controller.ts`
- `src/modules/transactions/transactions.service.ts`
- `src/modules/transactions/transactions.repository.ts`

DTO:

- `DepositDto`: `toAccountId` **atau** `toAccountNumber`, `amount`.
- `WithdrawDto`: `fromAccountId` **atau** `fromAccountNumber`, `amount`.
- `TransferDto`: `fromAccountId` **atau** `fromAccountNumber`, serta `toAccountId` **atau** `toAccountNumber`, `amount`.
- `CreateTransactionDto` dan `UpdateTransactionDto`: disediakan untuk struktur generic.

Flow:

1. Deposit: validasi account tujuan -> tambah balance -> simpan transaction type `DEPOSIT`.
2. Withdraw: validasi ownership + saldo cukup -> kurangi balance -> simpan `WITHDRAW`.
3. Transfer: validasi account sumber/tujuan, account berbeda, saldo cukup -> atomic debit/credit -> simpan `TRANSFER`.
4. Admin bisa lihat semua transaksi, customer hanya transaksi yang terkait account miliknya.
5. Untuk endpoint transaksi, kirim **tepat satu** identifier per sisi account: `accountId` atau `accountNumber`.

## DTO Summary

- `auth/dto/register.dto.ts`
- `auth/dto/login.dto.ts`
- `modules/user-profile/dto/update-user-profile.dto.ts`
- `modules/users/dto/create-user.dto.ts`
- `modules/users/dto/update-user.dto.ts`
- `modules/accounts/dto/create-account.dto.ts`
- `modules/accounts/dto/update-account.dto.ts`
- `modules/transactions/dto/deposit.dto.ts`
- `modules/transactions/dto/withdraw.dto.ts`
- `modules/transactions/dto/transfer.dto.ts`
- `modules/transactions/dto/create-transaction.dto.ts`
- `modules/transactions/dto/update-transaction.dto.ts`

## Postman Request Samples (All Endpoints)

Gunakan:

- Header private endpoint: `Authorization: Bearer <access_token>`
- Khusus `/users*`: tambahkan `x-api-key: <INTERNAL_API_KEY>`

### Auth

#### Register

`POST /api/v1/auth/register`

```json
{
  "email": "customer1@revobank.com",
  "name": "Customer One",
  "password": "StrongPass123!"
}
```

#### Login

`POST /api/v1/auth/login`

```json
{
  "email": "customer1@revobank.com",
  "password": "StrongPass123!"
}
```

#### Get Auth Profile

`GET /api/v1/auth/profile`

#### Refresh Token

`POST /api/v1/auth/refresh`
Header:
`Authorization: Bearer <refresh_token>`

#### Logout

`POST /api/v1/auth/logout`

### User Profile

#### Get Own Profile

`GET /api/v1/user/profile`

#### Update Own Profile

`PATCH /api/v1/user/profile`

```json
{
  "name": "Customer One Updated",
  "phoneNumber": "081234567890",
  "dateOfBirth": "1998-12-30"
}
```

### Users (Admin)

#### Create User

`POST /api/v1/users`
Headers:

- `x-api-key: <INTERNAL_API_KEY>`
- `Authorization: Bearer <access_token_admin>`

```json
{
  "email": "user2@revobank.com",
  "name": "User Two",
  "password": "StrongPass123!",
  "role": "CUSTOMER"
}
```

#### List Users

`GET /api/v1/users`
Headers:

- `x-api-key: <INTERNAL_API_KEY>`
- `Authorization: Bearer <access_token_admin>`

#### Get User By ID

`GET /api/v1/users/1`
Headers:

- `x-api-key: <INTERNAL_API_KEY>`
- `Authorization: Bearer <access_token_admin>`

#### Update User

`PATCH /api/v1/users/1`
Headers:

- `x-api-key: <INTERNAL_API_KEY>`
- `Authorization: Bearer <access_token_admin>`

```json
{
  "name": "Updated User Name"
}
```

#### Delete User

`DELETE /api/v1/users/1`
Headers:

- `x-api-key: <INTERNAL_API_KEY>`
- `Authorization: Bearer <access_token_admin>`

### Accounts

#### Create Account

`POST /api/v1/accounts`

```json
{
  "accountNumber": "123456789012",
  "balance": 500000
}
```

#### List Accounts

`GET /api/v1/accounts`

#### Get Account By ID

`GET /api/v1/accounts/1`

#### Update Account (Admin)

`PATCH /api/v1/accounts/1`

```json
{
  "balance": 750000
}
```

#### Delete Account (Admin)

`DELETE /api/v1/accounts/1`

### Transactions

#### Deposit

`POST /api/v1/transactions/deposit`

```json
{
  "toAccountId": 1,
  "amount": 200000
}
```

Atau by account number:

```json
{
  "toAccountNumber": "123456789012",
  "amount": 200000
}
```

#### Withdraw

`POST /api/v1/transactions/withdraw`

```json
{
  "fromAccountId": 1,
  "amount": 50000
}
```

Atau by account number:

```json
{
  "fromAccountNumber": "123456789012",
  "amount": 50000
}
```

#### Transfer

`POST /api/v1/transactions/transfer`

```json
{
  "fromAccountId": 1,
  "toAccountId": 2,
  "amount": 100000
}
```

Atau by account number:

```json
{
  "fromAccountNumber": "123456789012",
  "toAccountNumber": "987654321098",
  "amount": 100000
}
```

#### List Transactions

`GET /api/v1/transactions`

#### Get Transaction By ID

`GET /api/v1/transactions/1`

## Local Setup & Build Flow

### 1) Install Dependencies

```bash
pnpm install
```

### 2) Setup Environment

Copy file contoh:

```bash
cp .env.example .env
```

Lalu isi minimal:

- `DATABASE_URL`
- `PORT`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET` (disarankan ditambah)
- `JWT_EXPIRATION`
- `INTERNAL_API_KEY`

### 3) Generate Prisma Client

```bash
pnpm prisma:generate
```

### 4) Run Migration

```bash
pnpm prisma migrate dev
```

### 5) Seed Initial Data (Admin + Customer)

```bash
pnpm prisma:seed
```

### 6) Run App (Development)

```bash
pnpm run start:dev
```

### 7) Build Project

```bash
pnpm run build
```

### 8) Run Production Build

```bash
pnpm run start:prod
```

### 9) Run Tests

```bash
pnpm run test
pnpm run test:e2e
pnpm run test:cov
```

## Deployment Notes (Railway/Render/Fly.io)

- Build command: `pnpm run build`
- Start command: `pnpm run start:prod`
- Pastikan environment variables terisi lengkap.
- Jalankan migration saat deploy release:

```bash
pnpm prisma migrate deploy
```
