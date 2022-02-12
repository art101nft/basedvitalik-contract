const newURI = 'https://basedvitalik.io/metadata.json'; // last known good hash

module.exports = async function main(callback) {
  try {
    const BasedVitalik = artifacts.require("BasedVitalik");
    const contract = await BasedVitalik.deployed();
    if (newURI == '') {
      console.log('[!] You need to specify a contract URI where details can be loaded. ie: "ipfs://xxxxxx/"');
      callback(1);
    } else {
      await contract.setContractURI(newURI);
      console.log(`[+] Set new contract metadata URI as: ${newURI}`);
      callback(0);
    }
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
