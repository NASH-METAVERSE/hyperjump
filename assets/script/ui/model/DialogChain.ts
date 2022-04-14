
import { _decorator, Component, Node, Vec3, Label } from 'cc';
import { GameConstans } from '../../entity/GameConstans';
import { ClientEvent } from '../../utils/ClientEvent';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = DialogChain
 * DateTime = Thu Mar 24 2022 22:42:44 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = DialogChain.ts
 * FileBasenameNoExtension = DialogChain
 * URL = db://assets/script/ui/model/DialogChain.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('DialogChain')
export class DialogChain extends Component {


    /*
    * 初始化对话框缩放
    */
    private initDialogScale: Vec3 = new Vec3(0, 0, 1);

    private tipsLabel: Label = null;

    /*
     * yes操作 1 切换chain 2 添加chain 3 手动切换chain 4扫码切换chain
     */
    private yes_type: number = -1;

    /*
     * 钱包类型 1 Metamask 2 Binance 3 WalletConnet
     */
    private wallet_type: number = -1;

    onLoad() {
        this.tipsLabel = this.node.getChildByName('Tips_label').getComponent(Label);
    }

    /**
     * 初始化提示语
     * @param tips 
     * @param yes 1 切换chain 2添加chain
     */
    public initTips(tips: string, yes: number) {
        this.tipsLabel.string = tips;
        this.yes_type = yes;
    }

    /**
     * 修改钱包类型
     * @param wallet_type 
     */
    public changeWalletType(walletType: number) {
        this.wallet_type = walletType;
    }

    /*
    *@Author: yozora
    *@Description: 取消操作
    *@Date: 2022-02-09 14:37:46
    */
    private noAction() {
        this.node.setScale(this.initDialogScale);
        this.node.active = false;
    }

    private yesAction() {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.CHANGE_CHAIN, this.yes_type, this.wallet_type);
    }

}