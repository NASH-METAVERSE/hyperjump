
import { _decorator, Component, Node, Sprite, tween, Animation } from 'cc';
import { GameConstans } from '../../entity/GameConstans';
import { ClientEvent } from '../../utils/ClientEvent';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ShipListBorder
 * DateTime = Mon Jan 10 2022 22:16:36 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = ShipListBorder.ts
 * FileBasenameNoExtension = ShipListBorder
 * URL = db://assets/script/ui/model/ShipListBorder.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('ShipListBorder')
export class ShipListBorder extends Component {

    onEnable() {
        ClientEvent.on(GameConstans.CLIENTEVENT_ANIMATION_LIST.SHIP_LIST_DAIL_GROW, this.onShipListDailGrow, this);
    }

    /*
     *@Author: yozora
     *@Description: 刻度盘连线动画
     *@Date: 2022-01-10 23:41:22
     */
    private onShipListDailGrow(type: number, fillStart: number, fillRange: number) {
        let dailName;
        if (type == 0) {
            dailName = 'Dail_line_top'
        } else {
            dailName = 'Dail_line_buttom'
        }
        this.node.getChildByName(dailName).getComponent(Sprite).fillStart = fillStart;
        this.node.getChildByName(dailName).getComponent(Sprite).fillRange = 0;
        tween(this.node.getChildByName(dailName).getComponent(Sprite)).to(0.5, { fillRange: fillRange }, {
            'onComplete': () => {
                if (this.node.getComponent(Animation).getState("dail_grow") !== null && !this.node.getComponent(Animation).getState("dail_grow").isPlaying) {
                    this.node.getComponent(Animation).getState("dail_grow").play();
                }
            }
        }).tag(2).start();
    }

}

