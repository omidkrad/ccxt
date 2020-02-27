import { Exchange } from './base/Exchange';
import { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError, InvalidAddress, RateLimitExceeded } from './base/errors';
import { ROUND } from './base/functions/number';
import { Ticker, Market, Params, Trade, Balance, TickerSymbol, Currency, Transaction, Order, Balances, OrderBook, FundingFees, Fee, TradingFee } from 'base/ExchangeBase';
import * as WebAPI from 'binance-api-node'; // used only for type definitions

//  ---------------------------------------------------------------------------

export class binance extends Exchange {
    describe () {
        return this.fn.deepExtend (super.describe (), {
            'id': 'binance',
            'name': 'Binance',
            'countries': [ 'JP', 'MT' ], // Japan, Malta
            'rateLimit': 500,
            'certified': true,
            // new metainfo interface
            'has': {
                'fetchDepositAddress': true,
                'CORS': false,
                'fetchBidsAsks': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchOHLCV': true,
                'fetchMyTrades': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': 'emulated',
                'withdraw': true,
                'fetchFundingFees': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchTransactions': false,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
                'api': {
                    'web': 'https://www.binance.com',
                    'wapi': 'https://api.binance.com/wapi/v3',
                    'sapi': 'https://api.binance.com/sapi/v1',
                    'fapiPublic': 'https://fapi.binance.com/fapi/v1',
                    'fapiPrivate': 'https://fapi.binance.com/fapi/v1',
                    'public': 'https://api.binance.com/api/v3',
                    'private': 'https://api.binance.com/api/v3',
                    'v3': 'https://api.binance.com/api/v3',
                    'v1': 'https://api.binance.com/api/v1',
                },
                'www': 'https://www.binance.com',
                'referral': 'https://www.binance.com/?ref=10205187',
                'doc': [
                    'https://binance-docs.github.io/apidocs/spot/en',
                ],
                'api_management': 'https://www.binance.com/en/usercenter/settings/api-management',
                'fees': 'https://www.binance.com/en/fee/schedule',
            },
            'api': {
                'web': {
                    'get': [
                        'exchange/public/product',
                        'assetWithdraw/getAllAsset.html',
                    ],
                },
                // the API structure below will need 3-layer apidefs
                'sapi': {
                    'get': [
                        'accountSnapshot',
                        // these endpoints require this.apiKey
                        'margin/asset',
                        'margin/pair',
                        'margin/allAssets',
                        'margin/allPairs',
                        'margin/priceIndex',
                        // these endpoints require this.apiKey + this.secret
                        'asset/assetDividend',
                        'margin/loan',
                        'margin/repay',
                        'margin/account',
                        'margin/transfer',
                        'margin/interestHistory',
                        'margin/forceLiquidationRec',
                        'margin/order',
                        'margin/openOrders',
                        'margin/allOrders',
                        'margin/myTrades',
                        'margin/maxBorrowable',
                        'margin/maxTransferable',
                        'futures/transfer',
                        // https://binance-docs.github.io/apidocs/spot/en/#withdraw-sapi
                        'capital/config/getall', // get networks for withdrawing USDT ERC20 vs USDT Omni
                        'capital/deposit/address',
                        'capital/deposit/hisrec',
                        'capital/deposit/subAddress',
                        'capital/deposit/subHisrec',
                        'capital/withdraw/history',
                        'sub-account/futures/account',
                        'sub-account/futures/accountSummary',
                        'sub-account/futures/positionRisk',
                        'sub-account/margin/account',
                        'sub-account/margin/accountSummary',
                        'sub-account/status',
                        // lending endpoints
                        'lending/daily/product/list',
                        'lending/daily/userLeftQuota',
                        'lending/daily/userRedemptionQuota',
                        'lending/daily/token/position',
                        'lending/union/account',
                        'lending/union/purchaseRecord',
                        'lending/union/redemptionRecord',
                        'lending/union/interestHistory',
                    ],
                    'post': [
                        'asset/dust',
                        'account/disableFastWithdrawSwitch',
                        'account/enableFastWithdrawSwitch',
                        'capital/withdraw/apply',
                        'margin/transfer',
                        'margin/loan',
                        'margin/repay',
                        'margin/order',
                        'sub-account/margin/enable',
                        'sub-account/margin/enable',
                        'sub-account/futures/enable',
                        'userDataStream',
                        'futures/transfer',
                        // lending
                        'lending/daily/purchase',
                        'lending/daily/redeem',
                    ],
                    'put': [
                        'userDataStream',
                    ],
                    'delete': [
                        'margin/order',
                        'userDataStream',
                    ],
                },
                'wapi': {
                    'post': [
                        'withdraw',
                        'sub-account/transfer',
                    ],
                    'get': [
                        'depositHistory',
                        'withdrawHistory',
                        'depositAddress',
                        'accountStatus',
                        'systemStatus',
                        'apiTradingStatus',
                        'userAssetDribbletLog',
                        'tradeFee',
                        'assetDetail',
                        'sub-account/list',
                        'sub-account/transfer/history',
                        'sub-account/assets',
                    ],
                },
                'fapiPublic': {
                    'get': [
                        'ping',
                        'time',
                        'exchangeInfo',
                        'depth',
                        'trades',
                        'historicalTrades',
                        'aggTrades',
                        'klines',
                        'premiumIndex',
                        'ticker/24hr',
                        'ticker/price',
                        'ticker/bookTicker',
                    ],
                    'put': [ 'listenKey' ],
                    'post': [ 'listenKey' ],
                    'delete': [ 'listenKey' ],
                },
                'fapiPrivate': {
                    'get': [
                        'allOrders',
                        'openOrders',
                        'order',
                        'account',
                        'balance',
                        'positionMargin/history',
                        'positionRisk',
                        'userTrades',
                        'income',
                    ],
                    'post': [
                        'positionMargin',
                        'marginType',
                        'order',
                        'leverage',
                    ],
                    'delete': [
                        'order',
                        'allOpenOrders',
                    ],
                },
                'v3': {
                    'get': [
                        'ticker/price',
                        'ticker/bookTicker',
                    ],
                },
                'public': {
                    'get': [
                        'ping',
                        'time',
                        'depth',
                        'trades',
                        'aggTrades',
                        'historicalTrades',
                        'klines',
                        'ticker/24hr',
                        'ticker/price',
                        'ticker/bookTicker',
                        'exchangeInfo',
                    ],
                    'put': [ 'userDataStream' ],
                    'post': [ 'userDataStream' ],
                    'delete': [ 'userDataStream' ],
                },
                'private': {
                    'get': [
                        'allOrderList', // oco
                        'openOrderList', // oco
                        'orderList', // oco
                        'order',
                        'openOrders',
                        'allOrders',
                        'account',
                        'myTrades',
                    ],
                    'post': [
                        'order/oco',
                        'order',
                        'order/test',
                    ],
                    'delete': [
                        'orderList', // oco
                        'order',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.001,
                },
            },
            'commonCurrencies': {
                'BCC': 'BCC', // kept for backward-compatibility https://github.com/ccxt/ccxt/issues/4848
                'YOYO': 'YOYOW',
            },
            // exchange-specific options
            'options': {
                'fetchTradesMethod': 'publicGetAggTrades',
                'fetchTickersMethod': 'publicGetTicker24hr',
                'defaultTimeInForce': 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
                'defaultLimitOrderType': 'limit', // or 'limit_maker'
                'defaultType': 'spot', // 'spot', 'future'
                'hasAlreadyAuthenticatedSuccessfully': false,
                'warnOnFetchOpenOrdersWithoutSymbol': true,
                'recvWindow': 5 * 1000, // 5 sec, binance default
                'timeDifference': 0, // the difference between system clock and Binance clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                'parseOrderToPrecision': false, // force amounts and costs in parseOrder to precision
                'newOrderRespType': {
                    'market': 'FULL', // 'ACK' for order id, 'RESULT' for full order or 'FULL' for order with fills
                    'limit': 'RESULT', // we change it from 'ACK' by default to 'RESULT'
                },
            },
            'exceptions': {
                'API key does not exist': AuthenticationError,
                'Order would trigger immediately.': InvalidOrder,
                'Account has insufficient balance for requested action.': InsufficientFunds,
                'Rest API trading is not enabled.': ExchangeNotAvailable,
                '-1000': ExchangeNotAvailable, // {"code":-1000,"msg":"An unknown error occured while processing the request."}
                '-1003': RateLimitExceeded, // {"code":-1003,"msg":"Too much request weight used, current limit is 1200 request weight per 1 MINUTE. Please use the websocket for live updates to avoid polling the API."}
                '-1013': InvalidOrder, // createOrder -> 'invalid quantity'/'invalid price'/MIN_NOTIONAL
                '-1021': InvalidNonce, // 'your time is ahead of server'
                '-1022': AuthenticationError, // {"code":-1022,"msg":"Signature for this request is not valid."}
                '-1100': InvalidOrder, // createOrder(symbol, 1, asdf) -> 'Illegal characters found in parameter 'price'
                '-1104': ExchangeError, // Not all sent parameters were read, read 8 parameters but was sent 9
                '-1128': ExchangeError, // {"code":-1128,"msg":"Combination of optional parameters invalid."}
                '-2010': ExchangeError, // generic error code for createOrder -> 'Account has insufficient balance for requested action.', {"code":-2010,"msg":"Rest API trading is not enabled."}, etc...
                '-2011': OrderNotFound, // cancelOrder(1, 'BTC/USDT') -> 'UNKNOWN_ORDER'
                '-2013': OrderNotFound, // fetchOrder (1, 'BTC/USDT') -> 'Order does not exist'
                '-2014': AuthenticationError, // { "code":-2014, "msg": "API-key format invalid." }
                '-2015': AuthenticationError, // "Invalid API-key, IP, or permissions for action."
            },
        });
    }

    nonce () {
        return this.fn.milliseconds () - this.options['timeDifference'];
    }

    async fetchTime (params: Params = {}) {
        const type = this.fn.safeString2 (this.options, 'fetchTime', 'defaultType', 'spot');
        const method = (type === 'spot') ? 'publicGetTime' : 'fapiPublicGetTime';
        const response = await (<any>this)[method] (params);
        return this.fn.safeFloat (response, 'serverTime');
    }

    async loadTimeDifference () {
        const serverTime = await this.fetchTime ();
        const after = this.fn.milliseconds ();
        this.options['timeDifference'] = Math.floor (after - serverTime);
        return this.options['timeDifference'];
    }

    async fetchMarkets (params: Params = {}) {
        const defaultType = this.fn.safeString2 (this.options, 'fetchMarkets', 'defaultType', 'spot');
        const type = this.fn.safeString (params, 'type', defaultType);
        const query = this.fn.omit (params, 'type');
        const method = (type === 'spot') ? 'publicGetExchangeInfo' : 'fapiPublicGetExchangeInfo';
        const response = await (<any>this)[method] (query);
        { // JSON Response
        //
        // spot
        //
        //     {
        //         "timezone":"UTC",
        //         "serverTime":1575416692969,
        //         "rateLimits":[
        //             {"rateLimitType":"REQUEST_WEIGHT","interval":"MINUTE","intervalNum":1,"limit":1200},
        //             {"rateLimitType":"ORDERS","interval":"SECOND","intervalNum":10,"limit":100},
        //             {"rateLimitType":"ORDERS","interval":"DAY","intervalNum":1,"limit":200000}
        //         ],
        //         "exchangeFilters":[],
        //         "symbols":[
        //             {
        //                 "symbol":"ETHBTC",
        //                 "status":"TRADING",
        //                 "baseAsset":"ETH",
        //                 "baseAssetPrecision":8,
        //                 "quoteAsset":"BTC",
        //                 "quotePrecision":8,
        //                 "baseCommissionPrecision":8,
        //                 "quoteCommissionPrecision":8,
        //                 "orderTypes":["LIMIT","LIMIT_MAKER","MARKET","STOP_LOSS_LIMIT","TAKE_PROFIT_LIMIT"],
        //                 "icebergAllowed":true,
        //                 "ocoAllowed":true,
        //                 "quoteOrderQtyMarketAllowed":true,
        //                 "isSpotTradingAllowed":true,
        //                 "isMarginTradingAllowed":true,
        //                 "filters":[
        //                     {"filterType":"PRICE_FILTER","minPrice":"0.00000100","maxPrice":"100000.00000000","tickSize":"0.00000100"},
        //                     {"filterType":"PERCENT_PRICE","multiplierUp":"5","multiplierDown":"0.2","avgPriceMins":5},
        //                     {"filterType":"LOT_SIZE","minQty":"0.00100000","maxQty":"100000.00000000","stepSize":"0.00100000"},
        //                     {"filterType":"MIN_NOTIONAL","minNotional":"0.00010000","applyToMarket":true,"avgPriceMins":5},
        //                     {"filterType":"ICEBERG_PARTS","limit":10},
        //                     {"filterType":"MARKET_LOT_SIZE","minQty":"0.00000000","maxQty":"63100.00000000","stepSize":"0.00000000"},
        //                     {"filterType":"MAX_NUM_ALGO_ORDERS","maxNumAlgoOrders":5}
        //                 ]
        //             },
        //         ],
        //     }
        //
        // futures (fapi)
        //
        //     {
        //         "timezone":"UTC",
        //         "serverTime":1575417244353,
        //         "rateLimits":[
        //             {"rateLimitType":"REQUEST_WEIGHT","interval":"MINUTE","intervalNum":1,"limit":1200},
        //             {"rateLimitType":"ORDERS","interval":"MINUTE","intervalNum":1,"limit":1200}
        //         ],
        //         "exchangeFilters":[],
        //         "symbols":[
        //             {
        //                 "symbol":"BTCUSDT",
        //                 "status":"TRADING",
        //                 "maintMarginPercent":"2.5000",
        //                 "requiredMarginPercent":"5.0000",
        //                 "baseAsset":"BTC",
        //                 "quoteAsset":"USDT",
        //                 "pricePrecision":2,
        //                 "quantityPrecision":3,
        //                 "baseAssetPrecision":8,
        //                 "quotePrecision":8,
        //                 "filters":[
        //                     {"minPrice":"0.01","maxPrice":"100000","filterType":"PRICE_FILTER","tickSize":"0.01"},
        //                     {"stepSize":"0.001","filterType":"LOT_SIZE","maxQty":"1000","minQty":"0.001"},
        //                     {"stepSize":"0.001","filterType":"MARKET_LOT_SIZE","maxQty":"1000","minQty":"0.001"},
        //                     {"limit":200,"filterType":"MAX_NUM_ORDERS"},
        //                     {"multiplierDown":"0.8500","multiplierUp":"1.1500","multiplierDecimal":"4","filterType":"PERCENT_PRICE"}
        //                 ],
        //                 "orderTypes":["LIMIT","MARKET","STOP"],
        //                 "timeInForce":["GTC","IOC","FOK","GTX"]
        //             }
        //         ]
        //     }
        }
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference ();
        }
        const markets = this.fn.safeValue (response, 'symbols') as WebAPI.Symbol[];
        const result: Market[] = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const future = ('maintMarginPercent' in market);
            const spot = !future;
            const marketType = spot ? 'spot' : 'future';
            const id = this.fn.safeString (market, 'symbol');
            const baseId = market['baseAsset'];
            const quoteId = market['quoteAsset'];
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const filters = this.fn.indexBy (market['filters'], 'filterType');
            const precision = {
                'base': market['baseAssetPrecision'],
                'quote': market['quotePrecision'],
                'amount': market['baseAssetPrecision'],
                'price': market['quotePrecision'],
            };
            const status = this.fn.safeString (market, 'status');
            const active = (status === 'TRADING');
            const entry: Market = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'type': marketType,
                'spot': spot,
                'future': future,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': -1 * Math.log10 (precision['amount']),
                        'max': undefined,
                    },
                },
            };
            if ('PRICE_FILTER' in filters) {
                const filter = filters['PRICE_FILTER'];
                // PRICE_FILTER reports zero values for maxPrice
                // since they updated filter types in November 2018
                // https://github.com/ccxt/ccxt/issues/4286
                // therefore limits['price']['max'] doesn't have any meaningful value except undefined
                entry['limits']['price'] = {
                    'min': this.fn.safeFloat (filter, 'minPrice'),
                    'max': undefined,
                };
                const maxPrice = this.fn.safeFloat (filter, 'maxPrice');
                if ((maxPrice !== undefined) && (maxPrice > 0)) {
                    entry['limits']['price']['max'] = maxPrice;
                }
                entry['precision']['price'] = this.fn.precisionFromString ((<any>filter)['tickSize']);
            }
            if ('LOT_SIZE' in filters) {
                const filter = this.fn.safeValue (filters, 'LOT_SIZE', {} as any);
                const stepSize = this.fn.safeString (filter, 'stepSize');
                entry['precision']['amount'] = this.fn.precisionFromString (stepSize);
                entry['limits']['amount'] = {
                    'min': this.fn.safeFloat (filter, 'minQty'),
                    'max': this.fn.safeFloat (filter, 'maxQty'),
                };
            }
            if ('MIN_NOTIONAL' in filters) {
                entry['limits']['cost']!['min'] = this.fn.safeFloat (filters['MIN_NOTIONAL'], 'minNotional');
            }
            result.push (entry);
        }
        return result;
    }

    calculateFee (symbol: TickerSymbol, type: Order['type'], side: Order['side'], amount: number, price: number, takerOrMaker: 'taker' | 'maker' = 'taker', params: Params = {}) {
        const market = this.markets[symbol as string];
        let key: 'quote' | 'base';
        key = 'quote';
        const rate = market[takerOrMaker] ?? 0;
        let cost = amount * rate;
        let precision = market['precision']['price'];
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
            precision = market['precision']['amount'];
        }
        cost = parseFloat(this.fn.decimalToPrecision (cost, ROUND, precision, this.precisionMode));
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': cost,
        };
    }

    async fetchBalance (params: Params = {}) {
        await this.loadMarkets ();
        const defaultType = this.fn.safeString2 (this.options, 'fetchBalance', 'defaultType', 'spot');
        const type = this.fn.safeString (params, 'type', defaultType);
        const method = (type === 'spot') ? 'privateGetAccount' : 'fapiPrivateGetAccount';
        const query = this.fn.omit (params, 'type');
        const response = await (<any>this)[method] (query);
        { // JSON Response
        //
        // spot
        //
        //     {
        //         makerCommission: 10,
        //         takerCommission: 10,
        //         buyerCommission: 0,
        //         sellerCommission: 0,
        //         canTrade: true,
        //         canWithdraw: true,
        //         canDeposit: true,
        //         updateTime: 1575357359602,
        //         accountType: "MARGIN",
        //         balances: [
        //             { asset: "BTC", free: "0.00219821", locked: "0.00000000"  },
        //         ]
        //     }
        //
        // futures (fapi)
        //
        //     {
        //         "feeTier":0,
        //         "canTrade":true,
        //         "canDeposit":true,
        //         "canWithdraw":true,
        //         "updateTime":0,
        //         "totalInitialMargin":"0.00000000",
        //         "totalMaintMargin":"0.00000000",
        //         "totalWalletBalance":"4.54000000",
        //         "totalUnrealizedProfit":"0.00000000",
        //         "totalMarginBalance":"4.54000000",
        //         "totalPositionInitialMargin":"0.00000000",
        //         "totalOpenOrderInitialMargin":"0.00000000",
        //         "maxWithdrawAmount":"4.54000000",
        //         "assets":[
        //             {
        //                 "asset":"USDT",
        //                 "walletBalance":"4.54000000",
        //                 "unrealizedProfit":"0.00000000",
        //                 "marginBalance":"4.54000000",
        //                 "maintMargin":"0.00000000",
        //                 "initialMargin":"0.00000000",
        //                 "positionInitialMargin":"0.00000000",
        //                 "openOrderInitialMargin":"0.00000000",
        //                 "maxWithdrawAmount":"4.54000000"
        //             }
        //         ],
        //         "positions":[
        //             {
        //                 "symbol":"BTCUSDT",
        //                 "initialMargin":"0.00000",
        //                 "maintMargin":"0.00000",
        //                 "unrealizedProfit":"0.00000000",
        //                 "positionInitialMargin":"0.00000",
        //                 "openOrderInitialMargin":"0.00000"
        //             }
        //         ]
        //     }
        //
        }
        const result: Balances = { 'info': response };
        if (type === 'spot') {
            const balances: Balance[] = this.fn.safeValue (response, 'balances', []);
            for (let i = 0; i < balances.length; i++) {
                const balance = balances[i];
                const currencyId = this.fn.safeString (balance, 'asset');
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['free'] = this.fn.safeFloat (balance, 'free');
                account['used'] = this.fn.safeFloat (balance, 'locked');
                result[code] = account;
            }
        } else {
            const balances = this.fn.safeValue (response, 'assets', []);
            for (let i = 0; i < balances.length; i++) {
                const balance = balances[i];
                const currencyId = this.fn.safeString (balance, 'asset');
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['used'] = this.fn.safeFloat (balance, 'initialMargin');
                account['total'] = this.fn.safeFloat (balance, 'marginBalance');
                result[code] = account;
            }
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol: TickerSymbol, limit?: number, params: Params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: {
            symbol: TickerSymbol;
            limit?: number;
        } = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 5000, see https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#order-book
        }
        const method = market['spot'] ? 'publicGetDepth' : 'fapiPublicGetDepth';
        const response = await (<any>this)[method] (this.fn.extend (request, params));
        const orderbook = this.parseOrderBook (response);
        orderbook['nonce'] = this.fn.safeInteger (response, 'lastUpdateId');
        return orderbook;
    }

    parseTicker (ticker: any, market?: Market): Ticker {
        const timestamp = this.fn.safeInteger (ticker, 'closeTime');
        let symbol;
        const marketId = this.fn.safeString (ticker, 'symbol');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.fn.safeFloat (ticker, 'lastPrice');
        return <Ticker>{
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.fn.iso8601 (timestamp!),
            'high': this.fn.safeFloat (ticker, 'highPrice'),
            'low': this.fn.safeFloat (ticker, 'lowPrice'),
            'bid': this.fn.safeFloat (ticker, 'bidPrice'),
            'bidVolume': this.fn.safeFloat (ticker, 'bidQty'),
            'ask': this.fn.safeFloat (ticker, 'askPrice'),
            'askVolume': this.fn.safeFloat (ticker, 'askQty'),
            'vwap': this.fn.safeFloat (ticker, 'weightedAvgPrice'),
            'open': this.fn.safeFloat (ticker, 'openPrice'),
            'close': last,
            'last': last,
            'previousClose': this.fn.safeFloat (ticker, 'prevClosePrice'), // previous day close
            'change': this.fn.safeFloat (ticker, 'priceChange'),
            'percentage': this.fn.safeFloat (ticker, 'priceChangePercent'),
            'average': undefined,
            'baseVolume': this.fn.safeFloat (ticker, 'volume'),
            'quoteVolume': this.fn.safeFloat (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    declare wapiGetSystemStatus: Function;

    // declare wapiGetSystemStatus(): { 
    //     status: 0;   // 0: normal，1：system maintenance
    //     msg: string; // normal or system maintenance
    // };

    async fetchStatus (params: Params = {}) {
        const response = await this.wapiGetSystemStatus ();
        let status = this.fn.safeValue (response, 'status');
        if (status !== undefined) {
            status = (status === 0) ? 'ok' : 'maintenance';
            this.status = this.fn.extend (this.status, {
                'status': status,
                'updated': this.fn.milliseconds (),
            });
        }
        return this.status;
    }

    declare publicGetTicker24hr: Function;
    declare fapiPublicGetTicker24hr: Function;

    async fetchTicker (symbol: TickerSymbol, params: Params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const method = market['spot'] ? 'publicGetTicker24hr' : 'fapiPublicGetTicker24hr';
        const response = await this[method] (this.fn.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseTickers (rawTickers: [], symbols?: TickerSymbol[]) {
        const tickers: Ticker[] = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArrayAsDictionary (tickers, 'symbol', symbols as string[]);
    }

    declare publicGetTickerBookTicker: Function
    declare fapiPublicGetTickerBookTicker: Function

    async fetchBidsAsks (symbols = undefined, params: Params = {}) {
        await this.loadMarkets ();
        const defaultType = this.fn.safeString2 (this.options, 'fetchOpenOrders', 'defaultType', 'spot');
        const type = this.fn.safeString (params, 'type', defaultType);
        const query = this.fn.omit (params, 'type');
        const method = (type === 'spot') ? 'publicGetTickerBookTicker' : 'fapiPublicGetTickerBookTicker';
        const response = await this[method] (query);
        return this.parseTickers (response, symbols);
    }

    declare fetchTickersMethod: Function

    async fetchTickers (symbols?: TickerSymbol[], params?: Params) {
        await this.loadMarkets ();
        const method = this.options['fetchTickersMethod'];
        const response = await (<any>this)[method] (params);
        return this.parseTickers (response, symbols);
    }

    parseOHLCV (ohlcv: string[], market?: Market, timeframe = '1m', since?: number, limit?: number) {
        return [
            ohlcv[0],
            parseFloat (ohlcv[1]),
            parseFloat (ohlcv[2]),
            parseFloat (ohlcv[3]),
            parseFloat (ohlcv[4]),
            parseFloat (ohlcv[5]),
        ];
    }

    timeframes: Dictionary<WebAPI.CandleChartInterval> = {};
    declare publicGetKlines: Function
    declare fapiPublicGetKlines: Function

    async fetchOHLCV (symbol: TickerSymbol, timeframe: WebAPI.CandleChartInterval = WebAPI.CandleChartInterval.ONE_MINUTE, since?: number, limit?: number, params?: Params) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: WebAPI.CandlesOptions = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default == max == 500
        }
        const method = market['spot'] ? 'publicGetKlines' : 'fapiPublicGetKlines';
        const response = await this[method] (this.fn.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade: WebAPI.Trade, market?: Market) {
        if ('isDustTrade' in trade) {
            return this.parseDustTrade (trade, market);
        }
        { // JSON Response
        //
        // aggregate trades
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#compressedaggregate-trades-list
        //
        //     {
        //         "a": 26129,         // Aggregate tradeId
        //         "p": "0.01633102",  // Price
        //         "q": "4.70443515",  // Quantity
        //         "f": 27781,         // First tradeId
        //         "l": 27781,         // Last tradeId
        //         "T": 1498793709153, // Timestamp
        //         "m": true,          // Was the buyer the maker?
        //         "M": true           // Was the trade the best price match?
        //     }
        //
        // recent public trades and old public trades
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#recent-trades-list
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#old-trade-lookup-market_data
        //
        //     {
        //         "id": 28457,
        //         "price": "4.00000100",
        //         "qty": "12.00000000",
        //         "time": 1499865549590,
        //         "isBuyerMaker": true,
        //         "isBestMatch": true
        //     }
        //
        // private trades
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#account-trade-list-user_data
        //
        //     {
        //         "symbol": "BNBBTC",
        //         "id": 28457,
        //         "orderId": 100234,
        //         "price": "4.00000100",
        //         "qty": "12.00000000",
        //         "commission": "10.10000000",
        //         "commissionAsset": "BNB",
        //         "time": 1499865549590,
        //         "isBuyer": true,
        //         "isMaker": false,
        //         "isBestMatch": true
        //     }
        //
        // futures trades
        // https://binance-docs.github.io/apidocs/futures/en/#account-trade-list-user_data
        //
        //     {
        //       "accountId": 20,
        //       "buyer": False,
        //       "commission": "-0.07819010",
        //       "commissionAsset": "USDT",
        //       "counterPartyId": 653,
        //       "id": 698759,
        //       "maker": False,
        //       "orderId": 25851813,
        //       "price": "7819.01",
        //       "qty": "0.002",
        //       "quoteQty": "0.01563",
        //       "realizedPnl": "-0.91539999",
        //       "side": "SELL",
        //       "symbol": "BTCUSDT",
        //       "time": 1569514978020
        //     }
        //
        }
        const timestamp = this.fn.safeInteger2 (trade, 'T', 'time');
        const price = this.fn.safeFloat2 (trade, 'p', 'price') ?? 0;
        const amount = this.fn.safeFloat2 (trade, 'q', 'qty') ?? 0;
        const id = this.fn.safeString2 (trade, 'a', 'id');
        let side;
        const orderId = this.fn.safeString (trade, 'orderId');
        if ('m' in trade) {
            side = trade['m'] ? 'sell' : 'buy'; // this is reversed intentionally
        } else if ('isBuyerMaker' in trade) {
            side = trade['isBuyerMaker'] ? 'sell' : 'buy';
        } else if ('side' in trade) {
            side = this.fn.safeStringLower (trade, 'side');
        } else {
            if ('isBuyer' in trade) {
                side = trade['isBuyer'] ? 'buy' : 'sell'; // this is a true side
            }
        }
        let fee;
        if ('commission' in trade) {
            fee = {
                'cost': this.fn.safeFloat (trade, 'commission'),
                'currency': this.safeCurrencyCode (this.fn.safeString (trade, 'commissionAsset')),
            };
        }
        let takerOrMaker;
        if ('isMaker' in trade) {
            takerOrMaker = trade['isMaker'] ? 'maker' : 'taker';
        }
        let symbol;
        if (market === undefined) {
            const marketId = this.fn.safeString (trade, 'symbol');
            market = this.fn.safeValue (this.markets_by_id, marketId);
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return <Trade>{
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.fn.iso8601 (timestamp!),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'fee': fee,
        };
    }

    async fetchTrades (symbol: TickerSymbol, since?: number, limit?: number, params?: Params): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: {
            symbol: TickerSymbol;
            fromId?: string;
            startTime?: number;
            endTime?: number;
            limit?: number;
        } = {
            'symbol': market['id'],
            // 'fromId': 123,    // ID to get aggregate trades from INCLUSIVE.
            // 'startTime': 456, // Timestamp in ms to get aggregate trades from INCLUSIVE.
            // 'endTime': 789,   // Timestamp in ms to get aggregate trades until INCLUSIVE.
            // 'limit': 500,     // default = 500, maximum = 1000
        };
        if (this.options['fetchTradesMethod'] === 'publicGetAggTrades') {
            if (since !== undefined) {
                request['startTime'] = since;
                // https://github.com/ccxt/ccxt/issues/6400
                // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#compressedaggregate-trades-list
                request['endTime'] = this.fn.sum (since, 3600000);
            }
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default = 500, maximum = 1000
        }
        //
        // Caveats:
        // - default limit (500) applies only if no other parameters set, trades up
        //   to the maximum limit may be returned to satisfy other parameters
        // - if both limit and time window is set and time window contains more
        //   trades than the limit then the last trades from the window are returned
        // - 'tradeId' accepted and returned by this method is "aggregate" trade id
        //   which is different from actual trade id
        // - setting both fromId and time window results in error
        const method = this.fn.safeValue (this.options, 'fetchTradesMethod', 'publicGetTrades');
        const response: WebAPI.AggregatedTrade[] = await (<any>this)[method] (this.fn.extend (request, params));
        { // JSON Response
        //
        // aggregate trades
        //
        //     [
        //         {
        //             "a": 26129,         // Aggregate tradeId
        //             "p": "0.01633102",  // Price
        //             "q": "4.70443515",  // Quantity
        //             "f": 27781,         // First tradeId
        //             "l": 27781,         // Last tradeId
        //             "T": 1498793709153, // Timestamp
        //             "m": true,          // Was the buyer the maker?
        //             "M": true           // Was the trade the best price match?
        //         }
        //     ]
        //
        // recent public trades and historical public trades
        //
        //     [
        //         {
        //             "id": 28457,
        //             "price": "4.00000100",
        //             "qty": "12.00000000",
        //             "time": 1499865549590,
        //             "isBuyerMaker": true,
        //             "isBestMatch": true
        //         }
        //     ]
        //
        }
        return this.parseTrades (response, market, since, limit);
    }

    parseOrderStatus (status: string) {
        const statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'PENDING_CANCEL': 'canceling', // currently unused
            'REJECTED': 'rejected',
            'EXPIRED': 'canceled',
        };
        return this.fn.safeString (statuses, status, status);
    }

    parseOrder (order: any, market?: Market) {
        const status = this.parseOrderStatus (this.fn.safeString (order, 'status'));
        let symbol: TickerSymbol = '';
        const marketId = this.fn.safeString (order, 'symbol');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let timestamp: number;
        if ('time' in order) {
            timestamp = this.fn.safeInteger (order, 'time');
        } else if ('transactTime' in order) {
            timestamp = this.fn.safeInteger (order, 'transactTime');
        }
        let price = this.fn.safeFloat (order, 'price');
        const amount = this.fn.safeFloat (order, 'origQty');
        const filled = this.fn.safeFloat (order, 'executedQty');
        let remaining;
        // - Spot/Margin market: cummulativeQuoteQty
        // - Futures market: cumQuote.
        //   Note this is not the actual cost, since Binance futures uses leverage to calculate margins.
        let cost = this.fn.safeFloat2 (order, 'cummulativeQuoteQty', 'cumQuote');
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = amount - filled;
                if (this.options['parseOrderToPrecision']) {
                    remaining = parseFloat (this.amountToPrecision (symbol, remaining));
                }
                remaining = Math.max (remaining, 0.0);
            }
            if (price !== undefined) {
                if (cost === undefined) {
                    cost = price * filled;
                }
            }
        }
        const id = this.fn.safeString (order, 'orderId');
        let type = this.fn.safeStringLower (order, 'type');
        if (type === 'market') {
            if (price === 0.0) {
                if ((cost !== undefined) && (filled !== undefined)) {
                    if ((cost > 0) && (filled > 0)) {
                        price = cost / filled;
                        if (this.options['parseOrderToPrecision']) {
                            price = parseFloat (this.priceToPrecision (symbol, price));
                        }
                    }
                }
            }
        } else if (type === 'limit_maker') {
            type = 'limit';
        }
        const side = this.fn.safeStringLower (order, 'side');
        let fee;
        let trades;
        const fills: any = this.fn.safeValue (order, 'fills');
        if (fills !== undefined) {
            trades = this.parseTrades (fills, market);
            const numTrades = trades.length;
            if (numTrades > 0) {
                cost = trades[0]['cost'];
                fee = {
                    'cost': trades[0]['fee']['cost'],
                    'currency': trades[0]['fee']['currency'],
                };
                for (let i = 1; i < trades.length; i++) {
                    cost = this.fn.sum (cost, trades[i]['cost']);
                    fee['cost'] = this.fn.sum (fee['cost'], trades[i]['fee']['cost']);
                }
            }
        }
        let average;
        if (cost !== undefined) {
            if (filled) {
                average = cost / filled;
                if (this.options['parseOrderToPrecision']) {
                    average = parseFloat (this.priceToPrecision (symbol, average));
                }
            }
            if (this.options['parseOrderToPrecision']) {
                cost = parseFloat (this.costToPrecision (symbol, cost));
            }
        }
        return <Order>{
            'info': order,
            'id': id,
            'timestamp': timestamp!,
            'datetime': this.fn.iso8601 (timestamp!),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': trades,
        };
    }

    async createOrder (symbol: TickerSymbol, type: Order['type'], side: Order['side'], amount: number, price?: number, params?: Params) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        // the next 5 lines are added to support for testing orders
        let method = market['spot'] ? 'privatePostOrder' : 'fapiPrivatePostOrder';
        if (market['spot']) {
            const test = !!this.fn.safeValue (params!, 'test', false);
            if (test) {
                method += 'Test';
                params = this.fn.omit (params, 'test');
            }
        }
        const uppercaseType = type.toUpperCase ();
        const validOrderTypes = this.fn.safeValue (market['info'], 'orderTypes');
        if (!this.fn.inArray (uppercaseType, validOrderTypes)) {
            throw new InvalidOrder (this.id + ' ' + type + ' is not a valid order type in ' + market['type'] + ' market ' + symbol);
        }
        const request: WebAPI.NewOrder & { quoteOrderQty: string} = {
            'symbol': market['id'],
            'type': uppercaseType,
            'side': side.toUpperCase (),
        } as any;
        if (uppercaseType === 'MARKET') {
            const quoteOrderQty = this.fn.safeFloat (params!, 'quoteOrderQty');
            if (quoteOrderQty !== undefined) {
                request['quoteOrderQty'] = this.costToPrecision (symbol, quoteOrderQty);
            } else if (price !== undefined) {
                request['quoteOrderQty'] = this.costToPrecision (symbol, amount * price);
            } else {
                request['quantity'] = this.amountToPrecision (symbol, amount);
            }
        } else {
            request['quantity'] = this.amountToPrecision (symbol, amount);
        }
        if (market['spot']) {
            request['newOrderRespType'] = this.fn.safeValue (this.options['newOrderRespType'], type, 'RESULT'); // 'ACK' for order id, 'RESULT' for full order or 'FULL' for order with fills
        }
        let timeInForceIsRequired = false;
        let priceIsRequired = false;
        let stopPriceIsRequired = false;
        if (uppercaseType === 'LIMIT') {
            priceIsRequired = true;
            timeInForceIsRequired = true;
        } else if ((uppercaseType === 'STOP_LOSS') || (uppercaseType === 'TAKE_PROFIT')) {
            stopPriceIsRequired = true;
        } else if ((uppercaseType === 'STOP_LOSS_LIMIT') || (uppercaseType === 'TAKE_PROFIT_LIMIT')) {
            stopPriceIsRequired = true;
            priceIsRequired = true;
            timeInForceIsRequired = true;
        } else if (uppercaseType === 'LIMIT_MAKER') {
            priceIsRequired = true;
        } else if (uppercaseType === 'STOP') {
            stopPriceIsRequired = true;
            priceIsRequired = true;
        }
        if (priceIsRequired) {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder method requires a price argument for a ' + type + ' order');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (timeInForceIsRequired) {
            request['timeInForce'] = this.options['defaultTimeInForce']; // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
        }
        if (stopPriceIsRequired) {
            const stopPrice = this.fn.safeFloat (params!, 'stopPrice');
            if (stopPrice === undefined) {
                throw new InvalidOrder (this.id + ' createOrder method requires a stopPrice extra param for a ' + type + ' order');
            } else {
                params = this.fn.omit (params, 'stopPrice');
                request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
            }
        }
        const response = await (<any>this)[method] (this.fn.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOrder (id: string, symbol: TickerSymbol, params: Params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['spot'] ? 'privateGetOrder' : 'fapiPrivateGetOrder';
        const request: {
            symbol: TickerSymbol;
            origClientOrderId?: string;
            orderId?: number;
        } = {
            'symbol': market['id'],
        };
        const origClientOrderId = this.fn.safeValue (params, 'origClientOrderId') as string;
        if (origClientOrderId !== undefined) {
            request['origClientOrderId'] = origClientOrderId;
        } else {
            request['orderId'] = parseInt (id);
        }
        const response = await (<any>this)[method] (this.fn.extend (request, params));
        return this.parseOrder (response, market);
    }


    async fetchOrders (symbol?: TickerSymbol, since?: number, limit?: number, params: Params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: {
            symbol: TickerSymbol;
            startTime?: number;
            endTime?: number;
            limit?: number;
        } = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const method = market['spot'] ? 'privateGetAllOrders' : 'fapiPrivateGetAllOrders';
        const response = await (<any>this)[method] (this.fn.extend (request, params));
        { // JSON Response
        //
        //  Spot:
        //     [
        //         {
        //             "symbol": "LTCBTC",
        //             "orderId": 1,
        //             "clientOrderId": "myOrder1",
        //             "price": "0.1",
        //             "origQty": "1.0",
        //             "executedQty": "0.0",
        //             "cummulativeQuoteQty": "0.0",
        //             "status": "NEW",
        //             "timeInForce": "GTC",
        //             "type": "LIMIT",
        //             "side": "BUY",
        //             "stopPrice": "0.0",
        //             "icebergQty": "0.0",
        //             "time": 1499827319559,
        //             "updateTime": 1499827319559,
        //             "isWorking": true
        //         }
        //     ]
        //
        //  Futures:
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "orderId": 1,
        //             "clientOrderId": "myOrder1",
        //             "price": "0.1",
        //             "origQty": "1.0",
        //             "executedQty": "1.0",
        //             "cumQuote": "10.0",
        //             "status": "NEW",
        //             "timeInForce": "GTC",
        //             "type": "LIMIT",
        //             "side": "BUY",
        //             "stopPrice": "0.0",
        //             "updateTime": 1499827319559
        //         }
        //     ]
        //
        }
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol?: TickerSymbol, since?: number, limit?: number, params: Params = {}) {
        await this.loadMarkets ();
        let market;
        let query;
        let type;
        const request: {
            symbol: TickerSymbol;
        } = {} as any;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
            type = market['type'];
            query = params;
        } else if (this.options['warnOnFetchOpenOrdersWithoutSymbol']) {
            const symbols = this.symbols;
            const numSymbols = symbols.length;
            const fetchOpenOrdersRateLimit = Math.floor (numSymbols / 2);
            throw new ExchangeError (this.id + ' fetchOpenOrders WARNING: fetching open orders without specifying a symbol is rate-limited to one call per ' + fetchOpenOrdersRateLimit.toString () + ' seconds. Do not call this method frequently to avoid ban. Set ' + this.id + '.options["warnOnFetchOpenOrdersWithoutSymbol"] = false to suppress this warning message.');
        } else {
            const defaultType = this.fn.safeString2 (this.options, 'fetchOpenOrders', 'defaultType', 'spot');
            type = this.fn.safeString (params, 'type', defaultType);
            query = this.fn.omit (params, 'type');
        }
        const method = (type === 'spot') ? 'privateGetOpenOrders' : 'fapiPrivateGetOpenOrders';
        const response = await (<any>this)[method] (this.fn.extend (request, query));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol?: TickerSymbol, since?: number, limit?: number, params: Params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.fn.filterBy (orders, 'status', 'closed' as any);
    }

    async cancelOrder (id: string, symbol?: TickerSymbol, params?: Params) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        // https://github.com/ccxt/ccxt/issues/6507
        const origClientOrderId = this.fn.safeValue (params, 'origClientOrderId') as string;
        const request: {
            symbol: TickerSymbol;
            orderId?: number;
            origClientOrderId?: string;
        } = {
            'symbol': market['id'],
            // 'orderId': parseInt (id),
            // 'origClientOrderId': id,
        };
        if (origClientOrderId === undefined) {
            request['orderId'] = parseInt (id);
        } else {
            request['origClientOrderId'] = origClientOrderId;
        }
        const method = market['spot'] ? 'privateDeleteOrder' : 'fapiPrivateDeleteOrder';
        const response = await (<any>this)[method] (this.fn.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchMyTrades (symbol?: TickerSymbol, since?: number, limit?: number, params: Params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = market['spot'] ? 'privateGetMyTrades' : 'fapiPrivateGetUserTrades';
        const request: {
            symbol: TickerSymbol;
            startTime?: number;
            endTime?: number;
            limit?: number;
        } = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await (<any>this)[method] (this.fn.extend (request, params));
        { // JSON Response
        //
        // spot trade
        //     [
        //         {
        //             "symbol": "BNBBTC",
        //             "id": 28457,
        //             "orderId": 100234,
        //             "price": "4.00000100",
        //             "qty": "12.00000000",
        //             "commission": "10.10000000",
        //             "commissionAsset": "BNB",
        //             "time": 1499865549590,
        //             "isBuyer": true,
        //             "isMaker": false,
        //             "isBestMatch": true,
        //         }
        //     ]
        //
        // futures trade
        //
        //     [
        //         {
        //             "accountId": 20,
        //             "buyer": False,
        //             "commission": "-0.07819010",
        //             "commissionAsset": "USDT",
        //             "counterPartyId": 653,
        //             "id": 698759,
        //             "maker": False,
        //             "orderId": 25851813,
        //             "price": "7819.01",
        //             "qty": "0.002",
        //             "quoteQty": "0.01563",
        //             "realizedPnl": "-0.91539999",
        //             "side": "SELL",
        //             "symbol": "BTCUSDT",
        //             "time": 1569514978020
        //         }
        //     ]
        }
        return this.parseTrades (response, market, since, limit);
    }

    declare wapiGetUserAssetDribbletLog: Function;

    async fetchMyDustTrades (symbol = undefined, since = undefined, limit = undefined, params: Params = {}) {
        //
        // Binance provides an opportunity to trade insignificant (i.e. non-tradable and non-withdrawable)
        // token leftovers (of any asset) into `BNB` coin which in turn can be used to pay trading fees with it.
        // The corresponding trades history is called the `Dust Log` and can be requested via the following end-point:
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/wapi-api.md#dustlog-user_data
        //
        await this.loadMarkets ();
        const response = await this.wapiGetUserAssetDribbletLog (params);
        // { success:    true,
        //   results: { total:    1,
        //               rows: [ {     transfered_total: "1.06468458",
        //                         service_charge_total: "0.02172826",
        //                                      tran_id: 2701371634,
        //                                         logs: [ {              tranId:  2701371634,
        //                                                   serviceChargeAmount: "0.00012819",
        //                                                                   uid: "35103861",
        //                                                                amount: "0.8012",
        //                                                           operateTime: "2018-10-07 17:56:07",
        //                                                      transferedAmount: "0.00628141",
        //                                                             fromAsset: "ADA"                  } ],
        //                                 operate_time: "2018-10-07 17:56:06"                                } ] } }
        const results = this.fn.safeValue (response, 'results', {});
        const rows = this.fn.safeValue (results, 'rows', []);
        const data = [];
        for (let i = 0; i < rows.length; i++) {
            const logs = rows[i]['logs'];
            for (let j = 0; j < logs.length; j++) {
                logs[j]['isDustTrade'] = true;
                data.push (logs[j]);
            }
        }
        const trades = this.parseTrades (data, undefined, since, limit);
        return this.filterBySinceLimit (trades, since, limit);
    }

    parseDustTrade (trade: Trade, market?: Market) {
        // {              tranId:  2701371634,
        //   serviceChargeAmount: "0.00012819",
        //                   uid: "35103861",
        //                amount: "0.8012",
        //           operateTime: "2018-10-07 17:56:07",
        //      transferedAmount: "0.00628141",
        //             fromAsset: "ADA"                  },
        const orderId = this.fn.safeString (trade, 'tranId');
        const timestamp = this.fn.parse8601 (this.fn.safeString (trade, 'operateTime'));
        const tradedCurrency = this.safeCurrencyCode (this.fn.safeString (trade, 'fromAsset'));
        const earnedCurrency = this.currency ('BNB')['code'];
        const applicantSymbol = earnedCurrency + '/' + tradedCurrency;
        let tradedCurrencyIsQuote = false;
        if (applicantSymbol in this.markets) {
            tradedCurrencyIsQuote = true;
        }
        //
        // Warning
        // Binance dust trade `fee` is already excluded from the `BNB` earning reported in the `Dust Log`.
        // So the parser should either set the `fee.cost` to `0` or add it on top of the earned
        // BNB `amount` (or `cost` depending on the trade `side`). The second of the above options
        // is much more illustrative and therefore preferable.
        //
        const fee = {
            'currency': earnedCurrency,
            'cost': this.fn.safeFloat (trade, 'serviceChargeAmount'),
        };
        let symbol;
        let amount;
        let cost;
        let side;
        if (tradedCurrencyIsQuote) {
            symbol = applicantSymbol;
            amount = this.fn.sum (this.fn.safeFloat (trade, 'transferedAmount'), fee['cost']);
            cost = this.fn.safeFloat (trade, 'amount');
            side = 'buy';
        } else {
            symbol = tradedCurrency + '/' + earnedCurrency;
            amount = this.fn.safeFloat (trade, 'amount');
            cost = this.fn.sum (this.fn.safeFloat (trade, 'transferedAmount'), fee['cost']);
            side = 'sell';
        }
        let price;
        if (cost !== undefined) {
            if (amount) {
                price = cost / amount;
            }
        }
        const id = undefined;
        const type = undefined;
        const takerOrMaker = undefined;
        return <Trade>{
            'id': id as any,
            'timestamp': timestamp,
            'datetime': this.fn.iso8601 (timestamp!),
            'symbol': symbol,
            'order': orderId,
            'type': type as any,
            'takerOrMaker': takerOrMaker as any,
            'side': side,
            'amount': amount,
            'price': price,
            'cost': cost,
            'fee': fee as any,
            'info': trade,
        };
    }

    declare wapiGetDepositHistory: WebAPI.Binance['depositHistory'];

    async fetchDeposits (code?: string, since = undefined, limit = undefined, params: Params = {}) {
        await this.loadMarkets ();
        let currency: Currency;
        const request: {
            asset?: string;
            startTime?: number;
            endTime?: number;
        } = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
            // max 3 months range https://github.com/ccxt/ccxt/issues/6495
            request['endTime'] = this.fn.sum (since, 7776000000);
        }
        const response = await this.wapiGetDepositHistory (this.fn.extend (request, params));
        //
        //     {     success:    true,
        //       depositList: [ { insertTime:  1517425007000,
        //                            amount:  0.3,
        //                           address: "0x0123456789abcdef",
        //                        addressTag: "",
        //                              txId: "0x0123456789abcdef",
        //                             asset: "ETH",
        //                            status:  1                                                                    } ] }
        //
        return this.parseTransactions (response['depositList'], currency!, since, limit);
    }

    declare wapiGetWithdrawHistory: Function;

    async fetchWithdrawals (code?: string, since?: number, limit?: number, params: Params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        let currency: Currency;
        const request: {
            asset?: string;
            startTime?: number;
            endTime?: number;
        } = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
            // max 3 months range https://github.com/ccxt/ccxt/issues/6495
            request['endTime'] = this.fn.sum (since, 7776000000);
        }
        const response: WebAPI.WithdrawHistoryResponse = await this.wapiGetWithdrawHistory (this.fn.extend (request, params));
        { // JSON Response
        //
        //     { withdrawList: [ {      amount:  14,
        //                             address: "0x0123456789abcdef...",
        //                         successTime:  1514489710000,
        //                      transactionFee:  0.01,
        //                          addressTag: "",
        //                                txId: "0x0123456789abcdef...",
        //                                  id: "0123456789abcdef...",
        //                               asset: "ETH",
        //                           applyTime:  1514488724000,
        //                              status:  6                       },
        //                       {      amount:  7600,
        //                             address: "0x0123456789abcdef...",
        //                         successTime:  1515323226000,
        //                      transactionFee:  0.01,
        //                          addressTag: "",
        //                                txId: "0x0123456789abcdef...",
        //                                  id: "0123456789abcdef...",
        //                               asset: "ICN",
        //                           applyTime:  1515322539000,
        //                              status:  6                       }  ],
        //            success:    true                                         }
        //
        }
        return this.parseTransactions (response['withdrawList'], currency!, since, limit);
    }

    parseTransactionStatusByType (status: string, type: 'deposit' | 'withdrawal') {
        if (type === undefined) {
            return status;
        }
        const statuses = {
            'deposit': <Dictionary<string>>{
                '0': 'pending',
                '1': 'ok',
            },
            'withdrawal': <Dictionary<string>>{
                '0': 'pending', // Email Sent
                '1': 'canceled', // Cancelled (different from 1 = ok in deposits)
                '2': 'pending', // Awaiting Approval
                '3': 'failed', // Rejected
                '4': 'pending', // Processing
                '5': 'failed', // Failure
                '6': 'ok', // Completed
            },
        };
        return (status in statuses[type]) ? statuses[type][status] : status;
    }

    parseTransaction(transaction: any, currency: Currency): Transaction {
        //
        // fetchDeposits
        //      { insertTime:  1517425007000,
        //            amount:  0.3,
        //           address: "0x0123456789abcdef",
        //        addressTag: "",
        //              txId: "0x0123456789abcdef",
        //             asset: "ETH",
        //            status:  1                                                                    }
        //
        // fetchWithdrawals
        //
        //       {      amount:  14,
        //             address: "0x0123456789abcdef...",
        //         successTime:  1514489710000,
        //      transactionFee:  0.01,
        //          addressTag: "",
        //                txId: "0x0123456789abcdef...",
        //                  id: "0123456789abcdef...",
        //               asset: "ETH",
        //           applyTime:  1514488724000,
        //              status:  6                       }
        //
        const id = this.fn.safeString (transaction, 'id');
        const address = this.fn.safeString (transaction, 'address');
        let tag: string | undefined = this.fn.safeString (transaction, 'addressTag'); // set but unused
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        const txid = this.fn.safeValue (transaction, 'txId');
        const currencyId = this.fn.safeString (transaction, 'asset');
        const code = this.safeCurrencyCode (currencyId, currency);
        let timestamp: number;
        const insertTime = this.fn.safeInteger (transaction, 'insertTime');
        const applyTime = this.fn.safeInteger (transaction, 'applyTime');
        let type = this.fn.safeString (transaction, 'type') as 'deposit' | 'withdrawal';
        if (type === undefined) {
            if ((insertTime !== undefined) && (applyTime === undefined)) {
                type = 'deposit';
                timestamp = insertTime;
            } else if ((insertTime === undefined) && (applyTime !== undefined)) {
                type = 'withdrawal';
                timestamp = applyTime;
            }
        }
        const status = this.parseTransactionStatusByType (this.fn.safeString (transaction, 'status'), type);
        const amount = this.fn.safeFloat (transaction, 'amount');
        const feeCost = this.fn.safeFloat (transaction, 'transactionFee');
        let fee: Fee | undefined = undefined;
        if (feeCost !== undefined) {
            fee = { 'currency': code, 'cost': feeCost };
        }
        return <Transaction>{
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp!,
            'datetime': this.fn.iso8601 (timestamp!),
            'address': address,
            'tag': tag,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined as any,
            'fee': fee,
        };
    }

    declare wapiGetDepositAddress: Function;

    async fetchDepositAddress (code: string, params: Params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'asset': currency['id'],
        };
        const response = await this.wapiGetDepositAddress (this.fn.extend (request, params));
        const success = this.fn.safeValue (response, 'success');
        if ((success === undefined) || !success) {
            throw new InvalidAddress (this.id + ' fetchDepositAddress returned an empty response – create the deposit address in the user settings first.');
        }
        const address = this.fn.safeString (response, 'address');
        const tag = this.fn.safeString (response, 'addressTag');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': this.checkAddress (address),
            'tag': tag,
            'info': response,
        };
    }

    declare wapiGetAssetDetail: Function;
    // declare async wapiGetAssetDetail(params: Params): Promise<WebAPI.AssetDetail>;

    async fetchFundingFees (codes?: string, params: Params = {}) {
        const response = await this.wapiGetAssetDetail (params);
        { // JSON Response
        //
        //     {
        //         "success": true,
        //         "assetDetail": {
        //             "CTR": {
        //                 "minWithdrawAmount": "70.00000000", //min withdraw amount
        //                 "depositStatus": false,//deposit status
        //                 "withdrawFee": 35, // withdraw fee
        //                 "withdrawStatus": true, //withdraw status
        //                 "depositTip": "Delisted, Deposit Suspended" //reason
        //             },
        //             "SKY": {
        //                 "minWithdrawAmount": "0.02000000",
        //                 "depositStatus": true,
        //                 "withdrawFee": 0.01,
        //                 "withdrawStatus": true
        //             }
        //         }
        //     }
        //
        }
        const detail = this.fn.safeValue (response, 'assetDetail', {}) as any;
        const ids = Object.keys (detail);
        const withdrawFees: Dictionary<any> = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const code = this.safeCurrencyCode (id);
            withdrawFees[code] = this.fn.safeFloat (detail[id], 'withdrawFee');
        }
        return <FundingFees>{
            'withdraw': withdrawFees,
            'deposit': {},
            'info': response,
        };
    }

    declare wapiPostWithdraw: Function;

    async withdraw (code: string, amount: number, address: string, tag?: string, params?: Params) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        // name is optional, can be overrided via params
        const name = address.slice (0, 20);
        const request: {
            asset: string;
            address: string;
            addressTag?: string;
            amount: number;
            name: string;
        } = {
            'asset': currency['id'],
            'address': address,
            'amount': Number (amount),
            'name': name, // name is optional, can be overrided via params
            // https://binance-docs.github.io/apidocs/spot/en/#withdraw-sapi
            // issue sapiGetCapitalConfigGetall () to get networks for withdrawing USDT ERC20 vs USDT Omni
            // 'network': 'ETH', // 'BTC', 'TRX', etc, optional
        };
        if (tag !== undefined) {
            request['addressTag'] = tag;
        }
        const response = await this.wapiPostWithdraw (this.fn.extend (request, params));
        return {
            'info': response,
            'id': this.fn.safeString (response, 'id'),
        };
    }

    parseTradingFee (fee: WebAPI.TradeFee, market?: Market): TradingFee {
        //
        //     {
        //         "symbol": "ADABNB",
        //         "maker": 0.9000,
        //         "taker": 1.0000
        //     }
        //
        const marketId = this.fn.safeString (fee, 'symbol');
        let symbol: TickerSymbol = marketId;
        if (marketId in this.markets_by_id) {
            const market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        }
        return {
            'info': fee,
            'symbol': symbol,
            'maker': this.fn.safeFloat (fee, 'maker'),
            'taker': this.fn.safeFloat (fee, 'taker'),
        };
    }

    declare wapiGetTradeFee: Function;
    // declare wapiGetTradeFee(...args: any[]): WebAPI.TradeFeeResult

    async fetchTradingFee (symbol: TickerSymbol, params: Params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.wapiGetTradeFee (this.fn.extend (request, params));
        //
        //     {
        //         "tradeFee": [
        //             {
        //                 "symbol": "ADABNB",
        //                 "maker": 0.9000,
        //                 "taker": 1.0000
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const tradeFee = this.fn.safeValue (response, 'tradeFee', []);
        const first = this.fn.safeValue (tradeFee, 0, {});
        return this.parseTradingFee (first);
    }

    async fetchTradingFees (params: Params = {}) {
        await this.loadMarkets ();
        const response = await this.wapiGetTradeFee (params);
        //
        //     {
        //         "tradeFee": [
        //             {
        //                 "symbol": "ADABNB",
        //                 "maker": 0.9000,
        //                 "taker": 1.0000
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const tradeFee = this.fn.safeValue (response, 'tradeFee', []) as WebAPI.TradeFee[];
        const result: Dictionary<TradingFee> = {} as any;
        for (let i = 0; i < tradeFee.length; i++) {
            const fee = this.parseTradingFee (tradeFee[i]);
            const symbol = fee['symbol'];
            result[symbol as string] = fee;
        }
        return result;
    }

    sign (path: string, api = 'public', method = 'GET', params: Params = {}, headers?: any, body?: any) {
        let url = this.urls['api' as string][api];
        url += '/' + path;
        if (api === 'wapi') {
            url += '.html';
        }
        const userDataStream = ((path === 'userDataStream') || (path === 'listenKey'));
        if (path === 'historicalTrades') {
            if (this.apiKey) {
                headers = {
                    'X-MBX-APIKEY': this.apiKey,
                };
            } else {
                throw new AuthenticationError (this.id + ' historicalTrades endpoint requires `apiKey` credential');
            }
        } else if (userDataStream) {
            if (this.apiKey) {
                // v1 special case for userDataStream
                body = this.fn.urlencode (params);
                headers = {
                    'X-MBX-APIKEY': this.apiKey,
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
            } else {
                throw new AuthenticationError (this.id + ' userDataStream endpoint requires `apiKey` credential');
            }
        }
        if ((api === 'private') || (api === 'sapi') || (api === 'wapi' && path !== 'systemStatus') || (api === 'fapiPrivate')) {
            this.checkRequiredCredentials ();
            let query;
            if ((api === 'sapi') && (path === 'asset/dust')) {
                query = this.fn.urlencodeWithArrayRepeat (this.fn.extend ({
                    'timestamp': this.nonce (),
                    'recvWindow': this.options['recvWindow'],
                }, params));
            } else {
                query = this.fn.urlencode (this.fn.extend ({
                    'timestamp': this.nonce (),
                    'recvWindow': this.options['recvWindow'],
                }, params));
            }
            const signature = this.fn.hmac (this.encode (query), this.encode (this.secret!));
            query += '&' + 'signature=' + signature;
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
            if ((method === 'GET') || (method === 'DELETE') || (api === 'wapi')) {
                url += '?' + query;
            } else {
                body = query;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        } else {
            // userDataStream endpoints are public, but POST, PUT, DELETE
            // therefore they don't accept URL query arguments
            // https://github.com/ccxt/ccxt/issues/5224
            if (!userDataStream) {
                if (Object.keys (params).length) {
                    url += '?' + this.fn.urlencode (params);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: number, reason: string, url: string, method: string, headers: any, body: any, response: any, requestHeaders: any, requestBody: any) {
        if ((code === 418) || (code === 429)) {
            throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        // error response in a form: { "code": -1013, "msg": "Invalid quantity." }
        // following block cointains legacy checks against message patterns in "msg" property
        // will switch "code" checks eventually, when we know all of them
        if (code >= 400) {
            if (body.indexOf ('Price * QTY is zero or less') >= 0) {
                throw new InvalidOrder (this.id + ' order cost = amount * price is zero or less ' + body);
            }
            if (body.indexOf ('LOT_SIZE') >= 0) {
                throw new InvalidOrder (this.id + ' order amount should be evenly divisible by lot size ' + body);
            }
            if (body.indexOf ('PRICE_FILTER') >= 0) {
                throw new InvalidOrder (this.id + ' order price is invalid, i.e. exceeds allowed price precision, exceeds min price or max price limits or is invalid float value in general, use this.priceToPrecision (symbol, amount) ' + body);
            }
        }
        if (body.length > 0) {
            if (body[0] === '{') {
                // check success value for wapi endpoints
                // response in format {'msg': 'The coin does not exist.', 'success': true/false}
                const success = this.fn.safeValue (response, 'success', true);
                if (!success) {
                    const message = this.fn.safeString (response, 'msg');
                    let parsedMessage;
                    if (message !== undefined) {
                        try {
                            parsedMessage = JSON.parse (message);
                        } catch (e) {
                            // do nothing
                            parsedMessage = undefined;
                        }
                        if (parsedMessage !== undefined) {
                            response = parsedMessage;
                        }
                    }
                }
                const message = this.fn.safeString (response, 'msg');
                if (message !== undefined) {
                    this.throwExactlyMatchedException (this.exceptions, message, this.id + ' ' + message);
                }
                // checks against error codes
                const error = this.fn.safeString (response, 'code');
                if (error !== undefined) {
                    // https://github.com/ccxt/ccxt/issues/6501
                    if (error === '200') {
                        return;
                    }
                    // a workaround for {"code":-2015,"msg":"Invalid API-key, IP, or permissions for action."}
                    // despite that their message is very confusing, it is raised by Binance
                    // on a temporary ban (the API key is valid, but disabled for a while)
                    if ((error === '-2015') && this.options['hasAlreadyAuthenticatedSuccessfully']) {
                        throw new DDoSProtection (this.id + ' temporary banned: ' + body);
                    }
                    const feedback = this.id + ' ' + body;
                    this.throwExactlyMatchedException (this.exceptions, error, feedback);
                    throw new ExchangeError (feedback);
                }
                if (!success) {
                    throw new ExchangeError (this.id + ' ' + body);
                }
            }
        }
    }

    async request (path: string, api = 'public', method = 'GET', params: Params = {}, headers?: Dictionary<string>, body?: any) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        // a workaround for {"code":-2015,"msg":"Invalid API-key, IP, or permissions for action."}
        if ((api === 'private') || (api === 'wapi')) {
            this.options['hasAlreadyAuthenticatedSuccessfully'] = true;
        }
        return response;
    }
};
