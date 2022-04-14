
import { _decorator, Component, Node, Prefab, instantiate, Vec3, Sprite, resources, SpriteFrame, Label, SpriteAtlas, Button, EventMouse, find, EventTouch, Tween, tween, Mask, Toggle, UITransform, Animation, AnimationClip, Game, Color, Layers } from 'cc';
import { DataManager } from '../../DataManager';
import { GameConstans } from '../../entity/GameConstans';
import { ShipListDetail } from '../../entity/ShipListDetail';
import { ShipListInfo } from '../../entity/ShipListInfo';
import { ShipStatusInfo } from '../../entity/ShipStatusInfo';
import { GameManager } from '../../GameManager';
import { ClientEvent } from '../../utils/ClientEvent';
import { HttpRequest } from '../../utils/HttpRequest';
import { Logger } from '../../utils/Logger';
import { TimerManager } from '../common/TimerManager';
import { ShipBoardLarge } from './ShipBoardLarge';
import { ShipCard } from './ShipCard';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = HangarShipList
 * DateTime = Sun Nov 21 2021 23:19:04 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = HangarShipList.ts
 * FileBasenameNoExtension = HangarShipList
 * URL = db://assets/script/ui/HangarShipList.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * 机库UI管理
 */

@ccclass('ShipList')
export class ShipList extends Component {

    /*
     * 飞船卡片预制体
     */
    @property({ type: Prefab })
    private shipCard: Prefab = null;

    /*
     * 飞船闲置状态
     */
    @property({ type: SpriteFrame })
    private idleSpriteFrame: SpriteFrame = null;

    /*
     * 飞船攻击状态
     */
    @property({ type: SpriteFrame })
    private attackSpriteFrame: SpriteFrame = null;

    /*
     * 飞船采集状态
     */
    @property({ type: SpriteFrame })
    private collectSpriteFrame: SpriteFrame = null;

    /*
     * 飞船占领状态
     */
    @property({ type: SpriteFrame })
    private occupySpriteFrame: SpriteFrame = null;

    /*
     * 飞船跃迁状态
     */
    @property({ type: SpriteFrame })
    private jumpSpriteFrame: SpriteFrame = null;

    /*
     * 顶部文字区域
     */
    private topLabel: Node = null;

    /*
     * 飞船列表信息
     */
    private shipListInfo: ShipListInfo = null;

    /*
    * 动态卡片位置
    */
    private _initCardPos: Vec3 = new Vec3(-29, 490.5, 0);

    /*
     * 卡片水平偏移
     */
    private _horizontalOffset: number = 30.25;

    /*
     * 卡片垂直偏移
     */
    private _verticalOffset: number = 109;

    /*
     * 动态卡片位置
     */
    private _activeCardPos: Vec3 = new Vec3();

    /*
     * 加载数据中
     */
    private scollLoading: boolean = false;

    /*
     * 当前选中飞船卡片索引
     */
    private _curSelectShipCard: number = 0;

    /*
     * 当前选中飞船卡片索引
     */
    public _clickedShipCardIndex: number = -1;

    /*
     * 当前加载页码
     */
    private curLoadPage: number = 0;

    /*
     * 卡片当前页码
     */
    private _cardPage: number = 1;

    /*
     * 上边界
     */
    private _topBorder: number = 0;

    /*
     * 下边界
     */
    private _buttomBorder: number = 0;

    /*
     * 缓动队列
     */
    private tweenPositions: Vec3[] = [];

    private tweenTotalCount: number = 0;

    private tweenCurrentCount: number = 0;

    private collectTween: Map<number, Tween<Sprite>> = new Map();

    /*
     * 查询飞船状态
     */
    private queryShipStatus: number = -1;

    /*
     * 查询飞船排序
     */
    private queryShipOrder: string = "strength";

    /*
     * 计时器管理脚本
     */
    private timerManager: TimerManager = null;

    private firstLoad: boolean = true;

    start() {
        this.initShipCard();
        ClientEvent.on(GameConstans.CLIENTEVENT_LIST.CLICK_SHIP_CARD, this.selectShipDetailBoard, this);
        ClientEvent.on(GameConstans.CLIENTEVENT_LIST.HOVER_SHIP_CARD, this.selectShipBoard, this);
        ClientEvent.on(GameConstans.CLIENTEVENT_LIST.CHANGE_SHIP_CARD_INFO, this.changeShipCardInfo, this);
        ClientEvent.on(GameConstans.CLIENTEVENT_LIST.STOP_SHIP_COLLECT, this.stopShipCollet, this);
        ClientEvent.on(GameConstans.CLIENTEVENT_TIME_LIST.MONITOR_SHIP_STATUS, this.monitorShipStatus, this);
        // ClientEvent.on(GameConstans.CLIENTEVENT_UI_LIST.MOVE_LEFT_BAR_CONTENT, this.moveLeftBarContent, this);

    }

    /*
     *@Author: yozora
     *@Description: 鼠标滚轮事件
     *@Date: 2021-11-23 15:12:39
     */
    private async onMouseWheel(e: EventMouse) {
        if (!this.scollLoading && this.tweenCurrentCount === this.tweenTotalCount) {
            // 判断是否加载数据(滚动5条后加载)
            if (e.getScrollY() < 0 && this.shipListInfo.pageNum < this.shipListInfo.totalPage && this._curSelectShipCard % 10 === 0) {
                const loadPageNum = this._curSelectShipCard / 10 + 1;
                // 已加载页数
                if (this.shipListInfo.pageNum <= loadPageNum) {
                    this.activeLoading();
                    await this.loadShipCard();
                    this.closeLoading();
                }
            }
            let direction;
            if (e.getScrollY() > 0) {
                // 向下滚动
                this._curSelectShipCard -= 1;
                direction = -1;
            } else {
                // 向上滚动
                this._curSelectShipCard += 1;
                direction = 1;
            }

            // 上边界
            if (this._curSelectShipCard < this._topBorder) {
                this._curSelectShipCard = this._topBorder;
                return;
            }
            // 下边界
            if (this._curSelectShipCard > this._buttomBorder - 1) {
                this._curSelectShipCard = this._buttomBorder - 1;
                return;
            }

            this.scollCard(direction);
            this.processPageInfo();
        }
    }

    /*
     *@Author: yozora
     *@Description: 修改当前激活飞船卡片
     *@Date: 2022-03-02 23:15:48
     */
    private moveLeftBarContent() {
        console.log("change ship card.");
        if (find('GameManager/').getComponent(GameManager)._activeType === GameConstans.SCENCE_TYPE.STARMAP) {
            if (this.node.parent.active) {
                this.node.getChildByName('Ship_list_mask').children.forEach((shipCard: Node) => {
                    shipCard.active = true;
                })
            }
        }
        if (find('GameManager/').getComponent(GameManager)._activeType === GameConstans.SCENCE_TYPE.SOLAR_SYSTEM) {
            if (this.node.parent.active) {
                this.node.getChildByName('Ship_list_mask').children.forEach((shipCard: Node) => {
                    const index = Number(shipCard.name.split("shipCard")[1]);
                    if (this.shipListInfo.shipListInfos[index].solarSystemCode !== find('DataManager').getComponent(DataManager).getSolarSystemCode()) {
                        shipCard.active = false;
                    }
                })
            }
        }
        if (find('GameManager/').getComponent(GameManager)._activeType === GameConstans.SCENCE_TYPE.PLANET) {
            if (this.node.parent.active) {
                this.node.getChildByName('Ship_list_mask').children.forEach((shipCard: Node) => {
                    const index = Number(shipCard.name.split("shipCard")[1]);
                    if (this.shipListInfo.shipListInfos[index].planetCode !== find('DataManager').getComponent(DataManager).getPlanetCode()) {
                        shipCard.active = false;
                    }
                })
            }
        }
    }

    /*
     *@Author: yozora
     *@Description: click卡片显示飞船详细面板
     *@Date: 2021-11-24 23:38:03
     */
    private selectShipDetailBoard(nodeNmae: string) {
        if (this.shipListInfo) {
            // 获取卡片index
            if (this._clickedShipCardIndex === Number(nodeNmae.split("shipCard")[1])) {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.SELECT_SHIP_DETAIL_BOARD, null, false);
                this._clickedShipCardIndex = -1;
            } else {
                this._clickedShipCardIndex = Number(nodeNmae.split("shipCard")[1]);
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.SELECT_SHIP_DETAIL_BOARD, this.shipListInfo.shipListInfos[this._clickedShipCardIndex], true, this._clickedShipCardIndex);
            }
        }
    }

    /*
     *@Author: yozora
     *@Description: Hover卡片显示飞船面板
     *@Date: 2021-11-29 16:50:42
     */
    private selectShipBoard(nodeNmae: string, isShow: boolean) {
        if (this.shipListInfo) {
            // 获取卡片index
            const index = nodeNmae.split("shipCard")[1];
            // 1.显示提示框 2.显示跃迁路径
            let tooltipType: number = 1;
            // this.shipListInfo.shipListInfos[index].shipStatusInfoList.find(item => {
            //     if (item.shipStatus === GameConstans.SHIP_STATUS.SHIP_JUMP) {
            //         tooltipType = 2;
            //     }
            // });
            // 太阳系工具栏
            if (tooltipType === 1) {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.SELECT_SHIP_BOARD, this.shipListInfo.shipListInfos[index], isShow, index);
            }
            // 跃迁路径
            if (tooltipType === 2) {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.SELECT_SHIP_BOARD, this.shipListInfo.shipListInfos[index], isShow, index);
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.CHANGE_JUMP_ROAD, this.shipListInfo.shipListInfos[index], isShow, index);
            }
        }
    }


    /*
     *@Author: yozora
     *@Description: 滚动卡片 direction(-1:向下滚动，1:向上滚动)
     *@Date: 2021-11-23 15:11:26
     */
    private scollCard(direction: number, scollOffset: number = 1) {
        // 滚动
        let shipCount = this.shipListInfo.shipListInfos.length;
        for (let index = 0; index < shipCount; index++) {
            this.node.getChildByName("Ship_list_mask").getChildByName(`shipCard${index}`).getPosition(this._activeCardPos);
            // 向上滚动
            if (direction === 1) {
                this.node.getChildByName("Ship_list_mask").getChildByName(`shipCard${index}`).getComponent(ShipCard).ship_index--;
            } else {
                this.node.getChildByName("Ship_list_mask").getChildByName(`shipCard${index}`).getComponent(ShipCard).ship_index++;
            }
            const pos: Vec3 = this.processShipIndexForPosition(this.node.getChildByName("Ship_list_mask").getChildByName(`shipCard${index}`).getComponent(ShipCard).ship_index.toString());
            this.node.getChildByName("Ship_list_mask").getChildByName(`shipCard${index}`).setPosition(pos.x, this._activeCardPos.y + (direction * scollOffset * this._verticalOffset), this._activeCardPos.z);
            // this.tweenPositions.push(new Vec3(pos.x, this._activeCardPos.y + (direction * scollOffset * this._verticalOffset), this._activeCardPos.z));
        }
        // this.tweenCurrentCount = 0;
        // this.tweenTotalCount = this.tweenPositions.length;
        // for (let index = 0; index < this.tweenPositions.length; index++) {
        //     tween(this.node.getChildByName("Ship_list_mask").getChildByName(`shipCard${index}`))
        //         .to(0.005, { position: this.tweenPositions[index] }, {
        //             easing: 'quadIn',
        //             'onComplete': () => {
        //                 this.tweenCurrentCount++;
        //             }
        //         }).start();
        // }
        // this.tweenPositions = [];
    }

    /*
     *@Author: yozora
     *@Description: 翻页滚动
     *@Date: 2021-11-24 18:53:10
     */
    private pageCard(direction: number, scollOffset: number = 1) {
        // 滚动
        this.activeLoading();
        let shipCount = this.shipListInfo.shipListInfos.length;
        for (let index = 0; index < shipCount; index++) {
            this.node.getChildByName("Ship_list_mask").getChildByName(`shipCard${index}`).getPosition(this._activeCardPos);
            // 向上滚动
            if (direction === 1) {
                this.node.getChildByName("Ship_list_mask").getChildByName(`shipCard${index}`).getComponent(ShipCard).ship_index--;
            } else {
                this.node.getChildByName("Ship_list_mask").getChildByName(`shipCard${index}`).getComponent(ShipCard).ship_index++;
            }
            const pos: Vec3 = this.processShipIndexForPosition(this.node.getChildByName("Ship_list_mask").getChildByName(`shipCard${index}`).getComponent(ShipCard).ship_index.toString());
            // this.node.getChildByName("Ship_list_mask").getChildByName(`shipCard${index}`).setPosition(pos);
            this.node.getChildByName("Ship_list_mask").getChildByName(`shipCard${index}`).setPosition(new Vec3(pos.x, this._activeCardPos.y + (direction * scollOffset * this._verticalOffset), this._activeCardPos.z));
        }
        this.closeLoading();
    }

    /*
     *@Author: yozora
     *@Description: 处理对称坐标
     *@Date: 2022-01-05 17:10:29
     */
    private processShipIndexForPosition(ship_index: string) {
        let _ship_index: string;
        _ship_index = ship_index.substring(ship_index.length - 1, ship_index.length)
        if (_ship_index.lastIndexOf("1") !== -1 || _ship_index.lastIndexOf("0") !== -1) {
            return new Vec3(-29, 490.5, 0);
        }
        if (_ship_index.lastIndexOf("2") !== -1 || _ship_index.lastIndexOf("9") !== -1) {
            return new Vec3(18, 381.5, 0);
        }
        if (_ship_index.lastIndexOf("3") !== -1 || _ship_index.lastIndexOf("8") !== -1) {
            return new Vec3(56, 272.5, 0);
        }
        if (_ship_index.lastIndexOf("4") !== -1 || _ship_index.lastIndexOf("7") !== -1) {
            return new Vec3(80, 163.5, 0);
        }
        if (_ship_index.lastIndexOf("5") !== -1 || _ship_index.lastIndexOf("6") !== -1) {
            return new Vec3(92, 54.5, 0);
        }
    }

    /*
     *@Author: yozora
     *@Description: 从上至下开始初始化飞船卡片信息
     *@Date: 2021-11-21 23:22:23
     */
    private initShipCard() {
        this.activeLoading();
        this.firstLoad = true;
        if (!this.topLabel) {
            this.topLabel = this.node.getChildByName("Top_label_area");
        }
        // 重置数据
        this.node.getChildByName("Ship_list_mask").removeAllChildren();
        this._curSelectShipCard = 0;
        this._clickedShipCardIndex = -1;
        this._initCardPos = new Vec3(-29, 490.5, 0);

        this._topBorder = 0;
        this._buttomBorder = 0;
        this.shipListInfo === null;
        const tweenArray: Node[] = [];
        // 获取计时器信息
        find(`Canvas/Starmap_area/Ship_board_large`).getComponent(ShipBoardLarge).resetLastShip();
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIME_LIST.INIT_INVISIBLE_TIME);
        this.timerManager = find("TimerManager").getComponent(TimerManager);
        this.timerManager.resetTimer();
        // 获取飞船列表
        HttpRequest.getShipList(find('DataManager').getComponent(DataManager).getUserAddress(), 1, 10, this.queryShipStatus, this.queryShipOrder).then((res) => {
            if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                this.shipListInfo = res.data;
                let shipCount = this.shipListInfo.shipListInfos.length;
                // 卡片方向(1:向内，-1:向外)
                let i: number = 1;
                for (let index = 0; index < shipCount; index++) {
                    // 创建飞船卡片
                    const shipCard = instantiate(this.shipCard);
                    shipCard.layer = Layers.Enum.UI_2D;
                    shipCard.name = `shipCard${index}`;
                    // 设置飞船卡片内容
                    this.processShipCardContent(shipCard, this.shipListInfo.shipListInfos, index, index);
                    if (index > 0) {
                        const pos = this.processShipIndexForPosition(shipCard.getComponent(ShipCard).ship_index.toString());
                        shipCard.setPosition(new Vec3(pos.x + 430, this._initCardPos.y - (this._verticalOffset), this._initCardPos.z));
                    } else {
                        const pos = this._initCardPos;
                        pos.x = pos.x + 430;
                        shipCard.setPosition(pos);
                    }
                    // 默认选中
                    shipCard.active = true;
                    this.node.getChildByName("Ship_list_mask").addChild(shipCard);
                    shipCard.getPosition(this._initCardPos);
                    this._buttomBorder += 1;
                    tweenArray.push(shipCard);
                }
                // 缓动队列
                this.tweenCard(tweenArray, 0);
                this.processPageInfo();
                this.curLoadPage = 1;
            } else {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.TOAST, res.msg);
            }
            this.closeLoading();
        }).catch((err) => {
            console.error(err);
        });
    }

    /*
     *@Author: yozora
     *@Description: 卡片进入卡槽
     *@Date: 2022-01-10 14:31:30
     */
    private tweenCard(tweenArray: Node[], index: number) {
        tween(tweenArray[index])
            .by(0.1, { position: new Vec3(-430, 0, 0) }, {
                easing: 'circOut',
                'onComplete': () => {
                    if (index < tweenArray.length - 1) {
                        this.tweenCard(tweenArray, index + 1);
                    } else {
                        this.node.on(Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
                    }
                }
            }).start();
    }

    /*
     *@Author: yozora
     *@Description: 加载分页数据
     *@Date: 2021-11-23 17:59:23
     */
    private async loadShipCard() {
        // 获取飞船列表
        await HttpRequest.getShipList(find('DataManager').getComponent(DataManager).getUserAddress(), this.shipListInfo.pageNum + 1, this.shipListInfo.pageSize, this.queryShipStatus, this.queryShipOrder).then((res) => {
            // 新增数据
            const shipList: ShipListInfo = res.data;
            let shipCount = shipList.shipListInfos.length;
            if (shipCount > 0) {
                for (let index = (this.shipListInfo.pageSize * this.shipListInfo.pageNum); index < (this.shipListInfo.pageSize * this.shipListInfo.pageNum) + shipCount; index++) {
                    // 位置向上推移
                    let shipIndex = index;
                    if (!this.firstLoad && index - (this.shipListInfo.pageSize * this.shipListInfo.pageNum) === 0) {
                        this._initCardPos.y = this._initCardPos.y + (this._verticalOffset * 10);
                    }
                    if (!this.firstLoad) {
                        shipIndex = ((this.shipListInfo.pageNum - 1) * 10) + index;
                    }
                    // 创建飞船卡片
                    const shipCard = instantiate(this.shipCard);
                    shipCard.name = `shipCard${index}`;
                    shipCard.layer = Layers.Enum.UI_2D;
                    // 设置飞船卡片内容
                    this.processShipCardContent(shipCard, shipList.shipListInfos, index - (this.shipListInfo.pageSize * this.shipListInfo.pageNum), shipIndex);
                    shipCard.setPosition(this._initCardPos.x - (this._horizontalOffset), this._initCardPos.y - (this._verticalOffset), this._initCardPos.z);
                    this.node.getChildByName("Ship_list_mask").addChild(shipCard);
                    shipCard.getPosition(this._initCardPos);
                    this._buttomBorder += 1;
                    this.shipListInfo.shipListInfos.push(shipList.shipListInfos[index - (this.shipListInfo.pageSize * this.shipListInfo.pageNum)]);
                }
                this.shipListInfo.pageNum = shipList.pageNum;
                if (this.firstLoad) {
                    this.firstLoad = false;
                }
                return true;
            } else {
                return false;
            }
        }).catch((err) => {
            console.error(err);
        });
    }

    /*
     *@Author: yozora
     *@Description: 刷新飞船信息
     *@Date: 2022-02-22 16:44:05
     */
    private changeShipCardInfo(shipListInfos: ShipListDetail[], shipIndex: number, currentShipCode: string) {
        // console.log('new shipListInfos', shipListInfos);
        this.shipListInfo.shipListInfos[shipIndex] = shipListInfos[0];
        // console.log('change shipInfo: ', this.shipListInfo.shipListInfos[shipIndex]);
        const shipStatusInfos = this.shipListInfo.shipListInfos[shipIndex].shipStatusInfoList;
        if (shipStatusInfos.length < 2) {
            const newStatusInfo = shipStatusInfos[0];
            // 2号状态位置
            if (newStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_IDLE
                || newStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_JUMP
                || newStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_FLIGHT
                || newStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_JUMP_COOLING) {
                this.timerManager.getShipStatusList(this.shipListInfo.shipListInfos[shipIndex].shipCode).forEach((oldStatusInfo) => {
                    // 替换旧的状态
                    if (oldStatusInfo.statusNode.name === 'Ship_status_area_2') {
                        oldStatusInfo.shipStatus = newStatusInfo.shipStatus;
                        oldStatusInfo.currentTime = newStatusInfo.currentTime;
                        oldStatusInfo.evaluateTime = newStatusInfo.evaluateTime;
                        oldStatusInfo.statusRate = newStatusInfo.statusRate;
                    }
                    if (oldStatusInfo.statusNode.name === 'Ship_status_area_1') {
                        oldStatusInfo.shipStatus = GameConstans.SHIP_STATUS.SHIP_NULL;
                        oldStatusInfo.currentTime = 0;
                        oldStatusInfo.evaluateTime = 0;
                        oldStatusInfo.statusRate = 0;
                    }
                });
                // 1号状态位置
            } else {
                this.timerManager.getShipStatusList(this.shipListInfo.shipListInfos[shipIndex].shipCode).forEach((oldStatusInfo) => {
                    // 替换旧的状态
                    if (oldStatusInfo.statusNode.name === 'Ship_status_area_1') {
                        oldStatusInfo.shipStatus = newStatusInfo.shipStatus;
                        oldStatusInfo.currentTime = newStatusInfo.currentTime;
                        oldStatusInfo.evaluateTime = newStatusInfo.evaluateTime;
                        oldStatusInfo.statusRate = newStatusInfo.statusRate;
                    }
                    // 替换旧的状态
                    if (oldStatusInfo.statusNode.name === 'Ship_status_area_2') {
                        oldStatusInfo.shipStatus = GameConstans.SHIP_STATUS.SHIP_NULL;
                        oldStatusInfo.currentTime = 0;
                        oldStatusInfo.evaluateTime = 0;
                        oldStatusInfo.statusRate = 0;
                    }
                });
            }
        } else {
            shipStatusInfos.forEach((newStatusInfo) => {
                // 2号状态位置
                if (newStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_IDLE
                    || newStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_JUMP
                    || newStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_FLIGHT
                    || newStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_JUMP_COOLING) {
                    this.timerManager.getShipStatusList(this.shipListInfo.shipListInfos[shipIndex].shipCode).forEach((oldStatusInfo) => {
                        // 替换旧的状态
                        if (oldStatusInfo.statusNode.name === 'Ship_status_area_2') {
                            oldStatusInfo.shipStatus = newStatusInfo.shipStatus;
                            oldStatusInfo.currentTime = newStatusInfo.currentTime;
                            oldStatusInfo.evaluateTime = newStatusInfo.evaluateTime;
                            oldStatusInfo.statusRate = newStatusInfo.statusRate;
                            // console.log('2 status: ', oldStatusInfo);
                            // console.log('newStatusInfo: ', newStatusInfo);
                        }
                    });
                }
                // 1号状态位置
                if (newStatusInfo.shipStatus !== GameConstans.SHIP_STATUS.SHIP_IDLE
                    && newStatusInfo.shipStatus !== GameConstans.SHIP_STATUS.SHIP_JUMP
                    && newStatusInfo.shipStatus !== GameConstans.SHIP_STATUS.SHIP_FLIGHT
                    && newStatusInfo.shipStatus !== GameConstans.SHIP_STATUS.SHIP_JUMP_COOLING) {
                    this.timerManager.getShipStatusList(this.shipListInfo.shipListInfos[shipIndex].shipCode).forEach((oldStatusInfo) => {
                        // 替换旧的状态
                        if (oldStatusInfo.statusNode.name === 'Ship_status_area_1') {
                            oldStatusInfo.shipStatus = newStatusInfo.shipStatus;
                            oldStatusInfo.currentTime = newStatusInfo.currentTime;
                            oldStatusInfo.evaluateTime = newStatusInfo.evaluateTime;
                            oldStatusInfo.statusRate = newStatusInfo.statusRate;
                            // console.log('1 status: ', oldStatusInfo);
                            // console.log('newStatusInfo: ', newStatusInfo);
                        }
                    });
                }
            });
        }
        // 更新面板信息
        if (currentShipCode === this.shipListInfo.shipListInfos[shipIndex].shipCode) {
            Logger.logModel('update shipBoard index: ' + shipIndex.toString());
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.REFRESH_SHIP_BOARD_CONTENT, this.shipListInfo.shipListInfos[shipIndex], 2, shipIndex);
        }
    }


    /*
     *@Author: yozora
     *@Description: 翻页
     *@Date: 2021-11-24 16:37:13
     */
    private async loadPage(event: Event, type: string) {
        // 向上翻页
        if (type === "1") {
            if (this._curSelectShipCard >= this.shipListInfo.pageSize) {
                this._curSelectShipCard -= this.shipListInfo.pageSize;
                for (let index = 0; index < this.shipListInfo.pageSize; index++) {
                    this.pageCard(-1);
                    this.processPageInfo();
                }
            } else if (this._curSelectShipCard !== 0 && this._curSelectShipCard < this.shipListInfo.pageSize) {
                const curIndex = this._curSelectShipCard;
                this._curSelectShipCard = 0;
                for (let index = curIndex; index > 0; index--) {
                    this.pageCard(-1);
                    this.processPageInfo();
                }
            }
        } else if (type === "-1") {
            // 判断是否加载数据
            if (this.shipListInfo.pageNum < this.shipListInfo.totalPage) {
                this.activeLoading();
                await this.loadShipCard();
                this.closeLoading();
            }
            // 向下翻页
            if (this._curSelectShipCard + this.shipListInfo.pageSize <= this.shipListInfo.totalCount) {
                this._curSelectShipCard += this.shipListInfo.pageSize;
                for (let index = 0; index < this.shipListInfo.pageSize; index++) {
                    this.pageCard(1);
                    this.processPageInfo();
                }
            }
        }

    }

    /*
     *@Author: yozora
     *@Description: 处理分页信息栏
     *@Date: 2021-11-24 15:46:02
     */
    private processPageInfo() {
        // 顶部区域
        this.topLabel.getChildByName("Ship_list_top_total_label").getComponent(Label).string = this.shipListInfo.totalCount.toString();
        this.topLabel.getChildByName("Ship_list_top_index_label").getComponent(Label).string = (this._curSelectShipCard + 1).toString();
    }

    /*
     *@Author: yozora
     *@Description: 处理飞船卡片内容
     *@Date: 2021-11-22 18:44:06
     */
    private processShipCardContent(shipCard: Node, shipListInfos: ShipListDetail[], index: number, shipIndex: number) {
        let shipLevelStatus = -1;
        shipListInfos[index].shipStatusInfoList.forEach((shipStatusInfo) => {
            // 1号状态 (空闲、跃迁、飞行、跃迁冷却)
            if (shipStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_IDLE
                || shipStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_JUMP
                || shipStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_FLIGHT
                || shipStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_JUMP_COOLING) {
                this.processShipStatus(shipCard.getChildByName("Ship_status_area_2"), shipStatusInfo, shipListInfos[index]);
            }
            // 2号状态 (占领、采集、战斗冷却)
            else {
                this.processShipStatus(shipCard.getChildByName("Ship_status_area_1"), shipStatusInfo, shipListInfos[index]);
            }
        });
        // 飞船等级
        resources.load(`ui/ship_level/ship_level/ship_level_${shipListInfos[index].shipLevel}`, SpriteFrame, (err, asset) => {
            if (err) {
                console.error(err);
                return;
            }
            if (shipLevelStatus === -1) {
                shipCard.getChildByName("Ship_level").getComponent(Sprite).spriteFrame = asset;
            }
        });
        // 飞船名称
        shipCard.getChildByName("Ship_card_name_label").getComponent(Label).string = shipListInfos[index].shipName;
        // 飞船积分
        shipCard.getChildByName("Ship_card_mineral_label").getComponent(Label).string = shipListInfos[index].mineral;
        // 飞船卡片index
        shipCard.getComponent(ShipCard).ship_index = shipIndex + 1;
        shipCard.getComponent(ShipCard).ship_name = shipListInfos[index].shipName;
        // 飞船页码
        let _ship_index: string;
        _ship_index = index.toString().substring(index.toString().length - 1, index.toString().length);
        if (_ship_index.toString().lastIndexOf("0") !== -1) {
            shipCard.getChildByName("Ship_card_page_label").getComponent(Label).string = "P52" + this._cardPage.toString();
            this._cardPage++;
        }
    }

    /*
     *@Author: yozora
     *@Description: 处理飞船卡片状态栏
     *@Date: 2021-11-22 17:47:38
     */
    private processShipStatus(statusNode: Node, shipStatusInfo: ShipStatusInfo, shipListInfo: ShipListDetail, timerFlag: boolean = true) {

        if (statusNode.name === 'Ship_status_area_2') {
            let activeStatus_2 = false;
            if (shipStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_IDLE) {
                statusNode.getChildByName('Radio_actived').getComponent(Sprite).spriteFrame = this.idleSpriteFrame;
                activeStatus_2 = true;
                // 初始进度判断
                statusNode.getChildByName('Radio_actived').getComponent(Sprite).fillRange = this.processInitRadio(shipStatusInfo.statusRate);
            }
            if (shipStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_JUMP) {
                statusNode.getChildByName('Radio_actived').getComponent(Sprite).spriteFrame = this.jumpSpriteFrame;
                activeStatus_2 = true;
                // 初始进度判断
                statusNode.getChildByName('Radio_actived').getComponent(Sprite).fillRange = this.processInitRadio(shipStatusInfo.statusRate);
            }
            if (shipStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_FLIGHT) {
                statusNode.getChildByName('Radio_actived').getComponent(Sprite).spriteFrame = this.jumpSpriteFrame;
                activeStatus_2 = true;
                // 初始进度判断
                statusNode.getChildByName('Radio_actived').getComponent(Sprite).fillRange = this.processInitRadio(shipStatusInfo.statusRate);
            }
            if (shipStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_JUMP_COOLING) {
                statusNode.getChildByName('Radio_actived').getComponent(Sprite).spriteFrame = this.jumpSpriteFrame;
                activeStatus_2 = true;
                // 初始进度判断
                statusNode.getChildByName('Radio_actived').getComponent(Sprite).fillRange = this.processInitRadio(shipStatusInfo.statusRate);
            }
            if (activeStatus_2) {
                statusNode.getChildByName('Radio_actived').active = true;
            }
        }

        if (statusNode.name === 'Ship_status_area_1') {
            let activeStatus_1 = false;
            if (shipStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_ATTACK || shipStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_FULL_COOLING) {
                statusNode.getChildByName('Radio_actived').getComponent(Sprite).spriteFrame = this.attackSpriteFrame;
                activeStatus_1 = true;
                // 初始进度判断
                statusNode.getChildByName('Radio_actived').getComponent(Sprite).fillRange = this.processInitRadio(shipStatusInfo.statusRate);
            }
            if (shipStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_OCCUPYING) {
                statusNode.getChildByName('Radio_actived').getComponent(Sprite).spriteFrame = this.occupySpriteFrame;
                activeStatus_1 = true;
                // 初始进度判断
                statusNode.getChildByName('Radio_actived').getComponent(Sprite).fillRange = this.processInitRadio(shipStatusInfo.statusRate);
            }
            if (shipStatusInfo.shipStatus === GameConstans.SHIP_STATUS.SHIP_MINING) {
                statusNode.getChildByName('Radio_actived').getComponent(Sprite).spriteFrame = this.collectSpriteFrame;
                activeStatus_1 = true;
                // 初始进度判断
                statusNode.getChildByName('Radio_actived').getComponent(Sprite).fillRange = this.processInitRadio(shipStatusInfo.statusRate);
            }
            if (activeStatus_1) {
                statusNode.getChildByName('Radio_actived').active = true;
            }
        }
        if (timerFlag) {
            this.initTimer(statusNode, shipStatusInfo, shipListInfo);
            if (shipStatusInfo.shipStatus !== GameConstans.SHIP_STATUS.SHIP_NULL) {
                this.startTimer(shipListInfo.shipCode);
            }
        }
    }

    /*
     *@Author: yozora
     *@Description: 初始化飞船计时器
     *@Date: 2022-02-16 15:21:00
     */
    private initTimer(statusNode: Node, shipStatusInfo: ShipStatusInfo, shipListInfo: ShipListDetail) {
        shipStatusInfo.statusNode = statusNode;
        if (this.timerManager.shipTimerInfo.get(shipListInfo.shipCode) === undefined || this.timerManager.shipTimerInfo.get(shipListInfo.shipCode) === null) {
            this.timerManager.shipTimerInfo.set(shipListInfo.shipCode, []);
            this.timerManager.shipTimerInfo.get(shipListInfo.shipCode).push(shipStatusInfo);
        } else {
            this.timerManager.shipTimerInfo.get(shipListInfo.shipCode).push(shipStatusInfo);
        }
    }

    /*
     *@Author: yozora
     *@Description: 启动飞船计时器
     *@Date: 2022-02-16 16:00:15
     */
    private startTimer(shipCode: string) {
        this.timerManager.startShipTimer(shipCode, false);
    }

    /*
     *@Author: yozora
     *@Description: 监听飞船状态计时器
     *@Date: 2022-02-16 15:37:56
     */
    private monitorShipStatus(shipCode: string, index: number, shipStatusInfo: ShipStatusInfo, fillRange: number, changeFlag: boolean) {
        if (changeFlag) {
            this.processShipStatus(shipStatusInfo.statusNode, shipStatusInfo, null, false);
        }
        // 特殊状态: 采集 .currentTime === -1
        if (this.timerManager.shipTimerInfo.get(shipCode)[index].shipStatus === GameConstans.SHIP_STATUS.SHIP_MINING) {
            if (this.timerManager.shipTimerInfo.get(shipCode)[index].currentTime === -1) {
                console.log('飞船卡片开始采集');
                this.collectTween.forEach((value, key) => {
                    Tween.stopAllByTag(key);
                });
                const t = tween(shipStatusInfo.statusNode.getChildByName('Radio_actived').getComponent(Sprite))
                    .to(2, { fillRange: 1 })
                    .set({ fillRange: -1 })
                    .union()
                    .repeatForever().tag(GameConstans.TWEEN_TAG.COLLECT_CARD_TAG + Number(shipStatusInfo.statusNode.parent.name.split('shipCard')[1]));
                this.collectTween.set(GameConstans.TWEEN_TAG.COLLECT_CARD_TAG + Number(shipStatusInfo.statusNode.parent.name.split('shipCard')[1]), t);
                this.collectTween.forEach((value, key) => {
                    value.start();
                });
                return;
            }
        }
        if (fillRange > 0) {
            if (fillRange !== undefined && fillRange !== shipStatusInfo.statusNode.getChildByName('Radio_actived').getComponent(Sprite).fillRange) {
                shipStatusInfo.statusNode.getChildByName('Radio_actived').getComponent(Sprite).fillRange = fillRange;
            }
        } else {
            shipStatusInfo.statusNode.getChildByName('Radio_actived').getComponent(Sprite).fillRange = -1;
            if (shipStatusInfo.statusNode.name === 'Ship_status_area_2') {
                shipStatusInfo.statusNode.getChildByName('Radio_actived').getComponent(Sprite).spriteFrame = this.idleSpriteFrame;
            } else {
                shipStatusInfo.statusNode.getChildByName('Radio_actived').active = false;
                // 进入闲置状态
                shipStatusInfo.statusNode.parent.getChildByName('Ship_status_area_2').getChildByName('Radio_actived').active = true;
                shipStatusInfo.statusNode.parent.getChildByName('Ship_status_area_2').getChildByName('Radio_actived').getComponent(Sprite).spriteFrame = this.idleSpriteFrame;
            }
        }
    }

    /*
     *@Author: yozora
     *@Description: 停止飞船采集
     *@Date: 2022-02-23 00:03:58
     */
    private stopShipCollet(shipStatusInfo: ShipStatusInfo) {
        console.log('飞船卡片停止采集');
        shipStatusInfo.statusNode.getChildByName('Radio_actived').active = false;
        shipStatusInfo.statusNode.getChildByName('Radio_actived').getComponent(Sprite).fillRange = -1;
        Tween.stopAllByTag(GameConstans.TWEEN_TAG.COLLECT_CARD_TAG + Number(shipStatusInfo.statusNode.parent.name.split('shipCard')[1]));
        this.collectTween.delete(GameConstans.TWEEN_TAG.COLLECT_CARD_TAG + Number(shipStatusInfo.statusNode.parent.name.split('shipCard')[1]));
    }

    /*
     *@Author: yozora
     *@Description: 处理初始化飞船进度条
     *@Date: 2022-02-21 15:55:09
     */
    private processInitRadio(statusRate: number) {
        let fillRange;
        if (statusRate === 6) {
            fillRange = 1;
        }
        if (statusRate === 5) {
            fillRange = 0.845;
        }
        if (statusRate === 4) {
            fillRange = 0.68;
        }
        if (statusRate === 3) {
            fillRange = 0.515;

        }
        if (statusRate === 2) {
            fillRange = 0.345;
        }
        if (statusRate === 1) {
            fillRange = 0.175;
        }
        if (statusRate === 0) {
            fillRange = 0;
        }
        if (statusRate === undefined) {
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.TOAST, 'statusRate is undefined.');
        }
        return fillRange;
    }

    private activeLoading() {
        this.scollLoading = true;
        this.node.getChildByName("Ship_list_mask").active = false;
        this.node.getChildByName('Loading').active = true;
        this.node.getChildByName('Loading').getComponent(Animation).getState('loading').play();
    }

    private closeLoading() {
        this.scollLoading = false;
        this.node.getChildByName("Ship_list_mask").active = true;
        this.node.getChildByName('Loading').active = false;
        this.node.getChildByName('Loading').getComponent(Animation).getState('loading').stop();
    }

    /*
     *@Author: yozora
     *@Description: 飞船列表属性条件
     *@Date: 2022-01-10 16:06:31
     */
    private changeQueryStatus(e: Toggle, status: number) {
        if (e.isChecked) {
            this.queryShipStatus = status;
            this.initShipCard();
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.SELECT_SHIP_DETAIL_BOARD, null, false);
        }
    }

    /*
     *@Author: yozora
     *@Description: 飞船列表排序条件
     *@Date: 2022-01-10 16:06:54
     */
    private changeQueryOrder(e: Toggle, attr: string) {
        if (e.isChecked) {
            this.queryShipOrder = attr;
            this.initShipCard();
            console.log('飞船列表排序条件', this.queryShipOrder);
        }
        // else {
        //     this.queryShipOrder = "power";
        //     this.initShipCard();
        // }
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.SELECT_SHIP_DETAIL_BOARD, null, false);
    }
}

