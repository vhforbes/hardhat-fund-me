const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

describe("FundMe", async () => {
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1")

    beforeEach(async () => {
        // Gets the deployer address
        // 1. Ethers
        // const accounts = await ethers.getSigners()
        // const accountZero = accounts[0]
        // 2. Harhat
        deployer = (await getNamedAccounts()).deployer // gets only the deployer from the response
        //Deploy the contracts
        await deployments.fixture(["all"])
        // Save the contract to its variable and connect it with the second parameter
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
    })

    describe("constructor", async () => {
        it("Set the aggregator address correctly", async () => {
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("Fund", async () => {
        it("fails if not enough eth", async () => {
            await expect(fundMe.Fund()).to.be.revertedWith("Didn't send enough")
        })
        it("updates the amount funded data sctructure", async () => {
            await fundMe.Fund({ value: sendValue })
            const response = await fundMe.getAddressToAmmoutFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })
        it("add funder to array", async () => {
            await fundMe.Fund({ value: sendValue })
            const response = await fundMe.getFunder("0")
            assert.equal(response, deployer)
        })
    })

    describe("Withdraw", async () => {
        beforeEach(async () => {})
        it("withdraw eth from a single funder", async () => {
            //Arrange - send value to contract and get its balance
            await fundMe.Fund({ value: sendValue })

            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            //Act - make a withdraw and save the new balances
            const transactionResponse = await fundMe.Withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const totalGas = gasUsed.mul(effectiveGasPrice) // mul = multiply

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeplyerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Assert - starting fund me balance, should be equal to the final deployer
            // balance plus the spent gas fee
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeplyerBalance.add(totalGas.toString())
            )
        })

        it("withdraw eth from multiple s_funders", async () => {
            //Arrange - send money from different accounts and save
            //the contract and deployer balance
            const accounts = await ethers.getSigners()

            for (let i = 1; i < 6; i++) {
                // Connect contract with the account and send a value to the contract
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.Fund({ value: sendValue })
            }
            // get the balance from the contract and the deployer
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            //Act - make a withdraw and save the new balances
            const transactionResponse = await fundMe.Withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const totalGas = gasUsed.mul(effectiveGasPrice) // mul = multiply

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeplyerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Assert - starting fund me balance, should be equal to the final deployer
            // balance plus the spent gas fee
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeplyerBalance.add(totalGas.toString())
            )
            // Confirm that the s_funders array is clean (transaction should not occour)
            await expect(fundMe.getFunder(0)).to.be.reverted

            // Checking if the address to ammount funded values are zero
            for (i = 1; i < accounts.length; i++) {
                assert.equal(
                    await fundMe.getAddressToAmmoutFunded(accounts[i].address),
                    0
                )
            }
        })

        it("only allow owner to withdraw", async () => {
            // Connects to atacker account
            const accounts = await ethers.getSigners()
            const atackerConnectedContract = await fundMe.connect(accounts[1])
            // Revert with specific error message
            await expect(
                atackerConnectedContract.Withdraw()
            ).to.be.revertedWith("FundMe_NotOwner")
        })

        it("cheaper withdraw", async () => {
            //Arrange - send money from different accounts and save
            //the contract and deployer balance
            const accounts = await ethers.getSigners()

            for (let i = 1; i < 6; i++) {
                // Connect contract with the account and send a value to the contract
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.Fund({ value: sendValue })
            }
            // get the balance from the contract and the deployer
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            //Act - make a withdraw and save the new balances
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const totalGas = gasUsed.mul(effectiveGasPrice) // mul = multiply

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeplyerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Assert - starting fund me balance, should be equal to the final deployer
            // balance plus the spent gas fee
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeplyerBalance.add(totalGas.toString())
            )
            // Confirm that the s_funders array is clean (transaction should not occour)
            await expect(fundMe.getFunder(0)).to.be.reverted

            // Checking if the address to ammount funded values are zero
            for (i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.getAddressToAmmoutFunded(accounts[i].address),
                    0
                )
            }
        })
    })
})
