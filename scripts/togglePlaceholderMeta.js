module.exports = async function main(callback) {
  try {
    const BasedVitalik = artifacts.require("BasedVitalik");
    const contract = await BasedVitalik.deployed();
    await contract.togglePlaceholder();
    console.log(`[+] Placeholder meta is toggled, now ${await contract.placeholderMeta()}`);
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
