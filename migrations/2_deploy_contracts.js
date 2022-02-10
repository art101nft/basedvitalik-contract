var BasedVitalik = artifacts.require("BasedVitalik");

module.exports = function(deployer) {
  let addr;
  if (deployer.network == 'testnet') {
    console.log('[+] Using OpenSea testnet proxy address 0xf57b2c51ded3a29e6891aba85459d600256cf317');
    addr = '0xf57b2c51ded3a29e6891aba85459d600256cf317';
  } else {
    console.log('[+] Using OpenSea mainnet proxy address 0xa5409ec958c83c3f309868babaca7c86dcb077c1');
    addr = '0xa5409ec958c83c3f309868babaca7c86dcb077c1';
  }
  deployer.deploy(BasedVitalik, addr);
};
