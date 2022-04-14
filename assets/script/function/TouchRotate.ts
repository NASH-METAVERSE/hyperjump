
import { _decorator, Component, Node, input, Input, EventTouch, Quat, v3, Vec3, quat, math, misc, v2, Vec2, macro, Enum, assetManager } from 'cc';
let { ccclass, property } = _decorator;


let eRotateType = Enum({
    第一人称视角: 0,
    围绕目标旋转: 1,
    旋转目标: 2,
});

@ccclass('TouchRotate')
export class TouchRotate extends Component {

    @property(Node)
    nodeCamera: Node = null;

    @property(Node)
    nodeTarget: Node = null;

    @property({ type: eRotateType })
    rotateType = eRotateType.围绕目标旋转;

    onLoad() {
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.nodeCamera.lookAt(this.nodeTarget.worldPosition);
    }

    onTouchMove(event: EventTouch) {
        switch (this.rotateType) {
            case eRotateType.围绕目标旋转:
                this.aroundTarget(event);
                break;
            case eRotateType.旋转目标:
                this.rotateTarget(event);
                break;
            case eRotateType.第一人称视角:
                this.firstPersonView(event);
                break;
        }
    }

    firstPersonView(event: EventTouch) {
        let rotateAround = function (node: Node, axis: Vec3, angle: number) {
            let quat = new Quat();
            // 绕世界空间下指定轴旋转四元数
            Quat.rotateAround(quat, node.worldRotation, axis, angle);
            // 设置旋转
            node.setWorldRotation(quat);
        }

        let delta = event.getDelta();
        let speed = 0.004;
        let horizontal = -delta.x * speed;
        let vertical = -delta.y * speed;
        // 计算水平方向偏移后的旋转
        rotateAround(this.nodeCamera, v3(0, 1, 0), horizontal);
        // 计算垂直方向偏移后的旋转
        rotateAround(this.nodeCamera, v3(-1, 0, 0), vertical);
    }

    aroundTarget(event: EventTouch) {
        let delta = event.getDelta();
        let speed = 0.002;
        let horizontal = delta.x * speed;
        let vertical = delta.y * speed;
        // 计算水平方向的偏移量
        this.rotateAround(this.nodeCamera, this.nodeTarget.worldPosition, v3(0, 1, 0), horizontal);
        // 计算垂直方向的偏移量
        this.rotateAround(this.nodeCamera, this.nodeTarget.worldPosition, v3(-1, 0, 0), vertical);
    }

    rotateAround(node: Node, point: Vec3, axis: Vec3, angle: number) {
        // 根据旋转轴和旋转角度构建四元数
        let quat = new Quat();
        Quat.fromAxisAngle(quat, axis, angle);

        // 计算旋转后的位置
        let position = v3();
        Vec3.subtract(position, node.worldPosition, point);
        Vec3.transformQuat(position, position, quat);
        Vec3.add(position, point, position);

        // 根据旋转后的位置计算四元数
        let dir = v3();
        Vec3.subtract(dir, position, this.nodeTarget.worldPosition);
        let rotation = new Quat();
        Quat.fromViewUp(rotation, dir.normalize(), Vec3.UP);

        // 根据四元数计算欧拉角 判断是否在需要的范围内
        let euler = v3();
        rotation.getEulerAngles(euler);
        if (euler.x < -40 || euler.x > 40) {
            return;
        }

        // 设置位置及旋转
        node.setWorldPosition(position);
        node.setWorldRotation(rotation);
    }

    rotateTarget(event: EventTouch) {
        let delta = event.getDelta();
        // 计算旋转轴
        let axis = v3(-delta.y, delta.x, 0).normalize();
        // 计算旋转速度
        let rad = delta.length() * 0.02;
        // 将节点的旋转绕
        let quat = new Quat();
        Quat.rotateAround(quat, this.nodeTarget.worldRotation, axis, rad);
        this.nodeTarget.setWorldRotation(quat);
    }
}
