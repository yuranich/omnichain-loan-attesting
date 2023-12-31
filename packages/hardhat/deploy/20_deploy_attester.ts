import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { NetAddrs } from "../config/addresses.config"
import { ethers, tenderly } from "hardhat"

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const lzAttester: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
    const { deployer } = await hre.getNamedAccounts()
    const { deploy } = hre.deployments
    const easAddr = NetAddrs[hre.network.name].EAS || ethers.constants.AddressZero
    const schemaUid = NetAddrs[hre.network.name].CREDIT_REPORT_SCHEMA || ethers.constants.HashZero
    const lzEndpoint = NetAddrs[hre.network.name].LZ_ENDPOINT || ethers.constants.AddressZero
    const lzDestChain = NetAddrs[hre.network.name].LZ_DEST_CHAIN

    await deploy("OmnichainLoanAttester", {
        from: deployer,
        // Contract constructor arguments
        args: [easAddr, schemaUid, lzEndpoint, lzDestChain],
        log: true,
        // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
        // automatically mining the contract deployment transaction. There is no effect on live networks.
        autoMine: true,
    })

    const attester = await hre.ethers.getContract("OmnichainLoanAttester", deployer)

    await tenderly.verify({
        name: "OmnichainLoanAttester",
        address: attester.address,
    })
}

export default lzAttester

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
lzAttester.tags = ["OmnichainLoanAttester"]
