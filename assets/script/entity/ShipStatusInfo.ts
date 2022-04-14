
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ShipStatusInfo
 * DateTime = Mon Nov 22 2021 16:37:35 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = ShipStatusInfo.ts
 * FileBasenameNoExtension = ShipStatusInfo
 * URL = db://assets/script/entity/ShipStatusInfo.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * 飞船状态信息
 */

export interface ShipStatusInfo {

    /*
     * 飞船状态节点
     */
    statusNode: Node;

    /**
   * 飞船状态
   */
    shipStatus: string;

    /*
     * 预计时间
     */
    evaluateTime: number;

    /*
     * 当前时间
     */
    currentTime: number;

    /**
     * 状态进度(五等分)
     */
    statusRate: number;
}

