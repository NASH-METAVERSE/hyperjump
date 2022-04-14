
import { _decorator, Component, Node, SpriteFrame, Sprite } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = HoverStatus
 * DateTime = Fri Dec 03 2021 17:09:07 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = HoverStatus.ts
 * FileBasenameNoExtension = HoverStatus
 * URL = db://assets/script/ui/HoverStatus.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * 焦点状态
 */

@ccclass('HoverAndPressedStatus')
export class HoverAndPressedStatus extends Component {

    /*
     * 默认状态 
     */
    @property({ type: SpriteFrame })
    private default_spriteFrame: SpriteFrame = null;

    /*
     * 焦点状态
     */
    @property({ type: SpriteFrame })
    private hover_spriteFrame: SpriteFrame = null;

    /*
    * 点击状态
    */
    @property({ type: SpriteFrame })
    private pressed_spriteFrame: SpriteFrame = null;

    start() {
        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.on(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
    }

    onMouseEnter() {
        this.node.getComponent(Sprite).spriteFrame = this.hover_spriteFrame;
    }

    onMouseLeave() {
        this.node.getComponent(Sprite).spriteFrame = this.default_spriteFrame;
    }

    onMouseDown() {
        this.node.getComponent(Sprite).spriteFrame = this.pressed_spriteFrame;
    }

}

