// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IMegapot {
    function mintTicket(address user) external;
    function claimPrize(uint256 drawId) external;
    function getUserTickets(address user) external view returns (uint256);
}

contract MegapotMining {
    IMegapot public immutable megapot;
    address public immutable miningGrid;

    event TicketMinted(address indexed user, uint256 tileCount, uint256 round);

    constructor(address _megapot, address _miningGrid) {
        megapot = IMegapot(_megapot);
        miningGrid = _miningGrid;
    }

    function onStake(address user, uint256 tileCount) external {
        require(msg.sender == miningGrid, "Only mining grid");
        require(tileCount > 0, "No tiles");

        for (uint256 i = 0; i < tileCount; i++) {
            megapot.mintTicket(user);
        }

        emit TicketMinted(user, tileCount, 0);
    }

    function getTickets(address user) external view returns (uint256) {
        return megapot.getUserTickets(user);
    }
}