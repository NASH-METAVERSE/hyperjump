
import { _decorator, Component, Node, resources, SpriteFrame, Sprite, Vec2, Vec3, Color, Label, Overflow, find, UITransform, TTFFont, error, log, Widget, screen, Canvas, director, view, game } from 'cc';
import { DataManager } from '../../DataManager';
import { GameConstans } from '../../entity/GameConstans';
import { GameInfo } from '../../entity/GameInfo';
import { Quaternion } from '../../function/Quaternion';
import { GameManager } from '../../GameManager';
import { ClientEvent } from '../../utils/ClientEvent';
import { HttpRequest } from '../../utils/HttpRequest';
import { lodash } from '../../utils/lodash';
import { SolarSystemTooltipInfo } from '../../entity/SolarSystemTooltipInfo';
import { PlanetTooltipInfo } from '../../entity/PlanetTooltipInfo';

const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = GalaxyInfo
 * DateTime = Wed Nov 10 2021 13:53:18 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = GalaxyInfo.ts
 * FileBasenameNoExtension = GalaxyInfo
 * URL = db://assets/script/ui/GalaxyInfo.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('GalaxyStatisticsInfo')
export class GalaxyStatisticsInfo extends Component {

    /*
     * 圆形统计节点
     */
    private _circle_node: Node = null;

    /*
     * 圆形统计信息文字坐标参考节点
     */
    private _circle_related_node: Node = null;

    /*
     * 游戏信息
     */
    private gameInfo: GameInfo = null;

    /*
     * 我占领的区域数量
     */
    public myAreaCount: number = 0;

    /*
     * 其他人占领的区域数量
     */
    public otherAreaCount: number = 0;

    private dataManager: DataManager = null;


    start() {
        this.dataManager = find('DataManager').getComponent(DataManager);
        ClientEvent.on(GameConstans.CLIENTEVENT_UI_LIST.MOVE_LEFT_BAR_CONTENT, this.moveLeftBarContent, this);
        this.initData();
    }


    /*
     *@Author: yozora
     *@Description: 初始化游戏数据
     *@Date: 2021-11-10 17:46:14
     */
    private async initData() {
        await HttpRequest.getGameInfo()
            .then(res => {
                this.gameInfo = res.data;
            }).catch(err => {
                error(err);
                return;
            });
        this.initCircleInfo();
        this.initLeftBar();
        this.initPlayerInfo();
    }

    /*
     *@Author: yozora
     *@Description: 初始化玩家信息
     *@Date: 2021-12-09 14:01:58
     */
    private initPlayerInfo() {
        // 获取玩家数据
        HttpRequest.getUserProfile(this.dataManager.getUserAddress()).then(res => {
            this.dataManager.setUserProfile(res.data);
            // 设置玩家信息
            this.node.getChildByName("Player_name_label").getComponent(Label).string = this.dataManager.getUserData().userProfile.username;
            this.node.getChildByName("Player_mineral_label").getComponent(Label).string = this.dataManager.getUserData().userProfile.mineral.toString();
            this.node.getChildByName("Player_ship_label").getComponent(Label).string = this.dataManager.getUserData().userProfile.shipCount.toString();
            this.node.getChildByName("Player_solar_label").getComponent(Label).string = this.dataManager.getUserData().userProfile.solarCount === undefined ? "0" : this.dataManager.getUserData().userProfile.solarCount.toString();

            this.schedule(() => {
                const date = new Date();
                const time = lodash.formatTimestamp(date);
                this.node.getChildByName('Starmap_area').getChildByName('Game_time_label').getComponent(Label).string = time;
            }, 1);
        }).catch(err => {
            error(err);
            return;
        });
    }

    /*
     *@Author: yozora
     *@Description: 初始化侧边栏信息
     *@Date: 2021-12-09 15:21:39
     */
    private initLeftBar() {
        // 星系统计信息
        // this.node.getChildByName("Galaxy_total_label").getComponent(Label).string = this.gameInfo.totalMineral.toString();
        this.node.getChildByName('Starmap_area').getChildByName("Game_mineral_label").getComponent(Label).string = this.gameInfo.remainedMineral.toString();
        // this.node.getChildByName("Galaxy_collected_label").getComponent(Label).string = (this.gameInfo.totalMineral - this.gameInfo.remainedMineral).toString();
        // 太阳系统计信息
        this.node.getChildByName('Starmap_area').getChildByName("Game_solar_total_label").getComponent(Label).string = this.gameInfo.solarSystemCount.toString();
        // this.node.getChildByName("System_empty_label").getComponent(Label).string = this.gameInfo.noResourceSolarSystemCount.toString();
        this.node.getChildByName('Starmap_area').getChildByName("Game_solar_remaining_label").getComponent(Label).string = (this.gameInfo.solarSystemCount - this.gameInfo.noResourceSolarSystemCount).toString();
        // 星球统计信息
        this.node.getChildByName('Starmap_area').getChildByName("Game_planet_total_label").getComponent(Label).string = this.gameInfo.planetCount.toString();
        // this.node.getChildByName("Planet_empty_label").getComponent(Label).string = this.gameInfo.noResourcePlanetCount.toString();
        this.node.getChildByName('Starmap_area').getChildByName("Game_planet_occupied_label").getComponent(Label).string = (this.gameInfo.planetCount - this.gameInfo.noResourcePlanetCount).toString();
    }

    /*
     *@Author: yozora
     *@Description: 初始化统计信息
     *@Date: 2021-11-08 19:18:12
     */
    private initCircleInfo() {
        resources.load('ui/circleInfo/spriteFrame', SpriteFrame, (err, asset) => {
            if (err) {
                console.error(err);
            }
            // 存放节点
            if (!this._circle_node) {
                this._circle_node = this.node.getChildByName("Circle_info");
            }
            // 饼图
            let fillStart = 0;
            let fillRange = this.myAreaCount / (this.gameInfo.solarSystemCount);
            this.initNode(this._circle_node, "My_info", null, new Vec3(150, 0, 0), this.myAreaCount.toString(), 30, this.dataManager.my_color, Color.WHITE, Sprite.Type.FILLED, Sprite.FillType.RADIAL, asset, fillStart, fillRange, new Vec2(0.5, 0.5));
            fillStart = fillStart + fillRange;
            fillRange = this.otherAreaCount / (this.gameInfo.solarSystemCount);
            this.initNode(this._circle_node, "Other_info", null, new Vec3(150, 0, 0), this.otherAreaCount.toString(), 30, this.dataManager.ohter_color, Color.WHITE, Sprite.Type.FILLED, Sprite.FillType.RADIAL, asset, fillStart, fillRange, new Vec2(0.5, 0.5));
            // 环绕文字
            this._circle_node.getChildByName("My_info").setSiblingIndex(6);
            this._circle_node.getChildByName("Other_info").setSiblingIndex(6);
            // 饼图统计数据
            // 太阳系个数
            this.node.getChildByName("Cicle_total_label").getComponent(Label).string = this.gameInfo.solarSystemCount.toString();
            // 无人占领太阳系个数
            this.node.getChildByName("Cicle_remaining_label").getComponent(Label).string = this.gameInfo.nobodySolarSystemCount.toString();
            // 我占领的太阳系个数
            this.node.getChildByName("Cicle_my_label").getComponent(Label).string = this.myAreaCount.toString();
            // 其他占领的太阳系个数
            this.node.getChildByName("Cicle_other_label").getComponent(Label).string = this.otherAreaCount.toString();
        });
    }


    /*
     *@Author: yozora
     *@Description: 初始化节点信息
     *@Date: 2021-11-10 14:40:05
     */
    private initNode(parent: Node, nodeName: string, labelName: string, position: Vec3, value: string, fontSize: number, color: Color, fontColor: Color, type: number, detailType: number, asset: SpriteFrame, fillStart: number, fillRange: number, center?: Vec2) {
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
        parent.addChild(node);
        if (labelName) {
            this.initLabel(node, labelName, position, value, fontSize, fontColor, fillStart, fillRange, type, detailType);
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
                if (!this._circle_related_node) {
                    this._circle_related_node = find("Canvas/Galaxy_statistics/Circle_info/Inner_circle");
                }
                let rotate = fillStart + fillRange / 2;
                if (rotate > 1) {
                    rotate = rotate - 1;
                }
                Quaternion.RotationAroundNode(
                    info,
                    this._circle_related_node.position,
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
        label.font = this.dataManager.font;
        label.overflow = Overflow.SHRINK;
        label.color = color;
        parent.addChild(info);
    }

    /*
     *@Author: yozora
     *@Description: 文字环绕
     *@Date: 2021-11-30 14:07:38
     */
    private rotateLabel(parent: Node, nodeName: string, position: Vec3, value: string, fontSize: number, color: Color, fillStart: number, fillRange: number) {
        // 文字数组
        const textArray = value.split("");
        // 每个文字进行环绕处理
        for (let index = 0; index < textArray.length; index++) {
            const element = textArray[index];
            const info = new Node();
            info.layer = 33554432;
            info.name = nodeName + element;
            info.setPosition(position);
            const label = info.addComponent(Label);
            label.string = element;
            label.fontSize = fontSize;
            label.font = this.dataManager.font;
            label.overflow = Overflow.SHRINK;
            label.color = color;

            let rotate = fillStart + fillRange / 2;
            if (rotate > 1) {
                rotate = rotate - 1;
            }
            // const offset = fillRange * 2 / 3 - fillRange / 3;
            // let space = offset / textArray.length;
            // // 初始角度
            // if (space < 0.02) {
            //     space = 0.02;
            // }
            const angle = (360 * (rotate - (index - 1) * 0.03));
            // 初始半径
            const radius = 80;

            const curVec3 = new Vec3();
            const tempVec3 = new Vec3();

            // 将角度转换为弧度
            let radian = (Math.PI / 180) * angle;
            // 更新节点的位置
            info.getPosition(curVec3);
            this._circle_related_node.getPosition(tempVec3);
            // 圆形运动轨迹
            curVec3.x = Number((tempVec3.x + radius * Math.cos(radian)).toFixed(2));
            curVec3.y = Number((tempVec3.y + radius * Math.sin(radian)).toFixed(2));

            info.setPosition(curVec3);

            info.angle = angle - 90;
            parent.addChild(info);
        }
    }

    /*
     *@Author: yozora
     *@Description: 初始化文字位置
     *@Date: 2022-02-25 18:51:31
     */
    private moveLeftBarContent() {
        if (find('GameManager/').getComponent(GameManager)._activeType === GameConstans.SCENCE_TYPE.STARMAP) {
            this.node.getChildByName('Starmap_area').active = true;
            this.node.getChildByName('Solar_system_area').active = false;

            this.node.getChildByName("Player_name_label").getComponent(Widget).top = 151.403;
            this.node.getChildByName("Player_mineral_label").getComponent(Widget).top = 230.993;
            this.node.getChildByName("Player_ship_label").getComponent(Widget).top = 294.139;
            this.node.getChildByName("Player_solar_label").getComponent(Widget).top = 355.551;

            this.node.getChildByName('Starmap_bg').active = true;
            this.node.getChildByName('Solar_system_bg').active = false;
            this.node.getChildByName('Planet_bg').active = false;

            this.changeStarmapTooltipInfo();
        }
        if (find('GameManager/').getComponent(GameManager)._activeType === GameConstans.SCENCE_TYPE.SOLAR_SYSTEM) {
            this.node.getChildByName('Starmap_area').active = false;
            this.node.getChildByName('Solar_system_area').active = true;

            this.node.getChildByName("Player_name_label").getComponent(Widget).top = 148.991;
            this.node.getChildByName("Player_mineral_label").getComponent(Widget).top = 227.777;
            this.node.getChildByName("Player_ship_label").getComponent(Widget).top = 291.727;
            this.node.getChildByName("Player_solar_label").getComponent(Widget).top = 353.139;

            this.node.getChildByName('Solar_system_area').getChildByName('Solar_system_owner_label').getComponent(Widget).left = 23.1;
            this.node.getChildByName('Solar_system_area').getChildByName('Solar_system_remaining_label').getComponent(Widget).left = 73.3;
            this.node.getChildByName('Solar_system_area').getChildByName('Solar_system_ship_label').getComponent(Widget).left = 68.97;
            this.node.getChildByName('Solar_system_area').getChildByName('Solar_system_total_planet_label').getComponent(Widget).left = 67.36;
            this.node.getChildByName('Solar_system_area').getChildByName('Solar_system_remaining_planet_label').getComponent(Widget).left = 69.55;

            this.node.getChildByName('Starmap_bg').active = false;
            this.node.getChildByName('Solar_system_bg').active = true;
            this.node.getChildByName('Planet_bg').active = false;

            this.changeSolarSystemTooltipInfo(this.dataManager.getSolarSystemCode(), this.dataManager.getUserAddress());
        }
        if (find('GameManager/').getComponent(GameManager)._activeType === GameConstans.SCENCE_TYPE.PLANET) {
            this.node.getChildByName('Starmap_area').active = false;
            this.node.getChildByName('Solar_system_area').active = true;

            this.node.getChildByName("Player_name_label").getComponent(Widget).top = 143.362;
            this.node.getChildByName("Player_mineral_label").getComponent(Widget).top = 222.55;
            this.node.getChildByName("Player_ship_label").getComponent(Widget).top = 284.49;
            this.node.getChildByName("Player_solar_label").getComponent(Widget).top = 347.51;

            this.node.getChildByName('Solar_system_area').getChildByName('Solar_system_owner_label').getComponent(Widget).left = 35.75;
            this.node.getChildByName('Solar_system_area').getChildByName('Solar_system_remaining_label').getComponent(Widget).left = 86.31;
            this.node.getChildByName('Solar_system_area').getChildByName('Solar_system_ship_label').getComponent(Widget).left = 80.89;
            this.node.getChildByName('Solar_system_area').getChildByName('Solar_system_total_planet_label').getComponent(Widget).left = 79.28;
            this.node.getChildByName('Solar_system_area').getChildByName('Solar_system_remaining_planet_label').getComponent(Widget).left = 81.55;

            this.node.getChildByName('Starmap_bg').active = false;
            this.node.getChildByName('Solar_system_bg').active = false;
            this.node.getChildByName('Planet_bg').active = true;

            this.changePlanetTooltipInfo(this.dataManager.getPlanetCode(), this.dataManager.getUserAddress());

        }

    }

    /*
     *@Author: yozora
     *@Description: 修改星图信息
     *@Date: 2022-03-01 15:25:27
     */
    public changeStarmapTooltipInfo() {
        HttpRequest.getGameInfo()
            .then(res => {
                this.gameInfo = res.data;
                this.initCircleInfo();
                this.initLeftBar();
                HttpRequest.getUserProfile(this.dataManager.getUserAddress()).then(res => {
                    if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                        this.dataManager.setUserProfile(res.data);
                        // 设置玩家信息
                        this.node.getChildByName("Player_name_label").getComponent(Label).string = this.dataManager.getUserData().userProfile.username;
                        this.node.getChildByName("Player_mineral_label").getComponent(Label).string = this.dataManager.getUserData().userProfile.mineral.toString();
                        this.node.getChildByName("Player_ship_label").getComponent(Label).string = this.dataManager.getUserData().userProfile.shipCount.toString();
                        this.node.getChildByName("Player_solar_label").getComponent(Label).string = this.dataManager.getUserData().userProfile.solarCount === undefined ? '0' : this.dataManager.getUserData().userProfile.solarCount.toString();
                    } else {
                        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.TOAST, res.msg);
                    }
                }).catch(err => {
                    error(err);
                    return;
                });
            }).catch(err => {
                error(err);
                return;
            });
    }

    /*
     *@Author: yozora
     *@Description: 获取太阳系信息
     *@Date: 2022-03-01 11:43:04
     */
    public changeSolarSystemTooltipInfo(_solarSystemCode: string, _userAddress?: string) {
        HttpRequest.getSolarSystemTooltipInfo(_solarSystemCode, "-1", _userAddress).then(res => {
            if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                const solarSystemTooltipInfo: SolarSystemTooltipInfo = res.data;
                // this.systemId.string = (_solarSystemCode === null ? "UNKNOWN" : _solarSystemCode);
                this.node.getChildByName('Solar_system_area').getChildByName('Solar_system_owner_label').getComponent(Label).string = solarSystemTooltipInfo.solarSystemOwner === null ? "NONE" : solarSystemTooltipInfo.solarSystemOwner;
                this.node.getChildByName('Solar_system_area').getChildByName('Solar_system_remaining_label').getComponent(Label).string = solarSystemTooltipInfo.currentMineral.toString();
                this.node.getChildByName('Solar_system_area').getChildByName('Solar_system_ship_label').getComponent(Label).string = solarSystemTooltipInfo.allShipCount.toString();
                this.node.getChildByName('Solar_system_area').getChildByName('Solar_system_total_planet_label').getComponent(Label).string = solarSystemTooltipInfo.planetaryCount.toString();
                const remainingPlanetCount = solarSystemTooltipInfo.planetaryCount - solarSystemTooltipInfo.myPlanetCount - solarSystemTooltipInfo.otherPlanetCount;
                this.node.getChildByName('Solar_system_area').getChildByName('Solar_system_remaining_planet_label').getComponent(Label).string = remainingPlanetCount.toString();
            } else {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.TOAST, res.msg);
            }
        }).catch(err => {
            console.error(err);
        });
    }

    /*
     *@Author: yozora
     *@Description: 获取星球信息
     *@Date: 2022-03-01 11:44:47
     */
    public changePlanetTooltipInfo(_planetCode: string, _userAddress?: string) {
        HttpRequest.getPlanetTooltipInfo(_planetCode, "-1", _userAddress).then(res => {
            if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                const planetTooltipInfo: PlanetTooltipInfo = res.data;
                this.node.getChildByName('Solar_system_area').getChildByName('Solar_system_owner_label').getComponent(Label).string = "UNKNOWN";
                this.node.getChildByName('Solar_system_area').getChildByName('Solar_system_remaining_label').getComponent(Label).string = planetTooltipInfo.currentMineral.toString();
                this.node.getChildByName('Solar_system_area').getChildByName('Solar_system_ship_label').getComponent(Label).string = planetTooltipInfo.allShipCount.toString();
                this.node.getChildByName('Solar_system_area').getChildByName('Solar_system_total_planet_label').getComponent(Label).string = planetTooltipInfo.myShipCount.toString();
                const otherShipCount = planetTooltipInfo.allShipCount - planetTooltipInfo.myShipCount;
                this.node.getChildByName('Solar_system_area').getChildByName('Solar_system_remaining_planet_label').getComponent(Label).string = otherShipCount.toString();
            } else {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.TOAST, res.msg);
            }
        }).catch(err => {
            console.error(err);
        });
    }

}
