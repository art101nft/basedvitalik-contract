const newPrice = '60000000000000000'; // .06

module.exports = async function main(callback) {
  try {
    const BasedVitalik = artifacts.require("BasedVitalik");
    const contract = await BasedVitalik.deployed();
    if (newPrice == '') {
      console.log('[!] You need to specify a new sale price.');
      callback(1);
    } else {
      await contract.setSalePrice(newPrice);
      console.log(`[+] Set new sale price to ${newPrice}`);
      callback(0);
    }
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
