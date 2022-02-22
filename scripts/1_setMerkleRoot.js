const newMerkleRoot = '0x169752f4056168b6e3fe958637366b916de99a0c6aa0c44a81a2a8e61606abad'; // mainnet, v2 WL feb22 11:50 AM

module.exports = async function main(callback) {
  try {
    const BasedVitalik = artifacts.require("BasedVitalik");
    const contract = await BasedVitalik.deployed();
    if (newMerkleRoot == '') {
      console.log('[!] You need to specify a merkle root hash.');
      callback(1);
    } else {
      await contract.setMerkleRoot(newMerkleRoot);
      console.log(`[+] Set new merkle root hash as: ${newMerkleRoot}`);
      callback(0);
    }
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
