
import { _decorator, Component, Node, EventMouse } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = SolarSign
 * DateTime = Sun Jan 16 2022 17:40:10 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = SolarSign.ts
 * FileBasenameNoExtension = SolarSign
 * URL = db://assets/script/ui/model/SolarSign.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('SolarSign')
export class SolarSign extends Component {

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

