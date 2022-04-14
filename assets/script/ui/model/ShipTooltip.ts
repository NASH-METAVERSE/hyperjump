
import { _decorator, Component, find, Camera, RenderTexture, Sprite, Label, resources, MeshRenderer, Material } from 'cc';
import { DataManager } from '../../DataManager';
import { ShipListDetail } from '../../entity/ShipListDetail';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ShipTooltip
 * DateTime = Mon Dec 13 2021 18:36:58 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = ShipTooltip.ts
 * FileBasenameNoExtension = ShipTooltip
 * URL = db://assets/script/ui/ShipTooltip.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('ShipTooltip')
export class ShipTooltip extends Component {

    /*
    * 太阳系ID
    */
    private systemId: Label = null;

    /*
     * 太阳系名称
     */
    private systemName: Label = null;

    /*
    * 用户名
    */
    private player: Label = null;

    /*
     * 飞船剩余资源
     */
    private shipMineral: Label = null;

    /*
     * 跃迁时间状态
     */
    private time: Label = null;

    /*
     * 动态材质相机
     */
    private dynamicCamera: Camera = null;

    /*
     * 材质数量
     */
    private materialsCount: number = 22;

    /*
     *@Author: yozora
     *@Description: 修改飞船弹窗信息
     *@Date: 2021-12-13 19:12:30
     */
    public changeShipTooltipInfo(_shipDetailInfo: ShipListDetail, planetArea: Sprite, _isShow: boolean, _userAddress?: string) {
        if (!this.systemId) {
            this.initData();
        }
        if (_isShow) {
            this.systemId.string = _shipDetailInfo.solarSystemCode;
            this.systemName.string = _shipDetailInfo.solarSystemCode;
            this.shipMineral.string = _shipDetailInfo.mineral;
            this.player.string = DataManager.runtimeData.getUserData().userProfile.username;
            this.renderPlanet();
            this.dynamicCamera.node.getChildByName("Tooltip_planet").active = true;
        } else {
            this.dynamicCamera.node.getChildByName("Tooltip_planet").active = false;
        }
    }

    /*
     *@Author: yozora
    *@Description: 飞船工具栏星球渲染
    *@Date: 2021-11-26 14:30:57
    */
    public renderPlanet() {
        const index = Math.ceil(Math.random() * (this.materialsCount - 1));
        resources.load(`material/planet/Planet_${index}`, Material, (err, material) => {
            if (err) {
                console.error(err);
                return;
            }
            this.dynamicCamera.node.getChildByName("Tooltip_planet").getComponent(MeshRenderer).setMaterial(material, 0);
        });
    }

    /*
     *@Author: yozora
     *@Description: 初始化数据
     *@Date: 2021-12-17 11:06:35
     */
    private initData() {
        if (!this.systemId) {
            this.systemId = this.node.getChildByName("System_id_label").getComponent(Label);
        }
        if (!this.systemName) {
            this.systemName = this.node.getChildByName("System_name_label").getComponent(Label);
        }
        if (!this.shipMineral) {
            this.shipMineral = this.node.getChildByName("Remained_label").getComponent(Label);
        }
        if (!this.player) {
            this.player = this.node.getChildByName("Player_label").getComponent(Label);
        }

        if (!this.time) {
            this.time = this.node.getChildByName("Jump_time_label").getComponent(Label);
        }
        this.dynamicCamera = find("Dynamic Camera").getComponent(Camera);
        // 预加载星球材质
        resources.preloadDir("material/planet/", Material, (err) => {
            if (err) {
                console.error(err);
                return;
            }
        });
    }

}
