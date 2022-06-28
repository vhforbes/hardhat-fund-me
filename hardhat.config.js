require("dotenv").config()

//Plugins
require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    // solidity: "0.8.8",
    solidity: {
        compilers: [
            {
                version: "0.8.8",
            },
            {
                version: "0.6.8",
            },
        ],
    },
    networks: {
        ropsten: {
            url: process.env.ROPSTEN_URL || "",
            accounts:
                process.env.PRIVATE_KEY !== undefined
                    ? [process.env.PRIVATE_KEY]
                    : [],
        },
        rinkeby: {
            url: process.env.RINKEBY_RPC_URL,
            accounts: [process.env.PRIVATE_KEY],
            chainId: 4,
            blockConfirmations: 6,
        },
        localNetwork: {
            url: "http://127.0.0.1:8545/",
            accounts: [
                "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
            ],
        },
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        // currency: "USD",
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: 0,
    },
}
