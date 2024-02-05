import React, { useState } from "react";
import "./StockButton.css";

const StockButton = (props: {
  stock_symbol: string;
  active: boolean;
  onClick: any;
}) => {
  // Default Class for Button
  let className = "button";

  // If Active change Class Name
  if (props.active) {
    className += "-active";
  }

  return (
    <button
      className={className}
      disabled={props.active}
      onClick={props.onClick}
    >
      <h2>{props.stock_symbol}</h2>
    </button>
  );
};

export default StockButton;
