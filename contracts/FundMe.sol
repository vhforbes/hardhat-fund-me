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
    address private immutable i_owner;
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;
    AggregatorV3Interface private s_priceFeed;

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
    function Fund() public payable {
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
    function Withdraw() public payable onlyOwner {
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

    function cheaperWithdraw() public payable onlyOwner {
        // saved the s_funders to the memory so i can loop it without having to
        // read from storage every time it loops
        address[] memory funders = s_funders;

        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);

        // (bool callSuccess, ) = payable(msg.sender).call{
        //     value: address(this).balance
        // }("");

        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(callSuccess);
    }

    //Getter functions to facilitate interaction with the contract
    // and making the variables private result in cheaper gas!
    // View / Pure functions
    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmmoutFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    // What if someone send eth to the contract without the fund function?
    receive() external payable {
        Fund();
    }

    fallback() external payable {
        Fund();
    }
}
