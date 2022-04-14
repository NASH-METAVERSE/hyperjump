import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = SolarSystemPrefix
 * DateTime = Wed Oct 13 2021 13:51:38 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = SolarSystemPrefix.ts
 * FileBasenameNoExtension = SolarSystemPrefix
 * URL = db://assets/Scripts/model/SolarSystemPrefix.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * 太阳系概况
 *
 */

export interface SolarSystemPrefix {
  /*
   * 太阳系编码
   */
  solarSystemCode: string;
  /*
   * 星球数量
   */
  planetCount: string;
  /*
   * 飞船数量
   */
  shipCount: string;
  /*
   * 矿藏低于我的飞船数量
   */
  ltShipCount: string;
  /*
   * 矿藏高于我的飞船数量
   */
  mtShipCount: string;
  /*
   * 直线距离
   */
  lineardistance: string;
  /*
   * 跃迁时间
   */
  jumpTime: string;
  /*
   * 太阳系类型: 0:未解锁 1:未解锁被占领 2:已解锁无人占领 3:我的飞船 4:已解锁被别人占领 5:已解锁被自己占领
   */
  solarSystemType: string;
}
