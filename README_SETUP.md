## Production direction

This version is prepared for a cleaner backend architecture:

- Replace SQLite with PostgreSQL/MySQL later by changing Prisma datasource
- Replace embedded image strings with object storage URLs later
- Keep the same admin and public data shape during that migration

### Recommended next production steps

- Add server-side image upload limits
- Add admin role expansion and password reset
- Add audit logging for admin changes
- Add public SEO pages per tour
- Add booking requests table and form
