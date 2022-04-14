
import { _decorator, Component, Node, Vec3, quat, Quat, Vec2, systemEvent, SystemEvent, EventMouse, math, input, Input } from 'cc';
const { ccclass, property } = _decorator;

const qt_1 = new Quat();

/**
 * Predefined variables
 * Name = ObjectRotate
 * DateTime = Fri Jan 21 2022 10:47:35 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = ObjectRotate.ts
 * FileBasenameNoExtension = ObjectRotate
 * URL = db://assets/script/function/ObjectRotate.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('ObjectRotate')
export class ObjectRotate extends Component {


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
     * 当前位置
     */
    private _curPos = new Vec3(0, 0, 0);

    /*
     * 当前旋转
     */
    private _curRot = new Quat();

    /*
     * 当前方向
     */
    private _curDirection = math.Vec3.negate(new math.Vec3(), math.Vec3.UNIT_Z);

    /*
     * 左键按下
     */
    private leftMouseDown: boolean = false;

    private angles: number = Math.PI * 0.01;

    onEnable() {
        input.on(Input.EventType.MOUSE_UP, this.onMouse, this);
        input.on(Input.EventType.MOUSE_DOWN, this.onMouse, this);
        input.on(Input.EventType.MOUSE_MOVE, this.MouseMove, this);
    }

    /*
    *@Author: yozora
    *@Description: 更新节点位置与旋转
    *@Date: 2021-10-25 15:27:36
    */
    update(dt: number) {
    }

    /*  
    *@Author: yozora
    *@Description: 鼠标左右键监听
    *@Date: 2021-10-21 11:10:15
    */
    private onMouse(event: EventMouse) {
        // 左键
        if (event.getButton() === 0) {
            if (event.getType() === SystemEvent.EventType.MOUSE_DOWN) {
                this.leftMouseDown = true;
            } else {
                this.leftMouseDown = false;
            }
        }
    }

    /*
    *@Author: yozora
    *@Description: 左键旋转,右键拖拽
    *@Date: 2021-10-21 18:52:08
    */
    private MouseMove(e: EventMouse) {
        // 旋转
        if (this.leftMouseDown) {
            // if (e.getDeltaX()) {
            //     // 水平旋转
            //     this.angles = Math.PI * 0.01;
            //     this._curDirection = new Vec3(0, 0, -e.getDeltaX());
            //     this._curDirection.normalize();
            //     Quat.rotateAround(this._curRot, this.node.rotation, this._curDirection, this.angles);
            //     Quat.slerp(qt_1, this._curRot, this.node.rotation, this.damp);
            //     this.node.setRotation(qt_1);
            // }
            let delta = e.getDelta();
            // 计算旋转轴
            let axis = new Vec3(-delta.y, delta.x, 0).normalize();
            // 计算旋转速度
            let rad = delta.length() * 0.01;
            // 将节点的旋转绕
            let quat = new Quat();
            Quat.rotateAround(quat, this.node.worldRotation, axis, rad);
            this.node.setWorldRotation(quat);
        }
    }

    /*
    *@Author: yozora
    *@Description: 移除系统事件
    *@Date: 2021-11-23 10:59:28
    */
    public removeEvent() {
        input.off(Input.EventType.MOUSE_UP, this.onMouse, this);
        input.off(Input.EventType.MOUSE_DOWN, this.onMouse, this);
        input.off(Input.EventType.MOUSE_MOVE, this.MouseMove, this);
    }

    /*
     *@Author: yozora
     *@Description: 恢复系统事件
     *@Date: 2021-11-24 23:51:06
     */
    public resumeEvent() {
        input.on(Input.EventType.MOUSE_UP, this.onMouse, this);
        input.on(Input.EventType.MOUSE_DOWN, this.onMouse, this);
        input.on(Input.EventType.MOUSE_MOVE, this.MouseMove, this);
    }

}


