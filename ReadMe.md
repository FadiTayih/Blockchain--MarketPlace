# Decentralized Marketplace

A peer-to-peer marketplace dApp built on Ethereum. Sellers list products with a name and price; buyers purchase them directly via smart contract. Built with Solidity, Truffle, React, and Web3.js.

## Features

- **Create Product** – List a new item with name and price (ETH).
- **Purchase Product** – Buy any listed item by sending Ether; contract validates payment, prevents self-purchase, and transfers ownership.
- **Automated Payments** – Ether is automatically forwarded to the seller upon successful purchase.
- **Event-Driven Updates** – All actions emit blockchain events, enabling real‑time UI refresh.
- **Full Validation** – Prevents empty names, zero prices, duplicate purchases, and buyers buying their own listings.
- **Responsive UI** – Clean, modern frontend with instant transaction feedback.

## Tech Stack

| Layer         | Technology                                     |
| ------------- | ---------------------------------------------- |
| Blockchain    | Ethereum (Solidity ^0.5.0)                     |
| Dev Framework | [Truffle](https://www.trufflesuite.com/) 5.0.5 |
| Testing       | Mocha, Chai, chai-as-promised                  |
| Frontend      | React 16.8, Web3.js 1.0.0-beta.55              |
| Styling       | Bootstrap 4.3.1 + custom CSS                   |
| Wallet        | MetaMask                                       |
| Local Chain   | Ganache (port 7545)                            |

## Project Structure

├── src
│ ├── abis/ # Compiled contract ABIs
│ ├── contracts/ # Solidity smart contracts
│ │ ├── MarketPlace.sol
│ │ └── Migrations.sol
│ └── components/ # React frontend
│ ├── App.js
│ ├── App.css
│ └── Navbar.js
├── test/ # Truffle tests
│ └── MarketPlace.test.js
├── migrations/ # Deployment scripts
├── truffle-config.js # Truffle configuration
├── package.json
└── README.md

text

## Prerequisites

- [Node.js](https://nodejs.org/) (v12 or later recommended)
- [Truffle](https://www.trufflesuite.com/truffle) (`npm install -g truffle`)
- [Ganache](https://www.trufflesuite.com/ganache) (GUI or CLI)
- [MetaMask](https://metamask.io/) browser extension

## Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   Install dependencies
   ```

bash
npm install
Start Ganache

Ensure Ganache is running on http://127.0.0.1:7545 (default Truffle development network).

Compile and migrate smart contracts

bash
truffle compile
truffle migrate
Run the frontend

bash
npm run start
Connect MetaMask

Add Ganache as a custom RPC network (http://localhost:7545, chain ID 1337).

Import a Ganache account using its private key.

License
This project is licensed under the MIT License.
