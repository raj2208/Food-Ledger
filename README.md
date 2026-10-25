This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

This project uses [pnpm](https://pnpm.io) only. Data lives in PostgreSQL, accessed through [Prisma](https://www.prisma.io).

Prerequisites: Node.js 24 (LTS) and a running PostgreSQL (17 or newer).

On macOS with Homebrew:

```bash
brew install postgresql@17
brew services start postgresql@17
createdb foodledger
```

Then:

```bash
pnpm install              # also generates the Prisma client
cp .env.example .env      # then set your username in DATABASE_URL
pnpm db:migrate           # apply migrations
pnpm dev
```

### Database scripts

| Script             | What it does                                          |
| ------------------ | ----------------------------------------------------- |
| `pnpm db:migrate`  | Create/apply migrations after editing `schema.prisma` |
| `pnpm db:deploy`   | Apply existing migrations only (production/CI)        |
| `pnpm db:generate` | Regenerate the Prisma client                          |
| `pnpm db:studio`   | Browse the data at http://localhost:5555              |
| `pnpm db:reset`    | Drop everything and re-apply migrations (destroys data) |

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
