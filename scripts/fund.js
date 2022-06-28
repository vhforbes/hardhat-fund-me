const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    await deployments.fixture(["all"])
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("Funding Contract...")

    const transactionResponse = await fundMe.Fund({
        value: ethers.utils.parseEther("0.02"),
    })
    await transactionResponse.wait(1)
    console.log("Funded!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
