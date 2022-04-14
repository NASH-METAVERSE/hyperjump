import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = PlanetInfo
 * DateTime = Tue Oct 12 2021 15:42:16 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = PlanetInfo.ts
 * FileBasenameNoExtension = PlanetInfo
 * URL = db://assets/Scripts/model/PlanetInfo.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

export interface PlanetInfo {
  solarSystemCode: string;
  planetCode: string;
  isMinable: number;
  havingShipCode: Boolean;
  x: number;
  y: number;
}
