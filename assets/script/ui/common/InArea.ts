
import { _decorator, Component, Node, EventTouch } from 'cc';
import { GameConstans } from '../../entity/GameConstans';
import { ClientEvent } from '../../utils/ClientEvent';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = InArea
 * DateTime = Wed Feb 09 2022 17:32:06 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = InArea.ts
 * FileBasenameNoExtension = InArea
 * URL = db://assets/script/ui/common/InArea.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 * 区域移动
 */

@ccclass('InArea')
export class InArea extends Component {

    start() {
        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
    }

    private onMouseEnter(e: EventTouch) {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.MOVE_IN_TACTICS_AREA, this.node.name);
    }

    private onMouseLeave(e: EventTouch) {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.MOVE_IN_TACTICS_AREA, null);
    }

    private onMouseDown(e: EventTouch) {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.CLICK_TACTICS_AREA, this.node.name);
    }
}

