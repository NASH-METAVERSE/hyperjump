
import { _decorator, Component, Node, EventMouse, Vec2, find, screen, Camera, Vec3, Prefab, instantiate, UITransform } from 'cc';
import { StarmapManager } from '../../StarmapManager';
import { UIManager } from '../../UIManager';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = SmarmapQuadTree
 * DateTime = Sun Jan 16 2022 22:51:18 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = SmarmapQuadTree.ts
 * FileBasenameNoExtension = SmarmapQuadTree
 * URL = db://assets/script/ui/model/SmarmapQuadTree.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 * 星图碰撞检测
 */

@ccclass('SmarmapQuadTree')
export class SmarmapQuadTree extends Component {

    private _camera: Camera = null

    onEnable() {
        this.node.on(Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this.node.on(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        this._camera = find('Smarmap Camera').getComponent(Camera);
    }

    private onMouseMove(e: EventMouse) {
        const screenPos = new Vec3();
        this._camera.worldToScreen(this.node.getChildByName('solar_0').getWorldPosition(), screenPos);
        const center = new Vec2(screenPos.x, screenPos.y);
        const target = new Vec2(e.getLocation().x, e.getLocation().y);
        const d = Vec2.distance(center, target);
        console.log("target distance: ", d);

        // const floorDistance = find('Canvas').getComponent(UIManager).floorDistance;
        // console.log(floorDistance);
        // floorDistance.forEach((distance, floor) => {
        //     if (Math.floor(d) >= Math.floor(distance) - 5 || Math.floor(d) <= Math.floor(distance) + 5) {
        //         console.log("target floor: ", floor);
        //     }
        // });
    }

    private onMouseDown(e: EventMouse) {
        console.log("curPos: ", e.getLocation());
        console.log("worldToScreen: ", this._camera.worldToScreen(this.node.getChildByName('solar_1').getWorldPosition()));
    }

}
