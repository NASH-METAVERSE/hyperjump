
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
 * 对手飞船卡片
 */

@ccclass('ShipCardPlanet')
export class ShipCardPlanet extends Component {

    /*
     * 飞船位置索引
     */
    public ship_index: number = 0;

    /*
     * 是否选中状态
     */
    public _isChecked: boolean = false;

    onLoad() {
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
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.PLANET.CHANGE_CARD_HOVER_STATUS, this.node.name, true);
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.PLANET.HOVER_SHIP_CARD, this.node.name, true);
    }

    /*
     *@Author: yozora
     *@Description: 鼠标hover事件
     *@Date: 2021-11-25 18:53:00
     */
    private onMouseLeave(e: EventMouse) {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.PLANET.CHANGE_CARD_HOVER_STATUS, this.node.name, false);
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.PLANET.HOVER_SHIP_CARD, this.node.name, false);
    }

    /*
     *@Author: yozora
     *@Description: 卡片选中事件
     *@Date: 2021-11-24 23:22:11
     */
    private onCheckedCard(event: Button) {
        this._isChecked = !this._isChecked;
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.PLANET.CHANGE_CARD_PRESSED_STATUS, this.node.name, this._isChecked);
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.PLANET.CLICK_SHIP_CARD, this.node.name);
    }

}

