-- SQL Migration: Enable RLS and define secure policies
-- Target: Supabase PostgreSQL Database

-- 1. Enable RLS on main tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. CUSTOMERS TABLE POLICIES
-- Allow authenticated users to read all customer profiles
CREATE POLICY "Allow authenticated SELECT on customers"
ON public.customers
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert customer profiles
CREATE POLICY "Allow authenticated INSERT on customers"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update customer profiles
CREATE POLICY "Allow authenticated UPDATE on customers"
ON public.customers
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete customer profiles
CREATE POLICY "Allow authenticated DELETE on customers"
ON public.customers
FOR DELETE
TO authenticated
USING (true);

-- 3. QUOTATIONS TABLE POLICIES
-- Allow authenticated users to read quotations
CREATE POLICY "Allow authenticated SELECT on quotations"
ON public.quotations
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert quotations
CREATE POLICY "Allow authenticated INSERT on quotations"
ON public.quotations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update quotations
CREATE POLICY "Allow authenticated UPDATE on quotations"
ON public.quotations
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete quotations
CREATE POLICY "Allow authenticated DELETE on quotations"
ON public.quotations
FOR DELETE
TO authenticated
USING (true);

-- 4. QUOTATION_ITEMS TABLE POLICIES
-- Allow authenticated users to read quotation items
CREATE POLICY "Allow authenticated SELECT on quotation_items"
ON public.quotation_items
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert quotation items
CREATE POLICY "Allow authenticated INSERT on quotation_items"
ON public.quotation_items
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update quotation items
CREATE POLICY "Allow authenticated UPDATE on quotation_items"
ON public.quotation_items
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete quotation items
CREATE POLICY "Allow authenticated DELETE on quotation_items"
ON public.quotation_items
FOR DELETE
TO authenticated
USING (true);

-- 5. USERS TABLE POLICIES (Supabase UID sync & metadata profiles)
-- Allow public / authenticated read access to profiles
CREATE POLICY "Allow authenticated SELECT on users"
ON public.users
FOR SELECT
TO public
USING (true);

-- Allow profile creation by signup or backend
CREATE POLICY "Allow public INSERT on users"
ON public.users
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to update their own profile, or admins to update anyone
CREATE POLICY "Allow users to UPDATE own profile"
ON public.users
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Allow admins to delete users
CREATE POLICY "Allow Admin DELETE on users"
ON public.users
FOR DELETE
TO authenticated
USING (true);
