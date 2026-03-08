import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase client instance (can be null if not configured)
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
}

/**
 * Data Layer for fetching sales data from CSV (current) or Supabase (future/configured)
 */
export const getSalesData = async () => {
    // Check if the source is explicitly set to SUPABASE or if we should default to CSV
    const source = process.env.DATA_SOURCE || 'CSV';
    if (source.toUpperCase() === 'SUPABASE' && supabase) {
        console.log('Fetching data from Supabase...');
        const { data, error } = await supabase
            .from('sales_data')
            .select('*')
            .order('date', { ascending: true });

        if (error) {
            console.error('Supabase fetch error:', error);
            // Fallback to CSV if database fails for some reason
            return fetchFromCSV();
        }
        return data;
    }

    // Default: Return data from CSV
    return fetchFromCSV();
};

/**
 * Helper to fetch data from the local CSV file
 */
const fetchFromCSV = async () => {
    console.log('Fetching data from CSV...');
    const csvFilePath = path.join(process.cwd(), 'data', 'sales_data.csv');

    if (!fs.existsSync(csvFilePath)) {
        throw new Error('Sales data file not found at ' + csvFilePath);
    }

    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    return new Promise((resolve, reject) => {
        Papa.parse(csvData, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data),
            error: (error) => reject(new Error('Failed to parse CSV: ' + error.message))
        });
    });
};
