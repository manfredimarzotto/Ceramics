-- Enable Row Level Security on all tables to satisfy Supabase security requirements.
-- The application connects via the postgres superuser (through Prisma) which bypasses
-- RLS by default, so existing functionality is unaffected.

ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
