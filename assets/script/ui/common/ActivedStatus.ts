
import { _decorator, Component, Node, SpriteFrame, Sprite, Button } from 'cc';
import { GameConstans } from '../../entity/GameConstans';
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

@ccclass('ActivedStatus')
export class ActivedStatus extends Component {

    /*
     * 未激活状态 
     */
    @property({ type: SpriteFrame })
    private unactived_spriteFrame: SpriteFrame = null;

    /*
     * 激活状态
     */
    @property({ type: SpriteFrame })
    private actived_spriteFrame: SpriteFrame = null;

    /*
    * 点击状态
    */
    @property({ type: SpriteFrame })
    private pressed_spriteFrame: SpriteFrame = null;

    /*
    * 未激活状态 
    */
    @property({ type: SpriteFrame })
    private unactived_spriteFrame_alternative: SpriteFrame = null;

    /*
     * 激活状态
     */
    @property({ type: SpriteFrame })
    private actived_spriteFrame_alternative: SpriteFrame = null;

    /*
    * 点击状态
    */
    @property({ type: SpriteFrame })
    private pressed_spriteFrame_alternative: SpriteFrame = null;

    /*
     * 图片类型(0:未激活状态,1:激活状态)
     */
    private spriteFrameType: number = 0;

    /*
     * 是否激活状态
     */
    public actived: boolean = false;

    public pressed: boolean = false;

    start() {
        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.on(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
    }

    onMouseEnter() {
        if (this.actived) {
            this.node.getChildByName('Hover_border').active = true;
        }
    }

    onMouseLeave() {
        if (this.actived) {
            this.node.getChildByName('Hover_border').active = false;
            if (!this.pressed) {
                if (this.spriteFrameType === 0) {
                    this.node.getComponent(Sprite).spriteFrame = this.actived_spriteFrame;
                } else {
                    this.node.getComponent(Sprite).spriteFrame = this.actived_spriteFrame_alternative;
                }
            }
        }
    }

    onMouseDown() {
        if (this.actived) {
            this.pressed = true;
            if (!this.pressed) {
                if (this.spriteFrameType === 0) {
                    this.node.getComponent(Sprite).spriteFrame = this.actived_spriteFrame;
                } else {
                    this.node.getComponent(Sprite).spriteFrame = this.actived_spriteFrame_alternative;
                }
            } else {
                if (this.spriteFrameType === 0) {
                    this.node.getComponent(Sprite).spriteFrame = this.pressed_spriteFrame;
                } else {
                    this.node.getComponent(Sprite).spriteFrame = this.pressed_spriteFrame_alternative;
                }
            }
        }
    }

    /*
     *@Author: yozora
     *@Description: 重置按钮状态
     *@Date: 2022-02-18 15:52:30
     */
    public reset(pressed: boolean, actived: boolean) {
        if (pressed !== null) {
            this.pressed = pressed;
        }
        if (actived !== null) {
            this.actived = actived;
            // 按钮是否可使用
            if (this.actived) {
                this.node.getComponent(Button).interactable = true;
            } else {
                this.node.getComponent(Button).interactable = false;
            }
        }
        if (this.actived) {
            if (!this.pressed) {
                if (this.spriteFrameType === 0) {
                    this.node.getComponent(Sprite).spriteFrame = this.actived_spriteFrame;
                } else {
                    this.node.getComponent(Sprite).spriteFrame = this.actived_spriteFrame_alternative;
                }
            } else {
                if (this.spriteFrameType === 0) {
                    this.node.getComponent(Sprite).spriteFrame = this.pressed_spriteFrame;
                } else {
                    this.node.getComponent(Sprite).spriteFrame = this.pressed_spriteFrame_alternative;
                }
            }
        } else {
            if (this.spriteFrameType === 0) {
                this.node.getComponent(Sprite).spriteFrame = this.unactived_spriteFrame;
            } else {
                this.node.getComponent(Sprite).spriteFrame = this.unactived_spriteFrame_alternative;
            }
        }
    }

    /*
     *@Author: yozora
     *@Description: 修改按钮主题
     *@Date: 2022-02-10 18:31:05
     */
    public changeSpriteFrame(spriteFrameType: number, positive: boolean) {
        this.spriteFrameType = spriteFrameType;
        if (positive) {
            if (this.spriteFrameType === 0) {
                this.node.getComponent(Sprite).spriteFrame = this.pressed_spriteFrame;
            } else {
                this.node.getComponent(Sprite).spriteFrame = this.pressed_spriteFrame_alternative;
            }
        }
    }

    public getSpriteFrameType() {
        return this.spriteFrameType;
    }
}

