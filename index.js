const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6ijjp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

//@cluster0.6ijjp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

//mongoose.connect(mongodb+srv://clusterAnything.mongodb.net/test?retryWrites=true&w=majority, { user: process.env.MONGO_USER, pass: process.env.MONGO_PASSWORD, useNewUrlParser: true, useUnifiedTopology: true })

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {

    try {
        await client.connect();
        const database = client.db('delightTravel');
        const serviceCollection = database.collection('services');
        const serviceTypeCollection = database.collection('service_types');
        const ServiceBookCollection = database.collection('books');

        // GET SERVICE TYPE 
        app.get('/service_types', async (req, res) => {
            const cursor = serviceTypeCollection.find({});
            const types = await cursor.toArray();
            res.send(types);
        });

        // GET SERVICE 
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.json(service);
        });
        // GET SERVICES 
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        // ADD SERVICE
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })

        // GET MY ORDERS 
        app.get('/my-orders/:id', async (req, res) => {
            const uId = req.params.id;
            const query = { userId: uId };
            const cursor = ServiceBookCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        });
        // GET ALL ORDERS 
        app.get('/all-orders', async (req, res) => {
            const cursor = ServiceBookCollection.find();
            const orders = await cursor.toArray();
            res.json(orders);
        });
        //UPDATE API
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id
            const updateUser = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: updateUser.status
                },
            };
            const result = await ServiceBookCollection.updateOne(filter, updateDoc)
            res.json(result);
        })
        // DELETE ORDER 
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ServiceBookCollection.deleteOne(query);
            res.json(result);
        })
        // GET MY ORDER SERVICES
        app.post('/order-products', async (req, res) => {
            const keys = req.body;
            const newKeys = keys.map(key => ObjectId(key))
            const query = { _id: { $in: newKeys } }
            const services = await serviceCollection.find(query).toArray();
            res.json(services);
        })
        // ADD ORDER 
        app.post('/booking', async (req, res) => {
            const bookContent = req.body;
            const result = await ServiceBookCollection.insertOne(bookContent);
            res.send(result);
        })
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('Running Server');
})

app.listen(port, () => {
    console.log('Running Server Port', port);
});