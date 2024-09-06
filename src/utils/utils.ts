import { type UtxoI } from "mainnet-js"
import { hexToBin } from "@bitauth/libauth"
import type { ElectrumTokenData, TokenDataFT, TokenDataNFT } from "../interfaces/interfaces"

export function convertToUsd(satAmount: bigint, exchangeRate:number) {
  const newUsdValue =  Number(satAmount) * exchangeRate / 100_000_000
  return Number(newUsdValue.toFixed(2));
}

export function getAllNftTokenBalances(tokenUtxos: UtxoI[]){
  const result:Record<string, number> = {};
  const nftUtxos = tokenUtxos.filter((val) => val.token?.commitment !== undefined);
  for (const utxo of nftUtxos) {
    if(!utxo.token?.tokenId) return // should never happen
    if (!result[utxo.token.tokenId]) {
      result[utxo.token.tokenId] = 0;
    }
    result[utxo.token.tokenId] += 1;
  }
  return result
}

export function getFungibleTokenBalances(tokenUtxos: UtxoI[]){
  const result:Record<string, bigint> = {};
  const fungiblesUtxos = tokenUtxos.filter((val) => val.token?.amount);
  for (const utxo of fungiblesUtxos) {
    if(!utxo.token?.tokenId) return  // should never happen
    if (!result[utxo.token.tokenId]) {
      result[utxo.token?.tokenId] = 0n;
    }
    result[utxo.token?.tokenId] += utxo.token.amount;
  }
  return result
}

export function parseExtendedJson(jsonString: string){
  const uint8ArrayRegex = /^<Uint8Array: 0x(?<hex>[0-9a-f]*)>$/u;
  const bigIntRegex = /^<bigint: (?<bigint>[0-9]*)n>$/;

  return JSON.parse(jsonString, (_key, value) => {
    if (typeof value === "string") {
      const bigintMatch = value.match(bigIntRegex);
      if (bigintMatch) {
        return BigInt(bigintMatch[1]);
      }
      const uint8ArrayMatch = value.match(uint8ArrayRegex);
      if (uint8ArrayMatch) {
        return hexToBin(uint8ArrayMatch[1]);
      }
    }
    return value;
  })
}

export function convertElectrumTokenData(electrumTokenData: ElectrumTokenData | undefined){
  if(!electrumTokenData) return
  if(electrumTokenData.amount && BigInt(electrumTokenData.amount)){
    return {
      amount: BigInt(electrumTokenData.amount),
      tokenId: electrumTokenData.category,
    } as TokenDataFT
  }
  return {
    tokenId: electrumTokenData.category,
    nfts: [
      {
        token:{
          capability: electrumTokenData.nft?.capability,
          commitment: electrumTokenData.nft?.commitment
        }
      }
    ]
  } as TokenDataNFT
}