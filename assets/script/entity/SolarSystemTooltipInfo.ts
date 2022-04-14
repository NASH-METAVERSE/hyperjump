
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = SolarSystemCountInfo
 * DateTime = Wed Nov 17 2021 18:57:24 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = SolarSystemCountInfo.ts
 * FileBasenameNoExtension = SolarSystemCountInfo
 * URL = db://assets/script/entity/SolarSystemCountInfo.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * 太阳系弹窗信息
 */

export interface SolarSystemTooltipInfo {

    /*
     * 太阳系编码
     */
    solarSystemCode: string;

    /*
     * 太阳系占领者
     */
    solarSystemOwner: string;

    /*
     * 恒星数量
     */
    stellarCount: number;

    /*
     * 行星数量
     */
    planetaryCount: number;

    /*
     * 飞船数量
     */
    allShipCount: number;

    /*
     * 我的飞船数量
     */
    myShipCount: number;

    /*
     * 总资源
     */
    totalMineral: number;

    /*
    * 当前资源
    */
    currentMineral: number;

    /*
     * 我占领的星球
     */
    myPlanetCount: number;

    /*
     * 其他人占领的星球
     */
    otherPlanetCount: number;

    /*
     * 无人占领星球
     */
    nobodyPlanetCount: number;

    /*
    * 跃迁时间
    */
    jumpTime: number;
}
