module.exports = async function main(callback) {
  try {
    const BasedVitalik = artifacts.require("BasedVitalik");
    const contract = await BasedVitalik.deployed();
    const earlyAccessMode = await contract.earlyAccessMode();
    console.log(`[+] Toggling earlyAccessMode. Currently: ${earlyAccessMode}`);
    if (earlyAccessMode) {
      await contract.toggleEarlyAccessMode();
      console.log(`Early access mode disabled!`);
    } else {
      await contract.toggleEarlyAccessMode();
      console.log(`Early access mode enabled!`);
    }
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
