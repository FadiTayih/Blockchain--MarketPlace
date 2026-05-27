import React, { Component } from "react";

class Navbar extends Component {
  render() {
    return (
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-2 shadow">
        <span className="navbar-brand mb-0 h1">Decentralized Marketplace</span>
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-block">
            <small className="text-white">
              {this.props.account
                ? `Wallet: ${this.props.account.substring(
                    0,
                    6,
                  )}...${this.props.account.substring(38)}`
                : "Not Connected"}
            </small>
          </li>
        </ul>
      </nav>
    );
  }
}

export default Navbar;
