import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with:", deployer.address);
    console.log("Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

    const megapotAddress = process.env.MEGAPOT_ADDRESS || ethers.ZeroAddress;
    const feeRecipient = deployer.address;

    console.log("\n1. Deploying GEM token...");
    const maxMintPerBlock = ethers.parseEther("10000");
    const gem = await ethers.deployContract("GEM", [deployer.address, maxMintPerBlock]);
    await gem.waitForDeployment();
    const gemAddress = await gem.getAddress();
    console.log("GEM deployed to:", gemAddress);

    console.log("\n2. Deploying MegapotMining hook...");
    const megapotMining = await ethers.deployContract("MegapotMining", [
        megapotAddress,
        ethers.ZeroAddress
    ]);
    await megapotMining.waitForDeployment();
    const megapotMiningAddress = await megapotMining.getAddress();
    console.log("MegapotMining deployed to:", megapotMiningAddress);

    console.log("\n3. Deploying ConfidentialMiningGrid...");
    const miningGrid = await ethers.deployContract("ConfidentialMiningGrid", [
        gemAddress,
        megapotMiningAddress,
        feeRecipient
    ]);
    await miningGrid.waitForDeployment();
    const miningGridAddress = await miningGrid.getAddress();
    console.log("ConfidentialMiningGrid deployed to:", miningGridAddress);

    const deployment = {
        network: "baseSepolia",
        chainId: 84532,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            GEM: gemAddress,
            MegapotMining: megapotMiningAddress,
            ConfidentialMiningGrid: miningGridAddress
        },
        constructorArgs: {
            GEM: [deployer.address, maxMintPerBlock.toString()],
            MegapotMining: [process.env.MEGAPOT_ADDRESS || ethers.ZeroAddress, miningGridAddress],
            ConfidentialMiningGrid: [gemAddress, megapotMiningAddress, feeRecipient]
        }
    };

    const deployDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deployDir)) fs.mkdirSync(deployDir, { recursive: true });
    const deployFile = path.join(deployDir, `baseSepolia-${Date.now()}.json`);
    fs.writeFileSync(deployFile, JSON.stringify(deployment, null, 2));

    console.log("\n✅ Deployment complete!");
    console.log("\n--- CONTRACT ADDRESSES ---");
    console.log(`GEM: ${gemAddress}`);
    console.log(`MegapotMining: ${megapotMiningAddress}`);
    console.log(`ConfidentialMiningGrid: ${miningGridAddress}`);
    console.log(`\nDeployment saved to: ${deployFile}`);

    console.log("\n--- VERIFICATION COMMANDS ---");
    console.log(`npx hardhat verify --network baseSepolia ${gemAddress} "${deployer.address}" ${maxMintPerBlock}`);
    console.log(`npx hardhat verify --network baseSepolia ${megapotMiningAddress} "${process.env.MEGAPOT_ADDRESS || ethers.ZeroAddress}" "${miningGridAddress}"`);
    console.log(`npx hardhat verify --network baseSepolia ${miningGridAddress} "${gemAddress}" "${megapotMiningAddress}" "${feeRecipient}"`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});