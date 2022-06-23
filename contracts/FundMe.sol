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
    using PriceConverter for uint256;

    // State Variables
    uint256 public constant MINIMUM_USD = 10 * 1e18;
    address[] public s_funders;
    mapping(address => uint256) public s_addressToAmountFunded;
    AggregatorV3Interface public s_priceFeed;
    address public immutable i_owner;

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert FundMe_NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /** @notice Send ETH to the contract
     *  @dev uses getConversionRate function from other contract
     */
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "Didn't send enough"
        );

        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value;
    }

    /** @notice Withdraw funds from contract
     *  @dev resets the s_funders array
     */
    function Withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);

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
