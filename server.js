const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
require("dotenv").config();

// middleware
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("doctors"));
app.use(fileUpload());
const port = process.env.PORT || 5000;

// Connect Mongodb in Project
const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gpz9o.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true, useUnifiedTopology: true, });

client.connect((err) => {
  const productCollection = client.db("beauty-saloon").collection("products");
  const orderCollection = client.db("beauty-saloon").collection("orders");  
  const appointmentCollection = client.db("beauty-saloon").collection("appointments");
  const artistCollection = client.db("beauty-saloon").collection("artists")
 
// Manage Appointment...
app.post("/addAppointment", (req, res) => {
  const appointment = req.body;
  appointmentCollection.insertOne(appointment).then((result) => {
    res.send(result.insertedCount > 0);
  });
});  

app.get("/appointments", (req, res) => {
  appointmentCollection.find({}).toArray((err, documents) => {
    res.send(documents);
  });
});

app.post("/appointmentsByDate", (req, res) => {
  const date = req.body;
  const email = req.body.email;
  artistCollection.find({ email: email }).toArray((err, artists) => {
    const filter = { date: date.date };
    if (artists.length === 0) {
      filter.email = email;
    }
    appointmentCollection.find(filter).toArray((err, documents) => {
      console.log(email, date.date, artists, documents);
      res.send(documents);
    });
  });
});

// Manage Admin, Beautician(artist) & Team Member...
app.post("/addArtist", (req, res) => {
  const file = req.files.file;
  const name = req.body.name;
  const email = req.body.email;
  const position = req.body.position;
  const facebook = req.body.facebook;
  const instagram = req.body.instagram
  const linkedin = req.body.linkedin;
  const phone = req.body.phone;
  const newImg = file.data;
  const encImg = newImg.toString("base64");

  var image = {
    contentType: file.mimetype,
    size: file.size,
    img: Buffer.from(encImg, "base64"),
  };

  artistCollection.insertOne({ name, email, position, facebook, linkedin, instagram, phone, image })
    .then((result) => {
      console.log(result)
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/artists", (req, res) => {
    artistCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // Manage Shop and Product.....
  app.post("/addProduct", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const price = req.body.price;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    productCollection
      .insertOne({ name, price, description, image })
      .then((result) => {
          console.log(result);
        res.send(result.insertedCount > 0);
      });
  });

  app.get("/products", (req, res) => {
    productCollection.find({})
    .toArray((err, documents) => {
     res.send(documents);
     });
 });

  app.post("/addOrder", (req, res) => {
    const order = req.body;
    console.log(order)
    orderCollection.insertOne(order)
    .then((result) => {
      res.send(result.insertedCount > 0);
    });
 });
  
 
//  When Artist or Beautician is an admin....
  app.post("/isArtist", (req, res) => {
    const email = req.body.email;
    artistCollection.find({ email: email })
    .toArray((err, artists) => {
     res.send(artists.length > 0);
   });
 });
 
});



// Root API.......
app.get("/", (req, res) => {
  res.send("Hello from Server, it's working!!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});