
import { _decorator, Component, Node, Label, find } from 'cc';
import { DataManager } from '../../DataManager';
import { GameConstans } from '../../entity/GameConstans';
import { PlanetTooltipInfo } from '../../entity/PlanetTooltipInfo';
import { ClientEvent } from '../../utils/ClientEvent';
import { HttpRequest } from '../../utils/HttpRequest';
import { lodash } from '../../utils/lodash';
import { ShipBoardLarge } from './ShipBoardLarge';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = PlanetTooltip
 * DateTime = Mon Feb 28 2022 00:47:48 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = PlanetTooltip.ts
 * FileBasenameNoExtension = PlanetTooltip
 * URL = db://assets/script/ui/model/PlanetTooltip.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('PlanetTooltip')
export class PlanetTooltip extends Component {

    /*
     * 星球编码
     */
    private planetId: Label = null;

    /*
     * 星球占领者
     */
    private planetOwner: Label = null;

    /*
     * 星球矿产 
     */
    private planetMineral: Label = null;

    /*
     * 我的飞船
     */
    private grayShip: Label = null;

    /*
     * 敌方飞船
     */
    private purpleShip: Label = null;

    /*
     * 跃迁时间
     */
    private jump_time: Label = null;

    /*
     * 占领时间
     */
    private occupy_time: Label = null;

    /*
     * 星球弹窗信息
     */
    private planetTooltipInfo: PlanetTooltipInfo = null;

    /*
    * 当前选中星球
    */
    private currentPlanetCode: string = null;


    start() {
        if (!this.planetId) {
            this.planetId = this.node.getChildByName("Planet_name_label").getComponent(Label);
        }
        if (!this.planetOwner) {
            this.planetOwner = this.node.getChildByName("Owner_name_label").getComponent(Label);
        }
        if (!this.planetMineral) {
            this.planetMineral = this.node.getChildByName("Mineral_label").getComponent(Label);
        }
        if (!this.purpleShip) {
            this.purpleShip = this.node.getChildByName("Ohther_ship_label").getComponent(Label);
        }
        if (!this.grayShip) {
            this.grayShip = this.node.getChildByName("My_ship_label").getComponent(Label);
        }
        if (!this.jump_time) {
            this.jump_time = this.node.getChildByName("Jump_time_label").getComponent(Label);
        }
        if (!this.occupy_time) {
            this.occupy_time = this.node.getChildByName("Occupy_time_label").getComponent(Label);
        }
    }

    /*
     *@Author: yozora
     *@Description: 获取星球弹窗信息
     *@Date: 2022-02-28 01:04:31
     */
    public changePlanetTooltipInfo(_planetCode: string) {
        if (this.currentPlanetCode === _planetCode) {
            return;
        } else {
            this.currentPlanetCode = _planetCode;
        }
        // 如果当前有激活飞船面板，则显示预计跃迁时间
        const shipCode = this.processShipCode();
        HttpRequest.getPlanetTooltipInfo(_planetCode, shipCode, find('DataManager').getComponent(DataManager).getUserAddress()).then(res => {
            if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                this.planetTooltipInfo = res.data;
                this.planetId.string = _planetCode === null ? "UNKNOWN" : _planetCode;
                this.planetOwner.string = this.planetTooltipInfo.planetOwner === null ? "NONE" : this.planetTooltipInfo.planetOwner;
                this.planetMineral.string = this.planetTooltipInfo.currentMineral.toString();
                this.purpleShip.string = (this.planetTooltipInfo.allShipCount - this.planetTooltipInfo.myShipCount).toString();
                this.grayShip.string = this.planetTooltipInfo.myShipCount.toString();
                // 计算跃迁时间
                if (this.planetTooltipInfo.jumpTime === 0) {
                    this.jump_time.string = "- - - - -";
                } else {
                    let now = new Date();
                    now.setTime(now.setSeconds(now.getSeconds() + this.planetTooltipInfo.jumpTime));
                    this.jump_time.string = lodash.formatTimestamp(new Date(now.getTime()));
                }
                // 计算占领时间
                if (this.planetTooltipInfo.occupyTime === 0) {
                    this.occupy_time.string = "- - - - -";
                } else {
                    let now = new Date();
                    now.setTime(now.setSeconds(now.getSeconds() + this.planetTooltipInfo.occupyTime));
                    this.occupy_time.string = lodash.formatTimestamp(new Date(now.getTime()));
                }
            } else {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.TOAST, res.msg);
            }
        }).catch(err => {
            console.error(err);
        });
    }

    /*
    *@Author: yozora
    *@Description: 获取当前点击的飞船
    *@Date: 2022-02-28 00:28:17
    */
    private processShipCode() {
        if (find('Canvas').getChildByName('Starmap_area').getChildByName('Ship_board_large') && find('Canvas').getChildByName('Starmap_area').getChildByName('Ship_board_large').active) {
            return find('Canvas').getChildByName('Starmap_area').getChildByName('Ship_board_large').getComponent(ShipBoardLarge)._lastShip;
        }
        return "-1";
    }


}
