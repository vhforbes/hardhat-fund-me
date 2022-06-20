// SPDX-License-Identifier: MIt
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
  // Gets ETH value in usd
  function getPrice(AggregatorV3Interface priceFeed)
    public
    view
    returns (uint256)
  {
    // These commas , ,,, means the unused arguments
    (, int256 price, , , ) = priceFeed.latestRoundData();

    // Price = ETH in terms of usd
    // 300000000000  // Value is 3000, but comes with 8 decimals 3000.00000000
    // Need to match the decimals in eth(1e18) and the usd value

    // Converting to uint256 and matching decimals
    return uint256(price * 1e10);
  }

  function getConversionRate(uint256 ethAmount, AggregatorV3Interface priceFeed)
    internal
    view
    returns (uint256)
  {
    uint256 ethPrice = getPrice(priceFeed);
    uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
    return ethAmountInUsd;
  }
}
