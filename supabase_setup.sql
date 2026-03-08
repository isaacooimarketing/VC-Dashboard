-- Supabase SQL script to create the sales_data table
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

CREATE TABLE IF NOT EXISTS sales_data (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    product TEXT NOT NULL,
    channel TEXT NOT NULL,
    orders INTEGER NOT NULL,
    revenue NUMERIC(15, 2) NOT NULL,
    cost NUMERIC(15, 2) NOT NULL,
    visitors INTEGER NOT NULL,
    customers INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_sales_data_date ON sales_data(date);

-- Comment: Once you've created this table, you can enable RLS or keep it public for testing.
