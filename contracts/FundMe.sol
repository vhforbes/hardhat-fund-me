// SPDX-License-Identifier: MIt
pragma solidity ^0.8.8;

import "./PriceConverter.sol";

error Unauthorized();

contract FundMe {
  // Attach the priceConverter to uint256
  using PriceConverter for uint256;

  //constant => cheaper gas
  uint256 public constant MINIMUM_USD = 10 * 1e18;

  address[] public funders;
  // Relate the address with the value funded
  mapping(address => uint256) public addressToAmountFunded;

  AggregatorV3Interface public priceFeed;

  address public immutable i_owner;

  constructor(address priceFeedAddress) {
    i_owner = msg.sender;
    priceFeed = AggregatorV3Interface(priceFeedAddress);
  }

  // Send ETH to the contract
  function fund() public payable {
    // a.getConversionRate() (a is considered the first parameter)
    require(
      msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
      "Didn't send enough"
    );

    funders.push(msg.sender);
    addressToAmountFunded[msg.sender] = msg.value;
  }

  // Withdraw funds from contract
  function Withdraw() public onlyOwner {
    // Reset the funders array values
    for (uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
      address funder = funders[funderIndex];
      addressToAmountFunded[funder] = 0;
    }

    // Reset array - 0 means the numbers of objects inside the starting array
    funders = new address[](0);

    // //transfer
    // payable(msg.sender).transfer(address(this).balance);
    // //send
    // bool sendSuccess = payable(msg.sender).send(address(this).balance);
    // require(sendSuccess, "Send failed");

    // call, returns a boolean if the call is a success
    (bool callSuccess, ) = payable(msg.sender).call{
      value: address(this).balance
    }("");
    require(callSuccess, "Call failed");

    // Reverts if not owner (modifier)
    revert();
  }

  // Function will do this before executing the code
  modifier onlyOwner() {
    if (msg.sender != i_owner) {
      revert Unauthorized();
    }
    // // Less gas efficient
    // require(msg.sender == i_owner, "Sender is not owner!");
    _;
  }

  // What if someone send eth to the contract without the fund function?

  receive() external payable {
    fund();
  }

  fallback() external payable {
    fund();
  }
}
