
import { _decorator, Component, Node } from 'cc';
import { ShipLogInfo } from './ShipLogInfo';
import { ShipStatusInfo } from './ShipStatusInfo';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ShipListDetail
 * DateTime = Mon Nov 22 2021 16:35:37 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = ShipListDetail.ts
 * FileBasenameNoExtension = ShipListDetail
 * URL = db://assets/script/entity/ShipListDetail.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * 飞船列表详细信息
 */

export interface ShipListDetail {

    /*
   * 飞船编码
   */
    shipCode: string;

    /*
     * 飞船名称
     */
    shipName: string;

    /*
     * 飞船等级
     */
    shipLevel: string;

    /*
     * 飞船积分
     */
    mineral: string;

    /*
     * 飞船所在太阳系
     */
    solarSystemCode: string;

    /*
     * 飞船所在星球
     */
    planetCode: string;

    /*
     * 飞船火力
     */
    power: string;

    /*
     * 飞船生命值
     */
    strength: string;

    /*
     * 飞船攻击力
     */
    firePower: string;

    /*
     * 飞船雷达范围
     */
    radarRange: string;

    /*
     * 飞船冷却速度
     */
    coldSpeed: string;

    /*
     * 移动速度
     */
    moveSpeed: string;

    /*
     * 飞船状态信息
     */
    shipStatusInfoList: ShipStatusInfo[];

    /*
     * 飞船日志信息
     */
    shipLogInfoList: ShipLogInfo[];

}

