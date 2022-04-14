
import { _decorator, Component, Node, Label, resources, SpriteFrame, Vec3, Color, Sprite, Vec2, UITransform, Overflow, find } from 'cc';
import { DataManager } from '../../DataManager';
import { GameConstans } from '../../entity/GameConstans';
import { SolarSystemTooltipInfo } from '../../entity/SolarSystemTooltipInfo';
import { Quaternion } from '../../function/Quaternion';
import { ClientEvent } from '../../utils/ClientEvent';
import { HttpRequest } from '../../utils/HttpRequest';
import { lodash } from '../../utils/lodash';
import { ShipBoardLarge } from './ShipBoardLarge';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = SolarSystemTooltip
 * DateTime = Sun Dec 12 2021 22:15:42 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = SolarSystemTooltip.ts
 * FileBasenameNoExtension = SolarSystemTooltip
 * URL = db://assets/script/ui/SolarSystemTooltip.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('SolarSystemTooltip')
export class SolarSystemTooltip extends Component {

    /*
     * 太阳系ID
     */
    private systemId: Label = null;

    /*
    * 用户名
    */
    private player: Label = null;

    /*
     * 星球剩余资源
     */
    private solarSystemMineral: Label = null;

    /*
     * 星球数量
     */
    private planetCount: Label = null;

    /*
     * 我占领的星球
     */
    private myPlanetCount: Label = null;

    /*
     * 其它星球
     */
    private otherPlanetCount: Label = null;

    /*
    * 我的飞船数量
    */
    private grayShip: Label = null;

    /*
    * 其他飞船数量
    */
    private purpleShip: Label = null;

    /*
     * 跃迁时间状态
     */
    private time: Label = null;

    /*
     * 太阳系星球统计信息
     */
    private circleInfoTool: Node = null;

    /*
     * 太阳系弹窗数据
     */
    private solarSystemTooltipInfo: SolarSystemTooltipInfo = null;

    onLoad() {
        if (!this.systemId) {
            this.systemId = this.node.getChildByName("Position_label").getComponent(Label);
        }
        if (!this.player) {
            this.player = this.node.getChildByName("Player_label").getComponent(Label);
        }
        if (!this.solarSystemMineral) {
            this.solarSystemMineral = this.node.getChildByName("Mineral_label").getComponent(Label);
        }
        if (!this.planetCount) {
            this.planetCount = this.node.getChildByName("Ship_tooltip_s_planet_total_label").getComponent(Label);
        }
        if (!this.myPlanetCount) {
            this.myPlanetCount = this.node.getChildByName("Ship_tooltip_s_planet_owner_label").getComponent(Label);
        }
        if (!this.otherPlanetCount) {
            this.otherPlanetCount = this.node.getChildByName("Ship_tooltip_s_planet_others_label").getComponent(Label);
        }
        if (!this.purpleShip) {
            this.purpleShip = this.node.getChildByName("Purple_ship_label").getComponent(Label);
        }
        if (!this.grayShip) {
            this.grayShip = this.node.getChildByName("Gray_ship_label").getComponent(Label);
        }
        if (!this.time) {
            this.time = this.node.getChildByName("Jump_time_label").getComponent(Label);
        }
    }

    /*
    *@Author: yozora
    *@Description: 修改太阳系弹窗信息
    *@param: _activeHoverStarmapNode: 激活太阳系弹窗节点
    *@Date: 2021-11-17 19:07:18
    */
    public changeSolarSystemTooltipInfo(_solarSystemCode: string, _isShow: boolean, _shipCode?: string, _userAddress?: string) {
        if (_isShow) {
            // 如果当前有激活飞船面板，则显示预计跃迁时间
            const shipCode = this.processShipCode();
            HttpRequest.getSolarSystemTooltipInfo(_solarSystemCode, shipCode, find('DataManager').getComponent(DataManager).getUserAddress()).then(res => {
                if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                    this.solarSystemTooltipInfo = res.data;
                    this.systemId.string = (_solarSystemCode === null ? "UNKNOWN" : _solarSystemCode);
                    this.player.string = this.solarSystemTooltipInfo.solarSystemOwner === null ? "NONE" : this.solarSystemTooltipInfo.solarSystemOwner;
                    this.solarSystemMineral.string = this.solarSystemTooltipInfo.currentMineral.toString();
                    this.planetCount.string = this.solarSystemTooltipInfo.planetaryCount.toString();
                    this.myPlanetCount.string = this.solarSystemTooltipInfo.myPlanetCount.toString();
                    this.otherPlanetCount.string = this.solarSystemTooltipInfo.otherPlanetCount.toString();
                    this.purpleShip.string = (this.solarSystemTooltipInfo.allShipCount - this.solarSystemTooltipInfo.myShipCount).toString();
                    this.grayShip.string = this.solarSystemTooltipInfo.allShipCount.toString();
                    // 计算跃迁时间
                    if (this.solarSystemTooltipInfo.jumpTime === 0) {
                        this.time.string = "- - - - -";
                    } else {
                        let now = new Date();
                        now.setTime(now.setSeconds(now.getSeconds() + this.solarSystemTooltipInfo.jumpTime));
                        this.time.string = lodash.formatTimestamp(new Date(now.getTime()));
                    }
                } else {
                    ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.TOAST, res.msg);
                }
            }).catch(err => {
                console.error(err);
            });
        }
    }

    /*
     *@Author: yozora
     *@Description: 获取当前点击的飞船
     *@Date: 2022-02-28 00:28:17
     */
    private processShipCode() {
        if (find('Canvas').getChildByName('Starmap_area').getChildByName('Ship_board_large') && find('Canvas').getChildByName('Starmap_area').getChildByName('Ship_board_large').active) {
            return find('Canvas').getChildByName('Starmap_area').getChildByName('Ship_board_large').getComponent(ShipBoardLarge)._lastShip;
        }
        return "-1";
    }

    /*
     *@Author: yozora
     *@Description: 初始化星球统计信息
     *@Date: 2021-12-12 23:17:27
     */
    private initCircleInfo() {
        let processType = 0;
        if (this.circleInfoTool.children.length > 0) {
            processType = 1;
        }
        resources.load('ui/circleInfo/spriteFrame', SpriteFrame, (err, asset) => {
            if (err) {
                console.error(err);
            }
            // 饼图
            let fillStart = 0;
            let fillRange = this.solarSystemTooltipInfo.myPlanetCount / (this.solarSystemTooltipInfo.planetaryCount + this.solarSystemTooltipInfo.stellarCount);
            this.initNode(this.circleInfoTool, "My_info", null, new Vec3(150, 0, 0), this.solarSystemTooltipInfo.myPlanetCount.toString(), 30, find('DataManager').getComponent(DataManager).my_color, Color.WHITE, Sprite.Type.FILLED, Sprite.FillType.RADIAL, asset, fillStart, fillRange, new Vec2(0.5, 0.5), processType);
            fillStart = fillStart + fillRange;
            fillRange = this.solarSystemTooltipInfo.otherPlanetCount / (this.solarSystemTooltipInfo.planetaryCount + this.solarSystemTooltipInfo.stellarCount);
            this.initNode(this.circleInfoTool, "Other_info", null, new Vec3(150, 0, 0), this.solarSystemTooltipInfo.otherPlanetCount.toString(), 30, find('DataManager').getComponent(DataManager).ohter_color, Color.WHITE, Sprite.Type.FILLED, Sprite.FillType.RADIAL, asset, fillStart, fillRange, new Vec2(0.5, 0.5), processType);

            this.circleInfoTool.getChildByName("My_info").setSiblingIndex(6);
            this.circleInfoTool.getChildByName("Other_info").setSiblingIndex(6);
            // fillStart = fillStart + fillRange;
            // fillRange = 1;
            // this.initNode(this.circleInfoTool, "Nobody_info", null, new Vec3(150, 0, 0), this.solarSystemTooltipInfo.nobodyPlanetCount.toString(), 30, DataManager.runtimeData.nobody_color, Color.WHITE, Sprite.Type.FILLED, Sprite.FillType.RADIAL, asset, fillStart, fillRange, new Vec2(0.5, 0.5), processType);
        });
    }


    /*
     *@Author: yozora
     *@Description: 初始化节点信息
     *@Date: 2021-11-10 14:40:05
     */
    private initNode(parent: Node, nodeName: string, labelName: string, position: Vec3, value: string, fontSize: number, color: Color, fontColor: Color, type: number, detailType: number, asset: SpriteFrame, fillStart: number, fillRange: number, center?: Vec2, processType?: number) {
        if (processType === 0) {
            const node = new Node();
            // 设置节点layer
            node.layer = 33554432;
            node.name = nodeName;
            const sprite = node.addComponent(Sprite);
            sprite.spriteFrame = asset;
            sprite.type = type;
            if (type === Sprite.Type.FILLED) {
                if (detailType === Sprite.FillType.RADIAL) {
                    sprite.fillCenter = center;
                }
                sprite.fillType = detailType;
                sprite.fillStart = fillStart;
                sprite.fillRange = fillRange;
            }
            sprite.color = color;
            sprite.sizeMode = Sprite.SizeMode.TRIMMED;
            node.setPosition(new Vec3());
            parent.addChild(node);
            if (labelName) {
                this.initLabel(node, labelName, position, value, fontSize, fontColor, fillStart, fillRange, type, detailType);
            }
        }
        if (processType === 1) {
            const sprite = parent.getChildByName(nodeName).getComponent(Sprite);
            sprite.fillStart = fillStart;
            sprite.fillRange = fillRange;
        }

    }

    /*
     *@Author: yozora
     *@Description: 初始化标签信息
     *@Date: 2021-11-08 19:18:36
     */
    private initLabel(parent: Node, nodeName: string, position: Vec3, value: string, fontSize: number, color: Color, fillStart: number, fillRange: number, type: number, detailType: number) {
        const info = new Node();
        info.layer = 33554432;
        info.name = nodeName;
        info.setPosition(position);
        // 填充模式
        if (type === Sprite.Type.FILLED) {
            // 扇形进度条
            if (detailType === Sprite.FillType.RADIAL) {
                let rotate = fillStart + fillRange / 2;
                if (rotate > 1) {
                    rotate = rotate - 1;
                }
                Quaternion.RotationAroundNode(
                    info,
                    this.circleInfoTool.getChildByName("Inner_circle").position,
                    Vec3.FORWARD,
                    -360 * rotate
                );
            }
            // 水平进度条
            if (detailType === Sprite.FillType.HORIZONTAL) {
                const start_x = parent.getComponent(UITransform).contentSize.width * fillStart;
                const end_x = parent.getComponent(UITransform).contentSize.width * fillRange;
                const x = start_x + (end_x - start_x) / 2;
                info.setPosition(new Vec3(position.x + x, position.y, position.z));
            }
        }
        const label = info.addComponent(Label);
        label.string = value;
        label.fontSize = fontSize;
        label.font = find('DataManager').getComponent(DataManager).font;
        label.overflow = Overflow.SHRINK;
        label.color = color;
        parent.addChild(info);
    }

    private changeSolarSystem() {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_SCENCE_LIST.CHANG_SOLAR_SYSTEM, this.systemId);
    }

}
