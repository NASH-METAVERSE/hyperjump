
import { _decorator, Component, Node, SpriteFrame, Label, Sprite, resources, } from 'cc';
import { DataManager } from '../../DataManager';
import { GameConstans } from '../../entity/GameConstans';
import { ShipListDetail } from '../../entity/ShipListDetail';
import { ClientEvent } from '../../utils/ClientEvent';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ShipDetail
 * DateTime = Wed Nov 24 2021 22:51:06 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = ShipDetail.ts
 * FileBasenameNoExtension = ShipDetail
 * URL = db://assets/script/ui/ShipDetail.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * Description = 飞船详情
 */

@ccclass('ShipDetail')
export class ShipDetail extends Component {

    /*
     * 飞船名称
     */
    private shipNameLabel: Label = null;

    /*
     * 飞船积分
     */
    private shipMineralLabel: Label = null;

    /*
     * 太阳系编码
     */
    private solarSystemCodeLabel: Label = null;

    /*
     * 星球编码
     */
    private planetCodeLabel: Label = null;

    /*
    * 玩家信息
    */
    private playerLabel: Label = null;

    /*
     * 战斗冷却时间
     */
    private attackCool: Label = null;

    /*
     * 当前采集积分
     */
    private collected: Label = null;

    /*
     * 飞船积分
     */
    private shipMineral: Label = null;
    /*
     * 预计跃迁时间
     */
    private jumpTimeLabel: Label = null;

    /*
     * 飞船位置
     */
    private PositonLabel: Label = null;

    /*
     * 能量盾(生命值)
     */
    private energyShield: Label = null;

    /*
     * 攻击力
     */
    private attack: Label = null;

    /*
     * 防御力
     */
    private defense: Label = null;

    /*
     * 雷达
     */
    private rader: Label = null;

    /*
     * 承载力
     */
    private bearer: Label = null;

    /*
     * 移动速度
     */
    private moveSpeed: Label = null;

    /*
     * 采集速度
     */
    private collecting: Label = null;

    /*
     * 飞船模型
     */
    private shipLevel: Node = null;

    start() {
        ClientEvent.on(GameConstans.CLIENTEVENT_LIST.CHANGE_SHIP_DETAIL, this.updateShipDetail, this);
    }

    /*
     *@Author: yozora
     *@Description: 修改选中飞船详细信息
     *@Date: 2021-11-24 23:25:37
     */
    private updateShipDetail(ShipDetailInfo: ShipListDetail) {
        if (!this.shipNameLabel) {
            this.shipNameLabel = this.node.getChildByName('Ship_name_label').getComponent(Label);
        }
        if (!this.shipMineralLabel) {
            this.shipMineralLabel = this.node.getChildByName('Ship_mineral_label').getComponent(Label);
        }
        if (!this.shipLevel) {
            this.shipLevel = this.node.getChildByName("Ship_level_detail").getChildByName("Ship_info");
        }
        if (!this.solarSystemCodeLabel) {
            this.solarSystemCodeLabel = this.node.getChildByName('Info_system_id_label').getComponent(Label);
        }
        if (!this.planetCodeLabel) {
            this.planetCodeLabel = this.node.getChildByName('Info_planetid_label').getComponent(Label);
        }
        if (!this.playerLabel) {
            this.playerLabel = this.node.getChildByName('Info_player_label').getComponent(Label);
        }
        if (!this.attackCool) {
            this.attackCool = this.node.getChildByName('Info_attack_cool_label').getComponent(Label);
        }
        if (!this.jumpTimeLabel) {
            this.jumpTimeLabel = this.node.getChildByName('Info_jump_time_label').getComponent(Label);
        }
        if (!this.collected) {
            this.collected = this.node.getChildByName('Info_collected_label').getComponent(Label);
        }
        if (!this.shipMineral) {
            this.shipMineral = this.node.getChildByName('Info_ship_mineral_label').getComponent(Label);
        }
        if (!this.energyShield) {
            this.energyShield = this.node.getChildByName('Energy_shield_label').getComponent(Label);
        }
        if (!this.attack) {
            this.attack = this.node.getChildByName('Attack_label').getComponent(Label);
        }
        if (!this.defense) {
            this.defense = this.node.getChildByName('Defense_label').getComponent(Label);
        }
        if (!this.rader) {
            this.rader = this.node.getChildByName('Rader_label').getComponent(Label);
        }
        if (!this.bearer) {
            this.bearer = this.node.getChildByName('Bearer_label').getComponent(Label);
        }
        if (!this.moveSpeed) {
            this.moveSpeed = this.node.getChildByName('Move_speed_label').getComponent(Label);
        }
        if (!this.collecting) {
            this.collecting = this.node.getChildByName('Collecting_label').getComponent(Label);
        }
        // 修改飞船面板信息
        this.shipNameLabel.string = "SHIP-" + ShipDetailInfo.shipName;
        this.shipMineralLabel.string = ShipDetailInfo.mineral;
        this.solarSystemCodeLabel.string = ShipDetailInfo.solarSystemCode;
        this.planetCodeLabel.string = ShipDetailInfo.planetCode;
        this.playerLabel.string = DataManager.runtimeData.getUserData().userProfile.username;

        // this.attackCool.string = ShipDetailInfo.attackCool;
        // this.jumpTimeLabel.string = ShipDetailInfo.jumpTime;
        // this.collected.string = ShipDetailInfo.collected;

        this.shipMineral.string = ShipDetailInfo.mineral;
        this.energyShield.string = ShipDetailInfo.strength;
        this.attack.string = ShipDetailInfo.firePower;
        this.defense.string = ShipDetailInfo.strength;
        this.rader.string = ShipDetailInfo.radarRange;
        this.bearer.string = ShipDetailInfo.coldSpeed;
        this.moveSpeed.string = ShipDetailInfo.moveSpeed;
        this.collecting.string = ShipDetailInfo.coldSpeed;

        // 加载飞船模型
        resources.load(`ui/ship_level/ship_level/ship_level_${ShipDetailInfo.shipLevel}`, SpriteFrame, (err, asset) => {
            if (err) {
                console.error(err);
                return;
            }
            this.shipLevel.getComponent(Sprite).spriteFrame = asset;
        });
    }

}

