
import { _decorator, Component, Node, Label, find, tween, Sprite, Color, Tween, log, Prefab, instantiate, Game } from 'cc';
import { DataManager } from '../../DataManager';
import { GameConstans } from '../../entity/GameConstans';
import { ShipListDetail } from '../../entity/ShipListDetail';
import { ShipListInfo } from '../../entity/ShipListInfo';
import { ShipLogInfo } from '../../entity/ShipLogInfo';
import { ShipStatusInfo } from '../../entity/ShipStatusInfo';
import { GameManager } from '../../GameManager';
import { UserOperateManager } from '../../UserOperateManager';
import { ClientEvent } from '../../utils/ClientEvent';
import { HttpRequest } from '../../utils/HttpRequest';
import { lodash } from '../../utils/lodash';
import { ActivedStatus } from '../common/ActivedStatus';
import { TimerManager } from '../common/TimerManager';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ShipBoardLarge
 * DateTime = Fri Jan 07 2022 14:38:01 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = ShipBoardLarge.ts
 * FileBasenameNoExtension = ShipBoardLarge
 * URL = db://assets/script/ui/model/ShipBoardLarge.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('ShipBoardLarge')
export class ShipBoardLarge extends Component {

    @property({ type: Prefab })
    private Cooling_label: Prefab = null;

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
     * 飞船跃迁倒计时器
     */
    private _ShipBoardJumpTimeLabel: Node = null;

    /*
     * 飞船占领倒计时器
     */
    private _ShipBoardOccupyTimeLabel: Node = null;

    /*
     * 飞船已采集矿产
     */
    private _ShipMineralCollctedLabel: Node = null;

    /*
     * 隐身计时器
     */
    private _invisibleCounter: Node = null;

    /*
     * 飞船卡片名称
     */
    private shipIndex: number = -1;

    /*
     * 最后一次选中飞船编码
     */
    public _lastShip: string = null;

    /*
     * 最后一次选中太阳系
     */
    private _lastSolarSystemCode: string = null;

    /*
     * 最后一次选中星球
     */
    private _lastPlanetCode: string = null;

    /*
     * 默认颜色
     */
    private colorDefault: Color = new Color(255, 255, 255, 128);

    /*
     * 跃迁颜色
     */
    private colorJump: Color = new Color(0, 255, 255, 255);

    /*
     * 采集颜色
     */
    private colorOccupy: Color = new Color(255, 129, 0, 255);

    /**
    * 是否激活跃迁按钮(0 否 1 是)
    */
    private enableJump: number;

    /**
     * 是否激活占领按钮(0 否 1 是)
     */
    private enableOccupy: number;

    /**
     * 是否激活采集按钮(0 否 1 是)
     */
    private enableCollect: number;

    /**
     * 是否激活掠夺按钮(0 否 1 是)
     */
    private enablePlunder: number;

    /*
     * 数据管理脚本
     */
    private dataManager: DataManager = null;

    /*
     * 计时器管理脚本
     */
    private timerManager: TimerManager = null;

    /*
     * 用户操作管理脚本
     */
    private userOperateManager: UserOperateManager = null;

    onLoad() {
        this.dataManager = find('DataManager').getComponent(DataManager);
        this.timerManager = find('TimerManager').getComponent(TimerManager);
        this.userOperateManager = find('Canvas').getComponent(UserOperateManager);
        ClientEvent.on(
            GameConstans.CLIENTEVENT_UI_LIST.ACTIVE_SHIP_BOARD_BUTTON,
            this.activeShipBoardButton,
            this
        )
        ClientEvent.on(
            GameConstans.CLIENTEVENT_UI_LIST.CHANGE_SHIP_BOARD_BUTTON,
            this.changeShipBoardButton,
            this
        )
        ClientEvent.on(
            GameConstans.CLIENTEVENT_UI_LIST.RESET_SHIP_BOARD_BUTTON,
            this.resetShipBoardButton,
            this
        )
        ClientEvent.on(
            GameConstans.CLIENTEVENT_UI_LIST.REFRESH_SHIP_BOARD_CONTENT,
            this.processShipDetailBoardInfo,
            this);
        ClientEvent.on(
            GameConstans.CLIENTEVENT_UI_LIST.CANCEL_INVISIBLE,
            this.cancelInvisible,
            this
        );
        ClientEvent.on(
            GameConstans.CLIENTEVENT_TIME_LIST.INIT_BOARD_BUTTON_STATUS,
            this.initButtonStatus,
            this);
        ClientEvent.on(
            GameConstans.CLIENTEVENT_TIME_LIST.REFRESH_SHIP_STATUS,
            this.refreshShipStatus,
            this);
        ClientEvent.on(
            GameConstans.CLIENTEVENT_TIME_LIST.MONITOR_SHIP_STATUS_1,
            this.monitorShipStatus1,
            this);
        ClientEvent.on(
            GameConstans.CLIENTEVENT_TIME_LIST.MONITOR_SHIP_STATUS_2,
            this.monitorShipStatus2,
            this);
    }

    /*
     *@Author: yozora
     *@Description: 隐身超时流程
     *@Date: 2022-02-21 14:55:49
     */
    public invisibleTimeout(shipCode: string) {
        if (this.node.active && this._lastShip === shipCode) {
            // 重置操作状态
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.CHANGE_USER_OPERATION, null, null, true);
            // 返回星图场景
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_SCENCE_LIST.CHANGE_STARMAP, find('GameManager').getComponent(GameManager)._activeType);
        }
    }

    /*
     *@Author: yozora
     *@Description: 0 焦点事件 1 点击事件 2更新事件
     *@Date: 2022-01-18 14:21:36
     */
    public processShipDetailBoardInfo(shipDetailInfo: ShipListDetail, type: number, shipIndex: number) {
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
        if (!this._ShipMineralCollctedLabel) {
            this._ShipMineralCollctedLabel = this.node.getChildByName('Ship_board_mineral_collcted_label');
        }
        if (!this._ShipBoardJumpTimeLabel) {
            this._ShipBoardJumpTimeLabel = this.node.getChildByName('Ship_board_jump_time_label');
        }
        if (!this._ShipBoardOccupyTimeLabel) {
            this._ShipBoardOccupyTimeLabel = this.node.getChildByName('Ship_board_occupy_time_label');
        }
        if (!this._invisibleCounter) {
            this._invisibleCounter = this.node.getChildByName('Timer_area');
        }

        this._lastShip = shipDetailInfo.shipCode;
        this.shipIndex = shipIndex;

        if (this._invisibleCounter.getChildByName(this._lastShip) === null) {
            const time = instantiate(this.Cooling_label);
            time.name = this._lastShip;
            this._invisibleCounter.addChild(time);
        }
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_DATA_LIST.RUNTIME_DATA, 0, shipDetailInfo.shipCode);
        this._lastSolarSystemCode = shipDetailInfo.solarSystemCode;
        this._lastPlanetCode = shipDetailInfo.planetCode;
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
        this._ShipMineralCollctedLabel.getComponent(Label).string = shipDetailInfo.mineral;

        // 点击状态时，判断当前是否有未读消息
        if ((type === 1 || type === 2) && shipDetailInfo.shipLogInfoList.length > 0) {
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_DIALOG_LIST.CHANGE_SHIP_LOG, shipDetailInfo.shipLogInfoList);
            // 清除未读消息
            shipDetailInfo.shipLogInfoList = [];
        }

        // 初始化按钮状态
        this.initButtonStatus();

    }

    public resetLastShip() {
        this._lastShip = null;
    }

    /*
     *@Author: yozora
     *@Description: 初始化按钮状态
     *@Date: 2022-02-13 16:51:02
     */
    private async initButtonStatus(pressed?: boolean) {

        // 判断当前是跃迁还是飞行
        if (find('GameManager').getComponent(GameManager)._activeType === GameConstans.SCENCE_TYPE.SOLAR_SYSTEM) {
            this.changeJumpButton(this.dataManager.getSolarSystemCode(), null);
        }

        // 获取隐身冷却状态
        if (this.timerManager.getInvisibleCoolTime(this._lastShip) !== undefined && this.timerManager.getInvisibleCoolTime(this._lastShip) !== 0) {
            this._invisibleCounter.children.forEach(timer => {
                if (timer.name === this._lastShip) {
                    timer.active = true;
                } else {
                    timer.active = false;
                }
            });
            this._invisibleCounter.active = true;
            // 判断飞船状态
            await this.processCurrentShipStatus(true);
            this.changeCurrentButtonStatus(pressed);
        } else {
            // 判断飞船状态
            await this.processCurrentShipStatus(false);
            this.changeCurrentButtonStatus(pressed);
            // 获取隐身状态
            if (this.timerManager.getInvisibleCoolTime(this._lastShip) !== undefined && this.timerManager.getInvisibleTime(this._lastShip) !== 0) {
                this._invisibleCounter.children.forEach(timer => {
                    if (timer.name === this._lastShip) {
                        timer.active = true;
                    } else {
                        timer.active = false;
                    }
                });
                this._invisibleCounter.active = true;
            } else {
                this._invisibleCounter.active = false;
            }
        }
    }

    /*
     *@Author: yozora
     *@Description: 判断当前飞船状态
     *@Date: 2022-02-18 17:18:13
     */
    private async processCurrentShipStatus(invisibleCool: boolean) {
        const shipStatusInfos = this.timerManager.getShipStatusList(this._lastShip);
        if (invisibleCool) {
            this.enableCollect = 0;
            this.enableOccupy = 0;
            this.enableJump = 0;
            this.enablePlunder = 0;
            // console.log('disable all button.');
            return;
        }

        // 判断当前星球是否还有资源
        await HttpRequest.getPlanetMine(this._lastShip, this._lastPlanetCode).then(res => {
            shipStatusInfos.forEach(shipStatusInfo => {
                // 闲置状态
                if (shipStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_IDLE && this.timerManager.getShipTimer(this._lastShip, -2).currentTime === -1) {
                    this.enableCollect = 1;
                    this.enableOccupy = 1;
                    this.enableJump = 1;
                    this.enablePlunder = 1;
                }
                // 跃迁状态
                if (shipStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_JUMP && this.timerManager.getShipTimer(this._lastShip, -2).currentTime > 0) {
                    this.enableCollect = 0;
                    this.enableOccupy = 0;
                    this.enableJump = 0;
                    this.enablePlunder = 0;
                }
                // 飞行状态
                if (shipStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_FLIGHT && this.timerManager.getShipTimer(this._lastShip, -2).currentTime > 0) {
                    this.enableCollect = 0;
                    this.enableOccupy = 0;
                    this.enableJump = 0;
                    this.enablePlunder = 0;
                }
                // 跃迁冷却状态
                if (shipStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_JUMP_COOLING && this.timerManager.getShipTimer(this._lastShip, -2).currentTime > 0) {
                    this.enableCollect = 1;
                    this.enableOccupy = 1;
                    this.enableJump = 0;
                    this.enablePlunder = 1;
                }
            });
            shipStatusInfos.forEach(shipStatusInfo => {
                // 采集状态
                if (shipStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_MINING && this.timerManager.getShipTimer(this._lastShip, -1).currentTime === -1) {
                    this.enableCollect = 1;
                    this.enableOccupy = 0;
                    this.enableJump = 0;
                    this.enablePlunder = 0;
                }
                // 占领状态
                if (shipStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_OCCUPYING && this.timerManager.getShipTimer(this._lastShip, -1).currentTime > 0) {
                    this.enableCollect = 0;
                    this.enableOccupy = 1;
                    this.enableJump = 0;
                    this.enablePlunder = 0;
                }
                // 掠夺冷却状态
                if (shipStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_FULL_COOLING && this.timerManager.getShipTimer(this._lastShip, -1).currentTime > 0) {
                    this.enableCollect = 1;
                    this.enableOccupy = 1;
                    this.enableJump = 1;
                    this.enablePlunder = 0;
                }
            });
            if (res.code !== GameConstans.DATA_TYPE.SUCCESS) {
                this.enableCollect = 0;
            }
            // console.log("active collect: ", this.enableCollect, "active occupy: ", this.enableOccupy, "active jump: ", this.enableJump, "active plunder: ", this.enablePlunder);
        }).catch(err => {
            console.error(err);
        })
    }

    /*
    *@Author: yozora
    *@Description: 修改当前按钮激活状态
    *@Date: 2022-02-18 17:32:37
    */
    private changeCurrentButtonStatus(_pressed?: boolean) {
        let pressed = null;
        if (_pressed !== undefined) {
            pressed = _pressed;
        }
        this.changeButtonStatus('Jump_unactivated', pressed, this.enableJump === 1 ? true : false);
        this.changeButtonStatus('Occupy_unactivated', pressed, this.enableOccupy === 1 ? true : false);
        this.changeButtonStatus('Collect_unactivated', pressed, this.enableCollect === 1 ? true : false);
        if (this.timerManager.getShipTimer(this._lastShip, -1) !== null && this.timerManager.getShipTimer(this._lastShip, -1).currentTime === -1) {
            if (!this.node.getChildByName('Collect_unactivated').getChildByName('Radio_collect').active) {
                this.resetShipBoardButton(GameConstans.RESET_TYPE.PLANET.COLLECT, null);
                this.node.getChildByName('Collect_unactivated').getChildByName('Radio_collect').active = true;
            }
            this.restartCollectTween();
        } else {
            this.node.getChildByName('Collect_unactivated').getChildByName('Radio_collect').getComponent(Sprite).fillRange = -1;
            this.node.getChildByName('Collect_unactivated').getChildByName('Radio_collect').active = false;
            this.resetShipBoardButton(GameConstans.RESET_TYPE.PLANET.STOP_COLLECT, null);
            this.stopCollectTween();
        }
        this.changeButtonStatus('Plunder_unactivated', pressed, this.enablePlunder === 1 ? true : false);
    }

    /*
     *@Author: yozora
     *@Description: CORE 刷新飞船卡片
     *@Date: 2022-02-21 22:51:41
     */
    private async refreshShipStatus(shipCode: string, startFlag: boolean, timerIndex?: number, fromStatus?: string) {

        await HttpRequest.getMyShipByCode(this.dataManager.getUserAddress(), shipCode).then((res) => {
            // 新增数据
            if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                // 更新飞船信息
                const shipList: ShipListInfo = res.data;
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.CHANGE_SHIP_CARD_INFO, shipList.shipListInfos, this.shipIndex, this._lastShip);
                this.processCurrentShipStatus(false);
                this.changeCurrentButtonStatus();
                if (startFlag) {
                    if (fromStatus !== undefined) {
                        // 更新面板按钮样式
                        this.resetBoardTimerSprite(fromStatus, shipCode);
                    }
                    this.timerManager.startShipTimer(shipCode, true);
                } else {
                    if (fromStatus !== undefined) {
                        // 更新面板按钮样式
                        this.resetBoardTimerSprite(fromStatus, shipCode);
                    }
                    // 更新飞船卡片样式
                    ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIME_LIST.MONITOR_SHIP_STATUS, shipCode, timerIndex, this.timerManager.getShipStatusList(shipCode)[timerIndex], -1, true);
                }
            } else {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.TOAST, res.msg);
            }
        }).catch((err) => {
            console.error(err);
        });
    }

    /*
    *@Author: yozora
    *@Description: 激活按钮状态
    *@Date: 2022-02-16 17:32:20
    */
    private activeShipBoardButton(operateType: number) {
        console.log('operateType: ', operateType);
        // 激活跃迁
        if (operateType === GameConstans.RESET_TYPE.PLANET.JUMP) {
            HttpRequest.confirmJump(
                this.dataManager.getShipCode(),
                this.dataManager.getSolarSystemCode(),
                this.dataManager.getPlanetCode(),
            ).then(async (res) => {
                // 激活跃迁按钮
                if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                    // 修改二选一按钮状态
                    this.resetShipBoardButton(GameConstans.RESET_TYPE.FLIGHT_TO_JUMP, true);
                    // 刷新飞船状态
                    await this.refreshShipStatus(this._lastShip, true);
                    // 通知隐身计时器
                    this.changeInvisible();
                } else {
                    ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.TOAST, res.msg);
                }
            }).catch((err) => {
                console.error(err);
            });
        }
        // 激活飞行
        if (operateType === GameConstans.RESET_TYPE.PLANET.FLIGHT) {
            HttpRequest.confirmFlight(
                this.dataManager.getShipCode(),
                this.dataManager.getSolarSystemCode(),
                this.dataManager.getPlanetCode(),
            ).then(async (res) => {
                // 激活跃迁按钮
                if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                    // 修改二选一按钮状态
                    this.resetShipBoardButton(GameConstans.RESET_TYPE.JUMP_TO_FLIGHT, true);
                    // 刷新飞船状态
                    await this.refreshShipStatus(this._lastShip, true);
                    // 通知隐身计时器
                    this.changeInvisible();
                } else {
                    ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.TOAST, res.msg);
                }
            }).catch((err) => {
                console.error(err);
            });
        }
        // 激活战斗
        if (operateType === GameConstans.RESET_TYPE.PLANET.PLUNDER) {
            this.stopPlunder();
        }
        // 激活采集
        if (operateType === GameConstans.RESET_TYPE.PLANET.COLLECT) {
            this.activeCollect();
        }
        // 激活停止采集
        if (operateType === GameConstans.RESET_TYPE.PLANET.STOP_COLLECT) {
            this.stopCollect();
        }
        // 激活占领
        if (operateType === GameConstans.RESET_TYPE.PLANET.OCCUPY) {
            this.activeOccupy();
        }
        // 激活停止占领
        if (operateType === GameConstans.RESET_TYPE.PLANET.STOP_OCCUPY) {
            this.stopOccupy();
        }
        // 清除闲置状态
        this.timerManager.getShipStatusList(this._lastShip).forEach(shipStatusInfo => {
            if (shipStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_IDLE) {
                shipStatusInfo.currentTime = 0;
                shipStatusInfo.evaluateTime = 0;
            }
        });
        // 重置用户操作类型
        this.updateUserOperateType(this.userOperateManager.userOperateType, GameConstans.RESET_TYPE.NULL);
    }

    /*
     *@Author: yozora
     *@Description: 激活采集状态
     *@Date: 2022-02-20 21:53:35
     */
    private activeCollect() {
        // 通知后端数据
        HttpRequest.confirmMine(this._lastShip, this._lastSolarSystemCode, this._lastPlanetCode).then(async (res) => {
            if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                // 修改二选一按钮状态
                this.resetShipBoardButton(GameConstans.RESET_TYPE.PLANET.COLLECT, true);
                // 刷新飞船状态
                await this.refreshShipStatus(this._lastShip, true);
                // 通知隐身计时器
                this.changeInvisible();
                this.node.getChildByName('Collect_unactivated').getChildByName('Radio_collect').active = true;
                this.restartCollectTween();
            } else {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.TOAST, res.msg);
            }
        }).catch((err) => {
            console.error(err);
        });
    }

    /*
     *@Author: yozora
     *@Description: 激活占领
     *@Date: 2022-02-23 11:18:03
     */
    private activeOccupy() {
        HttpRequest.confirmOccupy(this._lastShip, this._lastPlanetCode).then(async (res) => {
            if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                // 修改二选一按钮状态
                this.resetShipBoardButton(GameConstans.RESET_TYPE.PLANET.OCCUPY, true);
                // 刷新飞船状态
                await this.refreshShipStatus(this._lastShip, true);
                // 通知隐身计时器
                this.changeInvisible();
                this.node.getChildByName('Occupy_unactivated').getChildByName('Radio_occupy').active = true;
            } else {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.TOAST, res.msg);
            }
        }).catch((err) => {
            console.error(err);
        });
    }

    /*
     *@Author: yozora
     *@Description: 停止采集状态
     *@Date: 2022-02-20 22:02:33
     */
    private stopCollect() {
        // 通知后端数据
        HttpRequest.interruptMine(this._lastShip).then(async (res) => {
            if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                // 刷新飞船状态
                await this.refreshShipStatus(this._lastShip, true);
                this.stopCollectTween();
                // 通知飞船卡片
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.STOP_SHIP_COLLECT, this.timerManager.getShipTimer(this._lastShip, -1));
                this.resetShipBoardButton(GameConstans.RESET_TYPE.PLANET.STOP_COLLECT, true, true);
                // 通知隐身计时器
                this.changeInvisible();
                this.node.getChildByName('Collect_unactivated').getChildByName('Radio_collect').active = false;
                // 显示采集报告
                const shipLogInfoList = new Array<ShipLogInfo>();
                const shipLogInfo = res.data;
                shipLogInfoList.push(shipLogInfo);
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_DIALOG_LIST.CHANGE_SHIP_LOG, shipLogInfoList);
            } else {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.TOAST, res.msg);
            }
        }).catch((err) => {
            console.error(err);
        });
    }

    /*
     *@Author: yozora
     *@Description: 中断占领
     *@Date: 2022-02-23 11:18:53
     */
    private stopOccupy() {
        HttpRequest.interruptOccupy(this._lastShip, this._lastPlanetCode).then(async (res) => {
            if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                // 修改二选一按钮状态
                this.resetShipBoardButton(GameConstans.RESET_TYPE.PLANET.STOP_OCCUPY, true);
                // 刷新飞船状态
                await this.refreshShipStatus(this._lastShip, true);
                // 更新面板按钮样式
                this.resetBoardTimerSprite(GameConstans.SHIP_STATUS.SHIP_OCCUPYING, this._lastShip);
                // 通知飞船卡片重置
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIME_LIST.MONITOR_SHIP_STATUS, this._lastShip, this.timerManager.getShipStatusIndex(this._lastShip, -1), this.timerManager.getShipTimer(this._lastShip, -1), 0, true);
                // 通知隐身计时器
                this.changeInvisible();
                // 显示占领报告
                const shipLogInfoList = new Array<ShipLogInfo>();
                const shipLogInfo = res.data;
                shipLogInfoList.push(shipLogInfo);
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_DIALOG_LIST.CHANGE_SHIP_LOG, shipLogInfoList);
            } else {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.TOAST, res.msg);
            }
        }).catch((err) => {
            console.error(err);
        });
    }

    /*
     *@Author: yozora
     *@Description: 停止战斗
     *@Date: 2022-03-02 00:01:44
     */
    private stopPlunder() {
        // 刷新飞船状态
        this.refreshShipStatus(this._lastShip, true);
        this.resetShipBoardButton(GameConstans.RESET_TYPE.PLANET.PLUNDER, false);
    }

    /*
     *@Author: yozora
     *@Description: 取消隐身计时器
     *@Date: 2022-02-28 18:06:45
     */
    private cancelInvisible() {
        this.timerManager.cancelInvisibleShip(this._lastShip);
        this._invisibleCounter.active = false;
    }

    /*
     *@Author: yozora
     *@Description: 转换隐身冷却
     *@Date: 2022-03-08 00:00:33
     */
    private changeInvisible() {
        this.timerManager.cancelInvisibleShip(this._lastShip);
        this.timerManager.activeInvisibleCool(this._invisibleCounter, this._lastShip, false);
    }

    /*
     *@Author: yozora
     *@Description: 监听飞船计时器1(跃迁 or 跃迁冷却)
     *@Date: 2022-02-16 16:27:51
     */
    private monitorShipStatus1(shipCode: string, index: number, shipStatusInfo: ShipStatusInfo, fillRange: number) {
        if (!this._lastShip || this._lastShip === shipCode) {
            const currentTime = this.timerManager.shipTimerInfo.get(shipCode)[index].currentTime;
            const t = new Date();
            t.setSeconds(t.getSeconds() + currentTime);
            this.updateClock(t.toString(), shipStatusInfo.shipStatus, fillRange);
        }
    }

    /*
     *@Author: yozora
     *@Description: 监听飞船计时器2(占领)
     *@Date: 2022-02-18 11:34:11
     */
    private monitorShipStatus2(shipCode: string, index: number, shipStatusInfo: ShipStatusInfo, fillRange: number) {
        if (!this._lastShip || this._lastShip === shipCode) {
            const currentTime = this.timerManager.shipTimerInfo.get(shipCode)[index].currentTime;
            const t = new Date();
            t.setSeconds(t.getSeconds() + currentTime);
            this.updateClock(t.toString(), shipStatusInfo.shipStatus, fillRange);
        }
    }

    /*
     *@Author: yozora
     *@Description: 更新时钟
     *@Date: 2022-01-18 14:17:24
     */
    private updateClock(endTime: string, shipStatus: string, fillRange: number) {
        const timeInfo = lodash.countdown(endTime);
        if (timeInfo.total > 0) {
            if (shipStatus === GameConstans.SHIP_STATUS.SHIP_JUMP || shipStatus === GameConstans.SHIP_STATUS.SHIP_FLIGHT || shipStatus === GameConstans.SHIP_STATUS.SHIP_JUMP_COOLING) {
                this._ShipBoardJumpTimeLabel.getComponent(Label).color = this.colorJump;
                if (!this.node.getChildByName('Jump_unactivated').getChildByName('Radio_jump').active) {
                    this.node.getChildByName('Jump_unactivated').getChildByName('Radio_jump').active = true;
                }
                if (fillRange !== undefined && fillRange !== this.node.getChildByName('Jump_unactivated').getChildByName('Radio_jump').getComponent(Sprite).fillRange) {
                    this.node.getChildByName('Jump_unactivated').getChildByName('Radio_jump').getComponent(Sprite).fillRange = fillRange;
                }
                this._ShipBoardJumpTimeLabel.getComponent(Label).string = timeInfo.hours + ':' + timeInfo.minutes + ':' + timeInfo.seconds;
            }
            if (shipStatus === GameConstans.SHIP_STATUS.SHIP_OCCUPYING) {
                this._ShipBoardOccupyTimeLabel.getComponent(Label).color = this.colorOccupy;
                if (!this.node.getChildByName('Occupy_unactivated').getChildByName('Radio_occupy').active) {
                    this.node.getChildByName('Occupy_unactivated').getChildByName('Radio_occupy').active = true;
                    this.resetShipBoardButton(GameConstans.RESET_TYPE.PLANET.OCCUPY, null);
                }
                if (fillRange !== undefined && fillRange !== this.node.getChildByName('Occupy_unactivated').getChildByName('Radio_occupy').getComponent(Sprite).fillRange) {
                    this.node.getChildByName('Occupy_unactivated').getChildByName('Radio_occupy').getComponent(Sprite).fillRange = fillRange;
                }
                this._ShipBoardOccupyTimeLabel.getComponent(Label).string = timeInfo.hours + ':' + timeInfo.minutes + ':' + timeInfo.seconds;
            }
        }
        if (timeInfo.total <= 0) {
            this.resetBoardTimerSprite(shipStatus);
        }
    }

    /*
     *@Author: yozora
     *@Description: 重置面板按钮样式
     *@Date: 2022-02-22 17:11:00
     */
    private resetBoardTimerSprite(shipStatus: string, shipCode?: string) {
        if (shipCode === this._lastShip) {
            if ((shipStatus === GameConstans.SHIP_STATUS.SHIP_JUMP || shipStatus === GameConstans.SHIP_STATUS.SHIP_FLIGHT || shipStatus === GameConstans.SHIP_STATUS.SHIP_JUMP_COOLING) && this.node.getChildByName('Jump_unactivated').getChildByName('Radio_jump').active) {
                this._ShipBoardJumpTimeLabel.getComponent(Label).string = "00:00:00";
                this._ShipBoardJumpTimeLabel.getComponent(Label).color = this.colorDefault;
                this.node.getChildByName('Jump_unactivated').getChildByName('Radio_jump').getComponent(Sprite).fillRange = -1;
                this.node.getChildByName('Jump_unactivated').getChildByName('Radio_jump').active = false;
            }
            if (shipStatus === GameConstans.SHIP_STATUS.SHIP_OCCUPYING && this.node.getChildByName('Occupy_unactivated').getChildByName('Radio_occupy').active) {
                this._ShipBoardOccupyTimeLabel.getComponent(Label).string = "00:00:00";
                this._ShipBoardOccupyTimeLabel.getComponent(Label).color = this.colorDefault;
                this.node.getChildByName('Occupy_unactivated').getChildByName('Radio_occupy').getComponent(Sprite).fillRange = -1;
                this.node.getChildByName('Occupy_unactivated').getChildByName('Radio_occupy').active = false;
            }
        }
    }

    /*
     *@Author: yozora
     *@Description: 跃迁飞船
     *@Date: 2022-02-10 16:36:13
     */
    private jump() {
        // 禁用其它按钮
        this.changeButtonStatus('Occupy_unactivated', false, false);
        this.changeButtonStatus('Collect_unactivated', false, false);
        this.changeButtonStatus('Plunder_unactivated', false, false);
        this.timerManager.startTimer(GameConstans.TIMER_TYPE.INVISIBLE_TIMER, this._lastShip, this.node.getChildByName('Ship_board_name_label').getComponent(Label).string);
        if (this.node.getChildByName('Jump_unactivated').getComponent(ActivedStatus).pressed) {
            if (this.node.getChildByName('Jump_unactivated').getComponent(ActivedStatus).getSpriteFrameType() === 0) {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.JUMP, this._lastSolarSystemCode, GameConstans.RESET_TYPE.PLANET.JUMP);
            } else {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.JUMP, this._lastSolarSystemCode, GameConstans.RESET_TYPE.PLANET.FLIGHT);
            }
        } else {
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.CHANGE_USER_OPERATION, null, null, true);
        }
    }

    /*
     *@Author: yozora
     *@Description: 占领星球
     *@Date: 2022-02-10 16:38:44
     */
    private occupy() {
        // 禁用其它按钮
        this.changeButtonStatus('Jump_unactivated', false, false);
        this.changeButtonStatus('Collect_unactivated', false, false);
        this.changeButtonStatus('Plunder_unactivated', false, false);
        this.timerManager.startTimer(GameConstans.TIMER_TYPE.INVISIBLE_TIMER, this._lastShip, this.node.getChildByName('Ship_board_name_label').getComponent(Label).string);
        if (this.node.getChildByName('Occupy_unactivated').getComponent(ActivedStatus).pressed) {
            if (this.node.getChildByName('Occupy_unactivated').getComponent(ActivedStatus).getSpriteFrameType() === 0) {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.OCCUPY, this._lastPlanetCode, GameConstans.RESET_TYPE.PLANET.OCCUPY);
            } else {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.OCCUPY, this._lastPlanetCode, GameConstans.RESET_TYPE.PLANET.STOP_OCCUPY);
            }
        } else {
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.CHANGE_USER_OPERATION, null, null, true);
        }
    }

    /*
     *@Author: yozora
     *@Description: 采集飞船
     *@Date: 2022-02-10 16:38:53
     */
    private collect() {
        this.changeButtonStatus('Jump_unactivated', false, false);
        this.changeButtonStatus('Occupy_unactivated', false, false);
        this.changeButtonStatus('Plunder_unactivated', false, false);
        this.timerManager.startTimer(GameConstans.TIMER_TYPE.INVISIBLE_TIMER, this._lastShip, this.node.getChildByName('Ship_board_name_label').getComponent(Label).string);
        if (this.node.getChildByName('Collect_unactivated').getComponent(ActivedStatus).pressed) {
            if (this.node.getChildByName('Collect_unactivated').getComponent(ActivedStatus).getSpriteFrameType() === 0) {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.COLLECT, this._lastPlanetCode, GameConstans.RESET_TYPE.PLANET.COLLECT);
            } else {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.COLLECT, this._lastPlanetCode, GameConstans.RESET_TYPE.PLANET.STOP_COLLECT);
            }
        } else {
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.CHANGE_USER_OPERATION, null, null, true);
        }
    }

    /*
     *@Author: yozora
     *@Description: 掠夺飞船
     *@Date: 2022-02-07 11:07:29
     */
    private plunder() {
        this.changeButtonStatus('Jump_unactivated', false, false);
        this.changeButtonStatus('Occupy_unactivated', false, false);
        this.changeButtonStatus('Collect_unactivated', false, false);
        this.timerManager.startTimer(GameConstans.TIMER_TYPE.INVISIBLE_TIMER, this._lastShip, this.node.getChildByName('Ship_board_name_label').getComponent(Label).string);
        if (this.node.getChildByName('Plunder_unactivated').getComponent(ActivedStatus).pressed) {
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.PLUNDER, this._lastPlanetCode);
        } else {
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.CHANGE_USER_OPERATION, null, null, true);
        }
    }

    /*
    *@Author: yozora
    *@Description: 修改用户操作状态
    *@Date: 2022-02-11 14:16:14
    */
    private updateUserOperateType(fromType: number, toType: number) {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.CHANGE_USER_OPERATION, fromType, toType, false);
    }

    /*
    *@Author: yozora
    *@Description: 重置计时器样式
    *@Date: 2022-02-17 18:55:52
    */
    public resetTimerLabel() {
        if (this.node.getChildByName('Jump_unactivated').getChildByName('Radio_jump').active) {
            this._ShipBoardJumpTimeLabel.getComponent(Label).string = "00:00:00";
            this._ShipBoardJumpTimeLabel.getComponent(Label).color = this.colorDefault;
            this.node.getChildByName('Jump_unactivated').getChildByName('Radio_jump').getComponent(Sprite).fillRange = -1;
            this.node.getChildByName('Jump_unactivated').getChildByName('Radio_jump').active = false;
        }
        if (this.node.getChildByName('Occupy_unactivated').getChildByName('Radio_occupy').active) {
            this._ShipBoardOccupyTimeLabel.getComponent(Label).string = "00:00:00";
            this._ShipBoardOccupyTimeLabel.getComponent(Label).color = this.colorDefault;
            this.node.getChildByName('Occupy_unactivated').getChildByName('Radio_occupy').getComponent(Sprite).fillRange = -1;
            this.node.getChildByName('Occupy_unactivated').getChildByName('Radio_occupy').active = false;
            this.resetShipBoardButton(GameConstans.RESET_TYPE.PLANET.STOP_OCCUPY, null);
        }
    }

    /*
     *@Author: yozora
     *@Description: 切换按钮点击状态
     *@Date: 2022-02-10 16:56:33
     */
    public changeShipBoardButton(solarSystemCode: string, pressed: boolean, actionType?: number) {
        if (actionType === undefined) {
            this.changeJumpButton(solarSystemCode, pressed);
            if (solarSystemCode === this._lastSolarSystemCode) {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.CHANGE_USER_OPERATION, GameConstans.RESET_TYPE.PLANET.JUMP, GameConstans.RESET_TYPE.PLANET.FLIGHT);
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIPS_LIST.CHANGE_TIPS_CONTENT, GameConstans.TIPS_CONTENT.FLIGHT);
            } else {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.CHANGE_USER_OPERATION, GameConstans.RESET_TYPE.PLANET.FLIGHT, GameConstans.RESET_TYPE.PLANET.JUMP);
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIPS_LIST.CHANGE_TIPS_CONTENT, GameConstans.TIPS_CONTENT.JUMP);
            }
        } else {
            if (actionType === GameConstans.RESET_TYPE.NULL) {
                this.changeJumpButton(solarSystemCode, pressed);
            }
            if (actionType === GameConstans.RESET_TYPE.PLANET.COLLECT) {
                this.node.getChildByName('Collect_unactivated').getComponent(ActivedStatus).reset(pressed, null);
            }
            if (actionType === GameConstans.RESET_TYPE.PLANET.OCCUPY) {
                this.node.getChildByName('Occupy_unactivated').getComponent(ActivedStatus).reset(pressed, null);
            }
        }
    }

    /*
     *@Author: yozora
     *@Description: 切换跃迁按钮
     *@Date: 2022-02-16 22:57:23
     */
    private changeJumpButton(solarSystemCode: string, pressed: boolean) {
        // 飞行
        if (solarSystemCode === this._lastSolarSystemCode) {
            // 切换图标
            this.node.getChildByName('Jump_unactivated').getComponent(ActivedStatus).changeSpriteFrame(1, true);
            this.node.getChildByName('Jump_unactivated').getComponent(ActivedStatus).reset(pressed, null);
            // 跃迁
        } else {
            // 切换图标
            this.node.getChildByName('Jump_unactivated').getComponent(ActivedStatus).changeSpriteFrame(0, true);
            this.node.getChildByName('Jump_unactivated').getComponent(ActivedStatus).reset(pressed, null);
        }
    }

    /*
     *@Author: yozora
     *@Description: 重置按钮状态
     *@Date: 2022-02-09 14:55:28
     */
    private resetShipBoardButton(actionType: number, actived: boolean, positive?: boolean) {
        let positiveFlag = false;
        if (positive !== undefined) {
            positiveFlag = positive;
        }
        if (actionType === null) {
            this.changeButtonStatus('Plunder_unactivated', false, actived);
            this.changeButtonStatus('Collect_unactivated', false, actived);
            this.changeButtonStatus('Occupy_unactivated', false, actived);
            this.changeButtonStatus('Jump_unactivated', false, actived);
        }
        if (actionType === GameConstans.RESET_TYPE.PLANET.JUMP) {
            this.changeButtonStatus('Jump_unactivated', false, actived);
        }
        if (actionType === GameConstans.RESET_TYPE.PLANET.FLIGHT) {
            this.changeButtonStatus('Jump_unactivated', false, actived);
        }
        if (actionType === GameConstans.RESET_TYPE.PLANET.PLUNDER) {
            this.changeButtonStatus('Plunder_unactivated', false, actived);
        }
        // 切换采集停止采集按钮
        if (actionType === GameConstans.RESET_TYPE.PLANET.COLLECT) {
            this.node.getChildByName('Collect_unactivated').getComponent(ActivedStatus).changeSpriteFrame(1, positiveFlag);
            this.changeButtonStatus('Collect_unactivated', false, actived);
        }
        // 切换占领停止占领按钮
        if (actionType === GameConstans.RESET_TYPE.PLANET.OCCUPY) {
            this.node.getChildByName('Occupy_unactivated').getComponent(ActivedStatus).changeSpriteFrame(1, positiveFlag);
            this.changeButtonStatus('Occupy_unactivated', false, actived);
        }
        // 切换停止采集采集按钮
        if (actionType === GameConstans.RESET_TYPE.PLANET.STOP_COLLECT) {
            this.node.getChildByName('Collect_unactivated').getComponent(ActivedStatus).changeSpriteFrame(0, positiveFlag);
            this.changeButtonStatus('Collect_unactivated', false, actived);
        }
        // 切换停止占领占领按钮
        if (actionType === GameConstans.RESET_TYPE.PLANET.STOP_OCCUPY) {
            this.node.getChildByName('Occupy_unactivated').getComponent(ActivedStatus).changeSpriteFrame(0, positiveFlag);
            this.changeButtonStatus('Occupy_unactivated', false, actived);
        }
        if (actionType === GameConstans.RESET_TYPE.JUMP_TO_FLIGHT) {
            this.node.getChildByName('Jump_unactivated').getComponent(ActivedStatus).changeSpriteFrame(1, true);
            this.changeButtonStatus('Jump_unactivated', false, actived);
        }
        if (actionType === GameConstans.RESET_TYPE.FLIGHT_TO_JUMP) {
            this.node.getChildByName('Jump_unactivated').getComponent(ActivedStatus).changeSpriteFrame(0, true);
            this.changeButtonStatus('Jump_unactivated', false, actived);
        }
    }

    /*
     *@Author: yozora
     *@Description: 修改按钮状态
     *@Date: 2022-02-18 15:22:28
     */
    private changeButtonStatus(name: string, pressed: boolean, actived: boolean) {
        this.node.getChildByName(name).getComponent(ActivedStatus).reset(pressed, actived);
    }

    /*
     *@Author: yozora
     *@Description: 开始采集
     *@Date: 2022-02-21 11:15:21
     */
    private restartCollectTween() {
        Tween.stopAllByTag(GameConstans.TWEEN_TAG.COLLECT_BOARD_TAG);
        this.node.getChildByName('Collect_unactivated').getChildByName('Radio_collect').getComponent(Sprite).fillRange = -1;
        tween(this.node.getChildByName('Collect_unactivated').getChildByName('Radio_collect').getComponent(Sprite))
            .to(2, { fillRange: 1 })
            .set({ fillRange: -1 })
            .union()
            .repeatForever().tag(GameConstans.TWEEN_TAG.COLLECT_BOARD_TAG).start();
    }

    /*
     *@Author: yozora
     *@Description: 停止采集
     *@Date: 2022-02-21 11:15:29
     */
    private stopCollectTween() {
        Tween.stopAllByTag(GameConstans.TWEEN_TAG.COLLECT_BOARD_TAG);
    }

}

