import { _decorator, Component, EventMouse, input, Input, Vec3, Node } from "cc";
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = SolarSystemManager
 * DateTime = Fri Oct 22 2021 16:10:52 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = SolarSystemManager.ts
 * FileBasenameNoExtension = SolarSystemManager
 * URL = db://assets/scripts/SolarSystemManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * 太阳系场景-太阳系管理
 */

@ccclass("SolarSystem")
export class SolarSystem extends Component {


  /*
   * 象限
   */
  public quadrant: number = -1;

  /*
   * 圈层
   */
  public floor: number = -1;

  /*
   * 太阳系类型
   */
  public solarSystemType: string = "-1";

  /*
   * 太阳系编码
   */
  public solarSystemCode: string = "-1";

  /*
   * 是否存在最高积分飞船
   */
  public is_first_target: boolean = false;



}
