import { _decorator, Component, Node, Enum } from "cc";
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ShipTypeEnum
 * DateTime = Fri Oct 15 2021 10:51:05 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = ShipTypeEnum.ts
 * FileBasenameNoExtension = ShipTypeEnum
 * URL = db://assets/Scripts/model/enums/ShipTypeEnum.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * 飞船类型枚举
 */

export enum ShipTypeEnum {
  MY_SHIP = 0,
  LT_SHIP = 1,
  MT_SHIP = 2,
}
