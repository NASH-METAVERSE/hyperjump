
import { _decorator, Component, Node, Label, find, Game, Prefab, instantiate, Scheduler } from 'cc';
import { GameConstans } from '../../entity/GameConstans';
import { ShipStatusInfo } from '../../entity/ShipStatusInfo';
import { ClientEvent } from '../../utils/ClientEvent';
import { HttpRequest } from '../../utils/HttpRequest';
import { Logger } from '../../utils/Logger';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = TimerManager
 * DateTime = Sun Feb 13 2022 16:40:52 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = CounterController.ts
 * FileBasenameNoExtension = CounterController
 * URL = db://assets/script/ui/common/CounterController.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 * 倒计时管理器
 */

@ccclass('TimerManager')
export class TimerManager extends Component {

    @property({ type: Prefab })
    private Cooling_label: Prefab = null;

    /*
     * 初始化隐身时间
     */
    private initInvisibleTime = 30;

    /*
     * 初始化隐身冷却时间
     */
    private initInvisibleCoolTime = 15;


    /*
     * 隐身计时器时间
     */
    private invisibleTimeOfShip: Map<string, number> = new Map<string, number>();

    /*
     * 隐身冷却计时器时间
     */
    private invisibleCoolTimeOfShip: Map<string, number> = new Map<string, number>();

    /*
    * 飞船状态计时器时间
    */
    public shipTimerInfo: Map<string, ShipStatusInfo[]> = new Map<string, ShipStatusInfo[]>();

    /*
     * 隐身计时器
     */
    private invisibleCounter: Map<string, () => void> = new Map<string, () => void>();

    /*
     * 隐身冷却计时器
     */
    private invisibleCoolCounter: Map<string, () => void> = new Map<string, () => void>();

    /*
     * 飞船状态计时函数
     */
    private shipTimerCounterCallback: Map<string, Map<number, () => void>> = new Map<string, Map<number, () => void>>();

    /*
     * 飞船状态倒计时器
     */
    private shipTimerCounterId: Map<string, Map<number, number>> = new Map<string, Map<number, number>>();



    start() {
        ClientEvent.on(GameConstans.CLIENTEVENT_TIME_LIST.INIT_INVISIBLE_TIME, this.initTimer, this);
    }

    /*
     *@Author: yozora
     *@Description: 启动计时器
     *@Date: 2022-02-13 17:43:53
     */
    public startTimer(timeType: number, shipCode: string, shipName: string) {
        // 已存在隐身计时器
        if (this.invisibleTimeOfShip.get(shipCode)
            && this.invisibleTimeOfShip.get(shipCode) > 0
            && this.invisibleCounter.has(shipCode)) {
            return;
        }
        if (timeType === GameConstans.TIMER_TYPE.INVISIBLE_TIMER) {
            // TODO:同步给后台隐身时间
            HttpRequest.asyncTimer(timeType, shipCode).then((res) => {
                if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                    this.invisibleTimeOfShip.set(shipCode, Number(res.data));
                    find('Canvas/Starmap_area/Ship_board_large/Timer_area').active = true;
                    find('Canvas/Starmap_area/Ship_board_large/Timer_area').children.forEach(timer => {
                        if (timer.name === shipCode) {
                            timer.active = true;
                        } else {
                            timer.active = false;
                        }
                    });
                    this.activeInvisibleTimer(find(`Canvas/Starmap_area/Ship_board_large/Timer_area/${shipCode}`), 'INVISIBLE ', shipCode, shipName);
                } else {
                    ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.TOAST, res.msg);
                }
            })
        }
    }

    /*
     *@Author: yozora
     *@Description: 重新启动隐身计时器
     *@Date: 2022-03-10 22:54:46
     */
    public restartTimer() {
        this.invisibleCounter.forEach((callback, key) => {
            setInterval(callback, 1000);
        });
        this.invisibleCoolCounter.forEach((callback, key) => {
            setInterval(callback, 1000);
        });
    }

    /*
     *@Author: yozora
     *@Description: 激活计时器
     *@Date: 2022-02-13 17:43:45
     */
    public activeTimer(timeType: number, node: Node, prefix: string, shipCode: string) {
        if (timeType === GameConstans.TIMER_TYPE.INVISIBLE_TIMER) {
            this.activeInvisibleTimer(node, prefix, shipCode);
        }
        if (timeType === GameConstans.TIMER_TYPE.INVISIBLE_COOL_TIMER) {
            this.activeInvisibleCoolTimer(node, prefix, shipCode);
        }
    }

    /*
     *@Author: yozora
     *@Description: 启动飞船计时器
     *@Date: 2022-02-16 15:31:50
     */
    public startShipTimer(shipCode: string, changeFlag: boolean) {
        if (this.shipTimerInfo.get(shipCode) !== null && this.shipTimerInfo.get(shipCode).length > 0) {
            this.shipTimerInfo.get(shipCode).forEach((statusInfo, index) => {
                if (this.shipTimerCounterCallback.get(shipCode) !== undefined
                    && this.shipTimerCounterCallback.get(shipCode) !== null
                    && this.shipTimerCounterCallback.get(shipCode).get(index) !== undefined
                    && this.shipTimerCounterCallback.get(shipCode).get(index) !== null) {
                    Logger.logBusiness(`${shipCode} counter ${index} is already exist.`);
                    return;
                }
                // 特殊状态: 空
                if (statusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_NULL) {
                    return;
                }
                // 特殊状态: 采集 .currentTime === -1
                if (statusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_MINING && statusInfo.currentTime === -1) {
                    ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIME_LIST.MONITOR_SHIP_STATUS, shipCode, index, this.shipTimerInfo.get(shipCode)[index], -1, true);
                }
                if (statusInfo.currentTime > 0) {
                    this.activeShipTimer(shipCode, index, changeFlag);
                }
            });
        }
    }

    /*
     *@Author: yozora
     *@Description:  激活飞船计时器
     *@Date: 2022-02-16 15:21:50
     */
    public activeShipTimer(shipCode: string, index: number, changeFlag?: boolean, evaluateTime?: number, currentTime?: number, status?: string) {
        // 样式切换FLAG
        let flag = false;
        if (changeFlag) {
            flag = true;
        }
        if (this.shipTimerInfo.has(shipCode)) {
            if (index < 0) {
                this.shipTimerInfo.get(shipCode).forEach((statusInfo, i) => {
                    if (index === -2 && statusInfo.statusNode.name === 'Ship_status_area_2') {
                        index = i;
                    }
                    if (index === -1 && statusInfo.statusNode.name === 'Ship_status_area_1') {
                        index = i;
                    }
                });
            }
            if (currentTime !== undefined) {
                this.shipTimerInfo.get(shipCode)[index].currentTime = currentTime;
            }
            if (evaluateTime !== undefined) {
                this.shipTimerInfo.get(shipCode)[index].evaluateTime = evaluateTime;
            }
            if (status !== undefined) {
                this.shipTimerInfo.get(shipCode)[index].shipStatus = status;
                flag = true;
            }
            let callback = () => {
                if (this.shipTimerInfo.get(shipCode)[index].currentTime > 0) {
                    // 通知飞船列表
                    ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIME_LIST.MONITOR_SHIP_STATUS, shipCode, index, this.shipTimerInfo.get(shipCode)[index], this.processRadio(index, shipCode), flag);
                    // 通知飞船面板
                    this.shipBoardTimerEvent(shipCode, index, flag);
                    // 通知跃迁路径
                    if (this.shipTimerInfo.get(shipCode)[index].shipStatus === GameConstans.SHIP_STATUS.SHIP_JUMP) {
                        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.CHANGE_JUMP_TIMER, shipCode, index, this.shipTimerInfo.get(shipCode)[index], this.processRadio(index, shipCode), false);
                    }
                    this.shipTimerInfo.get(shipCode)[index].currentTime--;
                } else {
                    // 后端确认是否时间结束
                    HttpRequest.confirmShipStatus(shipCode, this.shipTimerInfo.get(shipCode)[index].shipStatus).then(res => {
                        if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                            // 跃迁状态自动进入跃迁冷却状态
                            if (this.shipTimerInfo.get(shipCode)[index].shipStatus === GameConstans.SHIP_STATUS.SHIP_JUMP) {
                                clearInterval(callbackId);
                                // this.unschedule(callback);
                                this.shipTimerCounterCallback.get(shipCode).set(index, null);
                                this.shipTimerCounterId.get(shipCode).set(index, callbackId);

                                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIME_LIST.REFRESH_SHIP_STATUS, shipCode, true, null, GameConstans.SHIP_STATUS.SHIP_JUMP);
                                // 通知跃迁路径
                                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.CHANGE_JUMP_TIMER, shipCode, index, this.shipTimerInfo.get(shipCode)[index], this.processRadio(index, shipCode), true);
                            } else {
                                if (Number(res.data.currentTime) === 0) {
                                    // this.unschedule(callback);
                                    clearInterval(callbackId);
                                    // this.shipTimerCounter.get(shipCode).set(index, null);
                                    this.shipTimerCounterCallback.get(shipCode).set(index, null);
                                    this.shipTimerCounterId.get(shipCode).set(index, callbackId);

                                    if (this.shipTimerInfo.get(shipCode)[index].shipStatus === GameConstans.SHIP_STATUS.SHIP_JUMP_COOLING || this.shipTimerInfo.get(shipCode)[index].shipStatus === GameConstans.SHIP_STATUS.SHIP_FLIGHT) {
                                        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIME_LIST.REFRESH_SHIP_STATUS, shipCode, false, index, GameConstans.SHIP_STATUS.SHIP_JUMP_COOLING);
                                    }
                                    else if (this.shipTimerInfo.get(shipCode)[index].shipStatus === GameConstans.SHIP_STATUS.SHIP_OCCUPYING) {
                                        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIME_LIST.REFRESH_SHIP_STATUS, shipCode, false, index, GameConstans.SHIP_STATUS.SHIP_OCCUPYING);
                                        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.RESET_SHIP_BOARD_BUTTON, GameConstans.RESET_TYPE.PLANET.STOP_OCCUPY, true);
                                    }
                                    else {
                                        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIME_LIST.REFRESH_SHIP_STATUS, shipCode, false, index);
                                    }
                                } else {
                                    this.shipTimerInfo.get(shipCode)[index].currentTime = Number(res.data.currentTime);
                                }
                            }
                        } else {
                            // this.unschedule(callback);
                            clearInterval(callbackId);
                            // this.shipTimerCounter.get(shipCode).set(index, null);
                            this.shipTimerCounterCallback.get(shipCode).set(index, null);
                            this.shipTimerCounterId.get(shipCode).set(index, callbackId);
                        }
                    }).catch(err => {
                        console.error(err);
                        // this.unschedule(callback);
                        clearInterval(callbackId);
                        // this.shipTimerCounter.get(shipCode).set(index, null);
                        this.shipTimerCounterCallback.get(shipCode).set(index, null);
                        this.shipTimerCounterId.get(shipCode).set(index, callbackId);
                    });
                }
            };
            const callbackId = setInterval(callback, 1000);
            // 记录已运行计时器
            if (this.shipTimerCounterCallback.get(shipCode) === undefined || this.shipTimerCounterCallback.get(shipCode) === null) {
                const timerCouner = new Map<number, () => void>();
                const timerCounerId = new Map<number, number>();
                timerCouner.set(index, callback);
                timerCounerId.set(index, callbackId);
                this.shipTimerCounterCallback.set(shipCode, timerCouner);
                this.shipTimerCounterId.set(shipCode, timerCounerId);
            } else {
                this.shipTimerCounterCallback.get(shipCode).set(index, callback);
                this.shipTimerCounterId.get(shipCode).set(index, callbackId);
            }
            Logger.logBusiness(this.shipTimerCounterCallback);
            // this.schedule(callback, 1);
        }
    }

    /*
     *@Author: yozora
     *@Description: 停止飞船计时器
     *@Date: 2022-02-17 16:52:36
     */
    public stopShipTimer(shipCode: string, status: string) {
        let index = -1;
        if (this.shipTimerInfo.has(shipCode)) {
            this.shipTimerInfo.get(shipCode).forEach((statusInfo, i) => {
                // 寻找对应状态的计时器
                if (statusInfo.shipStatus === status) {
                    index = i;
                }
            });
            this.shipTimerInfo.get(shipCode)[index].currentTime = 0;
            this.shipTimerInfo.get(shipCode)[index].evaluateTime = 0;
        }
    }

    /*
     *@Author: yozora
     *@Description: 取消隐身计时器
     *@Date: 2022-02-20 23:58:46
     */
    public cancelInvisibleShip(shipCode: string) {
        if (this.invisibleCounter.get(shipCode)) {
            this.unschedule(this.invisibleCounter.get(shipCode));
            HttpRequest.asyncTimer(GameConstans.TIMER_TYPE.INVISIBLE_TIMER, shipCode, 0).then((res) => {
                if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                    this.invisibleTimeOfShip.set(shipCode, 0);
                    this.invisibleCounter.delete(shipCode);
                } else {
                    ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.TOAST, res.msg);
                }
            })
        }
    }

    /*
    *@Author: yozora
    *@Description: 获取隐身时间
    *@Date: 2022-02-13 17:10:35
    */
    public getInvisibleTime(shipCode: string) {
        return this.invisibleTimeOfShip.get(shipCode);
    }

    /*
     *@Author: yozora
     *@Description: 获取隐身冷却时间
     *@Date: 2022-02-13 17:07:17
     */
    public getInvisibleCoolTime(shipCode: string) {
        return this.invisibleCoolTimeOfShip.get(shipCode);
    }

    /*
     *@Author: yozora
     *@Description: 根据UI位置获取计时器信息
     *@Date: 2022-02-17 18:46:14
     */
    public getShipTimer(shipCode: string, index: number): ShipStatusInfo {
        if (this.shipTimerInfo.has(shipCode)) {
            if (index < 0) {
                this.shipTimerInfo.get(shipCode).forEach((statusInfo, i) => {
                    if (index === -2 && statusInfo.statusNode.name === 'Ship_status_area_2') {
                        index = i;
                    }
                    if (index === -1 && statusInfo.statusNode.name === 'Ship_status_area_1') {
                        index = i;
                    }
                });
            }
            return this.shipTimerInfo.get(shipCode)[index];
        } else {
            return null;
        }
    }

    /*
     *@Author: yozora
     *@Description: 初始化飞船面板计时样式
     *@Date: 2022-02-21 16:00:40
     */
    public initGetShipBoadrTimer(shipCode: string, index: number) {
        if (this.shipTimerInfo.has(shipCode)) {
            if (index < 0) {
                this.shipTimerInfo.get(shipCode).forEach((statusInfo, i) => {
                    if (index === -2 && statusInfo.statusNode.name === 'Ship_status_area_2') {
                        index = i;
                    }
                    if (index === -1 && statusInfo.statusNode.name === 'Ship_status_area_1') {
                        index = i;
                    }
                });
            }
            this.shipBoardTimerEvent(shipCode, index, true);
        } else {
            return null;
        }
    }

    /*
     *@Author: yozora
     *@Description: 获取飞船状态数组位置
     *@Date: 2022-02-20 22:10:04
     */
    public getShipStatusIndex(shipCode: string, index: number): number {
        if (this.shipTimerInfo.has(shipCode)) {
            if (index < 0) {
                this.shipTimerInfo.get(shipCode).forEach((statusInfo, i) => {
                    if (index === -2 && statusInfo.statusNode.name === 'Ship_status_area_2') {
                        index = i;
                    }
                    if (index === -1 && statusInfo.statusNode.name === 'Ship_status_area_1') {
                        index = i;
                    }
                });
            }
            return index;
        } else {
            return null;
        }
    }

    /*
     *@Author: yozora
     *@Description: 获取飞船状态
     *@Date: 2022-02-18 13:56:51
     */
    public getShipStatusList(shipCode: string) {
        return this.shipTimerInfo.get(shipCode);
    }

    /*
    *@Author: yozora
    *@Description: 获取飞船状态
    *@Date: 2022-02-18 13:56:51
    */
    public setShipStatusList(shipCode: string, shipStatusList: ShipStatusInfo[]) {
        return this.shipTimerInfo.set(shipCode, [...shipStatusList]);
    }

    /*
     *@Author: yozora
     *@Description: 重置飞船计时器回调
     *@Date: 2022-03-10 22:22:58
     */
    public resetTimer() {
        this.unscheduleAllCallbacks();
        for (let value of this.shipTimerCounterId.values()) {
            for (let counterId of value.values()) {
                clearInterval(counterId);
            }
            // console.log('clearInterval');
        }
        this.shipTimerInfo.clear();
        // this.shipTimerCounter.clear();
        this.shipTimerCounterCallback.clear();
        this.shipTimerCounterId.clear();
        this.invisibleTimeOfShip.clear();
        this.invisibleCounter.clear();
        this.invisibleCoolTimeOfShip.clear();
        this.invisibleCoolCounter.clear();
    }

    /*
     *@Author: yozora
     *@Description: 激活隐身冷却
     *@Date: 2022-03-07 23:58:31
     */
    public activeInvisibleCool(node: Node, shipCode: string, positive: boolean = true) {
        // 进入隐身冷却状态
        this.invisibleCoolTimeOfShip.set(shipCode, this.initInvisibleCoolTime);
        this.activeInvisibleCoolTimer(node.getChildByName(shipCode), 'INVISIBLE CD ', shipCode, positive);
    }

    /*
     *@Author: yozora
     *@Description: 激活隐身计时器
     *@Date: 2022-02-13 17:43:59
     */
    public activeInvisibleTimer(node: Node, prefix: string, shipCode: string, shipName?: string) {
        // console.log("invisibleCounter: ", this.invisibleCounter.has(shipCode));
        if (this.invisibleCounter.has(shipCode)) {
            return;
        }
        // 计时器函数
        let invisibleTimeCounter = () => {
            node.getComponent(Label).string = prefix + this.invisibleTimeOfShip.get(shipCode).toString();
            this.invisibleTimeOfShip.set(shipCode, this.invisibleTimeOfShip.get(shipCode) - 1);
            if (this.invisibleTimeOfShip.get(shipCode) < 0) {
                this.invisibleTimeOfShip.set(shipCode, 0);
                this.changeInvisibleCool(node, shipCode, shipName);
                this.invisibleCounter.delete(shipCode);
                // console.log('remove invisible: ', this.invisibleCounter.get(shipCode));
                this.unschedule(invisibleTimeCounter);
            }
        }
        this.invisibleCounter.set(shipCode, invisibleTimeCounter);
        this.schedule(invisibleTimeCounter, 1);
    }

    /*
     *@Author: yozora
     *@Description: 激活隐身冷却计时器
     *@Date: 2022-02-14 15:06:35
     */
    public activeInvisibleCoolTimer(node: Node, prefix: string, shipCode: string, positive: boolean = true) {
        // console.log("invisibleCoolCounter: ", this.invisibleCoolCounter.has(shipCode));
        if (this.invisibleCoolCounter.has(shipCode)) {
            return;
        }
        // 通知后台同步数据
        HttpRequest.asyncTimer(GameConstans.TIMER_TYPE.INVISIBLE_COOL_TIMER, shipCode).then((res) => {
            if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                // 禁用按钮
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIME_LIST.INIT_BOARD_BUTTON_STATUS, false);
                this.invisibleCoolTimeOfShip.set(shipCode, Number(res.data));
                // 启动计时器
                let invisibleCoolTimeCounter = () => {
                    node.getComponent(Label).string = prefix + this.invisibleCoolTimeOfShip.get(shipCode).toString();
                    this.invisibleCoolTimeOfShip.set(shipCode, this.invisibleCoolTimeOfShip.get(shipCode) - 1);
                    if (this.invisibleCoolTimeOfShip.get(shipCode) < 0) {
                        this.invisibleCoolTimeOfShip.set(shipCode, 0);
                        // 激活按钮
                        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIME_LIST.INIT_BOARD_BUTTON_STATUS);
                        this.invisibleCoolCounter.delete(shipCode);
                        // console.log('remove invisibleCool: ', this.invisibleCoolCounter.get(shipCode));
                        this.unschedule(invisibleCoolTimeCounter);
                    }
                }
                this.schedule(invisibleCoolTimeCounter, 1);
                this.invisibleCoolCounter.set(shipCode, invisibleCoolTimeCounter);
            } else {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.TOAST, res.msg);
            }
        })
    }

    /*
     *@Author: yozora
     *@Description: 进入隐身冷却状态
     *@Date: 2022-02-21 16:21:10
     */
    private changeInvisibleCool(node: Node, shipCode: string, shipName: string) {
        // 显示强制关闭弹窗
        ClientEvent.dispatchEvent(
            GameConstans.CLIENTEVENT_DIALOG_LIST.CHANGE_DIALOG,
            GameConstans.DIALOG_TYPE.TIMEOUT,
            GameConstans.TIPS_CONTENT.INVISIBLE_TIMEOUT.replace('@', shipName),
            shipCode);
        // 进入隐身冷却状态
        this.invisibleCoolTimeOfShip.set(shipCode, this.initInvisibleCoolTime);
        this.activeInvisibleCoolTimer(node, 'INVISIBLE CD ', shipCode);
    }

    /*
     *@Author: yozora
     *@Description: 飞船面板监听计时器
     *@Date: 2022-02-18 11:31:06
     */
    private shipBoardTimerEvent(shipCode: string, index: number, flag: boolean) {
        if (this.shipTimerInfo.get(shipCode)[index].shipStatus === GameConstans.SHIP_STATUS.SHIP_JUMP
            || this.shipTimerInfo.get(shipCode)[index].shipStatus === GameConstans.SHIP_STATUS.SHIP_FLIGHT
            || this.shipTimerInfo.get(shipCode)[index].shipStatus === GameConstans.SHIP_STATUS.SHIP_JUMP_COOLING) {
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIME_LIST.MONITOR_SHIP_STATUS_1, shipCode, index, this.shipTimerInfo.get(shipCode)[index], this.processRadio(index, shipCode), flag);
        }
        if (this.shipTimerInfo.get(shipCode)[index].shipStatus === GameConstans.SHIP_STATUS.SHIP_OCCUPYING) {
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIME_LIST.MONITOR_SHIP_STATUS_2, shipCode, index, this.shipTimerInfo.get(shipCode)[index], this.processRadio(index, shipCode), flag);
        }
    }

    /*
    *@Author: yozora
    *@Description: 进度条六等分
    *@Date: 2021-12-09 23:05:40
    */
    private processRadio(index: number, shipCode: string) {
        let count;
        let fillRange;
        if (this.shipTimerInfo.get(shipCode)[index].evaluateTime != 0) {
            const radio = (this.shipTimerInfo.get(shipCode)[index].currentTime) / this.shipTimerInfo.get(shipCode)[index].evaluateTime;
            if (radio >= 0.833) {
                count = 6;
                fillRange = 1;
            }
            if (0.833 > radio && radio >= 0.664) {
                count = 5;
                fillRange = 0.845;
            }
            if (0.664 > radio && radio >= 0.498) {
                count = 4;
                fillRange = 0.68;
            }
            if (0.498 > radio && radio >= 0.332) {
                count = 3;
                fillRange = 0.515;

            }
            if (0.332 > radio && radio >= 0.166) {
                count = 2;
                fillRange = 0.345;
            }
            if (0.166 > radio && radio > 0) {
                count = 1;
                fillRange = 0.175;
            }
            if (radio === 0) {
                count = 0;
                fillRange = 0;
            }
        } else {
            count = 0;
            fillRange = 0;
        }
        // if (count !== this.shipTimerInfo.get(shipCode)[index].statusRate) {
        this.shipTimerInfo.get(shipCode)[index].statusRate = count;
        return fillRange;
        // }
    }

    /*
     *@Author: yozora
     *@Description: 初始化隐身冷却计时器
     *@Date: 2022-03-11 15:58:15
     */
    private initInvisibleCoolTimer(node: Node, prefix: string, shipCode: string) {
        if (this.invisibleCoolCounter.has(shipCode)) {
            return;
        }
        // 禁用按钮
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIME_LIST.INIT_BOARD_BUTTON_STATUS, false);
        // 启动计时器
        let invisibleCoolTimeCounter = () => {
            node.getComponent(Label).string = prefix + this.invisibleCoolTimeOfShip.get(shipCode).toString();
            this.invisibleCoolTimeOfShip.set(shipCode, this.invisibleCoolTimeOfShip.get(shipCode) - 1);
            if (this.invisibleCoolTimeOfShip.get(shipCode) < 0) {
                this.invisibleCoolTimeOfShip.set(shipCode, 0);
                // 激活按钮
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIME_LIST.INIT_BOARD_BUTTON_STATUS);
                this.invisibleCoolCounter.delete(shipCode);
                // console.log('remove init invisibleCool: ', this.invisibleCoolCounter.get(shipCode));
                this.unschedule(invisibleCoolTimeCounter);
            }
        }
        this.schedule(invisibleCoolTimeCounter, 1);
        this.invisibleCoolCounter.set(shipCode, invisibleCoolTimeCounter);
    }

    /*
     *@Author: yozora
     *@Description: 初始化计时器
     *@Date: 2022-02-14 16:00:08
     */
    private initTimer() {
        HttpRequest.getTimer().then((res) => {
            if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                if (res.data.INVISIBLE) {
                    for (let shipCode in res.data.INVISIBLE) {
                        this.invisibleTimeOfShip.set(shipCode, res.data.INVISIBLE[shipCode] <= 0 ? 0 : res.data.INVISIBLE[shipCode]);
                        if (res.data.INVISIBLE[shipCode] > 0) {
                            if (find(`Canvas/Starmap_area/Ship_board_large/Timer_area`).getChildByName(shipCode) === null) {
                                const time = instantiate(this.Cooling_label);
                                time.name = shipCode;
                                find(`Canvas/Starmap_area/Ship_board_large/Timer_area`).addChild(time);
                            }
                            this.activeInvisibleTimer(find(`Canvas/Starmap_area/Ship_board_large/Timer_area/${shipCode}`), 'INVISIBLE ', shipCode, shipCode);
                        }
                    }
                }
                if (res.data.INVISIBLE_COOL) {
                    for (let shipCode in res.data.INVISIBLE_COOL) {
                        this.invisibleCoolTimeOfShip.set(shipCode, res.data.INVISIBLE_COOL[shipCode] <= 0 ? 0 : res.data.INVISIBLE_COOL[shipCode]);
                        if (res.data.INVISIBLE_COOL[shipCode] > 0) {
                            if (find(`Canvas/Starmap_area/Ship_board_large/Timer_area`).getChildByName(shipCode) === null) {
                                const time = instantiate(this.Cooling_label);
                                time.name = shipCode;
                                find(`Canvas/Starmap_area/Ship_board_large/Timer_area`).addChild(time);
                            }
                            this.initInvisibleCoolTimer(find(`Canvas/Starmap_area/Ship_board_large/Timer_area/${shipCode}`), 'INVISIBLE CD ', shipCode);
                        }
                    }
                }
            }
        }).catch((err) => {
            console.log(err);
        });
    }

}
