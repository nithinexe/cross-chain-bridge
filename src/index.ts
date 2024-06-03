import { Squid } from "@0xsquid/sdk";
import { ethers } from "ethers";

// Environment
// add to a file named ".env" to prevent them being uploaded to github
import * as dotenv from "dotenv";
dotenv.config();
const polygonRpcEndpoint = process.env.POLYGON_RPC_ENDPOINT;
const privateKey = process.env.PRIVATE_KEY;

// addresses and IDs
const polygonId = 137;
const osmosisChainId = "osmosis-1";
const nativeToken = "0x750e4C4984a9e0f12978eA6742Bc1c5D248f40ed";
const usdcaxl = "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858";

// amount of axlusdc to send to osmosis
const amount = "100000";

const getSDK = () => {
  const squid = new Squid({
    baseUrl: "https://api.squidrouter.com",
  });
  return squid;
};

(async () => {
  // set up your RPC provider and signer
  const provider = new ethers.providers.JsonRpcProvider(polygonRpcEndpoint);
  const signer = new ethers.Wallet(privateKey, provider);

  // instantiate the SDK
  const squid = getSDK();
  // init the SDK
  await squid.init();
  console.log("Squid inited");

  const { route } = await squid.getRoute({
    // fromAddress: signer.address,
    toAddress: "osmo1r99s327vxfqzqgvpjpd2nhfthnmxyzparwlgl3",
    fromChain: polygonId,
    fromToken: nativeToken,
    fromAmount: amount,
    toChain: osmosisChainId,
    toToken: usdcaxl,
    slippage: 1,
  });

  console.log("Route: ", route);
  console.log("feeCosts: ", route.estimate.feeCosts);
  console.log("signer address, ", signer.address);
  console.log("signer balance, ", await signer.getBalance());

  const tx = (await squid.executeRoute({
    signer,
    route,
  })) as ethers.providers.TransactionResponse;

  const txReceipt = await tx.wait();

  const axelarScanLink =
    "https://axelarscan.io/gmp/" + txReceipt.transactionHash;

  console.log(
    "Finished! Please check Axelarscan for more details: ",
    axelarScanLink,
    "\n"
  );

  console.log(
    "Track status via API call to: https://api.squidrouter.com/v1/status?transactionId=" +
      txReceipt.transactionHash,
    "\n"
  );
})();