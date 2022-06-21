// SPDX-License-Identifier: MIt
pragma solidity ^0.8.8;

import "./PriceConverter.sol";

error FundMe_NotOwner();

/** @title Crowdfunding contract
 * @author Forbes
 * @notice A demo for funding contract
 * @dev Implements a pricefeed
 */
contract FundMe {
  // Type declarations
  // Attach the priceConverter to uint256
  using PriceConverter for uint256;

  // State Variables
  //constant => cheaper gas
  uint256 public constant MINIMUM_USD = 10 * 1e18;
  address[] public funders;
  // Relate the address with the value funded
  mapping(address => uint256) public addressToAmountFunded;
  AggregatorV3Interface public priceFeed;
  address public immutable i_owner;

  modifier onlyOwner() {
    if (msg.sender != i_owner) {
      revert FundMe_NotOwner();
    }
    // // Less gas efficient
    // require(msg.sender == i_owner, "Sender is not owner!");
    _;
  }

  constructor(address priceFeedAddress) {
    i_owner = msg.sender;
    priceFeed = AggregatorV3Interface(priceFeedAddress);
  }

  /** @notice Send ETH to the contract
   * @dev uses getConversionRate function from other contract
   */
  function fund() public payable {
    // msg.value.getConversionRate() (msg.value is considered the first parameter of the function)
    require(
      msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
      "Didn't send enough"
    );

    funders.push(msg.sender);
    addressToAmountFunded[msg.sender] = msg.value;
  }

  /** @notice Withdraw funds from contract
   * @dev resets the funders array
   */
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

  // What if someone send eth to the contract without the fund function?

  receive() external payable {
    fund();
  }

  fallback() external payable {
    fund();
  }
}
