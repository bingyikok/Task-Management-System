const express = require("express");
var cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: "./config/config.env" });

const app = express();

const corsOptions = {
     origin: "http://localhost:5173", // Adjust based on your frontend origin
     credentials: true, // Allow credentials (cookies) to be included
};

app.use(cors(corsOptions)); // Setup CORS - Accessible by other domains

app.use(cookieParser());
app.use(express.json()); //Parse JSON bodies (as sent by API clients)

//Define Routes
app.use("/", require("./routes/routes"));

//Return error for any forbidden routes
app.use((req, res) => {
     const isValidURL = /^[a-zA-Z0-9]+$/.test(req.url.slice(1));
     if (!isValidURL) {
          return res.json({
               code: "A001",
          });
     }
});

//App Listener
app.listen(process.env.PORT, (err) => {
     if (err) {
          console.error("Error starting server:", err);
          return;
     }
     console.log(`Server started on port ${process.env.PORT}`);
});
