
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = PlanetTooltipInfo
 * DateTime = Wed Nov 17 2021 18:57:24 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = SolarSystemCountInfo.ts
 * FileBasenameNoExtension = SolarSystemCountInfo
 * URL = db://assets/script/entity/SolarSystemCountInfo.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * 太阳系弹窗信息
 */

export interface PlanetTooltipInfo {

    /*
     * 星球编码
     */
    planetCode: string;

    /*
     * 当前矿产
     */
    currentMineral: number;

    /*
    * 星球占领者
    */
    planetOwner: string;

    /*
     * 飞船数量
     */
    allShipCount: number;

    /*
     * 我的飞船数量
     */
    myShipCount: number;

    /*
    * 跃迁时间
    */
    jumpTime: number;

    /*
     * 占领时间
     */
    occupyTime: number;
}
