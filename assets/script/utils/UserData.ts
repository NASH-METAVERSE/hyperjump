
import { _decorator, Component, Node } from 'cc';
import { ShipStatusInfo } from '../entity/ShipStatusInfo';
import { UserProfile } from '../entity/UserProfile';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = UserData
 * DateTime = Wed Dec 15 2021 17:00:43 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = UserData.ts
 * FileBasenameNoExtension = UserData
 * URL = db://assets/script/entity/data/UserData.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('UserData')
export class UserData extends Component {

    /*
     * 用户合约地址
     */
    public address: string = '';

    /*
    * 玩家信息
    */
    public userProfile: UserProfile = null;

    /*
     * 飞船状态信息
     */
    public shipTimerInfo: Map<string, ShipStatusInfo> = new Map<string, ShipStatusInfo>();


}
