const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.json());// process json
app.use(express.urlencoded({ extended: true })); 
app.use(cors());

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://giftadmin:admin@giftdelivery.eu8ksup.mongodb.net/?retryWrites=true&w=majority&appName=giftdelivery";
const client = new MongoClient(uri);

// Global for general use
var userCollection;
var orderCollection;

async function connectDB() {
  
	try {

	  await client.connect();
	  console.log("Connected to MongoDB Atlas\n");
	  
	  const db = client.db("giftdelivery"); 
	  userCollection = db.collection("users"); 
	  orderCollection = db.collection("orders");

    } catch (error) {
    
	  console.error("MongoDB connection error:", error + "\n");
    }
}

connectDB();


app.get('/', (req, res) => {

  	res.send('<h3>Welcome to Gift Delivery server app!</h3>')
})


app.get('/getUserDataTest', async (req, res) => {
	
	try {
		
		const docs = await userCollection.find({}).toArray();
		console.log(JSON.stringify(docs) + " have been retrieved\n");
		res.status(200).send("<h1>" + JSON.stringify(docs) + "</h1>"); 

	} catch (err) {

		res.status(500).json({ message: "Server error", error: err });
	}
});
  

app.get('/getOrderDataTest', async (req, res) => {
	
	try {

		const docs = await orderCollection.find({}).toArray();
		console.log(JSON.stringify(docs) + " have been retrieved\n");
		res.status(200).send("<h1>" + JSON.stringify(docs) + "</h1>"); 

	} catch (err) {

		res.status(500).json({ message: "Server error", error: err });
	}
});



app.post('/verifyUserCredential', async (req, res) => {

	console.log("POST request received : " + JSON.stringify(req.body) + "\n"); 

	const loginData = req.body;

	try {  

		const doc = await userCollection.findOne({email:loginData.email, password:loginData.password}, {projection:{_id:0}});
		console.log( JSON.stringify(doc) + " have been retrieved\n");
		res.status(200).send(doc); 
  
	} catch (err) {
  
		res.status(500).json({ message: "Server error", error: err });
	}
});


app.post('/insertOrderData', async (req, res) => {
    
    console.log("POST request received : " + JSON.stringify(req.body) + "\n"); 

	const orderData = req.body; 	

	try {

		const result = await orderCollection.insertOne(orderData);
		console.log("Order record with ID "+ result.insertedId + " have been inserted\n");
		res.status(200).send(result);

	} catch (err) {
		
		res.status(500).json({ message: "Server error", error: err });
	}
    
});


// Register user and check email exists
app.get('/checkEmailExists', async (req, res) => {
	try {
		const email = req.query.email;
		const existingUser = await userCollection.findOne({ email: email });
		res.status(200).json({ exists: !!existingUser });
	} catch (err) {
		console.error('Error checking email:', err);
		res.status(500).json({message: 'Server error', error:err});
	}
});


app.post('/registerNewUser', async (req,res) => {
	
	try {
		const newUser = req.body;

		//Insert new user into MongoDB collection
		const result = await userCollection.insertOne({
			email: newUser.email,
			password: newUser.password,
			firstName: newUser.firstName,
			lastName: newUser.lastName,
			state: newUser.state,
			phoneNumber: newUser.phoneNumber,
			address: newUser.address,
			postcode: newUser.postcode,
		});
		
		res.status(201).json({message: 'Signed-up success'});
	} catch (err) {
		res.status(500).json({message: 'Server error', error:err});
	}
});


// Past Order list page
app.get('/getUserOrders', async (req,res) => {
	try {
		const userEmail = req.query.email;
		const userOrders = await orderCollection.find({customerEmail: userEmail}).toArray();

		res.status(200).json(userOrders);
	} catch (err) {
		res.status(500).json({message: 'Server error', error:err });
	}
});


// Delete endpoint
app.delete('/deleteOrders', async (req,res) => {
	try {
		const email = req.query.email;
		const result = await orderCollection.deleteMany({customerEmail:email});
		
		res.json({deletedCount: result.deletedCount});
	} catch (err) {
		res.status(500).json({message: 'Server error', error:err.toString()});
	}
});

  
app.listen(port, () => {

  	console.log(`Gift Delivery server app listening at http://localhost:${port}`) 
});



