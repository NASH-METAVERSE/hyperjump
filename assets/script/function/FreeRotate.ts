import { _decorator, Component, EventMouse, Vec3, Quat, Vec2, Input, math, Node } from 'cc';
const { ccclass, property } = _decorator;

const qt_1 = new Quat();

/**
 * Predefined variables
 * Name = FirstPersonCameraScript
 * DateTime = Thu Oct 28 2021 11:28:24 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = FirstPersonCameraScript.ts
 * FileBasenameNoExtension = FirstPersonCameraScript
 * URL = db://assets/scripts/function/FirstPersonCameraScript.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('FreeRotate')
export class FreeRotate extends Component {


    /*
     * 最小x视角
     */
    @property
    xAxisMin: number = 140;

    /*
     * 最大x视角
     */
    @property
    xAxisMax: number = 210;

    /*
    * 插值参数
    */
    @property({ slide: true, range: [0.05, 0.5, 0.01] })
    public damp = 0.2;

    /*
     * 当前旋转
     */
    private _curRot = new Quat();

    /*
     * 当前方向
     */
    private _curDirection = new Vec3();

    /*
     * 左键按下
     */
    private leftMouseDown: boolean = false;

    /*
    * 缓存移动距离
    */
    private dmove = new Vec2();

    onEnable() {
        this.node.on(Node.EventType.MOUSE_UP, this.onMouse, this);
        this.node.on(Node.EventType.MOUSE_DOWN, this.onMouse, this);
        this.node.on(Node.EventType.MOUSE_MOVE, this.MouseMove, this);
    }

    /*
    *@Author: yozora
    *@Description: 更新节点位置与旋转
    *@Date: 2021-10-25 15:27:36
    */
    update(dt: number) {
        // rotation
        Quat.slerp(qt_1, this._curRot, this.node.rotation, 0.5);
        this.node.setRotation(qt_1);
    }

    /*
    *@Author: yozora
    *@Description: 鼠标左右键监听
    *@Date: 2021-10-21 11:10:15
    */
    private onMouse(event: EventMouse) {
        // 左键
        if (event.getButton() === 0) {
            if (event.getType() === Input.EventType.MOUSE_DOWN) {
                this.leftMouseDown = true;
            } else {
                this.leftMouseDown = false;
            }
        }
    }

    private angles: number = 0;

    /*
    *@Author: yozora
    *@Description: 左键旋转,右键拖拽
    *@Date: 2021-10-21 18:52:08
    */
    private MouseMove(e: EventMouse) {
        // 旋转
        if (this.leftMouseDown) {
            this.angles = Math.PI * 0.01;
            this.angles = math.clamp(this.angles, -90, 90);
            // 自由旋转
            Vec2.multiply(this.dmove, this.dmove, new Vec2(4, 4))
            Vec2.add(this.dmove, e.getDelta(), this.dmove)
            Vec2.divide(this.dmove, this.dmove, new Vec2(5, 5))
            this._curDirection = new Vec3(-this.dmove.y, this.dmove.x, 0);
            this._curDirection.normalize();
            Quat.rotateAround(this._curRot, this.node.rotation, this._curDirection, this.angles);
            // 垂直旋转
            // this.angleXangleX += (e.movementX + this.leftAcceleration) / 5;
            // this.angleY += (e.movementY + this.leftAcceleration) / 5;
            // this.angleY = this.Clamp(this.angleY, this.xAxisMin, this.xAxisMax);
            // Quat.fromEuler(this._curRot, this.angleY, this._curRot.y, this._curRot.z);
        }
    }


    private Clamp(val: number, min: number, max: number): number {
        if (val <= min) val = min;
        if (val >= max) val = max;
        return val;
    }

}

