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
    uint256 public constant MINIMUM_USD = 10 * 1e18;
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;
    AggregatorV3Interface public priceFeed;
    address public immutable i_owner;

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert FundMe_NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /** @notice Send ETH to the contract
     *  @dev uses getConversionRate function from other contract
     */
    function fund() public payable {
        require(
            msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
            "Didn't send enough"
        );

        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] = msg.value;
    }

    /** @notice Withdraw funds from contract
     *  @dev resets the funders array
     */
    function Withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }

        funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");

        require(callSuccess, "Call failed");
    }

    // What if someone send eth to the contract without the fund function?

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}
