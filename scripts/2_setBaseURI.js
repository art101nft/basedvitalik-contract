const newURI = 'ipfs://QmQX8hPac73HpdzBFVRghHJxiGnpB3bn9UERTnaGvJVswV/'; // revealed 0-600

module.exports = async function main(callback) {
  try {
    const BasedVitalik = artifacts.require("BasedVitalik");
    const contract = await BasedVitalik.deployed();
    if (newURI == '') {
      console.log('[!] You need to specify a metadata URI where assets can be loaded. ie: "ipfs://xxxxxx/"');
      callback(1);
    } else {
      await contract.setBaseURI(newURI);
      console.log(`[+] Set new contract base metadata URI as: ${newURI}`);
      callback(0);
    }
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
