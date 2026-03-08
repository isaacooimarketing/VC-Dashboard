import express from 'express';
import cors from 'cors';
import { getSalesData } from './data-layer.js'; // Importing the new data layer

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// API interface remains unchanged, data source is abstract
app.get('/api/sales', async (req, res) => {
    try {
        // Now fetching via the source-agnostic data layer
        const data = await getSalesData();
        res.json(data);
    } catch (error) {
        console.error('API Server Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch sales data', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api/sales`);
});
