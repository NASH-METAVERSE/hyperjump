
import { _decorator, Component, Node, Vec3, input, Input, EventKeyboard, KeyCode } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = KeyboardMove
 * DateTime = Thu Nov 18 2021 15:00:27 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = KeyboardMove.ts
 * FileBasenameNoExtension = KeyboardMove
 * URL = db://assets/script/framework/KeyboardMove.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('KeyboardMove')
export class KeyboardMove extends Component {

    private point = new Vec3();

    private offset = new Vec3();

    private speed: number = 1;

    update(deltaTime: number) {
        //计算要移动的目标位置
        Vec3.add(this.point, this.node.position, this.offset);
        //插值计算
        Vec3.lerp(this.point, this.node.position, this.point, deltaTime * this.speed);
        //移动节点
        this.node.setPosition(this.point);
    }

    onLoad() {
        // [3]
        input.on(Input.EventType.KEY_PRESSING, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    private onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W:
                this.offset.z = 1;
                break;
            case KeyCode.KEY_S:
                this.offset.z = -1;
                break;
            case KeyCode.KEY_A:
                this.offset.x = -1;
                break;
            case KeyCode.KEY_D:
                this.offset.x = 1;
                break;
        }
        console.log(this.node.getPosition());
    }

    private onKeyUp() {
        this.offset.x = 0;
        this.offset.y = 0;
        this.offset.z = 0;
    }

}
