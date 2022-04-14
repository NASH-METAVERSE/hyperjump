
import { _decorator, Component, Node, find, Game } from 'cc';
import { GameConstans } from '../../entity/GameConstans';
import { UserOperateManager } from '../../UserOperateManager';
import { ClientEvent } from '../../utils/ClientEvent';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Dialog
 * DateTime = Wed Feb 09 2022 14:26:12 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = Dialog.ts
 * FileBasenameNoExtension = Dialog
 * URL = db://assets/script/ui/model/Dialog.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 * 对话框UI控制
 */

@ccclass('Dialog')
export class Dialog extends Component {

    /*
     * 飞船编码
     */
    private shipCode: string = null;

    /*
     *@Author: yozora
     *@Description: 关闭操作
     *@Date: 2022-02-21 14:30:22
     */
    private closeAction() {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.BUTTON_ACTION, this.node, GameConstans.DIALOG_TYPE.ACTION.CLOSE, find('Canvas').getComponent(UserOperateManager).userOperateType);
    }

    /*
     *@Author: yozora
     *@Description: 取消操作
     *@Date: 2022-02-09 14:37:46
     */
    private noAction() {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.BUTTON_ACTION, this.node, GameConstans.DIALOG_TYPE.ACTION.NO, find('Canvas').getComponent(UserOperateManager).userOperateType);
    }

    /*
     *@Author: yozora
     *@Description: 确认操作
     *@Date: 2022-02-09 14:40:00
     */
    private yesAction() {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.BUTTON_ACTION, this.node, GameConstans.DIALOG_TYPE.ACTION.YES, find('Canvas').getComponent(UserOperateManager).userOperateType);
    }

    public getShipCode() {
        return this.shipCode;
    }

    public setShipCode(shipCode: string) {
        this.shipCode = shipCode;
    }

}
