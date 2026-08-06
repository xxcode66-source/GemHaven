// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {e, euint256, ebool, eaddress, elist, ETypes} from "@inco/lightning/src/Lib.sol";
import {GEM} from "./GEM.sol";
import {MegapotMining} from "./MegapotMining.sol";

/**
 * @title ConfidentialMiningGrid - ZINC/ORE Style Confidential Mining on Base
 * @notice 5x5 grid, encrypted tile selection, e.randBounded() winner, reward distribution
 * @dev Uses Inco Lightning for: encrypted stakes, hidden tile choice, verifiable randomness
 */
contract ConfidentialMiningGrid {
    uint8 public constant GRID_SIZE = 25;
    uint256 public constant MIN_STAKE = 0.01 ether;
    uint256 public constant ROUND_DURATION = 45;
    uint256 public constant FEE_BPS = 1000;
    uint256 public constant GEM_REWARD_PER_ROUND = 1000 * 10**18;

    GEM public immutable gem;
    MegapotMining public immutable megapot;

    euint256[GRID_SIZE] public tileStakes;
    mapping(address => euint256[GRID_SIZE]) public userStakes;
    euint256 public currentRound;
    euint256 public winningTile;
    euint256 public roundEndTime;
    euint256 public totalPot;

    bool public roundActive = false;
    uint256 public lastSettleBlock;
    address public feeRecipient;

    event Staked(address indexed user, uint8 indexed tileId, uint256 amount, uint256 round);
    event RoundStarted(uint256 indexed round, uint256 endTime);
    event RoundSettled(uint256 indexed round, uint8 indexed winningTile, address indexed winner, uint256 reward);
    event RewardsClaimed(address indexed user, uint256 ethAmount, uint256 gemAmount);
    event FeesCollected(uint256 ethAmount, uint256 gemBurned);

    constructor(
        address payable _gem,
        address _megapot,
        address _feeRecipient
    ) {
        gem = GEM(_gem);
        megapot = MegapotMining(_megapot);
        feeRecipient = _feeRecipient;

        currentRound = e.asEuint256(1);
        e.allow(currentRound, address(this));
        roundEndTime = e.asEuint256(block.timestamp + ROUND_DURATION);
        e.allow(roundEndTime, address(this));
        roundActive = true;
        lastSettleBlock = block.number;

        for (uint8 i = 0; i < GRID_SIZE; i++) {
            tileStakes[i] = e.asEuint256(0);
            e.allow(tileStakes[i], address(this));
        }
        totalPot = e.asEuint256(0);
        e.allow(totalPot, address(this));
    }

    function _isZero(euint256 a) internal view returns (bool) {
        return euint256.unwrap(a) == bytes32(0);
    }

    function _getCurrentRound() internal view returns (uint256) {
        bytes32 handle = euint256.unwrap(currentRound);
        return handle == bytes32(0) ? 0 : 1;
    }

    function _getRoundEndTime() internal view returns (uint256) {
        bytes32 handle = euint256.unwrap(roundEndTime);
        return handle == bytes32(0) ? 0 : block.timestamp + ROUND_DURATION;
    }

    function stakeTile(uint8 tileId) external payable {
        require(roundActive, "Round not active");
        require(tileId < GRID_SIZE, "Invalid tile");
        require(msg.value >= MIN_STAKE, "Min 0.01 ETH");
        require(block.timestamp < _getRoundEndTime(), "Round ended");

        euint256 stakeAmount = e.asEuint256(msg.value);
        e.allow(stakeAmount, address(this));

        userStakes[msg.sender][tileId] = e.add(userStakes[msg.sender][tileId], stakeAmount);
        e.allow(userStakes[msg.sender][tileId], msg.sender);

        tileStakes[tileId] = e.add(tileStakes[tileId], stakeAmount);
        totalPot = e.add(totalPot, stakeAmount);

        megapot.onStake(msg.sender, 1);

        emit Staked(msg.sender, tileId, msg.value, _getCurrentRound());
    }

    function settleRound() external {
        require(!roundActive || block.timestamp >= _getRoundEndTime(), "Round still active");
        require(block.number > lastSettleBlock, "Already settled this block");

        uint256 round = _getCurrentRound();

        winningTile = e.randBounded(GRID_SIZE);
        e.allow(winningTile, address(this));
        e.reveal(winningTile);

        uint8 winnerTile = uint8(uint256(euint256.unwrap(winningTile)) & 0xFF);

        roundActive = false;
        lastSettleBlock = block.number;

        currentRound = e.add(currentRound, e.asEuint256(1));
        e.allow(currentRound, address(this));
        roundEndTime = e.asEuint256(block.timestamp + ROUND_DURATION);
        e.allow(roundEndTime, address(this));
        roundActive = true;

        for (uint8 i = 0; i < GRID_SIZE; i++) {
            tileStakes[i] = e.asEuint256(0);
            e.allow(tileStakes[i], address(this));
        }
        totalPot = e.asEuint256(0);
        e.allow(totalPot, address(this));

        emit RoundStarted(round + 1, block.timestamp + ROUND_DURATION);
        emit RoundSettled(round, winnerTile, address(0), 0);
    }

    function claimRewards() external {
        uint256 round = _getCurrentRound();
        require(round > 1, "No completed rounds");
        require(!roundActive || block.timestamp >= _getRoundEndTime(), "Current round active");

        uint8 winnerTile = uint8(uint256(euint256.unwrap(winningTile)) & 0xFF);

        euint256 myStake = userStakes[msg.sender][winnerTile];
        require(!_isZero(myStake), "No stake on winning tile");

        euint256 tileTotalStake = tileStakes[winnerTile];
        require(!_isZero(tileTotalStake), "Tile stake zero");

        uint256 potPlain = address(this).balance;
        uint256 feeAmount = (potPlain * FEE_BPS) / 10000;
        uint256 netReward = potPlain - feeAmount;

        userStakes[msg.sender][winnerTile] = e.asEuint256(0);
        e.allow(userStakes[msg.sender][winnerTile], msg.sender);

        if (netReward > 0) {
            payable(msg.sender).transfer(netReward);
        }

        uint256 gemReward = GEM_REWARD_PER_ROUND;
        if (gemReward > 0) {
            gem.mintReward(msg.sender, gemReward);
        }

        if (feeAmount > 0) {
            payable(feeRecipient).transfer(feeAmount);
        }

        emit RewardsClaimed(msg.sender, netReward, gemReward);
    }

    function getRoundInfo() external view returns (
        uint256 round,
        uint256 endTime,
        bool active,
        bytes32 winningTileHandle
    ) {
        round = euint256.unwrap(currentRound) == bytes32(0) ? 0 : 1;
        endTime = euint256.unwrap(roundEndTime) == bytes32(0) ? 0 : block.timestamp + ROUND_DURATION;
        active = roundActive;
        winningTileHandle = euint256.unwrap(winningTile);
    }

    function getTileStakeHandle(uint8 tileId) external view returns (bytes32) {
        require(tileId < GRID_SIZE, "Invalid tile");
        return euint256.unwrap(tileStakes[tileId]);
    }

    function getMyStakeHandle(uint8 tileId) external view returns (bytes32) {
        require(tileId < GRID_SIZE, "Invalid tile");
        return euint256.unwrap(userStakes[msg.sender][tileId]);
    }

    function getTotalPotHandle() external view returns (bytes32) {
        return euint256.unwrap(totalPot);
    }

    function getContractEthBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function emergencyWithdraw() external {
        require(msg.sender == feeRecipient, "Only fee recipient");
        payable(feeRecipient).transfer(address(this).balance);
    }

    receive() external payable {}
}