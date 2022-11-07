const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
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
// pass: 7qQryiw37LdEFnHt

// user: Assignment-11



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fpvwzmp.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})