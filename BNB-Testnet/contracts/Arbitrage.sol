// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// Interfacce per i router DEX
interface IPancakeRouter {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function getAmountsOut(uint amountIn, address[] calldata path)
        external view returns (uint[] memory amounts);
}

contract Arbitrage is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Router address per PancakeSwap
    IPancakeRouter public pancakeRouter;
    
    // Token addresses per BSC Testnet
    address public WBNB;
    address public BUSD;
    address public USDT;
    address public USDC;
    
    // Struct per definire un triangolo di arbitraggio
    struct TriangularPath {
        address tokenA;
        address tokenB;
        address tokenC;
        string name;
    }
    
    // Percorsi triangolari predefiniti
    TriangularPath[] public triangularPaths;
    
    // Eventi
    event TriangularArbitrageExecuted(
        address indexed tokenA,
        address indexed tokenB,
        address indexed tokenC,
        uint256 amountIn,
        uint256 profit,
        string pathName
    );
    
    event ArbitrageExecuted(
        address indexed tokenA,
        address indexed tokenB,
        uint256 amountIn,
        uint256 profit,
        string dexA,
        string dexB
    );
    
    event FundsWithdrawn(address indexed token, uint256 amount);
    
    // Modificatori
    modifier onlyValidNetwork() {
        require(
            block.chainid == 97 || block.chainid == 31337, // BSC Testnet o Hardhat
            "Contratto non supportato su questa rete"
        );
        _;
    }
    
    constructor() Ownable(msg.sender) {
        // Verifica che siamo su BSC Testnet o Hardhat
        require(
            block.chainid == 97 || block.chainid == 31337, 
            "Contratto deve essere deployato su BSC Testnet o Hardhat"
        );
        
        // Inizializza router per PancakeSwap
        pancakeRouter = IPancakeRouter(0xD99D1c33F9fC3444f8101754aBC46c52416550D1);
        
        // Inizializza token per BSC Testnet
        WBNB = 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd; // WBNB testnet
        BUSD = 0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee; // BUSD testnet
        USDT = 0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684; // USDT testnet
        USDC = 0x64544969ed7EBf5f083679233325356EbE738930; // USDC testnet
        
        // Inizializza percorsi triangolari
        _initializeTriangularPaths();
    }
    
    // Inizializza i percorsi triangolari
    function _initializeTriangularPaths() internal {
        // BNB -> BUSD -> USDT -> BNB
        triangularPaths.push(TriangularPath({
            tokenA: WBNB,
            tokenB: BUSD,
            tokenC: USDT,
            name: "BNB-BUSD-USDT"
        }));
        
        // BNB -> USDT -> BUSD -> BNB
        triangularPaths.push(TriangularPath({
            tokenA: WBNB,
            tokenB: USDT,
            tokenC: BUSD,
            name: "BNB-USDT-BUSD"
        }));
        
        // BUSD -> USDT -> BNB -> BUSD
        triangularPaths.push(TriangularPath({
            tokenA: BUSD,
            tokenB: USDT,
            tokenC: WBNB,
            name: "BUSD-USDT-BNB"
        }));
        
        // USDT -> BUSD -> BNB -> USDT
        triangularPaths.push(TriangularPath({
            tokenA: USDT,
            tokenB: BUSD,
            tokenC: WBNB,
            name: "USDT-BUSD-BNB"
        }));
    }
    
    // Funzione per eseguire arbitraggio triangolare
    function executeTriangularArbitrage(
        uint256 pathIndex,
        uint256 amountIn
    ) external onlyOwner onlyValidNetwork nonReentrant {
        require(pathIndex < triangularPaths.length, "Percorso non valido");
        require(amountIn > 0, "Amount deve essere maggiore di 0");
        
        TriangularPath memory path = triangularPaths[pathIndex];
        IERC20 tokenA = IERC20(path.tokenA);
        
        // Verifica saldo sufficiente
        require(
            tokenA.balanceOf(address(this)) >= amountIn,
            "Saldo token insufficiente"
        );
        
        uint256 initialBalance = tokenA.balanceOf(address(this));
        
        // Esegui il ciclo triangolare: A -> B -> C -> A
        uint256 amountB = _swapTokens(path.tokenA, path.tokenB, amountIn);
        uint256 amountC = _swapTokens(path.tokenB, path.tokenC, amountB);
        uint256 finalAmount = _swapTokens(path.tokenC, path.tokenA, amountC);
        
        uint256 finalBalance = tokenA.balanceOf(address(this));
        
        // Verifica profitto
        require(finalBalance > initialBalance, "Arbitraggio triangolare non profittevole");
        
        uint256 profit = finalBalance - initialBalance;
        
        emit TriangularArbitrageExecuted(
            path.tokenA,
            path.tokenB,
            path.tokenC,
            amountIn,
            profit,
            path.name
        );
    }
    
    // Funzione interna per eseguire swap
    function _swapTokens(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) internal returns (uint256) {
        IERC20(tokenIn).forceApprove(address(pancakeRouter), amountIn);
        
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        
        uint256 balanceBefore = IERC20(tokenOut).balanceOf(address(this));
        
        pancakeRouter.swapExactTokensForTokens(
            amountIn,
            0, // Accetta qualsiasi quantità di token out
            path,
            address(this),
            block.timestamp + 300
        );
        
        uint256 balanceAfter = IERC20(tokenOut).balanceOf(address(this));
        return balanceAfter - balanceBefore;
    }
    
    // Funzione per calcolare opportunità di arbitraggio triangolare
    function calculateTriangularOpportunity(
        uint256 pathIndex,
        uint256 amountIn
    ) external view returns (
        bool profitable,
        uint256 estimatedProfit,
        uint256 amountB,
        uint256 amountC,
        uint256 finalAmount
    ) {
        require(pathIndex < triangularPaths.length, "Percorso non valido");
        
        TriangularPath memory path = triangularPaths[pathIndex];
        
        // Simula il percorso triangolare
        amountB = _getAmountOut(path.tokenA, path.tokenB, amountIn);
        if (amountB == 0) return (false, 0, 0, 0, 0);
        
        amountC = _getAmountOut(path.tokenB, path.tokenC, amountB);
        if (amountC == 0) return (false, 0, 0, 0, 0);
        
        finalAmount = _getAmountOut(path.tokenC, path.tokenA, amountC);
        if (finalAmount == 0) return (false, 0, 0, 0, 0);
        
        profitable = finalAmount > amountIn;
        estimatedProfit = profitable ? finalAmount - amountIn : 0;
    }
    
    // Funzione per ottenere il prezzo di output
    function _getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) internal view returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        
        try pancakeRouter.getAmountsOut(amountIn, path) returns (uint[] memory amounts) {
            return amounts[1];
        } catch {
            return 0;
        }
    }
    
    // Funzione per ottenere tutti i percorsi triangolari
    function getAllTriangularPaths() external view returns (TriangularPath[] memory) {
        return triangularPaths;
    }
    
    // Funzione per aggiungere un nuovo percorso triangolare
    function addTriangularPath(
        address tokenA,
        address tokenB,
        address tokenC,
        string memory name
    ) external onlyOwner {
        triangularPaths.push(TriangularPath({
            tokenA: tokenA,
            tokenB: tokenB,
            tokenC: tokenC,
            name: name
        }));
    }
    
    // Funzione per rimuovere un percorso triangolare
    function removeTriangularPath(uint256 index) external onlyOwner {
        require(index < triangularPaths.length, "Indice non valido");
        
        for (uint256 i = index; i < triangularPaths.length - 1; i++) {
            triangularPaths[i] = triangularPaths[i + 1];
        }
        triangularPaths.pop();
    }
    
    // Funzione per scansionare tutte le opportunità triangolari
    function scanAllTriangularOpportunities(
        uint256 amountIn
    ) external view returns (
        bool[] memory profitable,
        uint256[] memory profits,
        string[] memory pathNames
    ) {
        uint256 pathCount = triangularPaths.length;
        profitable = new bool[](pathCount);
        profits = new uint256[](pathCount);
        pathNames = new string[](pathCount);
        
        for (uint256 i = 0; i < pathCount; i++) {
            (bool isProfitable, uint256 profit, , , ) = this.calculateTriangularOpportunity(i, amountIn);
            profitable[i] = isProfitable;
            profits[i] = profit;
            pathNames[i] = triangularPaths[i].name;
        }
    }
    
    // Funzione per depositare token
    function depositToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    }
    
    // Funzione per prelevare token
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        uint256 withdrawAmount = amount == 0 ? balance : amount;
        
        require(withdrawAmount <= balance, "Saldo insufficiente");
        tokenContract.safeTransfer(msg.sender, withdrawAmount);
        
        emit FundsWithdrawn(token, withdrawAmount);
    }
    
    // Funzione per prelevare BNB
    function withdrawBNB() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Nessun BNB da prelevare");
        
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Trasferimento BNB fallito");
    }
    
    // Funzione per ricevere BNB
    receive() external payable {}
    
    // Funzione di emergenza per fermare il contratto
    function emergencyStop() external onlyOwner {
        selfdestruct(payable(msg.sender));
    }
} 