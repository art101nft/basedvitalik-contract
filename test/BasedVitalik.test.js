// test/BasedVitalik.test.js
const fs = require('fs');
const { execSync } = require("child_process");
const { expect } = require('chai');
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const BasedVitalik = artifacts.require('BasedVitalik');

contract('BasedVitalik', function ([owner, other, other2, other3]) {

  let addresses;
  let proofs;
  let skipMint;
  if (process.env.SKIP == 'true') {
    skipMint = true;
  } else {
    skipMint = false;
  }
  const _buy1 = new BN('30000000000000000');
  const _buy2 = new BN('60000000000000000');
  const _buy3 = new BN('90000000000000000');
  const _buy5 = new BN('150000000000000000');
  const _buy6 = new BN('180000000000000000');
  const _buy10 = new BN('300000000000000000');
  const _buy20 = new BN('600000000000000000');
  const _buy30 = new BN('900000000000000000');
  const _buy31 = new BN('930000000000000000');
  const _buy70 = new BN('2100000000000000000');
  before(async function () {
    let addressesWhitelist = new Object();
    addressesWhitelist[other] = "100";
    addressesWhitelist[other2] = "20";
    addressesWhitelist[other3] = "10";

    fs.writeFileSync(
      "./output.json",
      JSON.stringify(addressesWhitelist),
      "utf8"
    );

    execSync(
      `go-merkle-distributor --json-file=output.json --output-file=proofs.json`,
      {
        stdio: "inherit",
      }
    );

    proofs = JSON.parse(fs.readFileSync("proofs.json", "utf8"));
    addresses = Object.keys(proofs);
  });

  beforeEach(async function () {
    this.bv = await BasedVitalik.new("0xf57b2c51ded3a29e6891aba85459d600256cf317", {from: owner});
  });

  after(() => {
    fs.unlinkSync("proofs.json");
    fs.unlinkSync("output.json");
  });

  it('sales are paused and early access mode is on by default', async function () {
    await expect(
      await this.bv.mintingIsActive()
    ).to.equal(false);
    await expect(
      await this.bv.earlyAccessMode()
    ).to.equal(true);
    await expect(
      await this.bv.placeholderMeta()
    ).to.equal(true);
  });

  it('ownership required for key functions', async function () {
    await expectRevert(
      this.bv.withdraw({from: other}),
      'Ownable: caller is not the owner',
    );
    await expectRevert(
      this.bv.setSalePrice('80000000000000000', {from: other}),
      'Ownable: caller is not the owner',
    );
    await expectRevert(
      this.bv.toggleMinting({from: other}),
      'Ownable: caller is not the owner',
    );
    await expectRevert(
      this.bv.toggleEarlyAccessMode({from: other}),
      'Ownable: caller is not the owner',
    );
    await expectRevert(
      this.bv.togglePlaceholder({from: other}),
      'Ownable: caller is not the owner',
    );
    await expectRevert(
      this.bv.setBaseURI("ipfs://mynewhash", {from: other}),
      'Ownable: caller is not the owner',
    );
    await expectRevert(
      this.bv.setMerkleRoot('0x00', {from: other}),
      'Ownable: caller is not the owner',
    );
    await expectRevert(
      this.bv.reserveVitaliks({from: other}),
      'Ownable: caller is not the owner',
    );
  });

  it('toggles work', async function () {
    // toggleMinting function toggles mintingIsActive var
    await expect(
      await this.bv.mintingIsActive()
    ).to.equal(false);
    await this.bv.toggleMinting();
    await expect(
      await this.bv.mintingIsActive()
    ).to.equal(true);
    await this.bv.toggleMinting();
    await expect(
      await this.bv.mintingIsActive()
    ).to.equal(false);
    // toggleEarlyAccessMode function toggles earlyAccessMode var
    await expect(
      await this.bv.earlyAccessMode()
    ).to.equal(true);
    await this.bv.toggleEarlyAccessMode();
    await expect(
      await this.bv.earlyAccessMode()
    ).to.equal(false);
    await this.bv.toggleEarlyAccessMode();
    await expect(
      await this.bv.earlyAccessMode()
    ).to.equal(true);
    // togglePlaceholder function toggles placeholderMeta var
    await expect(
      await this.bv.placeholderMeta()
    ).to.equal(true);
    await this.bv.togglePlaceholder();
    await expect(
      await this.bv.placeholderMeta()
    ).to.equal(false);
    await this.bv.togglePlaceholder();
    await expect(
      await this.bv.placeholderMeta()
    ).to.equal(true);
  });

  it('set funcs work', async function () {
    // setBaseURI function will set new metadata URI for NFTs
    const _hash = 'ipfs://mynewhash/';
    await this.bv.setBaseURI(_hash);
    await expect(
      await this.bv.tokenURI(1)
    ).to.equal(_hash);
    await this.bv.togglePlaceholder();
    await expect(
      await this.bv.tokenURI(1)
    ).to.equal(_hash + '1');
    await expect(
      await this.bv.tokenURI(2048)
    ).to.equal(_hash + '2048');
    // setSalePrice function updates the price
    const _price = '80000000000000000';
    await this.bv.setSalePrice(_price);
    await expect(
      await this.bv.salePrice()
    ).to.be.bignumber.equal(_price);
    // setMerkleRoot function sets merkle root
    const _merkle = '0x0000000000000000000000000000000000000000000000000000000000000000';
    await expect(
      await this.bv.merkleSet()
    ).to.equal(false);
    await this.bv.setMerkleRoot(_merkle);
    await expect(
      await this.bv.merkleSet()
    ).to.equal(true);
  });

  it('reserve func works once and mints 40 to owner', async function () {
    const _gas = await this.bv.reserveVitaliks.estimateGas();
    const _gasEth = web3.utils.fromWei(web3.utils.toWei(new BN(_gas.toString()), 'gwei'), 'ether');
    console.log(`[+] Estimates show reserving 40 vitaliks will require ${_gas} gas. At 150 gwei this transaction would cost ${_gasEth * 150} ETH`);
    await this.bv.reserveVitaliks();
    await expect(
      (await this.bv.totalSupply()).toString()
    ).to.equal('40');
    await expect(
      await this.bv.reservedVitaliks()
    ).to.equal(true);
    await this.bv.reserveVitaliks();
    await expect(
      (await this.bv.totalSupply()).toString()
    ).to.equal('40');
  });

  it('early access mode w/ merkle root hash allows whitelist minting', async function () {
    let root = proofs.root.Proof[0];
    await this.bv.setMerkleRoot(root);
    await this.bv.toggleMinting();
    const _gas1 = await this.bv.mintVitaliks.estimateGas(
      proofs[other].Index,
      other,
      proofs[other].Amount,
      proofs[other].Proof,
      1, {value: _buy1, from: other}
    );
    const _gasEth1 = web3.utils.fromWei(web3.utils.toWei(new BN(_gas1.toString()), 'gwei'), 'ether');
    console.log(`[+] Estimates show minting 1 during early access mode (w/ merkle proof validation) will require ${_gas1} gas. At 150 gwei this transaction would cost ${_gasEth1 * 150} ETH`);
    const _gas2 = await this.bv.mintVitaliks.estimateGas(
      proofs[other].Index,
      other,
      proofs[other].Amount,
      proofs[other].Proof,
      2, {value: _buy2, from: other}
    );
    const _gasEth2 = web3.utils.fromWei(web3.utils.toWei(new BN(_gas2.toString()), 'gwei'), 'ether');
    console.log(`[+] Estimates show minting 2 during early access mode (w/ merkle proof validation) will require ${_gas2} gas. At 150 gwei this transaction would cost ${_gasEth2 * 150} ETH`);
    const _gas10 = await this.bv.mintVitaliks.estimateGas(
      proofs[other].Index,
      other,
      proofs[other].Amount,
      proofs[other].Proof,
      10, {value: _buy10, from: other}
    );
    const _gasEth10 = web3.utils.fromWei(web3.utils.toWei(new BN(_gas10.toString()), 'gwei'), 'ether');
    console.log(`[+] Estimates show minting 10 during early access mode (w/ merkle proof validation) will require ${_gas10} gas. At 150 gwei this transaction would cost ${_gasEth10 * 150} ETH`);
    const _gas20 = await this.bv.mintVitaliks.estimateGas(
      proofs[other].Index,
      other,
      proofs[other].Amount,
      proofs[other].Proof,
      20, {value: _buy20, from: other}
    );
    const _gasEth20 = web3.utils.fromWei(web3.utils.toWei(new BN(_gas20.toString()), 'gwei'), 'ether');
    console.log(`[+] Estimates show minting 20 during early access mode (w/ merkle proof validation) will require ${_gas20} gas. At 150 gwei this transaction would cost ${_gasEth20 * 150} ETH`);
    const _gas70 = await this.bv.mintVitaliks.estimateGas(
      proofs[other].Index,
      other,
      proofs[other].Amount,
      proofs[other].Proof,
      70, {value: _buy70, from: other}
    );
    const _gasEth70 = web3.utils.fromWei(web3.utils.toWei(new BN(_gas70.toString()), 'gwei'), 'ether');
    console.log(`[+] Estimates show minting 70 during early access mode (w/ merkle proof validation) will require ${_gas70} gas. At 150 gwei this transaction would cost ${_gasEth70 * 150} ETH`);
    await this.bv.mintVitaliks(
      proofs[other].Index,
      other,
      proofs[other].Amount,
      proofs[other].Proof,
      1, {value: _buy1, from: other}
    );
    await expect(
      (await this.bv.totalSupply()).toString()
    ).to.equal('1');
    await expectRevert(
      this.bv.mintVitaliks(0, owner, 0, [], 1, {value: _buy1, from: owner}),
      'Invalid merkle proof.',
    );
    // mint 10 with other3 wallet
    await this.bv.mintVitaliks(
      proofs[other3].Index,
      other3,
      proofs[other3].Amount,
      proofs[other3].Proof,
      10, {value: _buy10, from: other3}
    );
    console.log(`[+] Amount minted during whitelist for ${other3}: ${await this.bv.earlyAccessMinted(other3)}`)
    // transfer all 10 to other wallet
    for (i = 1; i < 11; i++) {
      await this.bv.transferFrom(other3, other2, i, {from: other3});
      console.log(`[+] Transferred tokenID ${i} from ${other3} to ${other2}. New balance is ${await this.bv.balanceOf(other3)}`)
    }
    await expect(
      (await this.bv.totalSupply()).toString()
    ).to.equal('11');
    console.log(`[+] Amount minted during whitelist for ${other3} despite transferring: ${await this.bv.earlyAccessMinted(other3)}`)
    // mint 10 more with other3 wallet - should fail
    console.log(`[+] Minting 10 more vitaliks to ${other3} despite transferring should fail`);
    await expectRevert(
      this.bv.mintVitaliks(
        proofs[other3].Index,
        other3,
        proofs[other3].Amount,
        proofs[other3].Proof,
        10, {value: _buy10, from: other3}
      ),
      'Cannot exceed amount whitelisted during early access mode.',
    );
    // still 11 supply, still 10 tracked for other3 wallet
    await expect(
      (await this.bv.totalSupply()).toString()
    ).to.equal('11');
    await expect(
      (await this.bv.earlyAccessMinted(other3)).toString()
    ).to.equal('10');
  });

  it('minting works', async function () {
    await this.bv.toggleMinting();
    await this.bv.toggleEarlyAccessMode();
    const _gas1 = await this.bv.mintVitaliks.estimateGas(0, other, 0, [], 1, {value: _buy1, from: other});
    const _gas2 = await this.bv.mintVitaliks.estimateGas(0, other, 0, [], 2, {value: _buy2, from: other});
    const _gas3 = await this.bv.mintVitaliks.estimateGas(0, other, 0, [], 3, {value: _buy3, from: other});
    const _gas5 = await this.bv.mintVitaliks.estimateGas(0, other, 0, [], 5, {value: _buy5, from: other});
    const _gas30 = await this.bv.mintVitaliks.estimateGas(0, other, 0, [], 30, {value: _buy30, from: other});
    const _gasEth1 = web3.utils.fromWei(web3.utils.toWei(new BN(_gas1.toString()), 'gwei'), 'ether');
    console.log(`[+] Estimates show minting 1 during public mint (w/o merkle proof validation) will require ${_gas1} gas. At 150 gwei this transaction would cost ${_gasEth1 * 150} ETH`);
    const _gasEth2 = web3.utils.fromWei(web3.utils.toWei(new BN(_gas2.toString()), 'gwei'), 'ether');
    console.log(`[+] Estimates show minting 2 during public mint (w/o merkle proof validation) will require ${_gas2} gas. At 150 gwei this transaction would cost ${_gasEth2 * 150} ETH`);
    const _gasEth3 = web3.utils.fromWei(web3.utils.toWei(new BN(_gas3.toString()), 'gwei'), 'ether');
    console.log(`[+] Estimates show minting 3 during public mint (w/o merkle proof validation) will require ${_gas3} gas. At 150 gwei this transaction would cost ${_gasEth3 * 150} ETH`);
    const _gasEth5 = web3.utils.fromWei(web3.utils.toWei(new BN(_gas5.toString()), 'gwei'), 'ether');
    console.log(`[+] Estimates show minting 5 during public mint (w/o merkle proof validation) will require ${_gas5} gas. At 150 gwei this transaction would cost ${_gasEth5 * 150} ETH`);
    const _gasEth30 = web3.utils.fromWei(web3.utils.toWei(new BN(_gas30.toString()), 'gwei'), 'ether');
    console.log(`[+] Estimates show minting 30 during public mint (w/o merkle proof validation) will require ${_gas30} gas. At 150 gwei this transaction would cost ${_gasEth30 * 150} ETH`);
    await this.bv.mintVitaliks(0, other, 0, [], 1, {value: _buy1, from: other});
    await expect(
      (await this.bv.totalSupply()).toString()
    ).to.equal('1');
    await this.bv.mintVitaliks(0, other, 0, [], 2, {value: _buy2, from: other});
    await expect(
      (await this.bv.totalSupply()).toString()
    ).to.equal('3');
    await expectRevert(
      this.bv.mintVitaliks(0, other, 0, [], 4, {value: _buy5, from: other}),
      'Incorrect Ether supplied for the number of tokens requested.',
    );
    await expectRevert(
      this.bv.mintVitaliks(0, other, 0, [], 31, {value: _buy31, from: other}),
      'Cannot mint more than 30 per tx during public sale.',
    );
  });

  it('minting supply will halt minting', async function() {
    // Minting should not be active and early access mode is on by default
    await expect(
      await this.bv.mintingIsActive()
    ).to.equal(false);
    await expect(
      await this.bv.earlyAccessMode()
    ).to.equal(true);
    // Toggle minting and early access mode
    await this.bv.toggleMinting();
    await this.bv.toggleEarlyAccessMode();
    // Minting/early access should now be on/off
    await expect(
      await this.bv.mintingIsActive()
    ).to.equal(true);
    await expect(
      await this.bv.earlyAccessMode()
    ).to.equal(false);
    if (!skipMint) {
      // Mint all 4962
      for (i = 0; i < 165; i++) {
        await this.bv.mintVitaliks(0, other, 0, [], 30, {value: _buy30, from: other});
      }
      await this.bv.mintVitaliks(0, other, 0, [], 6, {value: _buy6, from: other});
      await this.bv.mintVitaliks(0, other, 0, [], 6, {value: _buy6, from: other});
      await expect(
        (await this.bv.totalSupply()).toString()
      ).to.equal('4962');
      // Minting should no longer be active
      await expect(
        await this.bv.mintingIsActive()
      ).to.equal(false);
      // Should not be able to mint more
      await expectRevert(
        this.bv.mintVitaliks(0, other, 0, [], 1, {value: _buy1, from: other}),
        'Minting is not active.',
      );
    }
  })


});
