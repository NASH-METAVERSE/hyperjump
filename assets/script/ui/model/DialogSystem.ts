
import { _decorator, Component, Node, director, Label } from 'cc';
import { ClientEvent } from '../../utils/ClientEvent';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = DialogSystem
 * DateTime = Fri Mar 04 2022 18:09:18 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = DialogSystem.ts
 * FileBasenameNoExtension = DialogSystem
 * URL = db://assets/script/ui/model/DialogSystem.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('DialogSystem')
export class DialogSystem extends Component {

    private tipsLabel: Label = null;

    onLoad() {
        this.tipsLabel = this.node.getChildByName('Tips_label').getComponent(Label);
    }

    /**
     * 初始化提示语
     * @param tips 
     */
    public initTips(tips: string, showClose: boolean) {
        this.tipsLabel.string = tips;
        if (!showClose) {
            this.node.getChildByName('Close').active = false;
        }
    }

    /*
    *@Author: yozora
    *@Description: 关闭操作
    *@Date: 2022-02-21 14:30:22
    */
    private closeAction() {
        window.close();
    }

}

