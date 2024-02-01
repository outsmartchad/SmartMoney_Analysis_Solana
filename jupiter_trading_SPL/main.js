import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";
import fetch from "cross-fetch";
import { Wallet } from "@project-serum/anchor";
import bs58 from "bs58";
const Helius_API_Key = "448fa184-4e3c-419b-a456-e9fd6889b659";
const RPC = "";
const Connection = new Connection(
  "https://mainnet.helius-rpc.com/?api-key=" + Helius_API_Key
);
const Wallet = new Wallet(
  Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || ""))
);

print(process.env.PRIVATE_KEY);
