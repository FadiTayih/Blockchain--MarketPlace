import React, { Component } from "react";
import Web3 from "web3";
import "./App.css";
import Marketplace from "../abis/MarketPlace.json";
import Navbar from "./Navbar";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: "",
      productCount: 0,
      products: [],
      loading: true,
      submitting: false,
      error: "",
      marketplace: null,
    };
  }

  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert("Please install MetaMask to use this marketplace.");
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    const networkId = await web3.eth.net.getId();
    const networkData = Marketplace.networks[networkId];

    if (!networkData) {
      window.alert("Marketplace contract not deployed on this network.");
      this.setState({ loading: false });
      return;
    }

    const marketplace = new web3.eth.Contract(
      Marketplace.abi,
      networkData.address,
    );
    this.setState({ marketplace });

    const productCount = await marketplace.methods.productCount().call();
    this.setState({ productCount: productCount.toNumber() });

    const products = [];
    for (let i = 1; i <= productCount; i++) {
      const product = await marketplace.methods.products(i).call();
      products.push({
        id: product.id,
        name: product.name,
        price: product.price,
        owner: product.owner,
        purchased: product.purchased,
      });
    }
    this.setState({ products, loading: false });
  }

  // Robust transaction sender using polling for the receipt
  sendTransaction = (method, options) => {
    return new Promise((resolve, reject) => {
      let transactionHash = null;
      let pollInterval = null;
      let timeout = null;

      const cleanUp = () => {
        if (pollInterval) clearInterval(pollInterval);
        if (timeout) clearTimeout(timeout);
      };

      // Start polling for the receipt once we have the hash
      const startPolling = (hash) => {
        transactionHash = hash;
        console.log("Transaction hash:", hash);
        const web3 = window.web3;
        pollInterval = setInterval(async () => {
          try {
            const receipt = await web3.eth.getTransactionReceipt(hash);
            if (receipt) {
              cleanUp();
              if (receipt.status === false || receipt.status === "0x0") {
                reject(new Error("Transaction failed on-chain"));
              } else {
                resolve(receipt);
              }
            }
          } catch (err) {
            // ignore network errors during polling
          }
        }, 1000);
      };

      // Set a timeout of 120 seconds to avoid waiting forever
      timeout = setTimeout(() => {
        cleanUp();
        reject(new Error("Transaction timed out. Please check MetaMask."));
      }, 120000);

      method
        .send(options)
        .on("transactionHash", startPolling)
        .on("error", (err) => {
          cleanUp();
          reject(err);
        });
    });
  };

  createProduct = async (name, price) => {
    this.setState({ submitting: true, error: "" });
    const priceInWei = window.web3.utils.toWei(price, "ether");
    try {
      const method = this.state.marketplace.methods.createProduct(
        name,
        priceInWei,
      );
      await this.sendTransaction(method, { from: this.state.account });
      await this.loadBlockchainData();
    } catch (err) {
      console.error("Error creating product:", err);
      this.setState({
        error: "Transaction failed. Check console for details.",
      });
    } finally {
      this.setState({ submitting: false });
    }
  };

  purchaseProduct = async (id, price) => {
    this.setState({ submitting: true, error: "" });
    try {
      const method = this.state.marketplace.methods.purchaseProduct(id);
      await this.sendTransaction(method, {
        from: this.state.account,
        value: price,
      });
      await this.loadBlockchainData();
    } catch (err) {
      console.error("Error purchasing product:", err);
      this.setState({
        error: "Transaction failed. Check console for details.",
      });
    } finally {
      this.setState({ submitting: false });
    }
  };

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-4">
          <div className="row">
            <main role="main" className="col-12">
              {this.state.loading ? (
                <div className="text-center mt-5">
                  <div className="spinner-border" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              ) : (
                <div>
                  {this.state.error && (
                    <div className="alert alert-danger">{this.state.error}</div>
                  )}
                  <AddProductForm
                    createProduct={this.createProduct}
                    submitting={this.state.submitting}
                  />
                  <ProductList
                    products={this.state.products}
                    account={this.state.account}
                    purchaseProduct={this.purchaseProduct}
                    submitting={this.state.submitting}
                  />
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    );
  }
}

class AddProductForm extends Component {
  constructor(props) {
    super(props);
    this.state = { name: "", price: "" };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.name && this.state.price) {
      this.props.createProduct(this.state.name, this.state.price);
      this.setState({ name: "", price: "" });
    }
  };

  render() {
    return (
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">List New Product</h5>
          <form onSubmit={this.handleSubmit}>
            <div className="form-row">
              <div className="col-md-6 mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Product Name"
                  value={this.state.name}
                  onChange={(e) => this.setState({ name: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-4 mb-2">
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="Price (ETH)"
                  value={this.state.price}
                  onChange={(e) => this.setState({ price: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={this.props.submitting}
                >
                  {this.props.submitting && (
                    <span
                      className="spinner-border spinner-border-sm mr-1"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  )}
                  Add
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

const ProductList = ({ products, account, purchaseProduct, submitting }) => {
  if (products.length === 0) {
    return <p className="text-center">No products listed yet.</p>;
  }

  return (
    <div className="row">
      {products.map((product) => (
        <div key={product.id} className="col-md-6 col-lg-4 mb-4">
          <div className="card product-card">
            <div className="card-body">
              <h5 className="card-title">{product.name}</h5>
              <p className="card-text">
                <strong>Price:</strong>{" "}
                {window.web3.utils.fromWei(product.price.toString(), "ether")}{" "}
                ETH
              </p>
              <p className="card-text">
                <strong>Seller:</strong>{" "}
                {product.owner.substring(0, 6) +
                  "..." +
                  product.owner.substring(38)}
              </p>
              <div className="mt-3">
                {product.purchased ? (
                  <span className="badge badge-secondary">Sold</span>
                ) : product.owner === account ? (
                  <span className="badge badge-info">Your Listing</span>
                ) : (
                  <button
                    className="btn btn-success btn-sm btn-block"
                    onClick={() => purchaseProduct(product.id, product.price)}
                    disabled={submitting}
                  >
                    {submitting && (
                      <span
                        className="spinner-border spinner-border-sm mr-1"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    )}
                    Buy Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default App;
