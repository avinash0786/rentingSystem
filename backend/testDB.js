
const MongoClient = require('mongodb').MongoClient;
var uri="mongodb+srv://admin:ADMIN@cluster0786-eve5j.mongodb.net/FIRST?retryWrites=true&w=majority&useUnifiedTopology: true";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("renting").collection("landlord");
  // perform actions on the collection object
  console.log(collection.find());
  client.close();
});