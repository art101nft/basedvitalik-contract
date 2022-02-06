module.exports = async function main(callback) {
  try {
    const BasedVitalik = artifacts.require("BasedVitalik");
    const contract = await BasedVitalik.deployed();
    await contract.withdraw();
    console.log(`[+] Withdrew contract balance into deployer wallet.`);
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
