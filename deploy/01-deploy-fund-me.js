// const deployfunc = () => {
//   console.log("hi")
// }

const { network } = require("hardhat")
const { networkConfig, devChains } = require("../helper-hardhat-config")

// module.exports.default = deployfunc()

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  let ethUsdPriceFeedAddress

  if (devChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator")
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethusdPriceFeed"]
  }

  // when using local use mock
  await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress], // priceFeed address
    log: true,
  })
  log("----------------------------------------------------------------")
}

module.exports.tags = ["all", "FundMe"]
