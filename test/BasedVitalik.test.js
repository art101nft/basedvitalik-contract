// test/BasedVitalik.test.js
const { expect } = require('chai');
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const BasedVitalik = artifacts.require('BasedVitalik');

// Start test block
contract('BasedVitalik', function ([owner, other]) {

  const unsetPrime = new BN('5867');
  const exampleURI = 'ipfs://myipfshash/';
  const examplePrime = new BN('911');

  beforeEach(async function () {
    this.bv = await BasedVitalik.new({from: owner});
  });

  // confirm default checks

  it('sales are paused upon launch', async function () {
    await expect(
      await this.bv.mintingIsActive()
    ).to.equal(false);
  });

  // ownership checks

  it('non owner cannot withdraw contract funds', async function () {
    await expectRevert(
      this.bv.withdraw({from: other}),
      'Ownable: caller is not the owner',
    );
  });

  it('non owner cannot set sale price', async function () {
    await expectRevert(
      this.bv.setSalePrice('80000000000000000', {from: other}),
      'Ownable: caller is not the owner',
    );
  });

  it('non owner cannot toggle minting state', async function () {
    await expectRevert(
      this.bv.toggleMinting({from: other}),
      'Ownable: caller is not the owner',
    );
  });

  it('non owner cannot toggle early access mode', async function () {
    await expectRevert(
      this.bv.toggleEarlyAccessMode({from: other}),
      'Ownable: caller is not the owner',
    );
  });

  it('non owner cannot set merkle root', async function () {
    await expectRevert(
      this.bv.setMerkleRoot('0x00', {from: other}),
      'Ownable: caller is not the owner',
    );
  });

  it('non owner cannot set the base URI', async function () {
    await expectRevert(
      this.bv.setBaseURI("ipfs://mynewhash", {from: other}),
      'Ownable: caller is not the owner',
    );
  });

  it('non owner cannot reserve vitaliks', async function () {
    await expectRevert(
      this.bv.reserveVitaliks({from: other}),
      'Ownable: caller is not the owner',
    );
  });

  // func checks

  it('toggleMinting function toggles mintingIsActive var', async function () {
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
  });

  it('toggleMinting function toggles mintingIsActive var', async function () {
    await expect(
      await this.bv.earlyAccessMode()
    ).to.equal(true);
    await this.bv.toggleEarlyAccessMode();
    await expect(
      await this.bv.earlyAccessMode()
    ).to.equal(false);
    await this.bv.toggleMinting();
    await expect(
      await this.bv.earlyAccessMode()
    ).to.equal(true);
  });

  it('setBaseURI function will set new metadata URI for NFTs', async function () {
    const _hash = 'ipfs://mynewhash';
    await this.bv.setBaseURI(_hash);
    await expect(
      await this.bv.tokenURI(1)
    ).to.equal(_hash + '1');
    await expect(
      await this.bv.tokenURI(2048)
    ).to.equal(_hash + '2048');
  });

  // checkTokenIsMinted func checks

  // it('checkTokenIsMinted function will return false for unminted token Ids', async function () {
  //   await expect(
  //     await this.bv.checkTokenIsMinted(1)
  //   ).to.equal(false);
  // });
  //
  // it('checkTokenIsMinted function will return true for minted token Ids', async function () {
  //   await this.bv.setRandPrime(examplePrime);
  //   await this.bv.mintItem(1, {value: 0});
  //   let tokenId = await this.bv.getTokenId(1);
  //   await expect(
  //     await this.bv.checkTokenIsMinted(tokenId)
  //   ).to.equal(true);
  // });
  //
  // it('checkTokenIsMinted function will revert if provided Id is outside of expected range', async function () {
  //   await expectRevert(
  //     this.bv.checkTokenIsMinted(2049),
  //     'Provided tokenId is not allowed'
  //   );
  // });
  //
  // // checkIndexIsMinted func checks
  //
  // it('checkIndexIsMinted function will return false for unminted token indexes', async function () {
  //   await expect(
  //     await this.bv.checkIndexIsMinted(1)
  //   ).to.equal(false);
  // });
  //
  // it('checkIndexIsMinted function will return true for minted token indexes', async function () {
  //   await this.bv.setRandPrime(examplePrime);
  //   await this.bv.mintItem(1, {value: 0});
  //   await expect(
  //     await this.bv.checkIndexIsMinted(1)
  //   ).to.equal(true);
  // });
  //
  // it('checkIndexIsMinted function will revert if provided index is outside of expected range', async function () {
  //   await expectRevert(
  //     this.bv.checkIndexIsMinted(2049),
  //     'Provided token index is not allowed'
  //   );
  // });
  //
  // // mintItem func checks
  //
  // it('mintItem function will revert if RAND_PRIME not set', async function () {
  //   await expectRevert(
  //     this.bv.mintItem(1, {value: 0}),
  //     'Random prime number has not been defined in the contract'
  //   );
  // });
  //
  // it('mintItem function will revert if mintingIsActive is false', async function () {
  //   await this.bv.setRandPrime(examplePrime);
  //   await this.bv.pauseSale();
  //   await expect(
  //     await this.bv.mintingIsActive()
  //   ).to.equal(false);
  //   await expectRevert(
  //     this.bv.mintItem(1, {value: 0}),
  //     'Sale must be active to mint items'
  //   );
  // });
  //
  // it('mintItem function will revert if numberOfTokens arg exceeds max', async function () {
  //   await this.bv.setRandPrime(examplePrime);
  //   await expectRevert(
  //     this.bv.mintItem(4, {value: 0}),
  //     'Can only mint 3 items at a time'
  //   );
  // });
  //
  // it('mintItem function will loop and mint appropriate amount of items', async function () {
  //   await this.bv.setRandPrime(examplePrime);
  //   await this.bv.mintItem(3, {value: 0})
  //   await expect(
  //     (await this.bv.totalSupply()).toString()
  //   ).to.equal('3');
  //   await this.bv.mintItem(3, {value: 0})
  //   await expect(
  //     (await this.bv.totalSupply()).toString()
  //   ).to.equal('6');
  //   await this.bv.mintItem(2, {value: 0})
  //   await expect(
  //     (await this.bv.totalSupply()).toString()
  //   ).to.equal('8');
  //   await this.bv.mintItem(1, {value: 0})
  //   await expect(
  //     (await this.bv.totalSupply()).toString()
  //   ).to.equal('9');
  // });
  //
  // it('mintItem function will mint only up to 2048 Items', async function () {
  //   this.timeout(0); // dont timeout for this long test
  //   await this.bv.setRandPrime(examplePrime);
  //   for (i = 0; i < 1024; i++) {
  //     let res = await this.bv.mintItem(2, {value: 0});
  //     let tokenIndex = (await this.bv.totalSupply()).toString();
  //     let tokenId = (await this.bv.getTokenId(tokenIndex)).toString();
  //     let timestamp = (await this.bv.TIMESTAMP()).toString();
  //     // console.log(`Minted token index ${tokenIndex} at ${tokenId}! Timestamp: ${timestamp} - Prime: ${examplePrime}`);
  //     await expectEvent(
  //       res, 'Transfer'
  //     );
  //   }
  //   await expect(
  //     (await this.bv.totalSupply()).toString()
  //   ).to.equal('2048');
  //   await expectRevert(
  //     this.bv.mintItem(1, {value: 0}),
  //     'Purchase would exceed max supply'
  //   );
  // });

});
