
import { _decorator, Component, Node, EventMouse, Button } from 'cc';
import { GameConstans } from '../../entity/GameConstans';
import { ClientEvent } from '../../utils/ClientEvent';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ShipCard
 * DateTime = Mon Nov 22 2021 19:11:49 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = ShipCard.ts
 * FileBasenameNoExtension = ShipCard
 * URL = db://assets/script/ui/ShipCard.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * 飞船卡片
 */

@ccclass('ShipCard')
export class ShipCard extends Component {

    /*
     * 飞船位置索引
     */
    public ship_index: number = 0;

    public ship_name: string = "";

    /*
     * 是否选中状态
     */
    public _isChecked: boolean = false;

    start() {
        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
    }

    /*
     *@Author: yozora
     *@Description: 鼠标hover事件
     *@Date: 2021-11-25 18:52:49
     */
    private onMouseEnter(e: EventMouse) {
        // 显示星图工具栏
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.CHANGE_CARD_HOVER_STATUS, this.node.name, true);
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.HOVER_SHIP_CARD, this.node.name, true);
    }

    /*
     *@Author: yozora
     *@Description: 鼠标hover事件
     *@Date: 2021-11-25 18:53:00
     */
    private onMouseLeave(e: EventMouse) {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.CHANGE_CARD_HOVER_STATUS, this.node.name, false);
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.HOVER_SHIP_CARD, this.node.name, false);
    }

    /*
     *@Author: yozora
     *@Description: 卡片选中事件
     *@Date: 2021-11-24 23:22:11
     */
    private onCheckedCard(event: Button) {
        this._isChecked = !this._isChecked;
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.CHANGE_CARD_PRESSED_STATUS, this.node.name, this._isChecked);
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.CLICK_SHIP_CARD, this.node.name);
    }

    /*
     *@Author: yozora
     *@Description: 连线动画监听
     *@Date: 2022-01-10 22:11:05
     */
    private dail_grow() {
        if (this.ship_index.toString().lastIndexOf("1") !== -1 || this.ship_index.toString().lastIndexOf("0") !== -1) {
            if (this.ship_index.toString().lastIndexOf("0") !== -1) {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_ANIMATION_LIST.SHIP_LIST_DAIL_GROW, 1, 0, 1);
            } else {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_ANIMATION_LIST.SHIP_LIST_DAIL_GROW, 0, 1, -1);
            }
        }
        if (this.ship_index.toString().lastIndexOf("2") !== -1 || this.ship_index.toString().lastIndexOf("9") !== -1) {
            if (this.ship_index.toString().lastIndexOf("2") !== -1) {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_ANIMATION_LIST.SHIP_LIST_DAIL_GROW, 0, 0.779, -0.779);
            } else {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_ANIMATION_LIST.SHIP_LIST_DAIL_GROW, 1, 0.223, 0.779);
            }
        }
        if (this.ship_index.toString().lastIndexOf("3") !== -1 || this.ship_index.toString().lastIndexOf("8") !== -1) {
            if (this.ship_index.toString().lastIndexOf("3") !== -1) {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_ANIMATION_LIST.SHIP_LIST_DAIL_GROW, 0, 0.555, -0.555);
            } else {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_ANIMATION_LIST.SHIP_LIST_DAIL_GROW, 1, 0.443, 0.557);
            }
        }
        if (this.ship_index.toString().lastIndexOf("4") !== -1 || this.ship_index.toString().lastIndexOf("7") !== -1) {
            if (this.ship_index.toString().lastIndexOf("4") !== -1) {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_ANIMATION_LIST.SHIP_LIST_DAIL_GROW, 0, 0.332, -0.332);
            } else {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_ANIMATION_LIST.SHIP_LIST_DAIL_GROW, 1, 0.664, 0.336);
            }
        }
        if (this.ship_index.toString().lastIndexOf("5") !== -1 || this.ship_index.toString().lastIndexOf("6") !== -1) {
            if (this.ship_index.toString().lastIndexOf("5") !== -1) {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_ANIMATION_LIST.SHIP_LIST_DAIL_GROW, 0, 0.112, -0.112);
            } else {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_ANIMATION_LIST.SHIP_LIST_DAIL_GROW, 1, 0.887, 0.112);
            }
        }
    }

}

