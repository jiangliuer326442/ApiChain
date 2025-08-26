import { ethers } from "hardhat"

async function main() {
    const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
    const simpleStorage = await SimpleStorageFactory.deploy()
    console.log("Simple Storage deployed to:", await simpleStorage.getAddress())
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })