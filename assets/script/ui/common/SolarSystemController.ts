
import { _decorator, Component, Node, Prefab, instantiate, find, Camera, Vec3, screen } from 'cc';
import { Rotate } from '../../function/Rotate';
import { RotateAround } from '../../function/RotateAround';
import { PlanetTooltip } from '../model/PlanetTooltip';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = SolarSystemController
 * DateTime = Sun Feb 06 2022 20:39:57 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = SolarSystemController.ts
 * FileBasenameNoExtension = SolarSystemController
 * URL = db://assets/script/ui/common/SolarSystemController.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 * 太阳系场景UI管理
 */

@ccclass('SolarSystemController')
export class SolarSystemController extends Component {


    /*
     * UI主节点
     */
    private canvas: Node = null;

    /*
     * 太阳系工具栏
     */
    private solarSystemTooltip: Node = null;

    private tooltipPos: Vec3 = new Vec3();

    private planetTooltip: PlanetTooltip = null;

    constructor(canvas: Node) {
        super();
        this.canvas = canvas;
    }

    /*
     *@Author: yozora
     *@Description: 显示或隐藏太阳系工具栏
     *@Date: 2022-02-06 22:13:33
     */
    public showHoverTooltip(prefad: Prefab, mainCamera: Camera, solarSystemNode: Node, is_show: boolean) {
        if (!this.solarSystemTooltip) {
            this.solarSystemTooltip = instantiate(prefad);
            this.canvas.getChildByName('SolarSystem_area').addChild(this.solarSystemTooltip);
        }
        if (is_show) {
            // 转换UI坐标
            mainCamera.convertToUINode(
                solarSystemNode.getWorldPosition(),
                this.canvas,
                this.tooltipPos
            )
            this.tooltipPos.x = this.tooltipPos.x + 200;
            this.planetTooltip = this.solarSystemTooltip.getComponent(PlanetTooltip);
            this.planetTooltip.changePlanetTooltipInfo(solarSystemNode.getComponent(RotateAround).getPlanetCode());
            this.solarSystemTooltip.setPosition(this.tooltipPos);
            this.solarSystemTooltip.active = true;
        } else {
            this.solarSystemTooltip.active = false;
        }
    }


    /*
     *@Author: yozora
     *@Description: 隐藏太阳系UI
     *@Date: 2022-02-10 16:49:49
     */
    public hiddenSolarSystemUI() {
        if (this.solarSystemTooltip && this.solarSystemTooltip.active) {
            this.solarSystemTooltip.active = false;
        }
    }
}
