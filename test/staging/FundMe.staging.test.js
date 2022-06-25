const { assert } = require("chai")
const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { devChains } = require("../../helper-hardhat-config")

devChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe
          let deployer
          const sendValue = ethers.utils.parseEther("0.01")

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("funds and withdraw", async () => {
              await fundMe.Fund({ value: sendValue })
              await fundMe.Withdraw({ gasLimit: 100000 })
              const fundedValue = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(fundedValue.toString(), "0")
          })
      })
