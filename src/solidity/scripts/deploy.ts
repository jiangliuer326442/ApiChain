import { ethers, network } from "hardhat"

import contractConfig from "../../config/contract.json";

async function main() {
    const { contractName } = contractConfig;
    const address = contractConfig[contractName].address[network.config.chainId];
    const abi = contractConfig[contractName].abi;

    const [signer] = await ethers.getSigners();
    const contract = new ethers.Contract(
      address,
      abi,
      signer
    );

    let result = await contract.withdraw();

    console.log("result", result);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })