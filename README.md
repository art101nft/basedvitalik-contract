# vitalik-contract
Smart contract for Based Vitalik NFT drop


# Scripts

### mainnet

npx truffle exec --network mainnet scripts/1_setMerkleRoot.js;
npx truffle exec --network mainnet scripts/2_setBaseURI.js;
npx truffle exec --network mainnet scripts/togglePlaceholderMeta.js;
npx truffle exec --network mainnet scripts/3_setContractURI.js;
npx truffle exec --network mainnet scripts/4_reserveVitaliks.js;
npx truffle exec --network mainnet scripts/5_toggleMinting.js;
npx truffle exec --network mainnet scripts/6_setSalePrice.js;
npx truffle exec --network mainnet scripts/7_toggleEarlyAccessMode.js;

### testnet

npx truffle exec --network testnet scripts/1_setMerkleRoot.js;
npx truffle exec --network testnet scripts/2_setBaseURI.js;
npx truffle exec --network testnet scripts/togglePlaceholderMeta.js;
npx truffle exec --network testnet scripts/3_setContractURI.js;
npx truffle exec --network testnet scripts/4_reserveVitaliks.js;
npx truffle exec --network testnet scripts/5_toggleMinting.js;
npx truffle exec --network testnet scripts/6_setSalePrice.js;
npx truffle exec --network testnet scripts/7_toggleEarlyAccessMode.js;
