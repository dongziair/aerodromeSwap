import { SocksProxyAgent } from 'socks-proxy-agent';
import { ethers } from 'ethers';
import { RPC_URL, PROXIES, PRIVATE_KEYS } from './config.js';

/**
 * 解析代理字符串为 SocksProxyAgent
 * 格式：ip:port:user:pass
 */
function createProxyAgent(proxyStr) {
    const parts = proxyStr.split(':');
    if (parts.length === 4) {
        const [host, port, username, password] = parts;
        return new SocksProxyAgent(`socks5://${username}:${password}@${host}:${port}`);
    }
    if (parts.length === 2) {
        const [host, port] = parts;
        return new SocksProxyAgent(`socks5://${host}:${port}`);
    }
    throw new Error(`无法解析代理格式: ${proxyStr}`);
}

/**
 * 创建带代理的 JsonRpcProvider
 */
function createProvider(proxyAgent) {
    const fetchReq = new ethers.FetchRequest(RPC_URL);
    if (proxyAgent) {
        fetchReq.getUrlFunc = ethers.FetchRequest.createGetUrlFunc({ agent: proxyAgent });
    }
    return new ethers.JsonRpcProvider(fetchReq);
}

/**
 * 为每个钱包创建 provider + signer 并分配代理
 * 返回数组：[{ wallet, provider, label }]
 */
export function setupWallets() {
    if (PRIVATE_KEYS.length === 0) {
        throw new Error('未配置 PRIVATE_KEYS');
    }

    const wallets = [];

    for (let i = 0; i < PRIVATE_KEYS.length; i++) {
        let pk = PRIVATE_KEYS[i];
        if (!pk.startsWith('0x')) pk = '0x' + pk;

        let proxyAgent = null;
        if (PROXIES.length > 0) {
            const proxyStr = PROXIES[i % PROXIES.length];
            proxyAgent = createProxyAgent(proxyStr);
            console.log(`钱包 #${i + 1} 绑定代理: ${proxyStr.split(':').slice(0, 2).join(':')}`);
        }

        const provider = createProvider(proxyAgent);
        const wallet = new ethers.Wallet(pk, provider);
        const label = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;

        wallets.push({ wallet, provider, label });
    }

    return wallets;
}
