import { db } from '@/db';
import { marketChartData } from '@/db/schema';

async function main() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const sampleChartData = [];
    
    // Market 1: Strong Yes trend (Trump winning)
    const market1Points = 35;
    for (let i = 0; i < market1Points; i++) {
        const timestamp = new Date(thirtyDaysAgo.getTime() + (i / market1Points) * 30 * 24 * 60 * 60 * 1000).toISOString();
        const basePrice = 0.45 + (i / market1Points) * 0.30 + (Math.random() * 0.05 - 0.025);
        const yesPrice = Math.max(0.2, Math.min(0.8, basePrice));
        sampleChartData.push({
            marketId: 1,
            timestamp,
            yesPrice,
            noPrice: 1 - yesPrice,
            volume: Math.floor(Math.random() * 80) + 20
        });
    }
    
    // Market 2: Strong No trend (Biden winning)
    const market2Points = 32;
    for (let i = 0; i < market2Points; i++) {
        const timestamp = new Date(thirtyDaysAgo.getTime() + (i / market2Points) * 30 * 24 * 60 * 60 * 1000).toISOString();
        const basePrice = 0.55 - (i / market2Points) * 0.30 + (Math.random() * 0.05 - 0.025);
        const yesPrice = Math.max(0.2, Math.min(0.8, basePrice));
        sampleChartData.push({
            marketId: 2,
            timestamp,
            yesPrice,
            noPrice: 1 - yesPrice,
            volume: Math.floor(Math.random() * 70) + 15
        });
    }
    
    // Market 3: Balanced with volatility
    const market3Points = 28;
    for (let i = 0; i < market3Points; i++) {
        const timestamp = new Date(thirtyDaysAgo.getTime() + (i / market3Points) * 30 * 24 * 60 * 60 * 1000).toISOString();
        const volatility = Math.sin(i * 0.5) * 0.15;
        const basePrice = 0.50 + volatility + (Math.random() * 0.08 - 0.04);
        const yesPrice = Math.max(0.2, Math.min(0.8, basePrice));
        sampleChartData.push({
            marketId: 3,
            timestamp,
            yesPrice,
            noPrice: 1 - yesPrice,
            volume: Math.floor(Math.random() * 90) + 10
        });
    }
    
    // Market 4: Gradual Yes trend with spike
    const market4Points = 30;
    for (let i = 0; i < market4Points; i++) {
        const timestamp = new Date(thirtyDaysAgo.getTime() + (i / market4Points) * 30 * 24 * 60 * 60 * 1000).toISOString();
        const spike = i === 20 ? 0.15 : 0;
        const basePrice = 0.40 + (i / market4Points) * 0.25 + spike + (Math.random() * 0.04 - 0.02);
        const yesPrice = Math.max(0.2, Math.min(0.8, basePrice));
        sampleChartData.push({
            marketId: 4,
            timestamp,
            yesPrice,
            noPrice: 1 - yesPrice,
            volume: i === 20 ? 95 : Math.floor(Math.random() * 60) + 20
        });
    }
    
    // Market 5: Declining trend with recovery
    const market5Points = 25;
    for (let i = 0; i < market5Points; i++) {
        const timestamp = new Date(thirtyDaysAgo.getTime() + (i / market5Points) * 30 * 24 * 60 * 60 * 1000).toISOString();
        let basePrice;
        if (i < 15) {
            basePrice = 0.60 - (i / 15) * 0.25;
        } else {
            basePrice = 0.35 + ((i - 15) / 10) * 0.15;
        }
        basePrice += (Math.random() * 0.06 - 0.03);
        const yesPrice = Math.max(0.2, Math.min(0.8, basePrice));
        sampleChartData.push({
            marketId: 5,
            timestamp,
            yesPrice,
            noPrice: 1 - yesPrice,
            volume: Math.floor(Math.random() * 75) + 15
        });
    }
    
    // Market 6: High volatility balanced market
    const market6Points = 27;
    for (let i = 0; i < market6Points; i++) {
        const timestamp = new Date(thirtyDaysAgo.getTime() + (i / market6Points) * 30 * 24 * 60 * 60 * 1000).toISOString();
        const basePrice = 0.50 + (Math.random() * 0.30 - 0.15);
        const yesPrice = Math.max(0.2, Math.min(0.8, basePrice));
        sampleChartData.push({
            marketId: 6,
            timestamp,
            yesPrice,
            noPrice: 1 - yesPrice,
            volume: Math.floor(Math.random() * 85) + 15
        });
    }
    
    // Market 7: Strong upward momentum
    const market7Points = 26;
    for (let i = 0; i < market7Points; i++) {
        const timestamp = new Date(thirtyDaysAgo.getTime() + (i / market7Points) * 30 * 24 * 60 * 60 * 1000).toISOString();
        const acceleration = Math.pow(i / market7Points, 1.5);
        const basePrice = 0.35 + acceleration * 0.40 + (Math.random() * 0.04 - 0.02);
        const yesPrice = Math.max(0.2, Math.min(0.8, basePrice));
        sampleChartData.push({
            marketId: 7,
            timestamp,
            yesPrice,
            noPrice: 1 - yesPrice,
            volume: Math.floor(Math.random() * 70) + 25
        });
    }
    
    // Market 8: Sudden drop then stabilization
    const market8Points = 25;
    for (let i = 0; i < market8Points; i++) {
        const timestamp = new Date(thirtyDaysAgo.getTime() + (i / market8Points) * 30 * 24 * 60 * 60 * 1000).toISOString();
        let basePrice;
        if (i < 10) {
            basePrice = 0.65 + (Math.random() * 0.04 - 0.02);
        } else if (i === 10) {
            basePrice = 0.40;
        } else {
            basePrice = 0.42 + (Math.random() * 0.06 - 0.03);
        }
        const yesPrice = Math.max(0.2, Math.min(0.8, basePrice));
        sampleChartData.push({
            marketId: 8,
            timestamp,
            yesPrice,
            noPrice: 1 - yesPrice,
            volume: i === 10 ? 100 : Math.floor(Math.random() * 65) + 20
        });
    }

    await db.insert(marketChartData).values(sampleChartData);
    
    console.log(`✅ Market chart data seeder completed successfully - ${sampleChartData.length} data points created`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});