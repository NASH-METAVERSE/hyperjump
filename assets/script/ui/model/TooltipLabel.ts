
import { _decorator, Component, Node, Label, Game } from 'cc';
import { GameConstans } from '../../entity/GameConstans';
import { ClientEvent } from '../../utils/ClientEvent';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = TooltipLabel
 * DateTime = Fri Feb 04 2022 22:45:58 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = TooltipLabel.ts
 * FileBasenameNoExtension = TooltipLabel
 * URL = db://assets/script/ui/model/TooltipLabel.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 * 提示语组件
 */

@ccclass('TooltipLabel')
export class TooltipLabel extends Component {

    start() {
        ClientEvent.on(GameConstans.CLIENTEVENT_TIPS_LIST.CHANGE_TIPS_CONTENT, this.changeTipsContent, this);
    }

    /*
     *@Author: yozora
     *@Description: 修改提示语内容
     *@Date: 2022-02-04 22:50:23
     */
    private changeTipsContent(content: string) {
        if (!this.node.active) {
            this.node.active = true;
        }
        this.unscheduleAllCallbacks();
        let i = 0;
        this.node.getComponent(Label).string = GameConstans.TIPS_CONTENT.NULL;
        this.schedule(() => {
            i++;
            this.node.getComponent(Label).string = content.substring(0, i);
        }, 0.03, content.length + 1, 0.03);

    }
}
