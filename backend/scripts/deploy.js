const hre = require("hardhat");

async function main() {
  console.log("Đang deploy PharmaSupplyChain contract...");

  // Lấy contract factory
  const PharmaSupplyChain = await hre.ethers.getContractFactory(
    "PharmaSupplyChain"
  );

  // Deploy contract
  const pharmaSupplyChain = await PharmaSupplyChain.deploy();

  await pharmaSupplyChain.waitForDeployment();

  const address = await pharmaSupplyChain.getAddress();

  console.log("PharmaSupplyChain deployed to:", address);
  console.log("\nLưu địa chỉ contract này vào file React app!");
  console.log("Contract address:", address);

  // Tạo file config để React app sử dụng
  const fs = require("fs");
  const config = {
    contractAddress: address,
    networkId: 5777, // Ganache default network ID
    rpcUrl: "http://127.0.0.1:7545",
  };

  fs.writeFileSync(
    "../frontend/src/config.json",
    JSON.stringify(config, null, 2)
  );

  console.log("\nĐã tạo file config.json trong thư mục frontend/src/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
