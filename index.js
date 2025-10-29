require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");


const app = express();
const port = process.env.PORT || 3000;

// Middleware----
app.use(cors());
app.use(express.json());

// MongoDB URI-----
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y7n1te0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// JWT Middleware
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).send({ message: "Unauthorized access. Token missing." });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).send({ message: "Forbidden. Invalid or expired token." });
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    // await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("jhotpot_Parcel_DB");
    const chatRoutes = require("./routes/chatRoutes");
    // const foodCollection = db.collection("foods");
    // const requestCollection = db.collection("requests");

  

    // JWT Token Generator
    app.post("/jwt", (req, res) => {
      const user = req.body; // Expected: { email: userEmail }
      if (!user.email) {
        return res.status(400).send({ message: "Email is required to generate token." });
      }
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "7d" });
      res.send({ token });
    });

    
    // AI chatRoutes
    app.use("/api", chatRoutes());

    

   

    // (Optional) Admin: Get all requests
    app.get("/all-requests", verifyJWT, async (req, res) => {
      // TODO: Add admin role verification here
      const all = await requestCollection.find().toArray();
      res.send(all);
    });

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}

run();
// ✅ Root route
app.get("/", (req, res) => {
  res.send("🚀 Jhotpot Server is running successfully!");
});

app.listen(port, () => {
  console.log(`🚀 Server with JWT running at http://localhost:${port}`);
});
