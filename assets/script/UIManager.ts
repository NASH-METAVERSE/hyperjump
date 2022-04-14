import {
  _decorator,
  Component,
  Node,
  Prefab,
  Camera,
  find,
  EventTouch,
  UITransform,
  screen,
  Widget,
} from "cc";
import { GameConstans } from "./entity/GameConstans";
import { ShipListDetail } from "./entity/ShipListDetail";
import { ClientEvent } from "./utils/ClientEvent";
import { GameManager } from "./GameManager";
import { ConmonUIController } from "./ui/common/ConmonUIController";
import { StarmapController } from "./ui/common/StarmapController";
import { SolarSystemController } from "./ui/common/SolarSystemController";
import { PlanetController } from "./ui/common/PlanetController";
import { ShipLogInfo } from "./entity/ShipLogInfo";
import { ShipStatusInfo } from "./entity/ShipStatusInfo";
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = UIManager
 * DateTime = Fri Oct 22 2021 16:13:32 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = UIManager.ts
 * FileBasenameNoExtension = UIManager
 * URL = db://assets/scripts/UIManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * UI管理
 */

@ccclass("UIManager")
export class UIManager extends Component {

  /**************************************************资源START****************************************************/

  /*
   * 主摄像机
   */
  @property({ type: Camera })
  private mainCamera: Camera = null;

  /*
   * 星图场景-点击飞船面板
   */
  @property({ type: Prefab })
  private shipDetailBoardPrefab: Prefab = null;

  /*
   * 太阳系场景-星球焦点工具栏
   */
  @property({ type: Prefab })
  private solarSystemTooltipPrefab: Prefab = null;

  /*
  * 星球场景-焦点飞船面板
  */
  @property({ type: Prefab })
  private planetPlunderBoardPrefab: Prefab = null;

  /*
   * 报告对话框
   */
  @property({ type: Prefab })
  private dialog_report: Prefab = null;

  @property({ type: Prefab })
  private tactics_attack_prefab: Prefab = null;

  @property({ type: Prefab })
  private tactics_defend_prefab: Prefab = null;

  @property({ type: Prefab })
  private tactics_speed_prefab: Prefab = null;

  @property({ type: Prefab })
  private dialog_report_prefab: Prefab = null;

  @property({ type: Prefab })
  private dialog_base_prefab: Prefab = null;

  @property({ type: Prefab })
  private dialog_large_prefab: Prefab = null;

  @property({ type: Prefab })
  private dialog_info_prefab: Prefab = null;

  @property({ type: Prefab })
  private dialog_tactics_prefab: Prefab = null;

  /**************************************************资源END****************************************************/

  /**************************************************UI脚本START****************************************************/

  /*
   * 游戲脚本
   */
  private gameManager: GameManager = null!;

  /*
   * 通用UI控制器
   */
  private conmonUIController: ConmonUIController = null!;

  /*
   * 星图脚本
   */
  private starmapController: StarmapController = null!;

  /*
   * 太阳系UI管理脚本
   */
  private solarSystemController: SolarSystemController = null!;

  /*
   * 星球UI管理脚本
   */
  private planetController: PlanetController = null!;

  /**************************************************UI脚本END****************************************************/

  /*
   * 星图太阳系距离参数
   */
  public floorDistance: Map<number, number> = new Map();

  /*
   * 画布宽
   */
  public canvasWidth: number = 0;

  /*
  * 画布高
  */
  public canvasHeight: number = 0;

  /*
   * 屏幕宽
   */
  public screenWidth: number = 0;

  /*
   * 屏幕高
  */
  public screenHeight: number = 0;

  onEnable() {
    // 加载资源
    this.loadResource();
    // 星图场景-焦点太阳系工具栏
    ClientEvent.on(
      GameConstans.CLIENTEVENT_LIST.SELECT_SOLAR_SYSTEM_TOOLTIP,
      this.showStarmapSolarSystemTooltip,
      this);
    // 星图场景-焦点飞船面板
    ClientEvent.on(
      GameConstans.CLIENTEVENT_LIST.SELECT_SHIP_BOARD,
      this.showStarmapShipBoard,
      this);
    // 星图场景-点击飞船详细面板
    ClientEvent.on(
      GameConstans.CLIENTEVENT_LIST.SELECT_SHIP_DETAIL_BOARD,
      this.showStarmapShipDetailBoard,
      this);
    // 星图场景-显示跃迁路径
    ClientEvent.on(
      GameConstans.CLIENTEVENT_LIST.CHANGE_JUMP_ROAD,
      this.showStarmapJumpRoad,
      this);
    // 星图场景-显示跃迁路径
    ClientEvent.on(
      GameConstans.CLIENTEVENT_LIST.CHANGE_JUMP_TIMER,
      this.changeJumpRoadTimer,
      this
    )
    // 太阳系场景-行星工具栏
    ClientEvent.on(
      GameConstans.CLIENTEVENT_LIST.SOLAR_SYSTEM.HOVER_SOLAR_SYSTEM_TOOLTIP,
      this.hoverSolarTooltop,
      this
    );
    // 星球场景-焦点飞船面板
    ClientEvent.on(
      GameConstans.CLIENTEVENT_LIST.PLANET.HOVER_SHIP_BOARD,
      this.changePlanetShipBoardStatus,
      this);
    // 星球场景-点击飞船面板
    ClientEvent.on(
      GameConstans.CLIENTEVENT_LIST.PLANET.CLICK_SHIP_BOARD,
      this.changePlanetShipDetailBoardStatus,
      this);
    // 对话框
    ClientEvent.on(
      GameConstans.CLIENTEVENT_DIALOG_LIST.CHANGE_DIALOG,
      this.showDialog,
      this);
    // 显示飞船日志
    ClientEvent.on(
      GameConstans.CLIENTEVENT_DIALOG_LIST.CHANGE_SHIP_LOG,
      this.showShipLog,
      this);
    // 对话框流程控制
    ClientEvent.on(
      GameConstans.CLIENTEVENT_UI_LIST.BUTTON_ACTION,
      this.processUserAction,
      this);
    // 对话框反向流程控制
    ClientEvent.on(
      GameConstans.CLIENTEVENT_UI_LIST.BACK_BUTTON_ACTION,
      this.processBackUserAction,
      this);
    // 切换星图场景
    ClientEvent.on(
      GameConstans.CLIENTEVENT_SCENCE_LIST.CHANGE_STARMAP,
      this.resetScence,
      this);
    // 重置场景资源
    ClientEvent.on(
      GameConstans.CLIENTEVENT_LIST.RESET_STARMAP,
      this.resetSceneResouce,
      this);
  }

  start() {
    this.gameManager = find("GameManager").getComponent(GameManager);
  }

  update() {
    if (this.gameManager._activeType === GameConstans.SCENCE_TYPE.STARMAP) {
      // this.starmapController.signShip();
      this.starmapController.tweenJumpRoad();
    }
  }

  /*
   *@Author: yozora
   *@Description: 同步星图位置信息
   *@Date: 2021-12-28 13:34:40
   *@Deprecated: 性能限制，暂时不用
   */
  // public updateSolarSystem() {
  //   const solarSystemNodes = find("GameManager/StarmapManager").getComponent(StarmapManager).solarSystemNodes;
  //   if (this.node.getChildByName("Starmap").children.length === 0) {
  //     solarSystemNodes.forEach((solarSystemNode: Node) => {
  //       const _solarSign = instantiate(this.solarSign);
  //       _solarSign.name = solarSystemNode.name;
  //       this.node.getChildByName("Starmap").addChild(_solarSign);
  //     });
  //   } else {
  //     solarSystemNodes.forEach((solarSystemNode: Node) => {
  //       let position = this.mainCamera.convertToUINode(
  //         solarSystemNode.getWorldPosition(),
  //         this.node
  //       );
  //       find(`Canvas/Starmap/${solarSystemNode.name}`).setPosition(position);
  //       const solarSystem = solarSystemNode.getComponent(SolarSystem);
  //       const solarSign = find(`Canvas/Starmap/${solarSystemNode.name}`).getComponent(SolarSign);

  //       // 传递3D参数到2D星图
  //       solarSign.solarSystemCode = solarSystem.solarSystemCode;
  //       solarSign.solarSystemType = solarSystem.solarSystemType;
  //       solarSign.quadrant = solarSystem.quadrant;
  //       solarSign.floor = solarSystem.floor;
  //       solarSign.is_first_target = solarSystem.is_first_target;
  //     });
  //   }
  // }

  /**************************************************UI相关方法START****************************************************/

  /*
   *@Author: yozora
   *@Description: 显示或隐藏跃迁路径
   *@Date: 2022-02-07 16:06:06
   */
  private showStarmapJumpRoad(shipDetailInfo: ShipListDetail, is_show: boolean) {
    if (this.gameManager._activeType === GameConstans.SCENCE_TYPE.STARMAP) {
      this.starmapController.changeJumpRoad(shipDetailInfo, is_show);
    }
  }

  /*
   *@Author: yozora
   *@Description: 修改跃迁路径
   *@Date: 2022-03-01 16:14:18
   */
  private changeJumpRoadTimer(shipCode: string, index: number, shipStatusInfo: ShipStatusInfo, fillRange: number, clearFlag: boolean) {
    if (this.gameManager._activeType === GameConstans.SCENCE_TYPE.STARMAP) {
      this.starmapController.jumpRoadTimer(shipCode, index, shipStatusInfo, fillRange, clearFlag);
    }
  }

  /*
   *@Author: yozora
   *@Description: Hover显示或隐藏星图场景太阳系工具栏
   *@Date: 2022-02-07 17:24:24
   */
  private showStarmapSolarSystemTooltip(target: Node, is_show: boolean) {
    if (this.gameManager && this.gameManager._activeType === GameConstans.SCENCE_TYPE.STARMAP) {
      this.starmapController.hoverSolarSystemTooltip(target, is_show);
    }
  }

  /*
   *@Author: yozora
   *@Description: Hover显示或隐藏星图场景飞船面板
   *@Date: 2022-02-07 17:26:09
   */
  private showStarmapShipBoard(shipDetailInfo: ShipListDetail, is_show: boolean, shipIndex: number) {
    this.starmapController.hoverShipBoard(this.shipDetailBoardPrefab, shipDetailInfo, is_show, shipIndex);
  }

  /*
   *@Author: yozora
   *@Description: Click显示或隐藏飞船详细面板
   *@Date: 2022-02-07 17:28:48
   */
  private showStarmapShipDetailBoard(shipDetailInfo: ShipListDetail, is_show: boolean, shipIndex: number) {
    this.starmapController.clickShipDetailBoard(this.shipDetailBoardPrefab, shipDetailInfo, is_show, shipIndex);
  }

  /*
   *@Author: yozora
   *@Description: 太阳系场景-星球焦点工具栏
   *@Date: 2021-10-29 14:11:28
   */
  private hoverSolarTooltop(solarSystemNode: Node, is_show: boolean) {
    if (this.gameManager._activeType === GameConstans.SCENCE_TYPE.SOLAR_SYSTEM) {
      this.solarSystemController.showHoverTooltip(this.solarSystemTooltipPrefab, this.mainCamera, solarSystemNode, is_show);
    }
  }

  /*
   *@Author: yozora
   *@Description: 星球场景-焦点对手飞船面板
   *@Date: 2022-02-07 15:39:57
   */
  private changePlanetShipBoardStatus(shipListDetail: ShipListDetail, is_show: boolean) {
    if (this.gameManager._activeType === GameConstans.SCENCE_TYPE.PLANET) {
      this.planetController.hoverShipBoard(this.planetPlunderBoardPrefab, shipListDetail, is_show);
    }
  }

  /*
   *@Author: yozora
   *@Description: 星球场景-点击对手飞船面板
   *@Date: 2022-02-07 15:40:20
   */
  private changePlanetShipDetailBoardStatus(shipListDetail: ShipListDetail, is_show: boolean) {
    if (this.gameManager._activeType === GameConstans.SCENCE_TYPE.PLANET) {
      this.planetController.clickShipBoard(this.planetPlunderBoardPrefab, shipListDetail, is_show);
    }
  }

  /*
   *@Author: yozora
   *@Description: 切换对话框
   *@Date: 2022-02-08 18:47:39
   */
  private showDialog(dialogType: number, tips: string, shipCode?: string) {
    this.conmonUIController.changeDialog(dialogType, tips, shipCode);
  }

  /*
   *@Author: yozora
   *@Description: 显示飞船日志
   *@Date: 2022-02-24 17:33:38
   */
  private showShipLog(shipLogInfo: ShipLogInfo[]) {
    this.conmonUIController.showLogReport(shipLogInfo, this.dialog_report);
  }

  /*
   *@Author: yozora
   *@Description: 对话框流程控制
   *@Date: 2022-02-09 18:06:58
   */
  private processUserAction(dialog: Node, button_type: number, action_type: number, ...arg) {
    this.conmonUIController.changeDialogProcess(dialog, button_type, action_type, arg);
  }

  /*
   *@Author: yozora
   *@Description: 对话框反向流程控制
   *@Date: 2022-02-15 15:09:12
   */
  private processBackUserAction(action_type: number, ...arg) {
    this.conmonUIController.backProcess(action_type, ...arg);
  }

  /**************************************************UI相关方法END****************************************************/

  /**************************************************重置相关方法START****************************************************/

  /*
   *@Author: yozora
   *@Description: 切换场景重置星图资源
   *@Date: 2022-02-04 22:40:25
   */
  private resetSceneResouce(type: number) {
    if (type === GameConstans.RESET_TYPE.ALL) {
      this.starmapController.hiddenStarmapUI();
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIPS_LIST.CHANGE_TIPS_CONTENT, GameConstans.TIPS_CONTENT.NULL);
    }
    if (type === GameConstans.RESET_TYPE.RESUME) {
      this.starmapController.showStarmapUI();
    }
    if (type === GameConstans.RESET_TYPE.SOLAR_SYSTEM.IN) {
      this.starmapController.hiddenStarmapUI();
    }
    if (type === GameConstans.RESET_TYPE.SOLAR_SYSTEM.OUT) {
      this.solarSystemController.hiddenSolarSystemUI();
    }
    // 星球采集行为
    if (type === GameConstans.RESET_TYPE.PLANET.COLLECT) {
      this.starmapController.hiddenStarmapUI();
      // 隐藏左侧面板
      this.node.getChildByName('Galaxy_statistics').active = false;
      // 切换对话框
      this.conmonUIController.changeDialog(GameConstans.DIALOG_TYPE.SELECT_LARGE, GameConstans.TIPS_CONTENT.CONFIRM_COLLECT);
    }
    // 星球占领行为
    if (type === GameConstans.RESET_TYPE.PLANET.OCCUPY) {
      this.starmapController.hiddenStarmapUI();
      // 隐藏左侧面板
      this.node.getChildByName('Galaxy_statistics').active = false;
      // 切换对话框
      this.conmonUIController.changeDialog(GameConstans.DIALOG_TYPE.SELECT_LARGE, GameConstans.TIPS_CONTENT.CONFIRM_OCCUPY);
    }
    // 星球停止采集行为
    if (type === GameConstans.RESET_TYPE.PLANET.STOP_COLLECT) {
      this.starmapController.hiddenStarmapUI();
      // 隐藏左侧面板
      this.node.getChildByName('Galaxy_statistics').active = false;
      // 切换对话框
      this.conmonUIController.changeDialog(GameConstans.DIALOG_TYPE.SELECT_LARGE, GameConstans.TIPS_CONTENT.STOP_COLLECT);
    }
    // 星球停止占领行为
    if (type === GameConstans.RESET_TYPE.PLANET.STOP_OCCUPY) {
      this.starmapController.hiddenStarmapUI();
      // 隐藏左侧面板
      this.node.getChildByName('Galaxy_statistics').active = false;
      // 切换对话框
      this.conmonUIController.changeDialog(GameConstans.DIALOG_TYPE.SELECT_LARGE, GameConstans.TIPS_CONTENT.STOP_OCCUPY);
    }
    // 星球掠夺行为
    if (type === GameConstans.RESET_TYPE.PLANET.PLUNDER) {
      this.starmapController.hiddenStarmapUI();
      // 隐藏左侧面板
      this.node.getChildByName('Galaxy_statistics').active = false;
      // 展示敌方飞船列表
      find('Canvas').getChildByName('Hanger-planet').active = true;
    }
  }

  /*
   *@Author: yozora
   *@Description: 重置场景信息
   *@Date: 2022-01-21 15:54:24
   */
  private resetScence(activeType: number) {
    // 隐藏所有太阳系面板
    if (activeType === GameConstans.SCENCE_TYPE.SOLAR_SYSTEM) {
      if (this.node.getChildByName('SolarSystem_area').children.length > 0) {
        this.node.getChildByName('SolarSystem_area').children.forEach((child) => {
          child.active = false;
        });
      }
    }
  }


  /**************************************************重置相关方法END****************************************************/


  /*****************************************状态相关方法START*********************************** */

  /*
   *@Author: yozora
   *@Description: 显示或隐藏右侧菜单
   *@Date: 2022-02-07 17:53:12
   */
  private changeHangerStatus(e: EventTouch) {
    this.starmapController.changeHangerStatus(e);
  }

  private changePlanetHangerStatus(e: EventTouch) {
    this.planetController.changeHangerStatus(e);
  }

  /*****************************************状态相关方法END*********************************** */

  /*
   *@Author: yozora
   *@Description: 加载资源
   *@Date: 2021-12-02 14:35:31
   */
  private loadResource() {

    this.canvasWidth = find('Canvas').getComponent(UITransform).width / 2;
    this.screenWidth = screen.windowSize.width / 2;

    this.canvasHeight = find('Canvas').getComponent(UITransform).height / 2;
    this.screenHeight = screen.windowSize.height / 2;

    console.log('canvasHeight: ' + this.canvasHeight);
    console.log('screenHeight: ' + this.screenHeight);

    this.conmonUIController = new ConmonUIController(this.node, this.tactics_attack_prefab, this.tactics_defend_prefab, this.tactics_speed_prefab
      , this.dialog_report_prefab
      , this.dialog_info_prefab
      , this.dialog_base_prefab
      , this.dialog_large_prefab
      , this.dialog_tactics_prefab);
    this.starmapController = new StarmapController(this.node, this.mainCamera);
    this.solarSystemController = new SolarSystemController(this.node);
    this.planetController = new PlanetController(this.node);
  }

  /**
   * 修改左边界
   */
  public changeLeftBorder() {
    const border = find('Canvas/Hanger-planet').getComponent(Widget).horizontalCenter;
    GameConstans.UI_POSITON.INIT_TARGET_BOARD_H = border + 506.5 + 20;
    GameConstans.UI_POSITON.CLICKED_TARGET_BOARD_H = border + 23.5;
    GameConstans.UI_POSITON.ATTACK_TARGET_BOARD_H = border + 212;

  }

  /**
   * 修改右边界
   */
  public changeRightBorder() {
    const border = find('Canvas/Hanger').getComponent(Widget).horizontalCenter;
    GameConstans.UI_POSITON.INIT_MY_BOARD_H = border - 506.5 - 20;
    GameConstans.UI_POSITON.CLICKED_MY_BOARD_H = border - 23.5;
    GameConstans.UI_POSITON.ATTACK_MY_BOARD_H = border - 212;

  }

}
