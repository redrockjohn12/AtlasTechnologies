# Atlas Technologies — Supabase setup

The browser app uses Supabase Auth + the Supabase Data API. The browser key must be the **publishable key** (or legacy `anon` key) and the database must use Row Level Security. Never place a service-role/secret key in `crm/config.js`.

## 1. Create or open the Supabase project

In the Supabase Dashboard, open **Connect** or **Settings → API Keys** and copy the project URL and the publishable key. Supabase documents publishable/anon keys as client-safe only when RLS is configured correctly; secret/service-role keys must stay on a backend. See https://supabase.com/docs/guides/database/secure-data

## 2. Run the database schema

Open the Supabase SQL Editor and run the complete `supabase/schema.sql` file.

## 3. Create the CRM user

In Supabase Dashboard → Authentication → Users, create the owner account with the email and password you want to use for Atlas CRM.

The login page intentionally has no public sign-up button because the CRM is an internal business system.

## 4. Configure the website URL

For this GitHub Pages project, use:

https://redrockjohn12.github.io/AtlasTechnologies/

Add the CRM login URL to the Auth redirect URLs as well:

https://redrockjohn12.github.io/AtlasTechnologies/crm/login.html

## 5. Test the flow

1. Open the public website.
2. Submit a test project enquiry.
3. Confirm the row appears in Supabase `leads`.
4. Open `/crm/` and sign in.
5. Confirm Leads, Customers and Projects load.
6. Convert a test lead into a customer.
7. Create a test project and confirm the dashboard totals update.

## Security

The public site can insert leads but cannot read CRM data. Authenticated users can operate the CRM tables. This is intentionally suitable for a private single-business CRM foundation. For multiple employees/companies later, move to organization-scoped RLS rather than leaving `using (true)` policies in place.
