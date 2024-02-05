import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

const StockLineChart = (props: { data: any }) => {
  const chartData = {
    labels: props.data.map((entry: any) => entry.timestamp), // Array of dates
    datasets: [
      {
        label: "Stock Prices",
        data: props.data.map((entry: any) => entry.price), // Array of stock prices
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const options: any = {};

  return <Line data={chartData} options={options} />;
};

export default StockLineChart;
