const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'unatuhorized access' })
        }
        req.decoded = decoded;
        next();
    })
}
async function run() {
    try {
        const serviceCollection = client.db('photoDb').collection('services')
        const reviewsCollection = client.db('photoDb').collection('reviews')
        //for jwt token
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1hr' })
            res.send({ token })

        })

        //for services
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.sort({_id:-1}).limit(3).toArray();
            res.send(services)
        })

        //for all services
        app.get('/allservices', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray();
            res.send(services)
        })

        //for add services

        // post for add allServices
        app.post("/addService", async (req, res) => {
            const review = req.body;
            const result = await serviceCollection.insertOne(review);
            res.send(result);
        });
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
            const updateUser = req.body;
            const query = { _id: ObjectId(id) }
            const Option = { upsert: true }
            const updateDoc = {
                $set: {
                    serviceName: updateUser.serviceName,
                    date: updateUser.date,
                    message: updateUser.message

                }
            }
            const result = await reviewsCollection.updateOne(query, updateDoc, Option)
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
            const reviews = await cursor.sort({date: 1}).toArray()
            res.send(reviews)
        })


        //for review by email
        app.get('/reviews', verifyJWT, async (req, res) => {
            console.log(req.headers)

            const decoded = req.decoded;
            console.log('Inside order api', decoded)
            if (decoded?.email !== req.query.email) {
                res.status(403).send({ message: 'Unauthorized access' })
            }

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