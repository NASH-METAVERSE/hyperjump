
import { _decorator, Component, Node, director, tween, Vec3, find, game, EditBox, Label, resources, Prefab, instantiate, AnimationState, Animation } from 'cc';
import { DataManager } from '../../DataManager';
import { GameConstans } from '../../entity/GameConstans';
import { ClientEvent } from '../../utils/ClientEvent';
import { HttpRequest } from '../../utils/HttpRequest';
import { Logger } from '../../utils/Logger';
import { DialogChain } from './DialogChain';
import { DialogSystem } from './DialogSystem';
// @ts-ignore
import detectEthereumProvider from '@metamask/detect-provider';
import { WalletConnect } from "../../plugins/walletConnect/walletconnect-bundle.js";
import { QRCodeModal } from "../../plugins/qr/walletconnect-qr-bundle.js";


const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Login
 * DateTime = Sat Feb 19 2022 23:08:55 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = Login.ts
 * FileBasenameNoExtension = Login
 * URL = db://assets/script/ui/model/Login.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('Login')
export class Login extends Component {


    /*
     * 对话框预制体
     */
    @property({ type: Prefab })
    private dialog_chain_prefab: Prefab = null;

    /*
     * 对话框
     */
    private dialogChain: Node = null;

    /*
     * 链ID
     */
    private chainId: string = null;

    /*
    * 初始化对话框缩放
    */
    private initDialogScale: Vec3 = new Vec3(0, 0, 1);

    onLoad() {
        ClientEvent.on(GameConstans.CLIENTEVENT_LIST.CHANGE_CHAIN, this.changeChain, this);
    }

    start() {
        this.detectProvider();
    }

    /**
     * 登录请求
     */
    private login() {
        HttpRequest.getServerInfo().then(res => {
            if (res.code === GameConstans.DATA_TYPE.SUCCESS && res.data.availableFlag === "1") {
                this.node.getChildByName('Login').active = false;
                this.openDialog(this.node.getChildByName('Wallet_board'));
            } else {
                resources.load('prefab/ui/dialog/Dialog_system', Prefab, (err, asset) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    const dialog = instantiate(asset);
                    find('Canvas').getChildByName('Dialog_area').addChild(dialog);
                    dialog.getComponent(DialogSystem).initTips(res.data.tips, false);
                    tween(dialog).to(0.08, { scale: new Vec3(1, 0.1, 1) }).to(0.42, { scale: new Vec3(1, 1, 1) }).start();
                });
            }
        }).catch(err => {
            console.error(err);
            resources.load('prefab/ui/dialog/Dialog_system', Prefab, (err, asset) => {
                if (err) {
                    console.error(err);
                    return;
                }
                const dialog = instantiate(asset);
                find('Canvas').getChildByName('Dialog_area').addChild(dialog);
                dialog.getComponent(DialogSystem).initTips(GameConstans.TIPS_CONTENT.SERVER_ERROR, false);
                tween(dialog).to(0.08, { scale: new Vec3(1, 0.1, 1) }).to(0.42, { scale: new Vec3(1, 1, 1) }).start();
            });
        });

    }

    /**
     * 选择钱包类型
     * @param type 
     */
    private switchProvider(event: TouchEvent, customEventData: string) {
        const type = Number(customEventData);
        this.closeDialog(this.node.getChildByName('Wallet_board'));
        let eth: any = null;
        // Metamask
        if (type === 1) {
            // @ts-ignore
            if (typeof window.ethereum !== 'undefined') {
                // @ts-ignore
                eth = window.ethereum;
            } else {
                resources.load('prefab/ui/dialog/Dialog_system', Prefab, (err, asset) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    const dialog = instantiate(asset);
                    find('Canvas').getChildByName('Dialog_area').addChild(dialog);
                    const tips = GameConstans.TIPS_CONTENT.NOT_SUPPROT_METAMASK.replace('{0}', 'METAMASK');
                    dialog.getComponent(DialogSystem).initTips(tips, false);
                    tween(dialog).to(0.08, { scale: new Vec3(1, 0.1, 1) }).to(0.42, { scale: new Vec3(1, 1, 1) }).start();
                });
                return;
            }
            this.activeLoading();
            setTimeout(() => {
                if (this.chainId === null) {
                    resources.load('prefab/ui/dialog/Dialog_system', Prefab, (err, asset) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        const dialog = instantiate(asset);
                        find('Canvas').getChildByName('Dialog_area').addChild(dialog);
                        const tips = GameConstans.TIPS_CONTENT.NOT_SEND_METAMASK.replace('{0}', 'METAMASK');
                        dialog.getComponent(DialogSystem).initTips(tips, false);
                        tween(dialog).to(0.08, { scale: new Vec3(1, 0.1, 1) }).to(0.42, { scale: new Vec3(1, 1, 1) }).start();
                    });
                }
            }, 5000);
            this.switchChain(eth, type);
        }
        // Binance
        if (type === 2) {
            // @ts-ignore
            // @ts-ignore
            if (typeof window.BinanceChain !== 'undefined') {
                // @ts-ignore
                eth = window.BinanceChain;
            } else {
                resources.load('prefab/ui/dialog/Dialog_system', Prefab, (err, asset) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    const dialog = instantiate(asset);
                    find('Canvas').getChildByName('Dialog_area').addChild(dialog);
                    const tips = GameConstans.TIPS_CONTENT.NOT_SUPPROT_METAMASK.replace('{0}', 'BINANCE WALLET');
                    dialog.getComponent(DialogSystem).initTips(tips, false);
                    tween(dialog).to(0.08, { scale: new Vec3(1, 0.1, 1) }).to(0.42, { scale: new Vec3(1, 1, 1) }).start();
                });
                return;
            }
            this.activeLoading();
            setTimeout(() => {
                if (this.chainId === null) {
                    resources.load('prefab/ui/dialog/Dialog_system', Prefab, (err, asset) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        const dialog = instantiate(asset);
                        find('Canvas').getChildByName('Dialog_area').addChild(dialog);
                        const tips = GameConstans.TIPS_CONTENT.NOT_SEND_METAMASK.replace('{0}', 'BINANCE WALLET');
                        dialog.getComponent(DialogSystem).initTips(tips, false);
                        tween(dialog).to(0.08, { scale: new Vec3(1, 0.1, 1) }).to(0.42, { scale: new Vec3(1, 1, 1) }).start();
                    });
                }
            }, 5000);
            this.switchChain(eth, type);
        }
        // WalletConnet
        if (type === 3) {
            this.walletConnect(type);
        }
    }

    /**
     * 检测钱包类型
     */
    private async detectProvider() {
        const provider = await detectEthereumProvider();
        if (provider) {
            if (provider !== window.ethereum) {
                console.error('Do you have multiple wallets installed?');
            } else {
                // 优先级更高
                if (provider.isMathWallet) {
                    console.log('Ready to connect to MathWallet.');
                }
                if (provider.isMetaMask) {
                    console.log('Ready to connect to MetaMask.');
                }
            }
        } else {
            console.error('Please install MetaMask!');
        }
    }

    /**
     * walletConnect连接
     */
    private walletConnect(walletType: number) {
        // Create a connector
        const connector = new WalletConnect({
            bridge: "https://bridge.walletconnect.org", // Required
            qrcodeModal: QRCodeModal,
        });

        // Check if connection is already established
        if (!connector.connected) {
            // create new session
            connector.createSession()
            console.log('createSession');
        }

        // Subscribe to connection events
        connector.on("connect", (error, payload) => {
            if (error) {
                throw error;
            }
            // Get provided accounts and chainId
            const { accounts, chainId } = payload.params[0];
            console.log("connect: ", chainId, accounts);
            this.chainId = chainId;
            // BSC Testnet
            // @ts-ignore
            console.log(("0x" + this.chainId.toString(16)));
            // @ts-ignore
            if ((this.chainId !== GameConstans.CHAIN_ID.BSC_MAINNET && ("0x" + this.chainId.toString(16)) !== GameConstans.CHAIN_ID.BSC_MAINNET)) {
                // 切换网络
                if (!this.dialogChain) {
                    this.dialogChain = instantiate(this.dialog_chain_prefab);
                    find('Canvas').getChildByName('Dialog_area').addChild(this.dialogChain);
                }
                this.dialogChain.getComponent(DialogChain).initTips(GameConstans.TIPS_CONTENT.SWITCH_CHAIN_TIPS, 4);
                this.dialogChain.getComponent(DialogChain).changeWalletType(walletType);
                this.openDialog(this.dialogChain);
                // 断开连接
                connector.rejectSession();
            } else {
                // 登录操作
                const msgParams = this.processSignMessage(accounts[0]);
                const params = [accounts[0], msgParams];
                // Sign Typed Data
                connector
                    .signTypedData(params)
                    .then((result) => {
                        if (result.error) {
                            console.error(result.error.message);
                        }
                        if (result.error) return console.error('ERROR', result);
                        console.log('SUCCESS: ', result);
                        HttpRequest.loginFromWallet(accounts[0]).then((res) => {
                            if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                                game.addPersistRootNode(find('DataManager'));
                                find('DataManager').getComponent(DataManager).setUserAddress(res.data.userAddress);
                                director.loadScene('Main', (err, scene) => {
                                    if (err) {
                                        console.error(err);
                                        return;
                                    }
                                });
                            } else {
                                resources.load('prefab/ui/dialog/Dialog_system', Prefab, (err, asset) => {
                                    if (err) {
                                        console.error(err);
                                        return;
                                    }
                                    const dialog = instantiate(asset);
                                    find('Canvas').getChildByName('Dialog_area').addChild(dialog);
                                    dialog.getComponent(DialogSystem).initTips(GameConstans.TIPS_CONTENT.NO_ACCOUNT, true);
                                    tween(dialog).to(0.08, { scale: new Vec3(1, 0.1, 1) }).to(0.42, { scale: new Vec3(1, 1, 1) }).start();
                                });
                            }
                        })
                    })
                    .catch((error) => {
                        console.error(error);
                        Logger.erroring(error);
                    });
            }
        });

        connector.on("session_update", (error, payload) => {
            if (error) {
                throw error;
            }
            // Get updated accounts and chainId
            const { accounts, chainId } = payload.params[0];
            console.log(accounts);
            console.log(chainId);
        });

        connector.on("disconnect", (error, payload) => {
            if (error) {
                throw error;
            }
            // Delete connector
            connector.killSession();
            console.log('disconnect');
        });
    }

    /**
     * 切换网络
     * @param eth window.ethereum
     */
    private async switchChain(eth: any, walletType: number) {
        this.chainId = await eth.request({ method: 'eth_chainId' }).catch(err => {
            console.error(err);
        });
        // BSC Testnet
        if (this.chainId !== GameConstans.CHAIN_ID.BSC_TESTNET) {
            // 切换网络
            if (!this.dialogChain) {
                this.dialogChain = instantiate(this.dialog_chain_prefab);
                find('Canvas').getChildByName('Dialog_area').addChild(this.dialogChain);
            }
            this.dialogChain.getComponent(DialogChain).initTips(GameConstans.TIPS_CONTENT.SWITCH_CHAIN, 1);
            this.dialogChain.getComponent(DialogChain).changeWalletType(walletType);
            this.openDialog(this.dialogChain);
        } else {
            if (walletType === 1) {
                await this.requestAccounts(eth);
            } else {
                await this.directRequestAccounts(eth);
            }
        }
    }

    /**
     * 
     * @param type 1 切换chain 2 添加chain 3 手动切换chain 4扫码切换chain
     * @param walletType 钱包类型 1 metaMask 2 Binance wallet 3 walletConnect 
     */
    private async changeChain(type: number, walletType: number) {
        // @ts-ignore
        // Metamask
        if (walletType === 1) {
            const eth = window.ethereum;
            // 切换链
            if (type === 1) {
                if (type === 1) {
                    this.closeDialog(this.dialogChain);
                    await eth.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: GameConstans.CHAIN_ID.BSC_TESTNET }],
                    }).then(async () => {
                        await this.requestAccounts(eth);
                    }).catch(switchError => {
                        if (switchError.code === 4902) {
                            try {
                                this.closeDialog(this.dialogChain);
                                this.dialogChain.getComponent(DialogChain).initTips(GameConstans.TIPS_CONTENT.ADD_CHAIN, 2);
                                this.openDialog(this.dialogChain);
                            } catch (addError) {
                                // handle "add" error
                                console.error(addError);
                            }
                        } else {
                            // handle other "switch" errors
                            console.error(switchError);
                        }
                    });
                }
            }
            // 新增链
            if (type === 2) {
                this.closeDialog(this.dialogChain);
                await eth.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: GameConstans.CHAIN_ID.BSC_TESTNET,
                            chainName: "BSC_TESTNET",
                            rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
                        },
                    ],
                }).then(async () => {
                    await this.requestAccounts(eth);
                }).catch(err => {
                    console.error(err);
                });
            }
        }
        // Binance wallet
        if (walletType === 2) {
            // 提示手动切换链
            if (type === 1) {
                this.dialogChain.getComponent(DialogChain).initTips(GameConstans.TIPS_CONTENT.SWITCH_CHAIN_MANUAL, 3);
                this.openDialog(this.dialogChain);
            }
            // 确认是否切换链
            if (type === 3) {
                // @ts-ignore
                const eth = window.BinanceChain;
                this.chainId = null;
                setTimeout(() => {
                    if (this.chainId === null) {
                        resources.load('prefab/ui/dialog/Dialog_system', Prefab, (err, asset) => {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            const dialog = instantiate(asset);
                            find('Canvas').getChildByName('Dialog_area').addChild(dialog);
                            const tips = GameConstans.TIPS_CONTENT.NOT_SEND_METAMASK.replace('{0}', 'BINANCE WALLET');
                            dialog.getComponent(DialogSystem).initTips(tips, false);
                            tween(dialog).to(0.08, { scale: new Vec3(1, 0.1, 1) }).to(0.42, { scale: new Vec3(1, 1, 1) }).start();
                        });
                    }
                }, 5000);
                this.chainId = await eth.request({ method: 'eth_chainId' }).catch(err => {
                    console.error(err);
                });
                // BSC Testnet
                if (this.chainId !== GameConstans.CHAIN_ID.BSC_TESTNET) {
                    this.dialogChain.getComponent(DialogChain).initTips(GameConstans.TIPS_CONTENT.SWITCH_CHAIN_MANUAL, 3);
                    this.openDialog(this.dialogChain);
                } else {
                    await this.directRequestAccounts(eth);
                }
            }
        }
        // Wallet connet
        if (walletType === 3) {
            this.closeDialog(this.dialogChain);
            this.node.getChildByName('Login').active = true;
        }
    }

    /**
    * 连接账号并签名
    * @param eth window.ethereum
    */
    private async requestAccounts(eth: any) {
        await eth.request({ method: "eth_requestAccounts" }).then(async accounts => {
            await this.sendSignMsg(accounts, eth);
        }).catch(err => {
            console.error(err);
        })
    }

    /**
     * 连接账号并登录
     * @param eth 
     */
    private async directRequestAccounts(eth: any) {
        await eth.request({ method: "eth_requestAccounts" }).then(async accounts => {
            console.log('accounts', accounts[0]);
            await HttpRequest.loginFromWallet(accounts[0]).then((res) => {
                if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                    game.addPersistRootNode(find('DataManager'));
                    find('DataManager').getComponent(DataManager).setUserAddress(res.data.userAddress);
                    director.loadScene('Main', (err, scene) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                    });
                } else {
                    resources.load('prefab/ui/dialog/Dialog_system', Prefab, (err, asset) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        const dialog = instantiate(asset);
                        find('Canvas').getChildByName('Dialog_area').addChild(dialog);
                        dialog.getComponent(DialogSystem).initTips(GameConstans.TIPS_CONTENT.NO_ACCOUNT, true);
                        tween(dialog).to(0.08, { scale: new Vec3(1, 0.1, 1) }).to(0.42, { scale: new Vec3(1, 1, 1) }).start();
                    });
                }
            }).catch((err) => {
                Logger.erroring(err);
            });
        }).catch(err => {
            console.error(err);
        })
    }

    /**
     * 
     * @param froms accounts
     * @param eth window.ethereum
     */
    private async sendSignMsg(froms, eth: any) {
        // MetaMask no longer injects web3. For details, see: https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3
        var from = froms[0];
        const msgParams = this.processSignMessage(from);
        var params = [from, msgParams];
        var method = 'eth_signTypedData_v4';
        await eth.sendAsync(
            {
                method,
                params,
                from,
            },
            (err, result) => {
                if (err) return console.dir(err);
                if (result.error) {
                    console.error(result.error.message);
                }
                if (result.error) return console.error('ERROR', result);
                HttpRequest.loginFromWallet(from).then((res) => {
                    if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                        game.addPersistRootNode(find('DataManager'));
                        find('DataManager').getComponent(DataManager).setUserAddress(res.data.userAddress);
                        director.loadScene('Main', (err, scene) => {
                            if (err) {
                                console.error(err);
                                return;
                            }
                        });
                    } else {
                        resources.load('prefab/ui/dialog/Dialog_system', Prefab, (err, asset) => {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            const dialog = instantiate(asset);
                            find('Canvas').getChildByName('Dialog_area').addChild(dialog);
                            dialog.getComponent(DialogSystem).initTips(GameConstans.TIPS_CONTENT.NO_ACCOUNT, true);
                            tween(dialog).to(0.08, { scale: new Vec3(1, 0.1, 1) }).to(0.42, { scale: new Vec3(1, 1, 1) }).start();
                        });
                    }
                }).catch((err) => {
                    Logger.erroring(err);
                });
            },
        );
    }

    /*
    *@Author: yozora
    *@Description: 构造消息体
    *@Date: 2021-11-01 18:13:21
    */
    private processSignMessage(from) {

        return JSON.stringify({

            domain: {
                // Defining the chain aka Rinkeby testnet or Ethereum Main Net
                chainId: GameConstans.CHAIN_ID.BSC_TESTNET,
                // Give a user friendly name to the specific contract you are signing for.
                name: 'Confirm that it is you',
                // If name isn't enough add verifying contract to make sure you are establishing contracts with the proper entity
                verifyingContract: '0x448c3a27ba49d7af93c272513db3543ee3a95354',
                // Just let's you know the latest version. Definitely make sure the field name is correct.
                version: '1',
            },

            // Defining the message signing data content.
            message: {
                /*
                 - Anything you want. Just a JSON Blob that encodes the data you want to send
                 - No required fields
                 - This is DApp Specific
                 - Be as explicit as possible when building out the message schema.
                */
                contents: 'Confirm to login',
                // attachedMoneyInEth: 4.2,
                from: {
                    name: from,
                },
                to:
                {
                    name: 'Nash Metaverse',
                    time: new Date()
                },
            },
            // Refers to the keys of the *types* object below.
            primaryType: 'Message',
            types: {
                // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
                EIP712Domain: [
                    { name: 'name', type: 'string' },
                    { name: 'version', type: 'string' },
                    { name: 'chainId', type: 'uint256' },
                    { name: 'verifyingContract', type: 'address' },
                ],
                // Not an EIP712Domain definition
                Group: [
                    { name: 'name', type: 'string' },
                    { name: 'members', type: 'Person[]' },
                ],
                // Refer to PrimaryType
                Message: [
                    { name: 'from', type: 'Person' },
                    { name: 'to', type: 'Service' },
                    { name: 'contents', type: 'string' },
                ],
                // Not an EIP712Domain definition
                Person: [
                    { name: 'name', type: 'string' },
                    // { name: 'wallets', type: 'address[]' },
                ],
                Service: [
                    { name: 'name', type: 'string' },
                    { name: 'time', type: 'string' },
                ],
            },
        });
    }

    private activeLoading() {
        this.node.getChildByName('Loading').active = true;
        this.node.getChildByName('Loading').getComponent(Animation).getState('loading').play();
    }

    private closeLoading() {
        this.node.getChildByName('Loading').active = false;
        this.node.getChildByName('Loading').getComponent(Animation).getState('loading').stop();
    }

    /*
    *@Author: yozora
    *@Description: 打开对话框
    *@Date: 2022-02-10 15:31:57
    */
    private openDialog(dialog: Node) {
        dialog.active = true;
        tween(dialog).to(0.08, { scale: new Vec3(1, 0.1, 1) }).to(0.42, { scale: new Vec3(1, 1, 1) }).start();
    }

    private closeDialog(dialog: Node) {
        dialog.setScale(this.initDialogScale);
        dialog.active = false;
    }

}
