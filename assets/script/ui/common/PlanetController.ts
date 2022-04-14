
import { _decorator, Component, Node, Prefab, instantiate, find, Widget, EventTouch, tween } from 'cc';
import { GameConstans } from '../../entity/GameConstans';
import { ShipListDetail } from '../../entity/ShipListDetail';
import { UIManager } from '../../UIManager';
import { UserOperateManager } from '../../UserOperateManager';
import { ClientEvent } from '../../utils/ClientEvent';
import { ShipBoardLargeTarget } from '../model/ShipBoardLargeTarget';
import { ShipList_planet } from '../model/ShipList_planet';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = PlanetController
 * DateTime = Mon Feb 07 2022 15:15:36 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = PlanetController.ts
 * FileBasenameNoExtension = PlanetController
 * URL = db://assets/script/ui/common/PlanetController.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 * 星球UI控制器
 */

@ccclass('PlanetController')
export class PlanetController extends Component {

    private canvas: Node = null;

    /*
     * 飞船面板
     */
    private ship_board: Node = null;

    /*
     * 点击面板状态
     */
    private clickedShipBoard: boolean = false;

    /*
    * 是否点击菜单
    */
    private clickedHanger: boolean = false;

    constructor(canvas: Node) {
        super();
        this.canvas = canvas;
    }

    /*
     *@Author: yozora
     *@Description: Hover飞船面板
     *@Date: 2022-02-07 15:36:00
     */
    public hoverShipBoard(prefab: Prefab, shipListDetail: ShipListDetail, is_show: boolean) {
        if (!this.ship_board) {
            this.ship_board = instantiate(prefab);
            this.canvas.getChildByName('Planet_area').addChild(this.ship_board);
            this.ship_board.getComponent(Widget).target = this.canvas;
            this.ship_board.getComponent(Widget).horizontalCenter = GameConstans.UI_POSITON.INIT_TARGET_BOARD_H;
            this.ship_board.getComponent(Widget).top = GameConstans.UI_POSITON.INIT_TARGET_BOARD_V;
        }
        if (!this.clickedShipBoard) {
            if (is_show) {
                this.ship_board.active = true;
                this.ship_board.getComponent(ShipBoardLargeTarget).processShipDetailBoardInfo(shipListDetail, 0);
            } else {
                this.ship_board.active = false;
            }
        }
    }

    /*
     *@Author: yozora
     *@Description: click飞船面板
     *@Date: 2022-02-07 15:47:18
     */
    public clickShipBoard(prefab: Prefab, shipListDetail: ShipListDetail, is_show: boolean) {
        if (!this.ship_board) {
            this.ship_board = instantiate(prefab);
            this.canvas.getChildByName('Planet_area').addChild(this.ship_board);
            this.ship_board.getComponent(Widget).target = this.canvas;
            this.ship_board.getComponent(Widget).horizontalCenter = GameConstans.UI_POSITON.INIT_TARGET_BOARD_H;
            this.ship_board.getComponent(Widget).top = GameConstans.UI_POSITON.INIT_TARGET_BOARD_V;
        }
        // 掠夺行为
        if (this.canvas.getComponent(UserOperateManager).userOperateType === GameConstans.RESET_TYPE.PLANET.PLUNDER && is_show) {
            this.clickedShipBoard = true;
            // 隐藏菜单栏
            this.canvas.getChildByName("Hanger-planet").active = false;
            this.clickedHanger = false;

            this.tweenShipBoard();

            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.CHANGE_PROCESS, GameConstans.PROCESS_TYPE.PLUNDER.BEFORE_CONFIRM_TARGET);
        } else {
            if (is_show) {
                // 重置飞船面板参数
                this.clickedShipBoard = true;
                this.ship_board.active = true;
            } else {
                this.resetShipBoard();
                this.clickedShipBoard = false;
                this.ship_board.active = false;
                this.canvas.getChildByName('Hanger-planet').getChildByName('Ship_list').getComponent(ShipList_planet)._clickedShipCardIndex = -1;
            }
        }
    }

    /*
     *@Author: yozora
     *@Description: 缓动飞船面板及展示对话框
     *@Date: 2022-02-09 14:08:41
     */
    private tweenShipBoard() {
        // 隐藏指示牌
        this.ship_board.getChildByName("Ship_border_left").active = false;
        // 缓动飞船详细面板到左端
        tween(this.ship_board.getComponent(Widget)).to(0.5, { horizontalCenter: GameConstans.UI_POSITON.CLICKED_TARGET_BOARD_H }, {
            easing: 'smooth', 'onComplete': () => {
                // 显示对话框
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_DIALOG_LIST.CHANGE_DIALOG, GameConstans.DIALOG_TYPE.SELECT_BASE, GameConstans.TIPS_CONTENT.CONFIRM_PLUNDER);
            }
        }).start();

    }

    /*
     *@Author: yozora 
     *@Description: 重置飞船面板样式
     *@Date: 2022-02-09 15:49:08
     */
    private resetShipBoard() {
        this.ship_board.getComponent(Widget).horizontalCenter = GameConstans.UI_POSITON.INIT_TARGET_BOARD_H;
        this.ship_board.getComponent(Widget).top = GameConstans.UI_POSITON.INIT_TARGET_BOARD_V;
        this.ship_board.getChildByName("Ship_border_left").active = true;
    }

    /**************************************************状态控制START****************************************************/

    /*
    *@Author: yozora
    *@Description: 修改菜单栏状态
    *@Date: 2022-02-04 16:50:04
    */
    public changeHangerStatus(e: EventTouch) {
        if (this.clickedHanger) {
            this.clickedHanger = false;
            this.canvas.getChildByName("Hanger-planet").active = false;
        } else {
            this.clickedHanger = true;
            this.canvas.getChildByName("Hanger-planet").active = true;
            if (this.clickedShipBoard) {
                // 隐藏飞船详细面板
                // this.clickShipDetailBoard(null, null, false);
                // ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.CHANGE_CARD_PRESSED_STATUS, 'Reset', false);
                // this.ship_detail_board_node.getComponent(Widget).left = 462.24;
                // this.clickedShipBoard = false;
                // this.canvas.getChildByName('Hanger').getChildByName('Ship_list').getComponent(ShipList)._clickedShipCardIndex = -1;
            }
        }
    }

    /**************************************************状态控制END****************************************************/

}
