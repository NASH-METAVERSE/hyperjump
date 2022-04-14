
import { _decorator, Component, Node, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ButtonStatus
 * DateTime = Fri Dec 03 2021 17:03:45 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = ButtonStatus.ts
 * FileBasenameNoExtension = ButtonStatus
 * URL = db://assets/script/ui/ButtonStatus.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('ButtonStatus')
export class ButtonStatus extends Component {

    /*
     * 默认状态资源
     */
    private _defalut_spriteFrame: SpriteFrame = null;

    /*
     * 焦点状态资源
     */
    private _hover_spriteFrame: SpriteFrame = null;

    /*
     * 点击状态资源
     */
    private _pressed_spriteFrame: SpriteFrame = null;


    start() {
        // [3]
    }


}