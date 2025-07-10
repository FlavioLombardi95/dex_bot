// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@balancer-labs/v2-interfaces/contracts/vault/IVault.sol";
import "@balancer-labs/v2-interfaces/contracts/vault/IFlashLoanRecipient.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Arbitrage is IFlashLoanRecipient, Ownable, ReentrancyGuard {
    // Balancer Vault per flash loan
    IVault private constant vault = IVault(0xBA12222222228d8Ba445958a75a0704d566BF2C8);
    
    // Router dei DEX
    IUniswapV2Router02 public uniswapRouter;
    IUniswapV2Router02 public sushiswapRouter;
    
    // Eventi per logging
    event FlashLoanInitiated(address token, uint256 amount);
    event ArbitrageExecuted(address tokenA, address tokenB, uint256 profit);
    event ErrorOccurred(string reason, bytes data);
    
    // Struttura per parametri arbitraggio
    struct ArbitrageParams {
        address tokenA;
        address tokenB;
        uint256 amountIn;
        address dexA; // Router del primo DEX
        address dexB; // Router del secondo DEX
        uint256 minProfit;
    }
    
    constructor(
        address _uniswapRouter,
        address _sushiswapRouter
    ) {
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
        sushiswapRouter = IUniswapV2Router02(_sushiswapRouter);
    }
    
    /**
     * @notice Inizia l'arbitraggio con flash loan
     * @param params Parametri per l'arbitraggio
     */
    function executeArbitrage(ArbitrageParams memory params) external onlyOwner nonReentrant {
        try this._executeArbitrageInternal(params) {
            emit ArbitrageExecuted(params.tokenA, params.tokenB, 0);
        } catch (bytes memory reason) {
            emit ErrorOccurred("Arbitrage execution failed", reason);
            revert("Arbitrage failed");
        }
    }
    
    function _executeArbitrageInternal(ArbitrageParams memory params) external {
        require(msg.sender == address(this), "Internal function");
        
        // Prepara i token per il flash loan
        IERC20[] memory tokens = new IERC20[](1);
        tokens[0] = IERC20(params.tokenA);
        
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = params.amountIn;
        
        // Codifica i parametri per il callback
        bytes memory userData = abi.encode(params);
        
        emit FlashLoanInitiated(params.tokenA, params.amountIn);
        
        // Richiedi il flash loan
        vault.flashLoan(this, tokens, amounts, userData);
    }
    
    /**
     * @notice Callback chiamato da Balancer durante il flash loan
     */
    function receiveFlashLoan(
        IERC20[] memory tokens,
        uint256[] memory amounts,
        uint256[] memory feeAmounts,
        bytes memory userData
    ) external override {
        require(msg.sender == address(vault), "Only vault can call");
        
        try this._performArbitrage(tokens, amounts, feeAmounts, userData) {
            // Successo
        } catch (bytes memory reason) {
            emit ErrorOccurred("Flash loan callback failed", reason);
            revert("Flash loan callback failed");
        }
    }
    
    function _performArbitrage(
        IERC20[] memory tokens,
        uint256[] memory amounts,
        uint256[] memory feeAmounts,
        bytes memory userData
    ) external {
        require(msg.sender == address(this), "Internal function");
        
        // Decodifica i parametri
        ArbitrageParams memory params = abi.decode(userData, (ArbitrageParams));
        
        uint256 initialAmount = amounts[0];
        uint256 flashLoanFee = feeAmounts[0];
        
        // Esegui il primo swap (DEX A)
        uint256 amountOut1 = _swapOnDEX(
            params.dexA,
            params.tokenA,
            params.tokenB,
            initialAmount
        );
        
        // Esegui il secondo swap (DEX B)
        uint256 amountOut2 = _swapOnDEX(
            params.dexB,
            params.tokenB,
            params.tokenA,
            amountOut1
        );
        
        // Calcola il profitto
        uint256 totalRepayment = initialAmount + flashLoanFee;
        require(amountOut2 >= totalRepayment, "Arbitrage not profitable");
        
        uint256 profit = amountOut2 - totalRepayment;
        require(profit >= params.minProfit, "Profit below minimum threshold");
        
        // Ripaga il flash loan
        tokens[0].transfer(address(vault), totalRepayment);
        
        // Invia il profitto al proprietario
        if (profit > 0) {
            tokens[0].transfer(owner(), profit);
        }
        
        emit ArbitrageExecuted(params.tokenA, params.tokenB, profit);
    }
    
    /**
     * @notice Esegue uno swap su un DEX specificato
     */
    function _swapOnDEX(
        address routerAddress,
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) internal returns (uint256 amountOut) {
        IUniswapV2Router02 router = IUniswapV2Router02(routerAddress);
        
        // Approva il router
        IERC20(tokenIn).approve(routerAddress, amountIn);
        
        // Prepara il path
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        
        // Esegui lo swap
        uint256[] memory amounts = router.swapExactTokensForTokens(
            amountIn,
            0, // accepta qualsiasi quantità di token out
            path,
            address(this),
            block.timestamp + 300 // 5 minuti di deadline
        );
        
        return amounts[1];
    }
    
    /**
     * @notice Funzione di emergenza per ritirare token
     */
    function emergencyWithdraw(address token) external onlyOwner {
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        if (balance > 0) {
            tokenContract.transfer(owner(), balance);
        }
    }
    
    /**
     * @notice Aggiorna gli indirizzi dei router
     */
    function updateRouters(address _uniswapRouter, address _sushiswapRouter) external onlyOwner {
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
        sushiswapRouter = IUniswapV2Router02(_sushiswapRouter);
    }
} 