import React, { useState, ChangeEvent, useEffect } from "react";
import StockButton from "./components/StockButton";
import StockLineChart from "./components/StockLineChart";
import "./App.css";

function App() {
  // Keep Track of Ticker Symbol Input
  const [tickerSymbol, setTicker] = useState("");

  // Keep Track of Current Watchlist
  const [watchlist, setWatchlist] = useState([]);

  // Keep Track of Selected Stock
  const [currentStock, setCurrentStock] = useState("");

  // Keep Track of Current Stock Price
  const [StockPrice, setStockPrice] = useState(0);

  // Keep Track of Historical Stock Price
  const [HistoricalData, setHistoricalData] = useState([]);

  // Event handler to update the state when the input changes
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTicker(event.target.value);
  };

  // Event Handler to Set Selected Stock
  const handleSelectedStock = (value: string) => {
    setCurrentStock(value);
  };

  // Event handler to Submit the Ticker
  const SubmitNewTicker = () => {
    const RequestOptions = {
      method: "Post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker: tickerSymbol }),
    };
    fetch("http://localhost:8000/add_ticker_symbol", RequestOptions)
      .then((res) => {
        if (!res.ok) {
          alert("Bad Request! Please Enter Valid Stock Ticker!");
        }
      })
      .then((res) => {
        setTicker("");
        fetch("http://localhost:8000/get_watchlist")
          .then((res) => {
            return res.json();
          })
          .then((res) => {
            setWatchlist(res.stocks);
            setTicker("");
          });
      });
  };

  // Event handler to delete the ticker
  const DeleteTicker = () => {
    console.log("Delete!");
    fetch(`http://localhost:8000/delete/${currentStock}`, {
      method: "DELETE",
    }).then(() => {
      console.log("Getting Watchlist");
      fetch("http://localhost:8000/get_watchlist", { method: "GET" })
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          setWatchlist(res.stocks);
          setHistoricalData([]);
          setCurrentStock("");
          setStockPrice(0);
        });
    });
  };

  // Get Historical Data
  const GetHistoricalData = () => {
    fetch(`http://localhost:8000/get_historical_data/${currentStock}`, {
      method: "GET",
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setHistoricalData(res.data);
      });
  };

  // Grab any Existing Entries for Watchlist
  useEffect(() => {
    fetch("http://localhost:8000/get_watchlist")
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setWatchlist(res.stocks);
      });
  }, []);

  // Update Screen Based on Stock Selection
  useEffect(() => {
    if (currentStock === "") {
    } else {
      const RequestOptions = {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      };
      fetch(
        `http://localhost:8000/get_current_stock_price/${currentStock}`,
        RequestOptions
      )
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          setStockPrice(res.price);
          console.log(currentStock);
        })
        .then(() => GetHistoricalData());
    }
  }, [currentStock]);

  // Check for New Price Info (5000ms)
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentStock === "") {
      } else {
        GetHistoricalData();
        const RequestOptions = {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        };
        fetch(
          `http://localhost:8000/get_current_stock_price/${currentStock}`,
          RequestOptions
        )
          .then((res) => {
            return res.json();
          })
          .then((res) => {
            setStockPrice(res.price);
          });
      }
    }, 5000);
    return () => clearInterval(interval);
  });

  return (
    <div className="App">
      <div id="WatchListContainer">
        <div id="WatchList">
          <h1>Ticker Watch List</h1>
          {watchlist.map((item, index) => (
            <StockButton
              key={index}
              stock_symbol={item["id"]}
              active={currentStock === item["id"] ? true : false}
              onClick={() => handleSelectedStock(item["id"])}
            />
          ))}
          <button onClick={DeleteTicker}>Delete Selected Stock</button>
        </div>
        <div id="FormContainer">
          <h1>New Ticker Symbol</h1>
          <input
            id="TickerSymbolInput"
            type="text"
            value={tickerSymbol}
            onChange={handleInputChange}
          ></input>
          <button onClick={SubmitNewTicker}>Add New Ticker Symbol</button>
        </div>
      </div>
      <div id="StockDisplay">
        <b>{currentStock}</b>
        <b>Current Stock Price: ${StockPrice}</b>
        {HistoricalData.length > 0 && <StockLineChart data={HistoricalData} />}
      </div>
    </div>
  );
}

export default App;
