import {DeployFunction} from "hardhat-deploy/types"
import {HardhatRuntimeEnvironment} from "hardhat/types"
import fse from "fs-extra";

import contractConfig from "../../config/contract.json";

const { contractName } = contractConfig;

const deployFunction: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
  ) {
    const { deployments, getNamedAccounts, network, ethers } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    // const args = [
    //   network.config.functionsRouter,
    //   network.config.donIdAddress,
    //   300000,
    //   network.config.subscriptionId,
    // ];
    const args = [
      network.config.functionsRouter,
      network.config.donIdAddress,
      300000,
    ];

    const deployResult = await deploy(contractName, {
        from: deployer,
        args,
        log: true,
        waitConfirmations: 1,
    });

    const abi = (await deployments.getArtifact(contractName)).abi

    let obj: any = {}
    if (contractName in contractConfig) {
      obj = contractConfig[contractName];
    } else {
      obj = {};
      contractConfig[contractName] = obj;
    }
    obj.abi = abi;
    if ("address" in obj) {
      obj.address[network.config.chainId] = deployResult.address;
    } else {
      obj.address = {};
      obj.address[network.config.chainId] = deployResult.address;
    }
    fse.writeFileSync("./src/config/contract.json", JSON.stringify(contractConfig, null, 2));
    
}

export default deployFunction
deployFunction.tags = [contractName]