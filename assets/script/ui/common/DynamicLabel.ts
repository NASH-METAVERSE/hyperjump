
import { _decorator, Component, Node, Tween, tween, Vec3, View, view, Label, find, UITransform, screen } from 'cc';
import { GameConstans } from '../../entity/GameConstans';
import { UIManager } from '../../UIManager';
import { UserOperateManager } from '../../UserOperateManager';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = DynamicLabel
 * DateTime = Thu Nov 25 2021 13:34:40 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = NewComponent.ts
 * FileBasenameNoExtension = DynamicLabel
 * URL = db://assets/script/ui/NewComponent.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('DynamicLabel')
export class DynamicLabel extends Component {

    private move: Tween<Node> = null;

    private initPos: Vec3 = new Vec3();

    start() {
        // const screenWidth = find('Canvas').getComponent(UIManager).screenWidth;
        // const startPos = screenWidth - this.node.getComponent(UITransform).width / 2;
        const startPos = view.getVisibleSizeInPixel().width / 2;
        this.initPos.x = startPos;
        this.node.setPosition(this.initPos);
        console.log(this.initPos);
        this.move = tween(this.node).to(20, { position: new Vec3(-startPos, 0, 0) }, { easing: 'linear' }).set({ position: this.initPos }).union().repeatForever();
        this.move.start();
    }

    update() {
        this.switchUserStatus(find('Canvas').getComponent(UserOperateManager).userOperateType);
    }

    private switchUserStatus(userOperateType: number) {
        switch (userOperateType) {
            case GameConstans.RESET_TYPE.NULL:
                this.node.getComponent(Label).string = 'NULL';
                break;
            case GameConstans.RESET_TYPE.PLANET.JUMP:
                this.node.getComponent(Label).string = 'JUMPING-' + find('Canvas').getComponent(UserOperateManager).currentJumpProcess;
                break;
            case GameConstans.RESET_TYPE.PLANET.FLIGHT:
                this.node.getComponent(Label).string = 'FLIGHTING-' + find('Canvas').getComponent(UserOperateManager).currentJumpProcess;
                break;
            case GameConstans.RESET_TYPE.PLANET.PLUNDER:
                this.node.getComponent(Label).string = 'PLUNDERING-' + find('Canvas').getComponent(UserOperateManager).currentPlunderProcess;
                break;
            case GameConstans.RESET_TYPE.PLANET.COLLECT:
                this.node.getComponent(Label).string = 'COLLECTING-' + find('Canvas').getComponent(UserOperateManager).currentCollectProcess;
                break;
            case GameConstans.RESET_TYPE.PLANET.OCCUPY:
                this.node.getComponent(Label).string = 'OCCUPING-' + find('Canvas').getComponent(UserOperateManager).currentOccupyProcess;
                break;
            case GameConstans.RESET_TYPE.PLANET.STOP_COLLECT:
                this.node.getComponent(Label).string = 'STOP_COLLECTING-' + find('Canvas').getComponent(UserOperateManager).currentCollectProcess;
                break;
            case GameConstans.RESET_TYPE.PLANET.STOP_OCCUPY:
                this.node.getComponent(Label).string = 'STOP_OCCUPING-' + find('Canvas').getComponent(UserOperateManager).currentOccupyProcess;
                break;
            default:
                this.node.getComponent(Label).string = 'NOTHING';
                break;
        }
    }

}
