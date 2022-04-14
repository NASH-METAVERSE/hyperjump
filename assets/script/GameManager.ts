import {
  _decorator,
  Component,
  Node,
  Vec3,
  Prefab,
  instantiate,
  Camera,
  Quat,
  EditBox,
  find,
  resources,
  tween,
} from "cc";
import { DataManager } from "./DataManager";
import { GameConstans } from "./entity/GameConstans";
import { RotateAround } from "./function/RotateAround";
import { ThirdFreeLookCamera } from "./function/ThirdFreeLookCamera";
import { PlanetManager } from "./PlanetManager";
import { SolarSystemManager } from "./SolarSystemManager";
import { TimerManager } from "./ui/common/TimerManager";
import { UserOperateManager } from "./UserOperateManager";
import { ClientEvent } from "./utils/ClientEvent";
import { HttpRequest } from "./utils/HttpRequest";
import { WebSock } from "./utils/WebSock";
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = GameManager
 * DateTime = Fri Oct 22 2021 16:10:38 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = GameManager.ts
 * FileBasenameNoExtension = GameManager
 * URL = db://assets/scripts/GameManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * 游戏主控制
 */

@ccclass("GameManager")
export class GameManager extends Component {

  /*
   * 星图场景
   */
  @property({ type: Prefab })
  private starmapScence: Prefab = null;
  /*
   * 太阳系场景
   */
  @property({ type: Prefab })
  private solarSystemScence: Prefab = null;

  /*
   * 星球场景
   */
  @property({ type: Prefab })
  private planetScence: Prefab = null;

  /*
  * 恒星资源
  */
  @property({ type: Prefab })
  private stellarPrefab: Prefab = null;

  /*
   * 行星资源
   */
  @property({ type: Prefab })
  private planetaryPrefab: Prefab = null;

  @property({
    type: Camera,
    tooltip: "摄像机",
  })
  private camera: Camera = null;

  /*
   * 星图场景
   */
  private _starmapNode: Node = null;

  /*
   * 太阳系节点
   */
  private _solarSystemNode: Node = null;

  /*
   * 星球场景
   */
  private _planetNode: Node = null;

  /*
   * 当前激活场景(0--星图 1--太阳系 2--星球)
   */
  public _activeType: number = 0;

  /*
  * 最近激活场景(0--星图 1--太阳系 2--星球)
  */
  public _lastActiveType: number = 0;

  /*
   * webSocket
   */
  private socket = new WebSock();

  /*
   * 当前位置
   */
  private _curPos = new Vec3();

  onLoad() {
    this.initScene();
    this.connectServer();
    ClientEvent.on(
      GameConstans.CLIENTEVENT_SCENCE_LIST.CHANGE_STARMAP,
      this.changeStarmapScence,
      this
    );
    ClientEvent.on(
      GameConstans.CLIENTEVENT_SCENCE_LIST.CHANG_SOLAR_SYSTEM,
      this.changeSolarSystemScence,
      this
    );
    ClientEvent.on(
      GameConstans.CLIENTEVENT_SCENCE_LIST.CHANG_PLANET,
      this.changePlanetScence,
      this
    );
    ClientEvent.on(
      GameConstans.CLIENTEVENT_SCENCE_LIST.CHANGE_LAST_SCENE,
      this.changeLastScence,
      this
    );
    ClientEvent.on(
      GameConstans.CLIENTEVENT_SCENCE_LIST.CHANGE_BACK_SCENE,
      this.changeBackScence,
      this
    );
    ClientEvent.on(
      GameConstans.CLIENTEVENT_SCENCE_LIST.OPERATE_CHANGE_PLANET,
      this.plunderChangePlanet,
      this
    );
  }

  /*
   *@Author: yozora
   *@Description: 初始化星图场景
   *@Date: 2021-11-02 14:35:41
   */
  private initScene() {

    
    this.initStarmap();
    this.initSolarSystem();
  }

  /*
   *@Author: yozora
   *@Description: 初始化星图场景
   *@Date: 2022-02-19 23:06:39
   */
  private initStarmap() {
    // 初始化星图场景
    this._activeType = GameConstans.SCENCE_TYPE.STARMAP;
    this._starmapNode = instantiate(this.starmapScence);
    this.node.addChild(this._starmapNode);
  }

  /*
   *@Author: yozora
   *@Description: 初始化太阳系场景
   *@Date: 2022-02-19 23:06:56
   */
  private initSolarSystem() {
    // 初始化太阳系场景
    this._solarSystemNode = instantiate(this.solarSystemScence);
    this.node.addChild(this._solarSystemNode);
    this._solarSystemNode.active = false;
    let planetMaxIndex = 15;
    for (let index = 0; index < planetMaxIndex; index++) {
      // 创建星球
      const planetNode = instantiate(this.planetaryPrefab);
      planetNode.name = `Planetary_${index + 1}`;
      // 设置星球位置
      planetNode.setPosition((index + 1) * 5, 0, 0);
      planetNode.getComponent(RotateAround).radius = (index + 1) * 5;
      planetNode.getComponent(RotateAround).target = this._solarSystemNode.getChildByName('Stellar');
      // 添加到场景
      this._solarSystemNode.getChildByName("Planet").addChild(planetNode);
    }
    const stellar = instantiate(this.stellarPrefab);
    this._solarSystemNode.getChildByName("Stellar").addChild(stellar);
  }

  /*
   *@Author: yozora
   *@Description: 修改关注对象位置
   *@Date: 2021-10-20 15:52:30
   */
  public setVisualAngle(rot: Quat, depth: number) {
    const offset = new Vec3(0, 0, 1);
    Vec3.transformQuat(offset, offset, rot);
    Vec3.normalize(offset, offset);
    Vec3.multiplyScalar(offset, offset, depth);
    Vec3.add(this._curPos, this.node.worldPosition, offset);
    this.camera.node.setWorldPosition(this._curPos);
    const up = new Vec3(0, 1, 0);
    Vec3.transformQuat(up, up, rot);
    Vec3.normalize(up, up);
    this.camera.node.lookAt(this.node.worldPosition, up);
  }

  /*
   *@Author: yozora
   *@Description: 切换星图场景
   *@Date: 2022-01-18 16:42:36
   */
  private changeStarmapScence(activeType: number) {
    this.lastScence();
    // 切换场景
    if (activeType === GameConstans.SCENCE_TYPE.SOLAR_SYSTEM) {
      this._solarSystemNode.active = false;
    }
    if (activeType === GameConstans.SCENCE_TYPE.PLANET) {
      // 隐藏对手面板
      ClientEvent.dispatchEvent(
        GameConstans.CLIENTEVENT_LIST.PLANET.CLICK_SHIP_BOARD,
        null,
        false);
      this._planetNode.active = false;
    }
    this._activeType = GameConstans.SCENCE_TYPE.STARMAP;
    // 切换UI状态
    ClientEvent.dispatchEvent(
      GameConstans.CLIENTEVENT_LIST.RESET_STARMAP, GameConstans.RESET_TYPE.RESUME);
    // 切换侧边栏信息
    ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.MOVE_LEFT_BAR_CONTENT);
    this._starmapNode.active = true;
    this.camera.node.getComponent(ThirdFreeLookCamera)._activeType = GameConstans.SCENCE_TYPE.STARMAP;
    ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.CHANGE_STARMAP_CAMERA, GameConstans.CAMERA_POSITION.STARMAP_POSITION.UNLOCK);
  }

  /*
   *@Author: yozora
   *@Description: 切换太阳系场景
   *@Date: 2021-12-30 15:27:15
   */
  private async changeSolarSystemScence(solarSystemCode: string) {
    this.lastScence();
    // 用户行为判断
    if (find('Canvas').getComponent(UserOperateManager).userOperateType === GameConstans.RESET_TYPE.PLANET.JUMP) {
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.CHANGE_SHIP_BOARD_BUTTON, solarSystemCode, true);
    }
    if (find('Canvas').getComponent(UserOperateManager).userOperateType === GameConstans.RESET_TYPE.NULL) {
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.CHANGE_SHIP_BOARD_BUTTON, solarSystemCode, false, GameConstans.RESET_TYPE.NULL);
    }
    // 切换场景
    if (!this._solarSystemNode) {
      this._solarSystemNode = instantiate(this.solarSystemScence);
      await this._solarSystemNode.getComponent(SolarSystemManager).initSolarSystemInfo(solarSystemCode);
      this.node.addChild(this._solarSystemNode);
      this._solarSystemNode.active = false;
    } else {
      await this._solarSystemNode.getComponent(SolarSystemManager).initSolarSystemInfo(solarSystemCode);
    }

    this._starmapNode.active = false;
    this._activeType = GameConstans.SCENCE_TYPE.SOLAR_SYSTEM;
    this.camera.node.getComponent(ThirdFreeLookCamera)._activeType = GameConstans.SCENCE_TYPE.SOLAR_SYSTEM;
    // 切换侧边栏信息
    ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.MOVE_LEFT_BAR_CONTENT);
    this._solarSystemNode.active = true;
    ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.RESET_STARMAP, GameConstans.RESET_TYPE.SOLAR_SYSTEM.IN);
    ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.CHANGE_STARMAP_CAMERA, GameConstans.CAMERA_POSITION.SOLAR_SYSTEM_POSITION.MAX);

    // 触发进度条
    // let callback = () => {

    // }
    // ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.PROCESS_BAR_ACTION, callback, solarSystemCode);

  }

  /*
   *@Author: yozora
   *@Description: 切换星球场景
   *@Date: 2021-10-26 16:45:25
   */
  private changePlanetScence(planet: Node) {
    this.lastScence();
    // 切换场景
    this._solarSystemNode.active = false;
    if (!this._planetNode) {
      this._planetNode = instantiate(this.planetScence);
      this.node.addChild(this._planetNode);
      this._planetNode.getComponent(PlanetManager).initPlanetInfo(planet);
    } else {
      this._planetNode.active = true;
      this._planetNode.getComponent(PlanetManager).initPlanetInfo(planet);
    }
    this._activeType = GameConstans.SCENCE_TYPE.PLANET;
    this.camera.node.getComponent(ThirdFreeLookCamera)._activeType = GameConstans.SCENCE_TYPE.PLANET;
    // 切换侧边栏信息
    ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.MOVE_LEFT_BAR_CONTENT);
    ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.CHANGE_STARMAP_CAMERA, GameConstans.CAMERA_POSITION.PLANET_POSITION.MAX);
    ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.RESET_STARMAP, GameConstans.RESET_TYPE.SOLAR_SYSTEM.OUT);
    // 用户行为判断
    if (find('Canvas').getComponent(UserOperateManager).userOperateType === GameConstans.RESET_TYPE.PLANET.JUMP) {
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.BUTTON_ACTION, null, GameConstans.DIALOG_TYPE.ACTION.YES, GameConstans.DIALOG_TYPE.ACTION.JUMP_2);
    }
    if (find('Canvas').getComponent(UserOperateManager).userOperateType === GameConstans.RESET_TYPE.PLANET.FLIGHT) {
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.BUTTON_ACTION, null, GameConstans.DIALOG_TYPE.ACTION.YES, GameConstans.DIALOG_TYPE.ACTION.FLIGHT_2);
    }
  }

  /*
   *@Author: yozora
   *@Description: UI控制回到上一个场景
   *@Date: 2022-02-11 15:38:56
   */
  private changeLastScence() {
    console.log('changeLastScence:', this._lastActiveType);
    if (this._starmapNode && this._starmapNode.active) {
      this._starmapNode.active = false;
    }
    if (this._solarSystemNode && this._solarSystemNode.active) {
      this._solarSystemNode.active = false;
    }
    if (this._planetNode && this._planetNode.active) {
      // 隐藏对手面板
      ClientEvent.dispatchEvent(
        GameConstans.CLIENTEVENT_LIST.PLANET.CLICK_SHIP_BOARD,
        null,
        false);
      this._planetNode.active = false;
    }

    // 切换场景
    if (this._lastActiveType === GameConstans.SCENCE_TYPE.STARMAP) {
      ClientEvent.dispatchEvent(
        GameConstans.CLIENTEVENT_LIST.RESET_STARMAP, GameConstans.RESET_TYPE.RESUME);
      this._activeType = GameConstans.SCENCE_TYPE.STARMAP;
      this.camera.node.getComponent(ThirdFreeLookCamera)._activeType = GameConstans.SCENCE_TYPE.STARMAP;
      // 切换侧边栏信息
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.MOVE_LEFT_BAR_CONTENT);
      this._starmapNode.active = true;
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.CHANGE_STARMAP_CAMERA, GameConstans.CAMERA_POSITION.STARMAP_POSITION.UNLOCK);
    }
    if (this._lastActiveType === GameConstans.SCENCE_TYPE.SOLAR_SYSTEM) {
      this._activeType = GameConstans.SCENCE_TYPE.SOLAR_SYSTEM;
      this.camera.node.getComponent(ThirdFreeLookCamera)._activeType = GameConstans.SCENCE_TYPE.SOLAR_SYSTEM;
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.RESET_STARMAP, GameConstans.RESET_TYPE.SOLAR_SYSTEM.IN);
      // 切换侧边栏信息
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.MOVE_LEFT_BAR_CONTENT);
      this._solarSystemNode.active = true;
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.CHANGE_STARMAP_CAMERA, GameConstans.CAMERA_POSITION.SOLAR_SYSTEM_POSITION.MAX);
    }
    if (this._lastActiveType === GameConstans.SCENCE_TYPE.PLANET) {
      this._activeType = GameConstans.SCENCE_TYPE.PLANET;
      this.camera.node.getComponent(ThirdFreeLookCamera)._activeType = GameConstans.SCENCE_TYPE.PLANET;
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.RESET_STARMAP, GameConstans.RESET_TYPE.SOLAR_SYSTEM.OUT);
      // 切换侧边栏信息
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.MOVE_LEFT_BAR_CONTENT);
      this._planetNode.active = true;
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.CHANGE_STARMAP_CAMERA, GameConstans.CAMERA_POSITION.PLANET_POSITION.MAX);
    }
    this._lastActiveType = 0;
  }

  /*
   *@Author: yozora
   *@Description: 回到上一个场景
   *@Date: 2022-02-15 16:41:36
   */
  private changeBackScence(sceneFlag?: number) {
    if (this._activeType === GameConstans.SCENCE_TYPE.STARMAP) {
      this.lastScence();
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.CANCEL_PROCESS, true);
      return;
    }
    if (this._activeType === GameConstans.SCENCE_TYPE.SOLAR_SYSTEM) {
      // 停止返回
      if (sceneFlag !== undefined && sceneFlag === GameConstans.SCENCE_TYPE.SOLAR_SYSTEM) {
        this.lastScence();
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.CANCEL_PROCESS, true);
        return;
      }
      this.lastScence();
      this._activeType = GameConstans.SCENCE_TYPE.STARMAP;
      this.camera.node.getComponent(ThirdFreeLookCamera)._activeType = GameConstans.SCENCE_TYPE.STARMAP;
      this._solarSystemNode.active = false;
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.RESET_STARMAP, GameConstans.RESET_TYPE.RESUME);
      // 切换侧边栏信息
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.MOVE_LEFT_BAR_CONTENT);
      this._starmapNode.active = true;
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.CHANGE_STARMAP_CAMERA, GameConstans.CAMERA_POSITION.STARMAP_POSITION.UNLOCK);
      // 飞行状态重置为跃迁状态
      if (find('Canvas').getComponent(UserOperateManager).userOperateType !== GameConstans.RESET_TYPE.NULL) {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.CHANGE_USER_OPERATION, find('Canvas').getComponent(UserOperateManager).userOperateType, GameConstans.RESET_TYPE.PLANET.JUMP, false);
      }
    }
    if (this._activeType === GameConstans.SCENCE_TYPE.PLANET) {
      this.lastScence();
      this._planetNode.active = false;
      this._activeType = GameConstans.SCENCE_TYPE.SOLAR_SYSTEM;
      this.camera.node.getComponent(ThirdFreeLookCamera)._activeType = GameConstans.SCENCE_TYPE.SOLAR_SYSTEM;
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.RESET_STARMAP, GameConstans.RESET_TYPE.SOLAR_SYSTEM.IN);
      // 切换侧边栏信息
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.MOVE_LEFT_BAR_CONTENT);
      this._solarSystemNode.active = true;
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.CHANGE_STARMAP_CAMERA, GameConstans.CAMERA_POSITION.SOLAR_SYSTEM_POSITION.MAX);

    }
  }

  /*
   *@Author: yozora
   *@Description: 操作-切换到星球场景
   *@Date: 2022-02-07 00:39:18
   */
  private plunderChangePlanet(planetCode: string) {
    this.lastScence();
    // 相同位置不跳转
    if (this._activeType === GameConstans.SCENCE_TYPE.PLANET && planetCode === this._planetNode.getComponent(PlanetManager)._lastSelectPlanet) {
      return;
    }
    // 关闭当前场景
    if (this._activeType === GameConstans.SCENCE_TYPE.STARMAP) {
      this._starmapNode.active = false;
    }
    if (this._activeType === GameConstans.SCENCE_TYPE.SOLAR_SYSTEM) {
      this._solarSystemNode.active = false;
    }

    // 切换到星球场景
    if (!this._planetNode) {
      this._planetNode = instantiate(this.planetScence);
      this.node.addChild(this._planetNode);
      this._planetNode.getComponent(PlanetManager).directInitPlanetInfo(planetCode);
    } else {
      this._planetNode.active = true;
      this._planetNode.getComponent(PlanetManager).directInitPlanetInfo(planetCode);
    }
    // 镜头控制
    ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.CHANGE_STARMAP_CAMERA, GameConstans.CAMERA_POSITION.PLANET_POSITION.MAX);
    this._activeType = GameConstans.SCENCE_TYPE.PLANET;
    this.camera.node.getComponent(ThirdFreeLookCamera)._activeType = GameConstans.SCENCE_TYPE.PLANET;
  }

  /*
   *@Author: yozora
   *@Description: 记录最近场景
   *@Date: 2022-02-11 15:30:48
   */
  private lastScence() {
    this._lastActiveType = Number(this._activeType);
  }

  /*
   *@Author: yozora
   *@Description: 连接服务器
   *@Date: 2021-12-12 22:46:25
   */
  private connectServer() {
    // TODO: 连接账号
    this.socket.connect({ url: HttpRequest.getChannel(), userAddress: find('DataManager').getComponent(DataManager).getUserAddress() });
    // 接收消息
    this.socket.onMessage = msg => {
      console.log('New message: ', msg.toString());
      // 消息解析
      if (msg.toString().startsWith("refresh:")) {
        const statusType = msg.toString().split(":")[2];
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIME_LIST.REFRESH_SHIP_STATUS, msg.toString().split(":")[1], true, null, msg.toString().split(":")[2]);
        if (statusType === GameConstans.SHIP_STATUS.LOG_OUT) {
          // this.socket.close();
          resources.load('prefab/ui/dialog/Dialog_system', Prefab, (err, asset) => {
            const dialog = instantiate(asset);
            find('Canvas').getChildByName('Dialog_area').addChild(dialog);
            tween(dialog).to(0.08, { scale: new Vec3(1, 0.1, 1) }).to(0.42, { scale: new Vec3(1, 1, 1) }).start();
          });
        }
        if (statusType === GameConstans.SHIP_STATUS.SHIP_MINING) {
          // 通知飞船卡片
          ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.STOP_SHIP_COLLECT, find('TimerManager').getComponent(TimerManager).getShipTimer(msg.toString().split(":")[1], -1));
        }
      }
    }
    this.socket.onError = msg => {
      console.log('Error: ', msg.toString());
    }
  }

  /*
   *@Author: yozora
   *@Description: 向后端发送消息
   *@Date: 2021-12-07 17:32:44
   */
  private sendMessage(e: EditBox) {
    this.socket.send(e.string);
  }

}
