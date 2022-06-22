require("dotenv").config()

const { network } = require("hardhat")
const { networkConfig, devChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// module.exports.default = deployfunc()

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress

    // Deploy Mock When Local
    if (devChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsd"]
    }

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], // priceFeed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    // contract address =  fundMe.address

    log("--------- Withdraw --------")

    let fundMeContract = await ethers.getContract("FundMe", deployer)
    let deposit = await fundMeContract.fund({
        value: "1000000000000000000",
    })

    const balance = await fundMeContract.provider.getBalance(fundMe.address)

    log(balance.toString())

    const transactionResponse = await fundMeContract.Withdraw()

    // const transactionReceipt = await transactionResponse.wait(1)

    // const endingDeplyerBalance = await fundMeContract.provider.getBalance(
    //     deployer
    // )

    log("----------------------------------------------------------------")
    if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
}

module.exports.tags = ["all", "FundMe"]
