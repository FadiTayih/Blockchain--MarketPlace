const MarketPlace = artifacts.require("./MarketPlace.sol");

require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("MarketPlace", ([deployer, seller, buyer]) => {
  let marketPlace;

  before(async () => {
    marketPlace = await MarketPlace.deployed();
  });

  describe("deployment", () => {
    it("deploys succesfully", async () => {
      const address = await marketPlace.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it("has a name", async () => {
      const name = await marketPlace.name();
      assert.equal(name, "MarketPlace");
    });
  });

  describe("product", () => {
    let result, productCount;

    before(async () => {
      result = await marketPlace.createProduct(
        "Iphone",
        web3.utils.toWei("1", "Ether"),
        { from: seller },
      );
      productCount = await marketPlace.productCount();
    });

    it("create products", async () => {
      // Success
      assert.equal(productCount, 1);
      const event = result.logs[0].args;
      assert.equal(
        event.id.toNumber(),
        productCount.toNumber(),
        "Id is correct",
      );
      assert.equal(event.name, "Iphone", " is correct");
      assert.equal(event.price, "1000000000000000000", "price is correct");
      assert.equal(event.owner, seller, "owner is correct");
      assert.equal(event.purchased, false, "purchase is correct");

      // Failure: Product must have a name
      await marketPlace.createProduct("", web3.utils.toWei("1", "Ether"), {
        from: seller,
      }).should.be.rejected;

      // Failure: Product must have a price
      await marketPlace.createProduct("Iphone", 0, {
        from: seller,
      }).should.be.rejected;
    });

    it("list products", async () => {
      const product = await marketPlace.products(productCount);

      assert.equal(
        product.id.toNumber(),
        productCount.toNumber(),
        "Id is correct",
      );
      assert.equal(product.name, "Iphone", " is correct");
      assert.equal(product.price, "1000000000000000000", "price is correct");
      assert.equal(product.owner, seller, "owner is correct");
      assert.equal(product.purchased, false, "purchase is correct");
    });

    it("sells products", async () => {
      // Track the seller balance before purchase
      let oldSellerBalance;
      oldSellerBalance = await web3.eth.getBalance(seller);
      oldSellerBalance = new web3.utils.BN(oldSellerBalance);

      // Success buyer makes a purchase
      result = await marketPlace.purchaseProduct(productCount, {
        from: buyer,
        value: web3.utils.toWei("1", "Ether"),
      });

      // Checking the logs
      const event = result.logs[0].args;
      assert.equal(
        event.id.toNumber(),
        productCount.toNumber(),
        "Id is correct",
      );
      assert.equal(event.name, "Iphone", " is correct");
      assert.equal(event.price, "1000000000000000000", "price is correct");
      assert.equal(event.owner, buyer, "owner is correct");
      assert.equal(event.purchased, true, "purchase is correct");

      // check that the seller recieved the funds
      let newSellerBalance;
      newSellerBalance = await web3.eth.getBalance(seller);
      newSellerBalance = new web3.utils.BN(newSellerBalance);

      let price;
      price = web3.utils.toWei("1", "Ether");
      price = new web3.utils.BN(price);

      const expectedBalance = oldSellerBalance.add(price);

      assert.equal(newSellerBalance.toString(), expectedBalance.toString());

      // Failure: Tried to buy a product that does not exits
      await marketPlace.purchaseProduct(99, {
        from: buyer,
        value: web3.utils.toWei("1", "Ether"),
      }).should.be.rejected;

      // Failure: tried to buy a product without enough Ether
      await marketPlace.purchaseProduct(productCount, {
        from: buyer,
        value: web3.utils.toWei("0.5", "Ether"),
      }).should.be.rejected;

      // Failure: Deployer tries to buy (already purchased)
      await marketPlace.purchaseProduct(productCount, {
        from: deployer,
        value: web3.utils.toWei("1", "Ether"),
      }).should.be.rejected;

      // Failure: Buyer tried to buy the product twice
      await marketPlace.purchaseProduct(productCount, {
        from: buyer,
        value: web3.utils.toWei("1", "Ether"),
      }).should.be.rejected;
    });
  });
});
