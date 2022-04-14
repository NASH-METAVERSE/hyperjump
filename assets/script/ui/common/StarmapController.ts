
import { _decorator, Component, Node, find, SpriteFrame, Sprite, Vec3, tween, Tween, resources, Prefab, instantiate, Camera, screen, UITransform, Widget, EventTouch, MeshRenderer, Material, AnimationClip, Animation } from 'cc';
import { GameConstans } from '../../entity/GameConstans';
import { ShipListDetail } from '../../entity/ShipListDetail';
import { ShipStatusInfo } from '../../entity/ShipStatusInfo';
import { FreeRotate } from '../../function/FreeRotate';
import { Quaternion } from '../../function/Quaternion';
import { Rotate } from '../../function/Rotate';
import { SolarSystem } from '../../SolarSystem';
import { ClientEvent } from '../../utils/ClientEvent';
import { HttpRequest } from '../../utils/HttpRequest';
import { ShipBoardLarge } from '../model/ShipBoardLarge';
import { ShipList } from '../model/ShipList';
import { ShipTooltip } from '../model/ShipTooltip';
import { SolarSystemTooltip } from '../model/SolarSystemTooltip';
import { TimerManager } from './TimerManager';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = StarmapController
 * DateTime = Mon Feb 07 2022 15:51:21 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = StarmapController.ts
 * FileBasenameNoExtension = StarmapController
 * URL = db://assets/script/ui/common/StarmapController.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 * 星图场景控制器
 */

@ccclass('StarmapController')
export class StarmapController extends Component {

    private canvas: Node = null;

    private mainCamera: Camera = null;

    /*
    * 标记飞船-闲置
    */
    private idle_sign: Prefab = null;

    /*
     * 标记飞船-3D
     */
    private solar_0: Prefab = null;

    /*
     * 标记飞船材质
     */
    private ship_sign_mat: Material | null = null;

    /*
    * 飞船标记节点
    */
    private hover_ship_node: Node = null;

    /*****************************************跃迁路径相关资源START************************************/

    /*
     * 跃迁飞船
     */
    private jump_ship_node: Node = null;

    /*
     * 跃迁目的地
     */
    private jump_destination_node: Node = null;

    /*
     * 跃迁飞船编码
     */
    private jump_ship_code: string = null;

    /*
     * 路径数量
     */
    private jump_road_count: number = 0;

    /*
     * 跃迁路径资源
     */
    private jump_road: SpriteFrame = null;

    /*
     * 跃迁路径放大资源
     */
    private jump_road_large: SpriteFrame = null;

    /*
     * 跃迁区域
     */
    private jump_area: Node = null;

    /*
     * 跃迁进度
     */
    private jump_radio: number = 0;

    /*
     * 跃迁进度路径位置
     */
    private jump_radio_road_index: number = 0;

    /*
     * 跃迁路径动画开关
     */
    private jump_tween_flag: boolean = false;

    /*
     * 跃迁场景加载开关
     */
    private loadRoadFlag: boolean = false;

    /*****************************************跃迁路径相关资源END************************************/

    /*****************************************UI相关资源START************************************/

    /*
    * 星图场景当前激活飞船焦点节点
    */
    private activeHoverStarmapShipNode: Node = null;

    /*
    * 星图场景焦点事件飞船工具栏
    */
    private hoveredStarmapShipTooltip: Node = null;


    /*
     * 星图太阳系左上工具栏
     */
    private starmap_tooltip_left_top: Node = null;

    /*
     * 星图太阳系右上工具栏
     */
    private starmap_tooltip_right_top: Node = null;

    /*
     * 星图飞船左上工具栏
     */
    private ship_tooltip_left_top: Node = null;

    /*
     * 星图飞船右上工具栏
     */
    private ship_tooltip_right_top: Node = null;

    /*
   * 星图太阳系下工具栏
   */
    private starmap_tooltip_left_buttom: Node = null;

    /*
     * 星图太阳系右下工具栏
     */
    private starmap_tooltip_right_buttom: Node = null;

    /*
     * 星图飞船左下工具栏
     */
    private ship_tooltip_left_buttom: Node = null;

    /*
     * 星图飞船右下工具栏
     */
    private ship_tooltip_right_buttom: Node = null;

    /*
    * 星图场景-焦点飞船面板节点
    */
    private ship_board_node: Node = null;

    /*
     * 星图场景-点击飞船面板节点
     */
    private ship_detail_board_node: Node = null;

    /*****************************************UI相关资源END************************************/

    /*****************************************UI的状态控制START*********************************** */

    /*
    * 是否点击飞船面板
    */
    private clickedShipBoard: boolean = false;

    /*
     * 是否点击菜单
     */
    private clickedHanger: boolean = false;

    /*****************************************UI的状态控制END*********************************** */

    /*****************************************RUNTIME START************************************/
    /*
    * 星图场景当前激活焦点节点
    */
    private activeHoverStarmapNode: Node = null;

    /*
     * 当前选中太阳系
     */
    private hoverSolarSystem: string = null;

    /*
    * 星图场景焦点事件工具栏
    */
    private hoveredStarmapTooltip: Node = null;

    /*
    * 飞船工具栏星球渲染区域
    */
    private planetArea: Sprite = null!;

    /*****************************************RUNTIME END************************************/

    /**************************************************UI脚本START****************************************************/

    constructor(canvas: Node, mainCamera: Camera) {
        super();
        this.canvas = canvas;
        this.mainCamera = mainCamera;
        this.loadResource();
    }
    /*
    * 飞船弹窗脚本
    */
    private shipTooltip: ShipTooltip = null;

    /*
    * 太阳系弹窗脚本
    */
    private solarSystemTooltip: SolarSystemTooltip = null;

    /**************************************************UI脚本END****************************************************/

    /*****************************************UI相关方法START*********************************** */

    /*
    *@Author: yozora
    *@Description: 显示星图场景焦点飞船工具栏
    *@Date: 2021-11-25 00:20:47
    *@Deprecated: 飞船面板替代
    */
    private changeShipTooltip(shipDetailInfo: ShipListDetail, isShow: boolean) {
        if (isShow) {
            // 判断方位
            this.activeHoverStarmapShipNode = find(`GameManager/StarmapManager/solar_${shipDetailInfo.solarSystemCode}`);
            const screenPoint = this.mainCamera.worldToScreen(this.activeHoverStarmapShipNode.getWorldPosition());
            let position = this.mainCamera.convertToUINode(
                this.activeHoverStarmapShipNode.getWorldPosition(),
                this.canvas
            );
            this.chooseShipTooltipPosition(screenPoint, position);
            this.shipTooltip = this.hoveredStarmapShipTooltip.getComponent(ShipTooltip);
            this.planetArea = this.hoveredStarmapShipTooltip.getChildByName("Planet_area").getComponent(Sprite);
            // 修改飞船工具栏信息
            this.shipTooltip.changeShipTooltipInfo(shipDetailInfo, this.planetArea, true);
            // 设置卡片
            this.canvas.getChildByName(this.hoveredStarmapShipTooltip.name).setPosition(position);
            this.hoveredStarmapShipTooltip.active = true;
            this.processNodeSprite(shipDetailInfo, position, 1);
        } else {
            this.shipTooltip.changeShipTooltipInfo(null, null, false);
            this.hoveredStarmapShipTooltip.active = false;
            this.processNodeSprite(shipDetailInfo, null, 0);
        }
    }

    /*
     *@Author: yozora
     *@Description: 处理焦点飞船节点样式
     *@Date: 2021-12-10 00:24:41
     *@Deprecated: 飞船面板替代
     */
    private processNodeSprite(shipDetailInfo: ShipListDetail, position: Vec3, type: number) {
        // 默认激活节点样式
        if (type === 0) {
            this.hover_ship_node.destroy();
            return;
        }
        // 修改激活节点样式
        if (type === 1) {
            if (shipDetailInfo.shipStatusInfoList[0].shipStatus === GameConstans.SHIP_STATUS.SHIP_IDLE) {
                this.hover_ship_node = instantiate(this.idle_sign);
                this.hover_ship_node.setPosition(position);
            }
            if (shipDetailInfo.shipStatusInfoList[0].shipStatus === GameConstans.SHIP_STATUS.SHIP_ATTACK) {
                this.hover_ship_node = instantiate(this.idle_sign);
                this.hover_ship_node.setPosition(position);
            }
            if (shipDetailInfo.shipStatusInfoList[0].shipStatus === GameConstans.SHIP_STATUS.SHIP_FULL_COOLING) {
                this.hover_ship_node = instantiate(this.idle_sign);
                this.hover_ship_node.setPosition(position);
            }
            if (shipDetailInfo.shipStatusInfoList[0].shipStatus === GameConstans.SHIP_STATUS.SHIP_JUMP_COOLING) {
                this.hover_ship_node = instantiate(this.idle_sign);
                this.hover_ship_node.setPosition(position);
            }
            if (shipDetailInfo.shipStatusInfoList[0].shipStatus === GameConstans.SHIP_STATUS.SHIP_OCCUPYING) {
                this.hover_ship_node = instantiate(this.idle_sign);
                this.hover_ship_node.setPosition(position);
            }
            if (shipDetailInfo.shipStatusInfoList[0].shipStatus === GameConstans.SHIP_STATUS.SHIP_MINING) {
                this.hover_ship_node = instantiate(this.idle_sign);
                this.hover_ship_node.setPosition(position);
            }
            this.canvas.addChild(this.hover_ship_node);
        }

    }

    /*
   *@Author: yozora
   *@Description: 判断太阳系工具栏方位
   *@Date: 2021-12-15 00:27:46
   *@Deprecated: 飞船面板替代
   */
    private chooseShipTooltipPosition(screenPoint: Vec3, position: Vec3) {
        let diretion = -1;
        // 右弹窗
        if (screenPoint.x - 799 < 0) {
            diretion = 1;
        } else if (screenPoint.x + 799 > screen.windowSize.x - 1081) {
            diretion = -1;
        }
        if (diretion === -1) {
            // 下弹窗
            if (screenPoint.y + 422 > screen.windowSize.y) {
                this.hoveredStarmapShipTooltip = this.ship_tooltip_left_buttom;
                this.ship_tooltip_right_buttom.active = false;
                this.ship_tooltip_left_top.active = false;
                this.ship_tooltip_left_buttom.active = false;
            }
            // 上弹窗
            else {
                this.hoveredStarmapShipTooltip = this.ship_tooltip_left_top;
                this.ship_tooltip_right_top.active = false;
                this.ship_tooltip_left_top.active = false;
                this.ship_tooltip_left_buttom.active = false;
            }
        } else {
            // 下弹窗
            if (screenPoint.y + 422 > screen.windowSize.y) {
                this.hoveredStarmapShipTooltip = this.ship_tooltip_right_buttom;
                this.ship_tooltip_right_top.active = false;
                this.ship_tooltip_right_buttom.active = false;
                this.ship_tooltip_left_buttom.active = false;
            }
            // 上弹窗
            else {
                this.hoveredStarmapShipTooltip = this.ship_tooltip_right_top;
                this.ship_tooltip_right_top.active = false;
                this.ship_tooltip_right_buttom.active = false;
                this.ship_tooltip_left_top.active = false;
            }
        }

    }

    /*
     *@Author: yozora
     *@Description: 显示星图场景太阳系焦点工具栏
     *@Date: 2021-11-16 16:08:10
     */
    public hoverSolarSystemTooltip(target: Node, is_show: boolean) {
        if (is_show) {
            // 同一个节点不重复添加
            if (this.activeHoverStarmapNode && this.activeHoverStarmapNode.name === target.name) {
                return;
            }
            this.activeHoverStarmapNode = target;
            this.hoveredStarmapTooltip = this.starmap_tooltip_left_top;
            const screenPoint = this.mainCamera.worldToScreen(this.activeHoverStarmapNode.getWorldPosition());
            let position = this.mainCamera.convertToUINode(
                this.activeHoverStarmapNode.getWorldPosition(),
                this.canvas
            );
            const d = this.chooseStarmapTooltipPosition(screenPoint, position);
            // 修改星图场景焦点工具栏
            this.solarSystemTooltip = this.hoveredStarmapTooltip.getComponent(SolarSystemTooltip);
            this.solarSystemTooltip.changeSolarSystemTooltipInfo(this.activeHoverStarmapNode.getComponent(SolarSystem).solarSystemCode, true);

            this.hoveredStarmapTooltip.active = true;
            if (d === -1) {
                position.x = position.x - 200;
            } else {
                position.x = position.x + 200;
            }
            this.canvas.getChildByName(this.hoveredStarmapTooltip.name).setPosition(position);
        } else {
            if (this.hoveredStarmapTooltip) {
                this.solarSystemTooltip.changeSolarSystemTooltipInfo(null, false, null);
                this.canvas.children.forEach((child) => {
                    if (child.name === 'Ship_tooltip_s') {
                        child.active = false;
                    }
                });
                // this.node.getChildByName(this.hoveredStarmapTooltip.name).active = false;
                this.activeHoverStarmapNode = null;
            }
        }
    }

    /*
    *@Author: yozora
    *@Description: 判断太阳系工具栏方位
    *@Date: 2021-12-15 00:27:46
    */
    private chooseStarmapTooltipPosition(screenPoint: Vec3, position: Vec3) {
        let diretion = -1;
        // 右弹窗
        if (screenPoint.x - 304 < 0) {
            return diretion = 1;
            // 左弹窗
        } else if (screenPoint.x + 304 > screen.windowSize.x - 404) {
            return diretion = -1;
        }
        // 上下窗
        // if (diretion === -1) {
        //     // 下弹窗
        //     if (screenPoint.y + 422 > screen.windowSize.y) {
        //         this.hoveredStarmapTooltip = this.starmap_tooltip_left_buttom;
        //         this.starmap_tooltip_left_top.active = false;
        //         this.starmap_tooltip_right_top.active = false;
        //         this.starmap_tooltip_right_buttom.active = false;
        //         // 上弹窗
        //     } else {
        //         this.hoveredStarmapTooltip = this.starmap_tooltip_left_top;
        //         this.starmap_tooltip_left_buttom.active = false;
        //         this.starmap_tooltip_right_top.active = false;
        //         this.starmap_tooltip_right_buttom.active = false;
        //     }
        // } else {
        //     // 下弹窗
        //     if (screenPoint.y + 422 > screen.windowSize.y) {
        //         this.hoveredStarmapTooltip = this.starmap_tooltip_right_buttom;
        //         this.starmap_tooltip_left_top.active = false;
        //         this.starmap_tooltip_left_buttom.active = false;
        //         this.starmap_tooltip_right_top.active = false;
        //         // 上弹窗
        //     } else {
        //         this.hoveredStarmapTooltip = this.starmap_tooltip_right_top;
        //         this.starmap_tooltip_left_top.active = false;
        //         this.starmap_tooltip_left_buttom.active = false;
        //         this.starmap_tooltip_right_buttom.active = false;
        //     }
        // }
    }

    /*
   *@Author: yozora
   *@Description: 激活星图场景-太阳系焦点工具栏
   *@Date: 2021-11-17 15:50:30
   */
    private activeHoverStarmapTooltop() {
        if (this.activeHoverStarmapNode && this.canvas.getChildByName("Starmap_solar_tooltip")) {
            const screenPoint = this.mainCamera.worldToScreen(this.activeHoverStarmapNode.getWorldPosition());
            let position = this.mainCamera.convertToUINode(
                this.activeHoverStarmapNode.getWorldPosition(),
                this.canvas
            );
            // // 左边界
            // if (screenPoint.x - 129 < 0) {
            //   // 下边界
            //   if (screenPoint.y - 122 < 0) {
            //     position.x = position.x + 129;
            //     position.y = position.y + 122;
            //   }
            //   // 上边界
            //   if (screenPoint.y + 122 > 1080) {
            //     position.x = position.x + 129;
            //     position.y = position.y - 122;
            //   }
            // } else
            //   // 右边界
            //   if (screenPoint.x + 129 > 1920) {
            //     // 下边界
            //     if (screenPoint.y - 122 < 0) {
            //       position.x = position.x - 129;
            //       position.y = position.y + 122;
            //     }
            //     // 上边界
            //     if (screenPoint.y + 122 > 1080) {
            //       position.x = position.x - 129;
            //       position.y = position.y - 122;
            //     }
            //   } else {
            //     position.x = position.x + 129;
            //     position.y = position.y - 122;
            //   }
            // position.x = position.x + 57;
            // position.y = position.y + 69;
            this.canvas.getChildByName("Starmap_solar_tooltip").setPosition(position);
        }
    }

    /*
    *@Author: yozora
    *@Description: Hover显示或隐藏飞船面板
    *@Date: 2022-01-04 17:20:11
    */
    public hoverShipBoard(prefab: Prefab, shipDetailInfo: ShipListDetail, isShow: boolean, shipIndex: number) {
        if (!this.ship_detail_board_node) {
            this.ship_detail_board_node = this.canvas.getChildByName('Starmap_area').getChildByName('Ship_board_large');
            this.ship_detail_board_node.getComponent(Widget).horizontalCenter = GameConstans.UI_POSITON.INIT_MY_BOARD_H;
            this.ship_detail_board_node.active = true;
        }
        if (!this.clickedShipBoard) {
            if (isShow) {
                // 重置飞船面板参数
                this.ship_detail_board_node.getChildByName("Ship_area").getChildByName("Ship").setRotationFromEuler(-13, -0.6, -32);
                this.ship_detail_board_node.getChildByName("Ship_area").getChildByName("Ship").getComponent(Rotate).enabled = true;
                this.ship_detail_board_node.getChildByName("Ship_area").getComponent(FreeRotate).enabled = false;
                this.ship_detail_board_node.getComponent(ShipBoardLarge).processShipDetailBoardInfo(shipDetailInfo, 0, shipIndex);
                this.ship_detail_board_node.active = true;
            } else {
                this.ship_detail_board_node.getComponent(ShipBoardLarge).resetTimerLabel();
                this.ship_detail_board_node.active = false;
            }
        }
    }

    /*
    *@Author: yozora
    *@Description: Click显示或隐藏飞船详细面板
    *@Date: 2022-01-04 18:36:26
    */
    public clickShipDetailBoard(prefab: Prefab, shipDetailInfo: ShipListDetail, isShow: boolean, shipIndex: number) {
        if (!this.ship_detail_board_node) {
            this.ship_detail_board_node = this.canvas.getChildByName('Starmap_area').getChildByName('Ship_board_large');
            this.ship_detail_board_node.getComponent(Widget).horizontalCenter = GameConstans.UI_POSITON.INIT_MY_BOARD_H;
            this.ship_detail_board_node.active = true;
        }
        if (isShow) {
            // 重置飞船面板参数
            this.clickedShipBoard = true;
            this.ship_detail_board_node.getChildByName("Ship_area").getChildByName("Ship").setRotationFromEuler(-13, -0.6, -32);
            this.ship_detail_board_node.getChildByName("Ship_area").getChildByName("Ship").getComponent(Rotate).enabled = false;
            this.ship_detail_board_node.getChildByName("Ship_area").getComponent(FreeRotate).enabled = true;
            this.ship_detail_board_node.getComponent(ShipBoardLarge).processShipDetailBoardInfo(shipDetailInfo, 1, shipIndex);
            this.ship_detail_board_node.active = true;

            // 标记飞船在星图位置
            // this.hoverSolarSystem = find('GameManager').getChildByName('StarmapManager').getChildByName(`solar_${shipDetailInfo.solarSystemCode}`);
            this.hoverSolarSystem = shipDetailInfo.solarSystemCode;
            this.signShip(true);

            // 隐藏菜单栏
            this.canvas.getChildByName("Hanger").active = false;
            this.clickedHanger = false;

            // 缓动飞船详细面板到右端
            this.tweenShipBoard();
        } else {
            this.resetShipBoard();
            this.clickedShipBoard = false;
            this.ship_detail_board_node.active = false;
            if (this.hover_ship_node && this.hover_ship_node.active) {
                this.hover_ship_node.active = false;
            }
            this.hoverSolarSystem = null;
        }
    }

    /*
     *@Author: yozora
     *@Description: 缓动飞船面板
     *@Date: 2022-02-09 14:10:12
     */
    private tweenShipBoard() {
        // 缓动飞船详细面板到左端
        tween(this.ship_detail_board_node.getComponent(Widget)).to(0.5, { horizontalCenter: GameConstans.UI_POSITON.CLICKED_MY_BOARD_H }, { easing: 'smooth' }).start();
        // 隐藏指示牌
        this.ship_detail_board_node.getChildByName("Ship_border_right").active = false;
    }

    /*
     *@Author: yozora
     *@Description: 激活标记飞船
     *@Date: 2022-02-08 11:26:56
     */
    private signShip(isShow: boolean) {
        // if (this.hoverSolarSystem) {
        //     const signPos = new Vec3();
        //     this.mainCamera.convertToUINode(
        //         this.hoverSolarSystem.getWorldPosition(),
        //         this.canvas,
        //         signPos
        //     )
        //     if (!this.hover_ship_node) {
        //         this.hover_ship_node = instantiate(this.idle_sign);
        //         this.canvas.addChild(this.hover_ship_node);
        //     } else {
        //         this.hover_ship_node.active = true;
        //     }
        //     this.hover_ship_node.setPosition(signPos);
        // }
        if (isShow) {
            if (!this.hover_ship_node) {
                // 叠加标记层
                this.hover_ship_node = instantiate(this.solar_0);
                this.hover_ship_node.name = 'sign_ship';
                find('GameManager/StarmapManager').addChild(this.hover_ship_node);
                this.hover_ship_node.getComponent(MeshRenderer).setMaterial(this.ship_sign_mat, 0);
                // 播放动画
                resources.load("animation/max_score_large", AnimationClip, (err, assert) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    this.hover_ship_node.addComponent(Animation).createState(assert);
                    const anime = this.hover_ship_node.getComponent(Animation);
                    if (anime.getState("max_score_large") !== null && !anime.getState("max_score_large").isPlaying) {
                        anime.play("max_score_large");
                    }
                });
            } else {
                this.hover_ship_node.active = true;
            }
            this.hover_ship_node.setPosition(find('GameManager/StarmapManager').getChildByPath(`/solar_${this.hoverSolarSystem}`).getPosition());
        } else {
            if (this.hover_ship_node && this.hover_ship_node.active) {
                this.hover_ship_node.active = false;
            }
        }
    }

    /*
    *@Author: yozora
    *@Description: 初始化飞船面板材质
    *@param: type 0焦点面板 1点击面板
    *@Date: 2022-01-04 18:29:30
    */
    // private initShipBoardInfo(type: number = 0) {
    //     const renderTex = this.ship_render;
    //     const camera = find("Dynamic Camera").getComponent(Camera)!;
    //     camera.targetTexture = renderTex;
    //     const spriteFrame = this.ship_detail_board_node.getChildByName("Ship_area").getComponent(Sprite).spriteFrame!;
    //     const sp = new SpriteFrame();
    //     sp.reset({
    //         originalSize: spriteFrame.originalSize,
    //         rect: spriteFrame.rect,
    //         offset: spriteFrame.offset,
    //         isRotate: spriteFrame.rotated,
    //     });
    //     sp.texture = renderTex;

    //     this.ship_detail_board_node.getChildByName("Ship_area").getComponent(Sprite).spriteFrame = sp;
    //     this.ship_detail_board_node.getChildByName("Ship_area").getComponent(Sprite).updateMaterial();
    // }

    /*
    *@Author: yozora 
    *@Description: 重置星图太阳系弹窗
    *@Date: 2022-01-17 16:54:32
    */
    private resetStarmapTooltip() {
        if (this.hoveredStarmapTooltip) {
            this.solarSystemTooltip.changeSolarSystemTooltipInfo(null, false, null);
            this.canvas.getChildByName(this.hoveredStarmapTooltip.name).active = false;
            this.activeHoverStarmapNode = null;
        }
    }

    /*
     *@Author: yozora
     *@Description: 重置飞船面板样式
     *@Date: 2022-02-09 15:48:19
     */
    private resetShipBoard() {
        this.ship_detail_board_node.getComponent(Widget).horizontalCenter = GameConstans.UI_POSITON.INIT_MY_BOARD_H;
        this.ship_detail_board_node.getComponent(Widget).top = GameConstans.UI_POSITON.INIT_MY_BOARD_V;
        this.ship_detail_board_node.getChildByName("Ship_border_right").active = true;
    }

    /*
     *@Author: yozora
     *@Description: 隐藏星图场景UI
     *@Date: 2022-02-07 18:00:17
     */
    public hiddenStarmapUI() {
        if (this.hover_ship_node && this.hover_ship_node.active) {
            this.hover_ship_node.active = false;
        }
        if (this.hoveredStarmapTooltip && this.hoveredStarmapTooltip.active) {
            this.hoveredStarmapTooltip.active = false;
        }
    }

    /*
     *@Author: yozora
     *@Description: 显示星图场景UI
     *@Date: 2022-02-09 15:02:53
     */
    public showStarmapUI() {
        // 显示左侧面板
        this.canvas.getChildByName('Galaxy_statistics').active = true;
        // 隐藏敌方飞船列表
        this.canvas.getChildByName('Hanger-planet').active = false;
        // 如果飞船面板打开，则恢复跃迁状态
        if (this.ship_detail_board_node) {
            this.ship_detail_board_node.getComponent(ShipBoardLarge).changeShipBoardButton(null, null, GameConstans.RESET_TYPE.NULL);
        }
    }

    /*****************************************UI相关方法END*********************************** */

    /*****************************************状态相关方法START*********************************** */

    /*
    *@Author: yozora
    *@Description: 修改菜单栏状态
    *@Date: 2022-02-04 16:50:04
    */
    public changeHangerStatus(e: EventTouch) {
        if (this.clickedHanger) {
            this.clickedHanger = false;
            this.canvas.getChildByName("Hanger").active = false;
        } else {
            this.clickedHanger = true;
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.MOVE_LEFT_BAR_CONTENT);
            this.canvas.getChildByName("Hanger").active = true;
            if (this.clickedShipBoard) {
                // 隐藏飞船详细面板
                // TODO: 重置用户当前行为
                this.clickShipDetailBoard(null, null, false, null);
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.CHANGE_CARD_PRESSED_STATUS, 'Reset', false);
                this.ship_detail_board_node.getComponent(Widget).horizontalCenter = GameConstans.UI_POSITON.INIT_MY_BOARD_H;
                this.clickedShipBoard = false;
                this.canvas.getChildByName('Hanger').getChildByName('Ship_list').getComponent(ShipList)._clickedShipCardIndex = -1;
            }
        }
    }

    /*****************************************状态相关方法END*********************************** */

    /*****************************************跃迁路径相关方法START*********************************** */

    /*
   *@Author: yozora
   *@Description: 重置跃迁区域
   *@Date: 2021-12-21 13:36:43 
   */
    private resetJumpInfo() {
        Tween.stopAllByTag(1);
        this.jump_area.removeAllChildren();
        this.loadRoadFlag = false;
        this.jump_tween_flag = false;
        this.jump_area.active = true;
    }

    /*
     *@Author: yozora
     *@Description: 绘制跃迁路径
     *@Date: 2021-12-02 11:47:52
     */
    public changeJumpRoad(shipDetailInfo: ShipListDetail, is_show: boolean) {
        if (is_show) {
            if (shipDetailInfo.shipCode === this.jump_ship_code && this.jump_area.children.length > 0) {
                this.jump_area.active = true;
                return;
            }
            this.resetJumpInfo();
            // 首次绘制加载数据
            HttpRequest.getJumpInfo(shipDetailInfo.shipCode).then((res) => {
                if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                    const shipStatus = find('TimerManager').getComponent(TimerManager).getShipTimer(shipDetailInfo.shipCode, -2);
                    let _jump_time = shipStatus.currentTime;
                    let _jump_evaluate_time = shipStatus.evaluateTime;
                    const distination: string = res.data.solarSystemCode;
                    this.jump_ship_code = shipDetailInfo.shipCode
                    // 标记飞船位置
                    const shipPosition = this.mainCamera.convertToUINode(
                        find(`GameManager/StarmapManager/solar_${shipDetailInfo.solarSystemCode}`).getWorldPosition(),
                        this.canvas
                    );
                    // 标记目的地位置
                    const distinationPosition = this.mainCamera.convertToUINode(
                        find(`GameManager/StarmapManager/solar_${distination}`).getWorldPosition(),
                        this.canvas
                    );
                    // 跃迁距离
                    const distance = Vec3.distance(shipPosition, distinationPosition);
                    // 跃迁进度
                    this.jump_radio = (_jump_evaluate_time - _jump_time) / _jump_evaluate_time;
                    // 进度位置记录
                    const modelPosition = new Vec3();
                    Vec3.lerp(modelPosition, shipPosition, distinationPosition, this.jump_radio);

                    // 绘制跃迁路径
                    const roadPositions: Vec3[] = [];
                    // 距离小则插入一个
                    if (distance < 8 * 3) {
                        const roadPosition = new Vec3();
                        Vec3.lerp(roadPosition, shipPosition, distinationPosition, 0.5);
                        roadPositions.push(roadPosition);
                        this.jump_radio_road_index = 1
                    } else {
                        // 固定间距插值
                        const roadCount = Math.ceil(distance / 14.4);
                        for (let index = 1; index < roadCount; index++) {
                            const roadPosition = new Vec3();
                            Vec3.lerp(roadPosition, shipPosition, distinationPosition, 1 / roadCount * index);
                            roadPositions.push(roadPosition);
                        }
                        // 确定进度位置
                        this.jump_radio_road_index = Math.ceil(this.jump_radio * roadCount);
                    }

                    //确定路径角度
                    const targerPosition = new Vec3();
                    Vec3.subtract(targerPosition, distinationPosition, shipPosition);
                    const radian = Vec3.angle(targerPosition, Vec3.UNIT_X);
                    let angle;
                    if (targerPosition.y < 0) {
                        angle = -radian * 180 / Math.PI;
                    } else {
                        angle = radian * 180 / Math.PI;
                    }
                    resources.load("prefab/ui/Road", Prefab, (err, prefab) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        this.jump_road_count = roadPositions.length;
                        let index = 0;
                        // 运动轨迹
                        this.schedule(() => {
                            const road: Node = instantiate(prefab);
                            road.name = `road_${index}`;
                            road.setPosition(roadPositions[index]);
                            Quaternion.RotateZ(road, angle);
                            this.jump_area.addChild(road);
                            // 最后一次执行,执行进度绘制
                            if (index === this.jump_road_count - 1) {
                                this.jump_tween_flag = true;
                            }
                            index++;
                        }, 0.01, this.jump_road_count - 1);
                    });

                    this.jump_ship_node.setPosition(shipPosition);
                    this.jump_destination_node.setPosition(distinationPosition);
                    this.jump_area.addChild(this.jump_ship_node);
                    this.jump_area.addChild(this.jump_destination_node);
                    this.loadRoadFlag = true;
                }
            }).catch((err) => {
                console.error(err);
            });
        }
        else {
            this.jump_area.active = false;
        }
    }

    /*
   *@Author: yozora
   *@Description: 倒计时器
   *@Date: 2021-12-08 18:40:35
   */
    public jumpRoadTimer(shipCode: string, index: number, shipStatusInfo: ShipStatusInfo, fillRange: number, clearFlag: boolean) {
        if (this.loadRoadFlag && this.jump_ship_code === shipCode) {
            if (!clearFlag) {
                this.jump_radio = (shipStatusInfo.evaluateTime - shipStatusInfo.currentTime) / shipStatusInfo.evaluateTime;
                // 确定进度位置
                this.jump_radio_road_index = Math.ceil(this.jump_radio * this.jump_road_count);
                this.tweenJumpRoad();
            } else {
                // 完成跃迁
                this.loadRoadFlag = false;
                this.jump_tween_flag = false;
                this.jump_area.active = false;
                Tween.stopAllByTag(1);
                this.jump_area.removeAllChildren();
            }
        }
    }

    /*
*@Author: yozora
*@Description: 路径进度绘制
*@Date: 2021-12-02 17:19:15
*/
    public tweenJumpRoad() {
        if (this.jump_radio_road_index > 0 && this.jump_tween_flag) {
            let index = 0;
            this.jump_tween_flag = false;
            this.scheduleOnce(() => {
                this.tweenJumpRoadByCount(index);
            });
        }
    }


    /*
     *@Author: yozora
     *@Description: 顺序缓动
     *@Date: 2021-12-02 18:04:07
     */
    private tweenJumpRoadByCount(index: number) {
        this.jump_area.getChildByName(`road_${index}`).getComponent(Sprite).spriteFrame = this.jump_road_large;
        tween(this.jump_area.getChildByName(`road_${index}`)).to(0.25, { scale: new Vec3(4, 4, 4) }, { easing: 'smooth' })
            .to(0.1, { scale: new Vec3(1, 1, 1) }, {
                easing: 'smooth', onComplete: () => {
                    this.jump_area.getChildByName(`road_${index}`).getComponent(Sprite).spriteFrame = this.jump_road;
                    index++;
                    if (index < this.jump_radio_road_index && index < this.jump_road_count) {
                        this.tweenJumpRoadByCount(index);
                    } else {
                        this.jump_radio_road_index = 0;
                        this.jump_tween_flag = true;
                    }
                }
            }).tag(1).start();
    }

    /*****************************************跃迁路径相关方法END*********************************** */

    /*
     *@Author: yozora
     *@Description: 加载资源
     *@Date: 2022-02-07 16:01:14
     */
    private loadResource() {
        resources.load("material/shipSign", Material, (err, asset) => {
            if (err) {
                console.error(err);
                return;
            }
            this.ship_sign_mat = asset;
        });
        resources.load("prefab/model/solar_0", Prefab, (err, prefab) => {
            if (err) {
                console.error(err);
                return;
            }
            this.solar_0 = prefab;
        });
        resources.load("prefab/ui/sign/Idle_sign", Prefab, (err, prefab) => {
            if (err) {
                console.error(err);
                return;
            }
            this.idle_sign = prefab;
        });
        resources.load("prefab/ui/sign/Jump_ship_sign", Prefab, (err, prefab) => {
            if (err) {
                console.error(err);
                return;
            }
            this.jump_ship_node = instantiate(prefab);
        });
        resources.load("prefab/ui/sign/Jump_destination", Prefab, (err, prefab) => {
            if (err) {
                console.error(err);
                return;
            }
            this.jump_destination_node = instantiate(prefab);
        });
        resources.load("ui/starmap_ui/road/spriteFrame", SpriteFrame, (err, assert) => {
            if (err) {
                console.error(err);
                return;
            }
            this.jump_road = assert;
        });
        resources.load("ui/starmap_ui/road_large/spriteFrame", SpriteFrame, (err, assert) => {
            if (err) {
                console.error(err);
                return;
            }
            this.jump_road_large = assert;
        });

        resources.load("prefab/ui/starmap_tooltip/Ship_tooltip_s", Prefab, (err, prefab) => {
            if (err) {
                console.error(err);
                return;
            }
            // 初始化上工具栏
            this.starmap_tooltip_left_top = instantiate(prefab);
            this.starmap_tooltip_right_top = instantiate(prefab);
            // 初始化下工具栏
            this.starmap_tooltip_left_buttom = instantiate(prefab);
            this.starmap_tooltip_right_buttom = instantiate(prefab);

            this.canvas.addChild(this.starmap_tooltip_left_top);
            this.canvas.addChild(this.starmap_tooltip_right_top);

            this.canvas.addChild(this.starmap_tooltip_left_buttom);
            this.canvas.addChild(this.starmap_tooltip_right_buttom);

            this.starmap_tooltip_left_top.active = false;
            this.starmap_tooltip_right_top.active = false;

            this.starmap_tooltip_left_buttom.active = false;
            this.starmap_tooltip_right_buttom.active = false;
        });
        this.jump_area = find("Canvas/Jump_area");
    }
}

