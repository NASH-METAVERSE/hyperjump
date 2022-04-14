import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ShipInfo
 * DateTime = Tue Oct 12 2021 15:33:21 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = ShipInfo.ts
 * FileBasenameNoExtension = ShipInfo
 * URL = db://assets/Scripts/model/ShipInfo.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

export interface ShipInfo {
  shipCount: number;
  shipCode: string;
  shipName: string;
  mineral: number;
  solarSystemCode: string;
  planetCode: string;
  shipStatus: string;
  shipType: string;
}
