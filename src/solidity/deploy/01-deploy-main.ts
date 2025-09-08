import {DeployFunction} from "hardhat-deploy/types"
import {HardhatRuntimeEnvironment} from "hardhat/types"
import fse from "fs-extra";

import contractConfig from "../../config/contract.json";

const { erc20Chains, contractName, erc20ContractName, erc20 } = contractConfig;

const deployFunction: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
  ) {
    
    const { deployments, getNamedAccounts, network, ethers } = hre;
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const networkId = network.config.chainId;

    let contract;
    let args;
    if (erc20Chains.includes(networkId?.toString())) {
      contract = erc20ContractName;
      let wethAddress = erc20.address[networkId?.toString()];
      args = [
        wethAddress,
        network.config.functionsRouter,
        network.config.donIdAddress,
        300000,
      ];
    } else {
      contract = contractName;
      args = [
        network.config.functionsRouter,
        network.config.donIdAddress,
        300000,
      ];
    }

    log(`准备部署到 ${network.name} 网络，部署参数：${args}`);

    const deployResult = await deploy(contract, {
        from: deployer,
        args,
        log: true,
        waitConfirmations: 1,
    });

    const abi = (await deployments.getArtifact(contract)).abi

    let obj: any = {}
    if (contract in contractConfig) {
      obj = contractConfig[contract];
    } else {
      obj = {};
      contractConfig[contract] = obj;
    }
    obj.abi = abi;
    if ("address" in obj) {
      obj.address[networkId] = deployResult.address;
    } else {
      obj.address = {};
      obj.address[networkId] = deployResult.address;
    }
    fse.writeFileSync("./src/config/contract.json", JSON.stringify(contractConfig, null, 2));
    
}

export default deployFunction
deployFunction.tags = [contractName]