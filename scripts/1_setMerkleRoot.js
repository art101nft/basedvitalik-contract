const newMerkleRoot = '0x8501da64f72c51f13cbd97fa98a4e0920edf32585ae8dcf7e24731e32aabbefc'; // mainnet, v4 WL feb27 11:34 PM

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
