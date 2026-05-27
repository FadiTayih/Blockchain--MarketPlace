// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

contract MarketPlace {
    string public name;
    uint public productCount = 0;
    mapping(uint => Product) public products;

    struct Product {
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    event ProductCreated(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    event ProductPurchased(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    constructor() public {
        name = "MarketPlace";
    }

    function createProduct(string memory _name, uint _price) public {
        require(bytes(_name).length > 0, "Product name cannot be empty");
        require(_price > 0, "Product price must be greater than 0");

        productCount++;
        products[productCount] = Product(productCount, _name, _price, msg.sender, false);
        emit ProductCreated(productCount, _name, _price, msg.sender, false);
    }

    function purchaseProduct(uint _id) public payable {
        // Check that product exists
        require(_id > 0 && _id <= productCount, "Invalid product ID");
        Product memory _product = products[_id];
        address payable _seller = _product.owner;

        require(msg.value >= _product.price, "Insufficient Ether sent");
        require(!_product.purchased, "Product already purchased");
        require(_seller != msg.sender, "Seller cannot buy own product");

        // Update product state
        _product.owner = msg.sender;
        _product.purchased = true;
        products[_id] = _product;

        // Transfer Ether to seller
        _seller.transfer(msg.value);

        // Emit event with correct product ID
        emit ProductPurchased(_id, _product.name, _product.price, msg.sender, true);
    }
}