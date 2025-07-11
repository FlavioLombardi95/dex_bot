const { ethers } = require('hardhat');
const config = require('../bot/config');
const TriangularArbitrageMonitor = require('../bot/monitor');

async function main() {
    console.log('🧪 Test Opportunità Arbitraggio Triangolare su BSC Testnet');
    console.log('=====================================================');
    
    // Verifica rete
    const network = await ethers.provider.getNetwork();
    console.log('📊 Rete:', {
        nome: network.name,
        chainId: network.chainId
    });
    
    if (network.chainId !== 97) {
        throw new Error('⚠️ Errore: Test deve essere eseguito su BSC Testnet (Chain ID 97)');
    }
    
    // Inizializza monitor
    console.log('🔍 Inizializzazione monitor...');
    const monitor = new TriangularArbitrageMonitor();
    
    // Verifica connessione
    const connected = await monitor.checkConnection();
    if (!connected) {
        throw new Error('❌ Impossibile connettersi alla rete BSC Testnet');
    }
    
    console.log('✅ Connessione verificata');
    
    // Test 1: Verifica configurazione percorsi
    console.log('\n📋 Test 1: Verifica Percorsi Triangolari');
    console.log('=========================================');
    
    const paths = config.getAllTriangularPaths();
    console.log(`💡 Percorsi configurati: ${paths.length}`);
    
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        console.log(`  ${i + 1}. ${path.name}`);
        console.log(`     📈 ${path.description}`);
        console.log(`     🔗 ${path.tokenA} → ${path.tokenB} → ${path.tokenC}`);
    }
    
    // Test 2: Verifica esistenza coppie
    console.log('\n🔍 Test 2: Verifica Esistenza Coppie');
    console.log('=====================================');
    
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        console.log(`\n📊 Verifica percorso: ${path.name}`);
        
        const tokenA = config.getTokenBySymbol(path.tokenA);
        const tokenB = config.getTokenBySymbol(path.tokenB);
        const tokenC = config.getTokenBySymbol(path.tokenC);
        
        if (!tokenA || !tokenB || !tokenC) {
            console.log('❌ Token non trovato nella configurazione');
            continue;
        }
        
        const [pairAB, pairBC, pairCA] = await Promise.all([
            monitor.checkPairExists(tokenA.address, tokenB.address),
            monitor.checkPairExists(tokenB.address, tokenC.address),
            monitor.checkPairExists(tokenC.address, tokenA.address)
        ]);
        
        console.log(`  🔗 ${path.tokenA}/${path.tokenB}: ${pairAB ? '✅' : '❌'}`);
        console.log(`  🔗 ${path.tokenB}/${path.tokenC}: ${pairBC ? '✅' : '❌'}`);
        console.log(`  🔗 ${path.tokenC}/${path.tokenA}: ${pairCA ? '✅' : '❌'}`);
        
        const allPairsExist = pairAB && pairBC && pairCA;
        console.log(`  📊 Percorso completo: ${allPairsExist ? '✅' : '❌'}`);
    }
    
    // Test 3: Analisi liquidità
    console.log('\n💧 Test 3: Analisi Liquidità');
    console.log('=============================');
    
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        console.log(`\n📊 Liquidità per: ${path.name}`);
        
        const tokenA = config.getTokenBySymbol(path.tokenA);
        const tokenB = config.getTokenBySymbol(path.tokenB);
        const tokenC = config.getTokenBySymbol(path.tokenC);
        
        if (!tokenA || !tokenB || !tokenC) continue;
        
        try {
            const [liquidityAB, liquidityBC, liquidityCA] = await Promise.all([
                monitor.getLiquidity(tokenA.address, tokenB.address),
                monitor.getLiquidity(tokenB.address, tokenC.address),
                monitor.getLiquidity(tokenC.address, tokenA.address)
            ]);
            
            console.log(`  🔗 ${path.tokenA}/${path.tokenB}:`);
            console.log(`     Reserve0: ${ethers.utils.formatEther(liquidityAB.reserve0 || 0)}`);
            console.log(`     Reserve1: ${ethers.utils.formatEther(liquidityAB.reserve1 || 0)}`);
            
            console.log(`  🔗 ${path.tokenB}/${path.tokenC}:`);
            console.log(`     Reserve0: ${ethers.utils.formatEther(liquidityBC.reserve0 || 0)}`);
            console.log(`     Reserve1: ${ethers.utils.formatEther(liquidityBC.reserve1 || 0)}`);
            
            console.log(`  🔗 ${path.tokenC}/${path.tokenA}:`);
            console.log(`     Reserve0: ${ethers.utils.formatEther(liquidityCA.reserve0 || 0)}`);
            console.log(`     Reserve1: ${ethers.utils.formatEther(liquidityCA.reserve1 || 0)}`);
            
        } catch (error) {
            console.log(`  ❌ Errore nel recupero liquidità: ${error.message}`);
        }
    }
    
    // Test 4: Calcolo opportunità per diversi importi
    console.log('\n💰 Test 4: Calcolo Opportunità');
    console.log('==============================');
    
    const testAmounts = [0.001, 0.01, 0.1, 0.5]; // BNB amounts
    
    for (const amount of testAmounts) {
        console.log(`\n💵 Test con ${amount} BNB:`);
        console.log('─'.repeat(50));
        
        const opportunities = [];
        
        for (let i = 0; i < paths.length; i++) {
            const path = paths[i];
            
            try {
                const opportunity = await monitor.calculateTriangularOpportunity(path, amount);
                
                if (opportunity) {
                    opportunities.push(opportunity);
                    
                    const profitSymbol = opportunity.profitable ? '💰' : '📉';
                    const profitColor = opportunity.profitable ? '\x1b[32m' : '\x1b[31m';
                    const resetColor = '\x1b[0m';
                    
                    console.log(`  ${profitSymbol} ${path.name}:`);
                    console.log(`     Input: ${opportunity.amountIn} ${path.tokenA}`);
                    console.log(`     Output: ${opportunity.finalAmount} ${path.tokenA}`);
                    console.log(`     ${profitColor}Profitto: ${opportunity.profit} ${path.tokenA} (${opportunity.profitPercentage.toFixed(4)}%)${resetColor}`);
                    console.log(`     Percorso: ${opportunity.amountIn} → ${opportunity.amountB} → ${opportunity.amountC} → ${opportunity.finalAmount}`);
                }
                
            } catch (error) {
                console.log(`  ❌ ${path.name}: Errore - ${error.message}`);
            }
        }
        
        // Trova la migliore opportunità
        const profitable = opportunities.filter(o => o.profitable);
        if (profitable.length > 0) {
            profitable.sort((a, b) => b.profitPercentage - a.profitPercentage);
            const best = profitable[0];
            
            console.log(`\n  🎯 Migliore opportunità: ${best.path}`);
            console.log(`     💰 Profitto: ${best.profit} ${best.tokenSymbols[0]} (${best.profitPercentage.toFixed(4)}%)`);
        } else {
            console.log(`\n  📉 Nessuna opportunità profittevole trovata`);
        }
    }
    
    // Test 5: Scansione completa
    console.log('\n🔍 Test 5: Scansione Completa');
    console.log('=============================');
    
    console.log('⏳ Esecuzione scansione completa...');
    const allOpportunities = await monitor.scanAllTriangularPaths();
    
    console.log(`📊 Risultati scansione:`);
    console.log(`   • Opportunità totali: ${allOpportunities.length}`);
    console.log(`   • Opportunità profittevoli: ${allOpportunities.filter(o => o.profitable).length}`);
    
    if (allOpportunities.length > 0) {
        console.log('\n📋 Riepilogo opportunità:');
        
        for (const opp of allOpportunities) {
            const status = opp.profitable ? '✅' : '❌';
            const profitText = opp.profitable ? 
                `+${opp.profitPercentage.toFixed(4)}%` : 
                `${opp.profitPercentage.toFixed(4)}%`;
            
            console.log(`  ${status} ${opp.path}: ${profitText}`);
        }
    }
    
    // Test 6: Statistiche performance
    console.log('\n📊 Test 6: Statistiche Performance');
    console.log('==================================');
    
    const stats = monitor.getOpportunityStats();
    console.log('📈 Statistiche:', {
        scansioni: stats.totalScans,
        profittevoli: stats.profitableOpportunities,
        rateProfitti: stats.profitabilityRate + '%',
        profittoMedio: stats.avgProfit + '%'
    });
    
    if (stats.bestOpportunity) {
        console.log('🏆 Migliore opportunità:', stats.bestOpportunity);
    }
    
    // Test 7: Statistiche cache
    console.log('\n💾 Test 7: Statistiche Cache');
    console.log('============================');
    
    const cacheStats = monitor.getCacheStats();
    console.log('📊 Cache:', cacheStats);
    
    // Test 8: Trova migliore opportunità
    console.log('\n🎯 Test 8: Ricerca Migliore Opportunità');
    console.log('=======================================');
    
    const bestOpportunity = await monitor.findBestOpportunity();
    
    if (bestOpportunity) {
        console.log('🏆 Migliore opportunità trovata:');
        console.log(`   • Percorso: ${bestOpportunity.path}`);
        console.log(`   • Profitto: ${bestOpportunity.profit} ${bestOpportunity.tokenSymbols[0]}`);
        console.log(`   • Percentuale: ${bestOpportunity.profitPercentage.toFixed(4)}%`);
        console.log(`   • Descrizione: ${bestOpportunity.description}`);
    } else {
        console.log('📉 Nessuna opportunità profittevole al momento');
    }
    
    // Riepilogo finale
    console.log('\n🎉 TEST COMPLETATO');
    console.log('==================');
    console.log('✅ Tutti i test sono stati eseguiti con successo');
    console.log('📊 Verifica i risultati sopra per valutare le opportunità');
    
    if (allOpportunities.filter(o => o.profitable).length > 0) {
        console.log('\n🚀 Prossimi passi consigliati:');
        console.log('  1. Analizza le opportunità profittevoli trovate');
        console.log('  2. Considera di depositare fondi nel contratto');
        console.log('  3. Avvia il monitoraggio continuo');
        console.log('  4. Configura le notifiche per le opportunità');
    } else {
        console.log('\n📝 Raccomandazioni:');
        console.log('  • Attualmente non ci sono opportunità profittevoli');
        console.log('  • Considera di ridurre la soglia minima di profitto');
        console.log('  • Aumenta la frequenza di scansione per cogliere opportunità rapide');
        console.log('  • Verifica se ci sono problemi di liquidità sui DEX');
    }
    
    console.log('\n🔗 Comandi utili:');
    console.log('  • Avvia monitoraggio: npm run start:triangular');
    console.log('  • Deploy contratto: npm run deploy:triangular');
    console.log('  • Analisi profittabilità: npm run analyze:triangular');
}

// Esegui il test
if (require.main === module) {
    main()
        .then(() => {
            console.log('\n✅ Test completato con successo');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Errore durante il test:', error);
            process.exit(1);
        });
}

module.exports = { main }; 