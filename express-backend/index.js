// Import Express & sqlite3 & cors
const express = require("express");
const sqlite3 = require("sqlite3");
const cors = require("cors");

// Start Express
const app = express();

// Enable CORS access from frontend
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // enable session cookies
  })
);

// Middleware to parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database
const db = new sqlite3.Database("../database/stocks.db", (err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
  } else {
    console.log("Connected to the SQLite database");
    // Check if Watchlist Table Exists, If not Create
    db.run(
      "CREATE TABLE IF NOT EXISTS watchlist (id text PRIMARY KEY,created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL)"
    );
    // Check if Stock Historical Table Exists, If not Create
    db.run(
      "CREATE TABLE IF NOT EXISTS stock_history (id INTEGER PRIMARY KEY AUTOINCREMENT,ticker TEXT NOT NULL,price REAL NOT NULL,timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL)"
    );
  }
});

// Test if API is reachable
app.get("/", (req, res) => {
  console.log("Success!");
  res.send("You made it!");
});

//Endpoint to Add Stocks to Watchlist
app.post("/add_ticker_symbol", (req, res) => {
  // Record Ticker
  const ticker = req.body["ticker"];

  if (ticker.replace(/\s/g, "").length === 0) {
    res.status(400).json({
      message: "Post request unsuccessful, Please Provide Valid Stock",
    });
    return;
  }
  // Add Ticker to WatchList
  db.run("INSERT INTO watchlist(id) VALUES(?)", [ticker], (err) => {
    if (err) {
      console.log("Error on Adding Stock Ticker to Watchlist.");
      console.log(err);
      // Unique Constraint Error
      if (err.message.includes("UNIQUE constraint failed")) {
        res.send("Stock already on Watchlist!");
      }
    } else {
      console.log("Ticker Added!");
      res.send("Success!");
    }
  });
});
//Endpoint to Get Current Stock Prices
app.get("/get_current_stock_price/:stock", (req, res) => {
  // Get Ticker
  const ticker = req.params.stock;

  // Generate Random Stock Price for Ticker
  const price = (Math.random() * 1000).toFixed(2);

  // Add Price to Historical Database
  db.run(
    "INSERT INTO stock_history(ticker, price) VALUES(?, ?)",
    [ticker, price],
    (err) => {
      if (err) {
        console.log("Error adding price to historical table.");
      }
    }
  );

  // Create Response and Send
  const price_response = { price: price };
  res.send(price_response);
});

//Endpoint to Select Stocks from Watchlist
app.get("/get_watchlist", (req, res) => {
  const sql = "SELECT ID FROM watchlist;";

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.log("Error Querying Watchlist.");
      console.log(err);
    }

    const watchlist = { stocks: rows };
    res.send(watchlist);
  });
});

//Endpoint to delete Stock from Watchlist
app.delete("/delete/:stock", (req, res) => {
  console.log("Stocks Deleted!");
  const stock = req.params.stock;

  db.run("DELETE FROM watchlist WHERE id = ?", [stock], (err) => {
    if (err) {
      console.log(err);
    }
  });

  db.run("DELETE FROM stock_history WHERE ticker = ?", [stock], (err) => {
    if (err) {
      console.log(err);
    }
  });

  res.send("DELETE Request Called");
});

// Get Historical Price Points
app.get("/get_historical_data/:stock", (req, res) => {
  const stock = req.params.stock;
  db.all(
    "SELECT ticker, price, timestamp FROM stock_history WHERE ticker = ? AND timestamp >= datetime('now', '-5 minutes');",
    [stock],
    (err, rows) => {
      if (err) {
        console.log(err);
      }
      const data = { data: rows };
      res.send(data);
    }
  );
});

// Gracefully close the database connection when the server is shutting down
process.on("SIGINT", () => {
  console.log("Received SIGINT. Closing database connection.");
  db.close();
  process.exit();
});

// Start Listening to Specified Port
app.listen(8000, () => console.log("Server listening at port 8000"));
