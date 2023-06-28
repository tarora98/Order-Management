const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const orders = [
    {
        id: '223',
        datetime: '2022-11-01T11:11:11.111Z',
        totalfee: 100,
        services: [{ id: '123' }],
    },
    {
        id: '224',
        datetime: '2022-11-01T11:11:11.111Z',
        totalfee: 100,
        services: [{ id: '789' }],
    },
    {
        id: '225',
        datetime: '2022-11-01T11:11:11.111Z',
        totalfee: 100,
        services: [{ id: '456' }],
    },
];

// Get all orders
app.get('/orders', (req, res) => {
    res.json(orders);
});

// Get a specific order by ID
app.get('/orders/:id', (req, res) => {
    const { id } = req.params;
    const order = orders.find((order) => order.id === id);

    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

// Create a new order
app.post('/orders', (req, res) => {
    const { id, datetime, totalfee, services } = req.body;

    // Check if there is an existing order within 3 hours
    const existingOrder = orders.find(
        (order) => Math.abs(new Date(order.datetime) - new Date(datetime)) < 3 * 60 * 60 * 1000
    );

    if (existingOrder) {
        res.status(400).json({ error: 'An order already exists within 3 hours of the specified datetime' });
    } else {
        const newOrder = { id: uuidv4(), datetime, totalfee, services };
        orders.push(newOrder);
        res.status(201).json(newOrder);
    }
});

// Update an existing order
app.put('/orders/:id', (req, res) => {
    const { id } = req.params;
    const { datetime, totalfee, services } = req.body;

    const orderIndex = orders.findIndex((order) => order.id === id);

    if (orderIndex !== -1) {
        // Check if there is an existing order within 3 hours
        const existingOrder = orders.find(
            (order) =>
                order.id !== id &&
                Math.abs(new Date(order.datetime) - new Date(datetime)) < 3 * 60 * 60 * 1000
        );

        if (existingOrder) {
            res.status(400).json({ error: 'An order already exists within 3 hours of the specified datetime' });
        } else {
            orders[orderIndex] = { id, datetime, totalfee, services };
            res.json({ message: 'Order updated successfully' });
        }
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

// Delete an order
app.delete('/orders/:id', (req, res) => {
    const { id } = req.params;
    const orderIndex = orders.findIndex((order) => order.id === id);

    if (orderIndex !== -1) {
        orders.splice(orderIndex, 1);
        res.json({ message: 'Order deleted successfully' });
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
