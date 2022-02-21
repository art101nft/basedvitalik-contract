module.exports = async function main(callback) {
  try {
    const BasedVitalik = artifacts.require("BasedVitalik");
    const contract = await BasedVitalik.deployed();
    const merkleSet = await contract.merkleSet();
    const earlyAccessMode = await contract.earlyAccessMode();
    const mintingIsActive = await contract.mintingIsActive();
    const reservedVitaliks = await contract.reservedVitaliks();
    const placeholderMeta = await contract.placeholderMeta();
    const salePriceWei = await contract.salePrice();
    const salePriceEth = web3.utils.fromWei(salePriceWei);
    const maxSupply = await contract.maxSupply();
    const maxMints = await contract.maxMints();
    const baseURI = await contract.baseURI();
    const tokenURI = await contract.tokenURI(1);
    const _contractURI = await contract._contractURI();
    console.log(`[+] Mint info:`)
    console.log(`- contractAddress: ${contract.address}`);
    console.log(`- merkleSet: ${merkleSet}`);
    console.log(`- earlyAccessMode: ${earlyAccessMode}`);
    console.log(`- mintingIsActive: ${mintingIsActive}`);
    console.log(`- reservedVitaliks: ${reservedVitaliks}`);
    console.log(`- placeholderMeta: ${placeholderMeta}`);
    console.log(`- salePriceWei: ${salePriceWei}`);
    console.log(`- salePriceEth: ${salePriceEth}`);
    console.log(`- maxSupply: ${maxSupply}`);
    console.log(`- maxMints: ${maxMints}`);
    console.log(`- baseURI: ${baseURI}`);
    console.log(`- tokenURI(1): ${tokenURI}`);
    console.log(`- _contractURI: ${_contractURI}`);
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
