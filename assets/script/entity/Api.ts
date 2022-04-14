import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Api
 * DateTime = Mon Sep 27 2021 10:57:20 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = Api.ts
 * FileBasenameNoExtension = Api
 * URL = db://assets/Scripts/Api.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass("Api")
export class Api {
  /*
   * 短信验证码
   */
  public sendCode = "/loginCode";
  /*
   * 登录
   */
  public login = "/login";

  /*
   * 钱包登录
   */
  public loginFromWallet = "/loginFromWallet";

  /*
   * 绑定钱包
   */
  public bindWallet = "/bindWallet";
  /*
   * 用户退出
   */
  public logout = "/userLogOut";
  /*
   * 当前游戏信息
   */
  public gameInfo = "/gameInfo/";
  /*
   * 当前服务器状态
   */
  public serverInfo = "/serverInfo";

  /*
   * 用户游戏统计信息
   */
  public userProfile = "/userProfile";

  /*
  * 获取倒计时
 */
  public getTimer = "/getTimer";

  /*
   * 同步倒计时
   */
  public asyncTimer = "/asyncTimer";

  /********************************************星图相关*****************************************/
  /*
   * 初始化星图
   */
  public initStarmap = "/initStarmap/1";
  /*
   * 获取与我相关星图信息
   */
  public getStarmapInfoAboutMe = "/getStarmapInfoAboutMe";
  /*
  * 获取其它星图信息
  */
  public getStarmapInfoOther = "/getStarmapInfoOther";
  /*
   * 获取太阳系星球信息(0全量 1存在资源星球)
   */
  public getSolarSystemPlanetList = "/getSolarSystemPlanetList";

  /*
   * 获取星球矿产信息
   */
  public queryPlanetMine = "/queryPlanetMine";

  /********************************************采集相关*****************************************/

  /*
   * 获取星球矿产
   */
  public getPlanetMine = "/getPlanetMine";

  /*
   *确认开采
   */
  public confirmMine = "/confirmMine";

  /*
   * 中断开采
   */
  public interruptMine = "/interruptMine";

  /********************************************占领相关*****************************************/

  /*
  *确认占领
 */
  public confirmOccupy = "/confirmOccupy";

  /*
   * 中断占领
   */
  public interruptOccupy = "/interruptOccupy";

  /********************************************战斗相关*****************************************/

  /*
 * 锁定飞船
 */
  public confirmLockShip = "/confirmLockShip";
  /*
   * 确认攻击
   */
  public confirmAttack = "/confirmAttack";

  /********************************************跃迁相关*****************************************/

  /*
   * 获取跃迁信息
   */
  public getJumpInfo = "/getJumpInfo";

  /*
   * 进入跃迁
   */
  public confirmJump = "/confirmJump";

  /*
   * 进入飞行
   */
  public confirmFlight = "/confirmFlight";


  /********************************************飞船相关*****************************************/
  /*
   * 获取已激活飞船状态
   */
  public getActivatedShipStatus = "/getActivatedShipStatus";
  /*
   * 获取未激活飞船
   */
  public getInactiveShips = "/getInactiveShips";
  /*
   * 获取激活飞船
   */
  public getActivatedShips = "/getActivatedShips";
  /*
  * 获取飞船列表
  */
  public getMyShips = "/getMyShips";

  /*
   * 根据飞船编码获取飞船信息
   */
  public getMyShipByCode = "/getMyShipByCode";

  /*
   * 获取太阳系星球和飞船概况
   */
  public getSolarSystemShipAndPlanet = "/getSolarSystemShipAndPlanet";
  /*
   * 获取太阳系飞船信息
   */
  public getSolarSystemShipList = "/getSolarSystemShipList";
  /*
   * 获取星球弹窗信息
   */
  public getPlanetTooltipInfo = "/getPlanetTooltipInfo";
  /*
  * 获取太阳系弹窗信息
  */
  public getSolarSystemTooltipInfo = "/getSolarSystemTooltipInfo";
  /*
   * 获取星球对手飞船信息
   */
  public getPlanetTargetShipList = "/getPlanetTargetShipList";
  /*
   * 获取星球飞船信息
   */
  public getPlanetShipList = "/getPlanetShipList";
  /*
   * 激活飞船
   */
  public activeShip = "/activeShip";

  /*
   * 确认飞船状态
   */
  public confirmShipStatus = "/confirmShipStatus";
  /*
   * 获取跃迁时间
   */
  public calculateJumpTime = "/calculateJumpTime";

  static API: Api = null;

  public static getInstance() {
    if (this.API === null) {
      this.API = new Api();
    }
    return this.API;
  }
}
