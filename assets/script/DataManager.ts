
import { _decorator, Component, Node, TTFFont, Color } from 'cc';
import { UserData } from './utils/UserData';
import { UserProfile } from './entity/UserProfile';
import { ClientEvent } from './utils/ClientEvent';
import { GameConstans } from './entity/GameConstans';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = DataManager
 * DateTime = Sun Dec 12 2021 22:52:37 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = DataManager.ts
 * FileBasenameNoExtension = DataManager
 * URL = db://assets/script/DataManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * 运行数据管理器
 */

@ccclass('DataManager')
export class DataManager extends Component {

    /*
    * 字体
    */
    @property({ type: TTFFont })
    public font: TTFFont = null;

    /*
    * 我的区域颜色
    */
    public my_color: Color = new Color(255, 255, 255, 128);

    /*
     * 别人区域颜色
     */
    public ohter_color: Color = new Color(255, 0, 208, 64);

    /*
     * 无人区域颜色
     */
    public nobody_color: Color = new Color(255, 255, 255, 0);

    /*
     * 当前选中飞船编码
     */
    private currentShipCode: string = null;

    /*
     * 当前选中敌方飞船编码
     */
    private currentTargetShipCode: string = null;

    /*
     * 当前选中太阳系编码
     */
    private currentSolarSystemCode: string = null;

    /*
     * 当前选中星球编码
     */
    private currentPlanetCode: string = null;

    private userData: UserData = new UserData();

    start() {
        ClientEvent.on(GameConstans.CLIENTEVENT_DATA_LIST.RUNTIME_DATA, this.updateRuntimeData, this);
    }

    private updateRuntimeData(dataType: number, data: string) {
        if (dataType === 0) {
            this.currentShipCode = data;
        }
        else if (dataType === 1) {
            this.currentTargetShipCode = data;
        }
        else if (dataType === 2) {
            this.currentSolarSystemCode = data;
        }
        else if (dataType === 3) {
            this.currentPlanetCode = data;
        }
    }

    public setUserAddress(address: string) {
        this.userData.address = address;
    }

    public getUserAddress() {
        return this.userData.address;
    }

    /*
    *@Author: yozora
    *@Description: 获取用户数据
    *@Date: 2021-12-15 17:10:32
    */
    public getUserData() {
        return this.userData;
    }

    /*
     *@Author: yozora
     *@Description: 设置用户数据
     *@Date: 2021-12-15 17:10:25
     */
    public setUserProfile(userProfile: UserProfile) {
        this.userData.userProfile = userProfile;
    }

    /*
     *@Author: yozora
     *@Description: 获取飞船编码
     *@Date: 2022-02-16 14:08:22
     */
    public getShipCode() {
        return this.currentShipCode;
    }

    /*
     *@Author: yozora
     *@Description: 获取对手飞船编码
     *@Date: 2022-02-16 14:08:32
     */
    public getTargetShipCode() {
        return this.currentTargetShipCode;
    }

    /*
     *@Author: yozora
     *@Description: 获取太阳系编码
     *@Date: 2022-02-16 14:08:42
     */
    public getSolarSystemCode() {
        return this.currentSolarSystemCode;
    }

    /*
     *@Author: yozora
     *@Description: 获取星球编码
     *@Date: 2022-02-16 14:08:47
     */
    public getPlanetCode() {
        return this.currentPlanetCode;
    }

}
