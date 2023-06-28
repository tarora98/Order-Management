import express, { Request, Response } from 'express';
import { Pool } from 'pg';

const app = express();
app.use(express.json());

// PostgreSQL database connection
const pool = new Pool({
    user: 'your_username',
    host: 'your_host',
    database: 'your_database',
    password: 'your_password',
    port: 5432,
});

// Sample data
const serviceRecords = [
    {
        id: 123,
        name: 'Inspection',
    },
    {
        id: 789,
        name: 'Testing',
    },
    {
        id: 456,
        name: 'Analysis',
    },
];

// Endpoint to create a new order
app.post('/orders', async (req: Request, res: Response) => {
    try {
        const { id, datetime, totalfee, services } = req.body;

        // Check if there is a pre-existing order within the last 3 hours
        const existingOrder = await pool.query(
            'SELECT * FROM orders WHERE datetime >= NOW() - INTERVAL \'3 hours\''
        );

        if (existingOrder.rowCount > 0) {
            return res.status(400).json({ error: 'An order already exists within the last 3 hours' });
        }

        await pool.query('INSERT INTO orders (id, datetime, totalfee, services) VALUES ($1, $2, $3, $4)', [
            id,
            datetime,
            totalfee,
            JSON.stringify(services),
        ]);

        res.status(201).json({ message: 'Order created successfully' });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to get details of a specific order
app.get('/orders/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error retrieving order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to update details of a specific order
app.put('/orders/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const { datetime, totalfee, services } = req.body;

        const result = await pool.query(
            'UPDATE orders SET datetime = $1, totalfee = $2, services = $3 WHERE id = $4',
            [datetime, totalfee, JSON.stringify(services), id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ message: 'Order updated successfully' });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to delete a specific order
app.delete('/orders/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        const result = await pool.query('DELETE FROM orders WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to get all orders
app.get('/orders', async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM orders');

        res.json(result.rows);
    } catch (error) {
        console.error('Error retrieving orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
