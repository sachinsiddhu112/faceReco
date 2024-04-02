// Import the required modules
import { MongoClient } from 'mongodb';

// Initialize a global variable for the MongoDB client
let client;

// Function to connect to the MongoDB databa
async function connectToDatabase() {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME;
 
  try {
    // Connect to MongoDB using the provided URI
    client = await MongoClient.connect(uri);
    console.log('Connected to MongoDB' );
    // Return the database object
    return client.db(dbName);
  } catch (error) {
    // Handle connection errors
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// Lambda handler function
export const handler = async (event,context, callback) => {
  
    // Connect to the MongoDB database
    const db = await connectToDatabase();
    console.log(context,callback);

    // Access a specific collection (e.g., "items")
    const collection = db.collection('faces');

    // Perform CRUD operations based on the HTTP method and path
    const { httpMethod, body } = event;
    let res ={
      "statusCode": 200,
      "headers": {
          "Content-Type": "*/*",
          
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
       
      },
      body:""
  };
    console.log("Handler executed")
    if (httpMethod === 'GET') {
      // Fetch all items from the collection
      const items = await collection.find({}).toArray();
      res.body = items
     // callback(null, res);
      return {
        "statusCode": 200,
      "headers": {
          "Content-Type": "*/*",
          
            
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
       
        },
        "body":JSON.stringify({
        "faces":items
      })
      }
    } 
    if (httpMethod === 'POST') {
      // Insert a new item into the collection
      const newItem =  JSON.parse(body);
      const result = await collection.insertMany(newItem);
      console.log(result,"this is result")
     res.body = {
        user:newItem
      }
     return {
       "statusCode": 200,
      "headers": {
          "Content-Type": "*/*",
          
            
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
       
        },
        "body":JSON.stringify({
        "user":newItem
      }),
      "isBase64Encoded": false
     }
    } else {
      // Return a 404 Not Found response for other paths
      res.statusCode = 404;
      res.body = { "msg": "not found" }
      return callback(null, res);
    }
  
};
