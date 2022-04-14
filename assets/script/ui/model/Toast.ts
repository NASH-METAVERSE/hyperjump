
import { _decorator, Component, Node, Label, tween, Widget, Game, Tween, Vec3 } from 'cc';
import { GameConstans } from '../../entity/GameConstans';
import { ClientEvent } from '../../utils/ClientEvent';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = NewComponent
 * DateTime = Fri Feb 18 2022 14:10:05 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = NewComponent.ts
 * FileBasenameNoExtension = NewComponent
 * URL = db://assets/script/ui/model/NewComponent.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('Toast')
export class Toast extends Component {


    private toast: Node = null;

    /*
    * 初始化对话框缩放
    */
    private initDialogScale: Vec3 = new Vec3(0, 0, 1);

    start() {
        this.toast = this.node.getChildByName('Toast');
        ClientEvent.on(GameConstans.CLIENTEVENT_UI_LIST.TOAST, this.showToast, this);
    }

    /*
     *@Author: yozora
     *@Description: 显示toast
     *@Date: 2022-02-22 15:46:46
     */
    private showToast(content: string) {
        console.log('showToast: ', this.toast);
        if (!this.toast.active) {
            this.toast.active = true;
            this.toast.getChildByName('Toast_label').getComponent(Label).string = content;
            tween(this.toast).to(0.08, { scale: new Vec3(1, 0.1, 1) }).to(0.42, { scale: new Vec3(1, 1, 1) }).start();
        }
    }

    private close() {
        this.toast.setScale(this.initDialogScale);
        this.toast.active = false;
    }
}
