
import { _decorator, Component, Node, Label } from 'cc';
import { GameConstans } from '../../entity/GameConstans';
import { ShipListDetail } from '../../entity/ShipListDetail';
import { ClientEvent } from '../../utils/ClientEvent';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ShipBoardLargeTarget
 * DateTime = Fri Jan 07 2022 14:38:01 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = ShipBoardLarge.ts
 * FileBasenameNoExtension = ShipBoardLarge
 * URL = db://assets/script/ui/model/ShipBoardLarge.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('ShipBoardLargeTarget')
export class ShipBoardLargeTarget extends Component {

    /*
     * 飞船名称
     */
    private _ShipNameLabel: Node = null;

    /*
     * 飞船矿产
     */
    private _ShipMineralLabel: Node = null;

    /*
     * 飞船停靠星球
     */
    private _ShipPlanetLabel: Node = null;

    /*
     * 飞船位置
     */
    private _ShipPositionLabel: Node = null;

    /*
     * 飞船攻击力
     */
    private _ShipAttackLabel: Node = null;

    /*
     * 飞船速度
     */
    private _ShipSpeedLabel: Node = null;

    /*
     * 飞船能量盾
     */
    private _ShipShieldLabel: Node = null;

    /*
     * 飞船防御力
     */
    private _ShipDefenseLabel: Node = null;

    /*
     * 飞船雷达
     */
    private _ShipRadarLabel: Node = null;

    /*
     * 飞船采集速度
     */
    private _ShipCollectingLabel: Node = null;

    /*
     * 飞船承载力
     */
    private _ShipBearerLabel: Node = null;

    /*
     * 最后一次选中飞船编码
     */
    public _lastShip: string = null;

    /*
     *@Author: yozora
     *@Description: 0 焦点事件 1 点击事件
     *@Date: 2022-01-18 14:21:36
     */
    public processShipDetailBoardInfo(shipDetailInfo: ShipListDetail, type: number) {
        if (!this._ShipNameLabel) {
            this._ShipNameLabel = this.node.getChildByName('Ship_board_name_label');
        }
        if (!this._ShipMineralLabel) {
            this._ShipMineralLabel = this.node.getChildByName('Ship_board_mineral_label');
        }
        if (!this._ShipPlanetLabel) {
            this._ShipPlanetLabel = this.node.getChildByName('Ship_board_planet_label');
        }
        if (!this._ShipPositionLabel) {
            this._ShipPositionLabel = this.node.getChildByName('Ship_board_position_label');
        }
        if (!this._ShipAttackLabel) {
            this._ShipAttackLabel = this.node.getChildByName('Ship_board_attack_label');
        }
        if (!this._ShipSpeedLabel) {
            this._ShipSpeedLabel = this.node.getChildByName('Ship_board_speed_label');
        }
        if (!this._ShipShieldLabel) {
            this._ShipShieldLabel = this.node.getChildByName('Ship_board_shield_label');
        }
        if (!this._ShipDefenseLabel) {
            this._ShipDefenseLabel = this.node.getChildByName('Ship_board_defense_label');
        }
        if (!this._ShipRadarLabel) {
            this._ShipRadarLabel = this.node.getChildByName('Ship_board_radar_label');
        }
        if (!this._ShipCollectingLabel) {
            this._ShipCollectingLabel = this.node.getChildByName('Ship_board_collecting_label');
        }
        if (!this._ShipBearerLabel) {
            this._ShipBearerLabel = this.node.getChildByName('Ship_board_bearer_label');
        }

        this._lastShip = shipDetailInfo.shipCode;
        // 记录对手飞船编码
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_DATA_LIST.RUNTIME_DATA, 1, shipDetailInfo.shipCode);
        // this._lastSolarSystemCode = shipDetailInfo.solarSystemCode;
        // this._lastPlanetCode = shipDetailInfo.planetCode;
        this._ShipNameLabel.getComponent(Label).string = shipDetailInfo.shipName;
        this._ShipMineralLabel.getComponent(Label).string = shipDetailInfo.mineral;
        this._ShipPlanetLabel.getComponent(Label).string = shipDetailInfo.planetCode;
        this._ShipPositionLabel.getComponent(Label).string = shipDetailInfo.solarSystemCode;
        this._ShipAttackLabel.getComponent(Label).string = shipDetailInfo.firePower;
        this._ShipSpeedLabel.getComponent(Label).string = shipDetailInfo.moveSpeed;
        this._ShipShieldLabel.getComponent(Label).string = shipDetailInfo.strength;
        this._ShipDefenseLabel.getComponent(Label).string = shipDetailInfo.strength;
        this._ShipRadarLabel.getComponent(Label).string = shipDetailInfo.radarRange;
        this._ShipCollectingLabel.getComponent(Label).string = shipDetailInfo.coldSpeed;
        this._ShipBearerLabel.getComponent(Label).string = shipDetailInfo.power;

    }

    public resetLastShip() {
        this._lastShip = null;
    }

}

