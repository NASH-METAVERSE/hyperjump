
import { _decorator, Component, Node, Widget, Label } from 'cc';
import { GameConstans } from '../../entity/GameConstans';
import { ClientEvent } from '../../utils/ClientEvent';
import { Logger } from '../../utils/Logger';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = DialogTactics
 * DateTime = Wed Feb 09 2022 17:24:23 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = DialogTactics.ts
 * FileBasenameNoExtension = DialogTactics
 * URL = db://assets/script/ui/model/DialogTactics.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 * 策略对话框UI
 */

@ccclass('DialogTactics')
export class DialogTactics extends Component {


    /*
     * 鼠标悬浮区域
     */
    private hoverArea: Node = null;

    /*
     * 鼠标悬浮区域起始位置
     */
    private hoverStartY: number = 174.59;

    /*
     * 鼠标悬浮区域间距
     */
    private hoverDistance: number = 120;

    /*
     * 是否选中按钮
     */
    private clicked: boolean = false;

    /*
     * 当前选中策略
     */
    private tactics: number = 0;

    private counter: number = 300;

    /*
     * 倒计时
     */
    private callback: Function = () => {
        if (this.counter <= 0) {
            this.unschedule(this.callback);
            // 随机策略
            this.tactics = Math.floor(Math.random() * 3) + 1;
            Logger.logBusiness('Random: ' + this.tactics);
            this.yesAction();
            return;
        }
        this.node.getChildByName('Count_label').getComponent(Label).string = this.counter.toString();
        this.counter--;
    }


    onLoad() {
        this.hoverArea = this.node.getChildByName('Hover_bg');
    }

    onEnable() {
        this.counter = 300;
        this.schedule(this.callback, 1);
    }

    onDisable() {
        this.unschedule(this.callback);
    }

    start() {
        ClientEvent.on(GameConstans.CLIENTEVENT_UI_LIST.MOVE_IN_TACTICS_AREA, this.changeHoverArea, this);
        ClientEvent.on(GameConstans.CLIENTEVENT_UI_LIST.CLICK_TACTICS_AREA, this.chooseTactics, this);
    }

    /*
     *@Author: yozora
     *@Description: 修改鼠标悬浮区域
     *@Date: 2022-02-09 17:37:20
     */
    private changeHoverArea(area: string) {
        if (!this.clicked) {
            if (area === null) {
                this.hoverArea.active = false;
                return;
            }
            // 不可选择
            if (area === "4") {

            }
            this.hoverArea.getComponent(Widget).top = this.hoverStartY + this.hoverDistance * (Number(area) - 1);
            this.hoverArea.active = true;
        }
    }

    /*
     *@Author: yozora
     *@Description: 选择策略
     *@Date: 2022-02-09 17:51:44
     */
    private chooseTactics(tactics: string) {
        this.clicked = true;
        this.hoverArea.getComponent(Widget).top = this.hoverStartY + this.hoverDistance * (Number(tactics) - 1);
        this.hoverArea.active = true;
        this.tactics = Number(tactics);
    }

    /*
    *@Author: yozora
    *@Description: 取消操作
    *@Date: 2022-02-09 14:37:46
    */
    private noAction() {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.BUTTON_ACTION, this.node, GameConstans.DIALOG_TYPE.ACTION.NO, null);
        this.unschedule(this.callback);
    }

    /*
     *@Author: yozora
     *@Description: 确认操作
     *@Date: 2022-02-09 14:40:00
     */
    private yesAction() {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.BUTTON_ACTION, this.node, GameConstans.DIALOG_TYPE.ACTION.YES, GameConstans.DIALOG_TYPE.ACTION.PLUNDER_2, this.tactics);
        this.unschedule(this.callback);
    }

}

