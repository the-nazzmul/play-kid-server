const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 4000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wy9csda.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const productsCollection = client.db('playKid').collection('products')


        // get product by search
        app.get('/search/:text', async (req, res) => {

            const searchText = req.params.text

            const result = await productsCollection.find({
                $or: [
                    { title: { $regex: searchText, $options: "i" } },
                    { seller: { $regex: searchText, $options: "i" } },
                    { sub_category: { $regex: searchText, $options: "i" } }
                ]
            }).toArray()
            res.send(result)
        })


        // get all products
        app.get('/all-products', async (req, res) => {
            const result = await productsCollection.find().toArray()
            res.send(result)
        })

        // get by sort
        app.get('/sort/:value', async (req, res) => {
            const sortValue = req.params.value
            const email = req.query.email
            const query = { seller_email: email }

            if (sortValue === 'ascending') {
                const result = await productsCollection.find(query).sort({ price: 1 }).toArray()
                res.send(result);
            }
            if (sortValue === 'descending') {
                const result = await productsCollection.find(query).sort({ price: -1 }).toArray()
                res.send(result);
            }
        })



        // get all products with limit
        app.get('/all-products-limit', async (req, res) => {
            const result = await productsCollection.find().limit(20).toArray()
            res.send(result)
        })

        // get products by category
        app.get('/all-products/:age', async (req, res) => {
            const category = req.params.age
            const filter = { age_category: category }
            const result = await productsCollection.find(filter).toArray()
            res.send(result)

        })
        // Get single product 
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.findOne(query)
            res.send(result)

        })

        // Get products by email
        app.get('/my-toys/:email', async (req, res) => {
            const email = req.params.email
            const query = { seller_email: email }
            const result = await productsCollection.find(query).toArray()
            res.send(result)
        })

        // Post a product
        app.post('/products', async (req, res) => {
            const data = req.body
            console.log(data);
            const result = await productsCollection.insertOne(data)
            res.send(result)
        })

        // update Product
        app.put('/update-products/:id', async (req, res) => {
            const id = req.params.id;
            const toy = req.body
            const filter = { _id: new ObjectId(id) }
            const updateToy = {
                $set: {
                    price: toy.price,
                    available_quantity: toy.available_quantity,
                    description: toy.description
                },
            };
            const result = await productsCollection.updateOne(filter, updateToy)
            res.send(result)
        })

        // delete single product
        app.delete('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.deleteOne(query)
            res.send(result)

        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('server is running')
})

app.get('/allProducts', (req, res) => {

})

app.listen(port, () => {
    console.log("server is running on port:", port);
})
