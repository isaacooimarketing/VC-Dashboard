import { NextResponse } from 'next/server';
import { getSalesData } from '../../../data-layer.js';

export async function GET() {
    try {
        const data = await getSalesData();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Server Error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch sales data', details: error.message }, { status: 500 });
    }
}
