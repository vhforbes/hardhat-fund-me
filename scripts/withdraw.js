const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    // await deployments.fixture(["all"])
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("Withdrawing Contract...")
    const transactionResponse = await fundMe.WithdrawCheaper()
    await transactionResponse.wait(1)
    console.log("Withdraw!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
