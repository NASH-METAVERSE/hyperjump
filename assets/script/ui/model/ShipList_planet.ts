
import { _decorator, Component, Node, Prefab, instantiate, Vec3, Sprite, resources, SpriteFrame, Label, SpriteAtlas, Button, EventMouse, find, EventTouch, Tween, tween, Mask, Toggle, UITransform, Animation, AnimationClip, Game, Color, Layers } from 'cc';
import { DataManager } from '../../DataManager';
import { GameConstans } from '../../entity/GameConstans';
import { ShipListDetail } from '../../entity/ShipListDetail';
import { ShipListInfo } from '../../entity/ShipListInfo';
import { ShipStatusInfo } from '../../entity/ShipStatusInfo';
import { ClientEvent } from '../../utils/ClientEvent';
import { HttpRequest } from '../../utils/HttpRequest';
import { ShipBoardLargeTarget } from './ShipBoardLargeTarget';
import { ShipCardPlanet } from './ShipCardPlanet';
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

@ccclass('ShipList_planet')
export class ShipList_planet extends Component {

    /*
     * 飞船卡片预制体
     */
    @property({ type: Prefab })
    private shipCard: Prefab = null;

    /*
     * 顶部文字区域
     */
    private topLabel: Node = null;

    /*
     * 飞船列表信息
     */
    private shipListInfo: ShipListInfo = null;

    /*
     * 卡片栏最外侧x轴位置
     */
    private _outboard_x: number = 92;

    /*
     * 卡片栏最内侧x轴位置
     */
    private _innerboard_x: number = -29;

    /*
     * 卡片栏最内侧y轴位置
     */
    private _innerboarder_y: number = 54.5;

    /*
    * 动态卡片位置
    */
    private _initCardPos: Vec3 = new Vec3(92, 490.5, 0);

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

    private tweenPositions: Vec3[] = [];

    private tweenTotalCount: number = 0;

    private tweenCurrentCount: number = 0;

    /*
     * 查询飞船状态
     */
    private queryShipStatus: number = -1;

    /*
     * 查询飞船排序
     */
    private queryShipOrder: string = "strength";

    /*
     * 是否首次加载
     */
    private firstLoad: boolean = true;

    start() {
        ClientEvent.on(GameConstans.CLIENTEVENT_LIST.PLANET.INIT_TARGET_SHIP_CARD, this.initShipCard, this);
        ClientEvent.on(GameConstans.CLIENTEVENT_LIST.PLANET.CLICK_SHIP_CARD, this.clickShipBoard, this);
        ClientEvent.on(GameConstans.CLIENTEVENT_LIST.PLANET.HOVER_SHIP_CARD, this.hoverShipBoard, this);
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
        }
    }

    /*
     *@Author: yozora
     *@Description: click卡片显示飞船面板
     *@Date: 2021-11-24 23:38:03
     */
    private clickShipBoard(nodeNmae: string) {
        if (this.shipListInfo) {
            // 获取卡片index
            if (this._clickedShipCardIndex === Number(nodeNmae.split("shipCardPlanet")[1])) {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.PLANET.CLICK_SHIP_BOARD, null, false);
            } else {
                this._clickedShipCardIndex = Number(nodeNmae.split("shipCardPlanet")[1]);
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.PLANET.CLICK_SHIP_BOARD, this.shipListInfo.shipListInfos[this._clickedShipCardIndex], true);
            }
        }
    }

    /*
     *@Author: yozora
     *@Description: Hover卡片显示飞船面板
     *@Date: 2021-11-29 16:50:42
     */
    private hoverShipBoard(nodeNmae: string, isShow: boolean) {
        if (this.shipListInfo) {
            // 获取卡片index
            const index = nodeNmae.split("shipCardPlanet")[1];
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.PLANET.HOVER_SHIP_BOARD, this.shipListInfo.shipListInfos[index], isShow);
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
            this.node.getChildByName("Ship_list_mask").getChildByName(`shipCardPlanet${index}`).getPosition(this._activeCardPos);
            // 向上滚动
            if (direction === 1) {
                this.node.getChildByName("Ship_list_mask").getChildByName(`shipCardPlanet${index}`).getComponent(ShipCardPlanet).ship_index--;
            } else {
                this.node.getChildByName("Ship_list_mask").getChildByName(`shipCardPlanet${index}`).getComponent(ShipCardPlanet).ship_index++;
            }
            const pos: Vec3 = this.processShipIndexForPosition(this.node.getChildByName("Ship_list_mask").getChildByName(`shipCardPlanet${index}`).getComponent(ShipCardPlanet).ship_index.toString());
            this.tweenPositions.push(new Vec3(pos.x, this._activeCardPos.y + (direction * scollOffset * this._verticalOffset), this._activeCardPos.z));
        }
        this.tweenCurrentCount = 0;
        this.tweenTotalCount = this.tweenPositions.length;
        for (let index = 0; index < this.tweenPositions.length; index++) {
            tween(this.node.getChildByName("Ship_list_mask").getChildByName(`shipCardPlanet${index}`))
                .to(0.005, { position: this.tweenPositions[index] }, {
                    easing: 'quadIn',
                    'onComplete': () => {
                        this.tweenCurrentCount++;
                    }
                }).start();
        }
        this.tweenPositions = [];
    }

    /*
     *@Author: yozora
     *@Description: 翻页滚动
     *@Date: 2021-11-24 18:53:10
     */
    private pageCard(direction: number, scollOffset: number = 1) {
        // 滚动
        let shipCount = this.shipListInfo.shipListInfos.length;
        for (let index = 0; index < shipCount; index++) {
            this.node.getChildByName("Ship_list_mask").getChildByName(`shipCardPlanet${index}`).getPosition(this._activeCardPos);
            // 向上滚动
            if (direction === 1) {
                this.node.getChildByName("Ship_list_mask").getChildByName(`shipCardPlanet${index}`).getComponent(ShipCardPlanet).ship_index--;
            } else {
                this.node.getChildByName("Ship_list_mask").getChildByName(`shipCardPlanet${index}`).getComponent(ShipCardPlanet).ship_index++;
            }
            const pos: Vec3 = this.processShipIndexForPosition(this.node.getChildByName("Ship_list_mask").getChildByName(`shipCardPlanet${index}`).getComponent(ShipCardPlanet).ship_index.toString());
            this.node.getChildByName("Ship_list_mask").getChildByName(`shipCardPlanet${index}`).setPosition(new Vec3(pos.x, this._activeCardPos.y + (direction * scollOffset * this._verticalOffset), this._activeCardPos.z));
        }
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
            return new Vec3(92, 490.5, 0);
        }
        if (_ship_index.lastIndexOf("2") !== -1 || _ship_index.lastIndexOf("9") !== -1) {
            return new Vec3(46.53, 381.5, 0);
        }
        if (_ship_index.lastIndexOf("3") !== -1 || _ship_index.lastIndexOf("8") !== -1) {
            return new Vec3(7, 272.5, 0);
        }
        if (_ship_index.lastIndexOf("4") !== -1 || _ship_index.lastIndexOf("7") !== -1) {
            return new Vec3(-17, 163.5, 0);
        }
        if (_ship_index.lastIndexOf("5") !== -1 || _ship_index.lastIndexOf("6") !== -1) {
            return new Vec3(-29, 54.5, 0);
        }
    }

    /*
     *@Author: yozora
     *@Description: 从上至下开始初始化飞船卡片信息
     *@Date: 2021-11-21 23:22:23
     */
    private initShipCard() {
        this.activeLoading();
        if (!this.topLabel) {
            this.topLabel = this.node.getChildByName("Top_label_area");
        }
        // 重置数据
        this.node.getChildByName("Ship_list_mask").removeAllChildren();
        this._curSelectShipCard = 0;
        this._clickedShipCardIndex = -1;
        this._initCardPos = new Vec3(92, 490.5, 0)

        this._topBorder = 0;
        this._buttomBorder = 0;
        this.shipListInfo === null;
        const tweenArray: Node[] = [];

        if (find(`Canvas/Planet_area/Ship_board_large_target`)) {
            find(`Canvas/Planet_area/Ship_board_large_target`).getComponent(ShipBoardLargeTarget).resetLastShip();
        }
        // 获取飞船列表
        HttpRequest.getPlanetTargetShipInfo(find('DataManager').getComponent(DataManager).getPlanetCode(), 1, 10, this.queryShipStatus, this.queryShipOrder).then((res) => {
            if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                this.shipListInfo = res.data;
                let shipCount = this.shipListInfo.shipListInfos.length;
                // 卡片方向(1:向内，-1:向外)
                let i: number = 1;
                for (let index = 0; index < shipCount; index++) {
                    // 创建飞船卡片
                    const shipCard = instantiate(this.shipCard);
                    shipCard.layer = Layers.Enum.UI_2D;
                    shipCard.name = `shipCardPlanet${index}`;
                    // 设置飞船卡片内容
                    this.processShipCardContent(shipCard, this.shipListInfo.shipListInfos, index, index);
                    if (index > 0) {
                        const pos = this.processShipIndexForPosition(shipCard.getComponent(ShipCardPlanet).ship_index.toString());
                        shipCard.setPosition(new Vec3(pos.x - 430, this._initCardPos.y - (this._verticalOffset), this._initCardPos.z));
                    } else {
                        const pos = this._initCardPos;
                        pos.x = pos.x - 430;
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
            .by(0.1, { position: new Vec3(430, 0, 0) }, {
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
        await HttpRequest.getPlanetTargetShipInfo(find('DataManager').getComponent(DataManager).getPlanetCode(), this.shipListInfo.pageNum + 1, this.shipListInfo.pageSize, this.queryShipStatus, this.queryShipOrder).then((res) => {
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
                    shipCard.name = `shipCardPlanet${index}`;
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
                }
            } else if (this._curSelectShipCard !== 0 && this._curSelectShipCard < this.shipListInfo.pageSize) {
                const curIndex = this._curSelectShipCard;
                this._curSelectShipCard = 0;
                for (let index = curIndex; index > 0; index--) {
                    this.pageCard(-1);
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
                }
            }
        }

    }

    /*
     *@Author: yozora
     *@Description: 处理飞船卡片内容
     *@Date: 2021-11-22 18:44:06
     */
    private processShipCardContent(shipCard: Node, shipListInfos: ShipListDetail[], index: number, shipIndex: number) {
        let shipLevelStatus = -1;
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
        // 飞船速度
        // shipCard.getChildByName("Ship_speed_label").getComponent(Label).string = shipListInfos[index].moveSpeed;
        // 飞船积分
        shipCard.getChildByName("Ship_card_mineral_label").getComponent(Label).string = shipListInfos[index].mineral;
        // 飞船卡片index
        shipCard.getComponent(ShipCardPlanet).ship_index = shipIndex + 1;
        // 飞船页码
        let _ship_index: string;
        _ship_index = index.toString().substring(index.toString().length - 1, index.toString().length);
        if (_ship_index.toString().lastIndexOf("0") !== -1) {
            shipCard.getChildByName("Ship_card_page_label").getComponent(Label).string = "P52" + this._cardPage.toString();
            this._cardPage++;
        }
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
            console.log("status: ", status);
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
            console.log("attr: ", attr);
            this.queryShipOrder = attr;
            this.initShipCard();
        } else {
            this.queryShipOrder = "power";
            this.initShipCard();
        }
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.SELECT_SHIP_DETAIL_BOARD, null, false);
    }
}

