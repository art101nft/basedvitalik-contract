const newMerkleRoot = '0xb57718b579f31cd59f3025aad8e9c7a706086a7ca72750958c4b47ac1b29dc81'; // mainnet, v3 WL feb22 4:11 PM

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
