const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

//middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('server is running')
})





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fpvwzmp.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const serviceCollection = client.db('photoDb').collection('services')
        const reviewsCollection = client.db('photoDb').collection('reviews')

        //for services
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.limit(3).toArray();
            res.send(services)
        })

        //for all services
        app.get('/allservices', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray();
            res.send(services)
        })
        //for specific service

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })

        //for post
        app.post('/reviews', async (req, res) => {
            const review = req.body
            const result = await reviewsCollection.insertOne(review)
            res.send(result)
        })
        //for delete specific data

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewsCollection.deleteOne(query)
            res.send(result)
        })

        //for update
        app.patch('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.params.status;
            const query = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    status: status

                }
            }
            const result = await reviewsCollection.updateOne(query, updateDoc)
            res.send(result)

        })
        app.get('/reviews', async (req, res) => {
           
            let query = {}
            if (req.query.serviceName) {
                query = {
                    serviceName: req.query.serviceName

                }

            }
            const cursor = reviewsCollection.find(query)
            const reviews = await cursor.toArray()
            res.send(reviews)
        })


        //for review by email
        app.get('/reviews', async (req, res) => {
            
            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email

                }

            }
            const cursor = reviewsCollection.find(query)
            const reviews = await cursor.toArray()
            res.send(reviews)
        })

    }
    finally {

    }
} run().catch(console.dir)



app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})