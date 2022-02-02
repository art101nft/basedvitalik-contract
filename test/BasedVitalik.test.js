// test/BasedVitalik.test.js
const { expect } = require('chai');
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const BasedVitalik = artifacts.require('BasedVitalik');
const { MerkleTree } = require('merkletreejs');
const abi = require('ethereumjs-abi');
const keccak256 = require('keccak256');

// Start test block
contract('BasedVitalik', function ([owner, other]) {

  beforeEach(async function () {
    this.bv = await BasedVitalik.new({from: owner});
  });

  it('sales are paused and early access mode is on by default', async function () {
    await expect(
      await this.bv.mintingIsActive()
    ).to.equal(false);
    await expect(
      await this.bv.earlyAccessMode()
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
  });

  it('set funcs work', async function () {
    // setBaseURI function will set new metadata URI for NFTs
    const _hash = 'ipfs://mynewhash';
    await this.bv.setBaseURI(_hash);
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
  })

  // it('early access mode w/ merkle root hash allows whitelist minting', async function () {
  //   const _val = new BN('0100000000000000000');
  //   const leaf1 = abi.rawEncode(
  //     [ "uint", "address", "uint"],
  //     [ 1, other, 5 ]
  //   )
  //   const leaves = ['0x' + leaf1, 2].map(v => keccak256(v));
  //   const tree = new MerkleTree(leaves, keccak256, { sort: true });
  //   const root = tree.getHexRoot();
  //   const leaf = keccak256(leaf1);
  //   const proof = tree.getHexProof(leaf);
  //   await this.bv.setMerkleRoot(root);
  //   await this.bv.toggleMinting();
  //   await this.bv.mintVitaliks(1, other, 5, proof, 1, {value: _val, from: other});
  //   await expect(
  //     (await this.bv.totalSupply()).toString()
  //   ).to.equal('1');
  // })


});
