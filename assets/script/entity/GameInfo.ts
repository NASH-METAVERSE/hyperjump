import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = GameInfo
 * DateTime = Wed Oct 13 2021 10:53:31 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = GameInfo.ts
 * FileBasenameNoExtension = GameInfo
 * URL = db://assets/Scripts/model/GameInfo.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

export interface GameInfo {
  totalMineral: number;
  remainedMineral: number;
  nobodySolarSystemCount: number;
  solarSystemCount: number;
  noResourceSolarSystemCount: number;
  planetCount: number;
  noResourcePlanetCount: number;
  myAreaCount: number;
  otherAreaCount: number;
  activeCount: number;
}
