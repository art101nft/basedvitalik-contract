module.exports = async function main(callback) {
  try {
    const BasedVitalik = artifacts.require("BasedVitalik");
    const contract = await BasedVitalik.deployed();
    await contract.reserveVitaliks();
    console.log(`Minted reserved Vitaliks to contract deployer`);
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
