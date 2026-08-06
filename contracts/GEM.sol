// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GEM is ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 21_000_000 * 10**18;
    uint256 public immutable MAX_MINT_PER_BLOCK;

    constructor(address initialOwner, uint256 _maxMintPerBlock) Ownable(initialOwner) ERC20("GemHaven", "GEM") {
        MAX_MINT_PER_BLOCK = _maxMintPerBlock;
    }

    function mintReward(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply reached");
        require(amount <= MAX_MINT_PER_BLOCK, "Exceeds max mint per block");
        _mint(to, amount);
    }

    function buybackAndBurn(uint256 ethAmount) external onlyOwner {
        uint256 gemBalance = balanceOf(address(this));
        uint256 burnAmount = gemBalance > ethAmount ? ethAmount : gemBalance;
        if (burnAmount > 0) {
            _burn(address(this), burnAmount);
        }
    }

    function withdrawEth() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function withdrawGem(address to) external onlyOwner {
        uint256 bal = balanceOf(address(this));
        _transfer(address(this), to, bal);
    }

    receive() external payable {}
}