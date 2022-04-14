import { _decorator, Component, Node, resources, Prefab, instantiate, Label, Widget, find, tween, Vec3, Game, Sprite, Camera } from 'cc';
import { DataManager } from '../../DataManager';
import { GameConstans } from '../../entity/GameConstans';
import { GameManager } from '../../GameManager';
import { UserOperateManager } from '../../UserOperateManager';
import { ClientEvent } from '../../utils/ClientEvent';
import { HttpRequest } from '../../utils/HttpRequest';
import { Dialog } from '../model/Dialog';
import { DialogReport } from '../model/DialogReport';
import { ShipBoardLarge } from '../model/ShipBoardLarge';
import { AttackReport } from '../../entity/AttackReport';
import { ShipLogInfo } from '../../entity/ShipLogInfo';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ConmonUIController
 * DateTime = Tue Feb 08 2022 18:50:59 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = CommonUIController.ts
 * FileBasenameNoExtension = CommonUIController
 * URL = db://assets/script/ui/common/CommonUIController.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 * 通用UI控制器
 */

@ccclass('ConmonUIController')
export class ConmonUIController extends Component {

    private canvas: Node = null;

    /*
    * 信息对话框
    */
    private dialogInfo: Node = null;

    /*
    * 选择对话框-基础
    */
    private dialogSelectBase: Node = null;

    /*
    * 选择对话框-大
    */
    private dialogSelectLarge: Node = null;

    /*
    * 报告对话框
    */
    private dialogReport: Node = null;

    private tactics_attack_prefab: Prefab = null;
    private tactics_defend_prefab: Prefab = null;
    private tactics_speed_prefab: Prefab = null;

    private dialog_report_prefab: Prefab = null;
    private dialog_info_prefab: Prefab = null;
    private dialog_base_prefab: Prefab = null;
    private dialog_large_prefab: Prefab = null;
    private dialog_tactics_prefab: Prefab = null;

    /*
    * 策略对话框
    */
    private dialogTactics: Node = null;

    private myShipBoard: Node = null;

    private targetShipBoard: Node = null;

    /*
     * 初始化对话框缩放
     */
    private initDialogScale: Vec3 = new Vec3(0, 0, 1);

    /*
     * 用户操作脚本
     */
    private userOperateManager: UserOperateManager = null;

    /*
     * 用户数据脚本
     */
    private dataManager: DataManager = null;


    constructor(canvas: Node, tactics_attack_prefab: Prefab, tactics_defend_prefab: Prefab, tactics_speed_prefab: Prefab, dialog_report_prefab: Prefab, dialog_info_prefab: Prefab, dialog_base_prefab: Prefab, dialog_large_prefab: Prefab, dialog_tactics_prefab: Prefab) {
        super();
        this.canvas = canvas;
        this.tactics_attack_prefab = tactics_attack_prefab;
        this.tactics_defend_prefab = tactics_defend_prefab;
        this.tactics_speed_prefab = tactics_speed_prefab;
        this.dialog_report_prefab = dialog_report_prefab;
        this.dialog_info_prefab = dialog_info_prefab;
        this.dialog_base_prefab = dialog_base_prefab;
        this.dialog_large_prefab = dialog_large_prefab;
        this.dialog_tactics_prefab = dialog_tactics_prefab;
        this.dataManager = find('DataManager').getComponent(DataManager);
        this.userOperateManager = find('Canvas').getComponent(UserOperateManager);
        this.loadResource();
    }


    /*
     *@Author: yozora
     *@Description: 切换对话框类型
     *@Date: 2022-02-08 19:03:41
     */
    public changeDialog(dialogType: number, tips: string, shipCode?: string) {
        if (dialogType === GameConstans.DIALOG_TYPE.INFO) {
            if (tips === null) {
                this.closeDialog(this.dialogInfo);
            }
            this.dialogInfo.getChildByName('Tips_label').getComponent(Label).string = tips;
            this.openDialog(this.dialogInfo);
        }
        else if (dialogType === GameConstans.DIALOG_TYPE.SELECT_BASE) {
            if (tips === null) {
                this.closeDialog(this.dialogSelectBase);
            }
            this.dialogSelectBase.getChildByName('Tips_label').getComponent(Label).string = tips;
            this.dialogSelectBase.getChildByName('Tips_label').getComponent(Widget).top = 40.59;
            this.openDialog(this.dialogSelectBase);
        }
        else if (dialogType === GameConstans.DIALOG_TYPE.SELECT_LARGE) {
            if (tips === null) {
                this.closeDialog(this.dialogSelectLarge);
            }
            this.dialogSelectLarge.getChildByName('Tips_label').getComponent(Label).string = tips;
            this.dialogSelectLarge.getChildByName('Tips_label').getComponent(Widget).top = 40.59;
            this.openDialog(this.dialogSelectLarge);
        }
        else if (dialogType === GameConstans.DIALOG_TYPE.REPORT) {
            if (tips === null) {
                this.closeDialog(this.dialogReport);
            }
            this.dialogReport.getChildByName('SubTitle_label').getComponent(Label).string = tips;
            this.openDialog(this.dialogReport);
        }
        else if (dialogType === GameConstans.DIALOG_TYPE.TACTICS) {
            if (tips === null) {
                this.closeDialog(this.dialogTactics);
            }
            this.dialogTactics.getChildByName('Tips_label').getComponent(Label).string = tips;
            this.openDialog(this.dialogTactics);
        } else if (dialogType === GameConstans.DIALOG_TYPE.TIMEOUT) {
            // 当前打开的飞船
            if (this.dataManager.getShipCode() === shipCode) {
                // 关闭其它对话框
                if (this.dialogInfo && this.dialogInfo.active) {
                    this.closeDialog(this.dialogInfo);
                }
                if (this.dialogSelectBase && this.dialogSelectBase.active) {
                    this.closeDialog(this.dialogSelectBase);
                }
                if (this.dialogSelectLarge && this.dialogSelectLarge.active) {
                    this.closeDialog(this.dialogSelectLarge);
                }
                if (this.dialogReport && this.dialogReport.active) {
                    this.closeDialog(this.dialogReport);
                }
                if (this.dialogTactics && this.dialogTactics.active) {
                    this.closeDialog(this.dialogTactics);
                }
                // 关闭提示语
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIPS_LIST.CHANGE_TIPS_CONTENT, GameConstans.TIPS_CONTENT.NULL);
                this.dialogInfo.getComponent(Dialog).setShipCode(shipCode);
                this.dialogInfo.getChildByName('Tips_label').getComponent(Label).string = tips;
                this.dialogInfo.getChildByName('Tips_label').getComponent(Widget).top = 40.59;
                this.openDialog(this.dialogInfo);
            }
        }
    }

    /*
     *@Author: yozora
     *@Description: 显示飞船日志
     *@Date: 2022-02-24 17:30:04
     */
    public showLogReport(shipLogs: ShipLogInfo[], prefab: Prefab) {
        console.log('showLogReport: ', shipLogs.length);
        // 生成一次性报告
        if (shipLogs.length > 1) {
            for (let index = 0; index < shipLogs.length; index++) {
                const dialog = instantiate(prefab);
                find('Canvas').getChildByName('Dialog_area').addChild(dialog);
                console.log(dialog);
                const shipLog = shipLogs[index];
                if (Number(shipLog.shipOperate) === GameConstans.SHIP_LOG_TYPE.ATTACK_OPERATE || Number(shipLog.shipOperate) === GameConstans.SHIP_LOG_TYPE.ATTACKED_OPERATE) {
                    const report: AttackReport = {
                        processorAttack: Number(shipLog.result) < 0 ? 1 : 0,
                        reward: Number(shipLog.result),
                        attackStrategy: null,
                        attackedStrategy: null,
                        fullCoolingTime: null,
                        attackCoolingTime: null,
                    }
                    dialog.getChildByName('SubTitle_label').getComponent(Label).string = 'PLUNDER';
                    dialog.getComponent(DialogReport).plunderContent(report, true);
                }
                if (Number(shipLog.shipOperate) === GameConstans.SHIP_LOG_TYPE.JUMP_OPERATE || Number(shipLog.shipOperate) === GameConstans.SHIP_LOG_TYPE.FLIGHT_OPERATE) {
                    dialog.getChildByName('SubTitle_label').getComponent(Label).string = Number(shipLog.shipOperate) === GameConstans.SHIP_LOG_TYPE.JUMP_OPERATE ? 'HYPERJUMP' : 'FLIGHT';
                    dialog.getComponent(DialogReport).jumpContent(shipLog, true);
                }
                if (Number(shipLog.shipOperate) === GameConstans.SHIP_LOG_TYPE.COLLECT_OPERATE) {
                    dialog.getChildByName('SubTitle_label').getComponent(Label).string = 'COLLECT';
                    dialog.getComponent(DialogReport).collectContent(shipLog, true);
                }
                if (Number(shipLog.shipOperate) === GameConstans.SHIP_LOG_TYPE.OCCUPY_OPERATE) {
                    dialog.getChildByName('SubTitle_label').getComponent(Label).string = 'OCCUPY';
                    dialog.getComponent(DialogReport).occupyContent(shipLog, true);
                }
                this.openDialog(dialog);
            }
        } else {
            const shipLog = shipLogs[0];
            if (Number(shipLog.shipOperate) === GameConstans.SHIP_LOG_TYPE.ATTACK_OPERATE || Number(shipLog.shipOperate) === GameConstans.SHIP_LOG_TYPE.ATTACKED_OPERATE) {
                const report: AttackReport = {
                    processorAttack: Number(shipLog.result) < 0 ? 1 : 0,
                    reward: Number(shipLog.result),
                    attackStrategy: null,
                    attackedStrategy: null,
                    fullCoolingTime: null,
                    attackCoolingTime: null,
                }
                this.dialogReport.getChildByName('SubTitle_label').getComponent(Label).string = 'PLUNDER';
                this.dialogReport.getComponent(DialogReport).plunderContent(report);
            }
            if (Number(shipLog.shipOperate) === GameConstans.SHIP_LOG_TYPE.JUMP_OPERATE || Number(shipLog.shipOperate) === GameConstans.SHIP_LOG_TYPE.FLIGHT_OPERATE) {
                this.dialogReport.getChildByName('SubTitle_label').getComponent(Label).string = Number(shipLog.shipOperate) === GameConstans.SHIP_LOG_TYPE.JUMP_OPERATE ? 'HYPERJUMP' : 'FLIGHT';
                this.dialogReport.getComponent(DialogReport).jumpContent(shipLog);
            }
            if (Number(shipLog.shipOperate) === GameConstans.SHIP_LOG_TYPE.COLLECT_OPERATE) {
                this.dialogReport.getChildByName('SubTitle_label').getComponent(Label).string = 'COLLECT';
                this.dialogReport.getComponent(DialogReport).collectContent(shipLog);
            }
            if (Number(shipLog.shipOperate) === GameConstans.SHIP_LOG_TYPE.OCCUPY_OPERATE) {
                this.dialogReport.getChildByName('SubTitle_label').getComponent(Label).string = 'OCCUPY';
                this.dialogReport.getComponent(DialogReport).occupyContent(shipLog);
            }
            this.openDialog(this.dialogReport);
        }
    }

    /*
     *@Author: yozora
     *@Description: 对话框流程控制
     *@Date: 2022-02-09 17:09:34
     */
    public changeDialogProcess(dialog: Node, button_type: number, action_type: number, ...arg) {
        if (button_type === GameConstans.DIALOG_TYPE.ACTION.CLOSE) {
            this.closeAction(dialog, action_type, ...arg);
        }
        if (button_type === GameConstans.DIALOG_TYPE.ACTION.NO) {
            this.noAction(dialog, action_type, ...arg);
        }
        if (button_type === GameConstans.DIALOG_TYPE.ACTION.YES) {
            this.yesAction(dialog, action_type, ...arg);
        }
    }

    /*
     *@Author: yozora
     *@Description: 重置到星图场景
     *@Date: 2022-02-21 14:29:41
     */
    private closeAction(dialog: Node, action_type: number, ...arg) {
        this.closeDialog(dialog);
        if (!this.myShipBoard) {
            this.myShipBoard = this.canvas.getChildByName('Starmap_area').getChildByName('Ship_board_large');
        }
        this.myShipBoard.getComponent(ShipBoardLarge).invisibleTimeout(dialog.getComponent(Dialog).getShipCode());
    }

    /*
     *@Author: yozora
     *@Description: NO 操作
     *@Date: 2022-02-09 17:10:44
     */
    private noAction(dialog: Node, action_type: number, ...arg) {
        // 掠夺状态重置
        if (this.userOperateManager.userOperateType === GameConstans.RESET_TYPE.PLANET.PLUNDER) {
            // 重置掠夺当前流程
            if (action_type === GameConstans.DIALOG_TYPE.ACTION.PLUNDER_4) {
                // 激活面板状态
                this.activeShipBoardButton(this.userOperateManager.userOperateType);
            }
            this.updateTooltipContent(GameConstans.TIPS_CONTENT.NULL);
            // 重置用户状态
            this.updateUserOperateType(this.userOperateManager.userOperateType, GameConstans.RESET_TYPE.NULL);
        }
        // 跃迁状态重置
        if (this.userOperateManager.userOperateType === GameConstans.RESET_TYPE.PLANET.JUMP
            || this.userOperateManager.userOperateType === GameConstans.RESET_TYPE.PLANET.FLIGHT) {
            // 激活跃迁-重置跃迁当前流程
            if (action_type === GameConstans.DIALOG_TYPE.ACTION.JUMP_4) {
                this.changeUserProcess(GameConstans.PROCESS_TYPE.NULL);
                // 修改上一个场景
                find('GameManager').getComponent(GameManager)._lastActiveType = GameConstans.SCENCE_TYPE.STARMAP;
                // 激活面板状态
                this.activeShipBoardButton(this.userOperateManager.userOperateType);
            }
            // 激活飞行-重置跃迁当前流程
            else if (action_type === GameConstans.DIALOG_TYPE.ACTION.FLIGHT_4) {
                this.changeUserProcess(GameConstans.PROCESS_TYPE.NULL);
                // 激活面板状态
                this.activeShipBoardButton(this.userOperateManager.userOperateType);
            }
            // 返回流程
            else {
                // 重置飞船面板状态
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.BACK_PROCESS);
            }
        }
        // 采集或停止采集状态重置
        if (this.userOperateManager.userOperateType === GameConstans.RESET_TYPE.PLANET.COLLECT
            || this.userOperateManager.userOperateType === GameConstans.RESET_TYPE.PLANET.STOP_COLLECT) {
            this.updateTooltipContent(GameConstans.TIPS_CONTENT.NULL);
            this.updateUserOperateType(this.userOperateManager.userOperateType, GameConstans.RESET_TYPE.NULL);
            this.unactivedShipboardButton(null, false, GameConstans.RESET_TYPE.PLANET.COLLECT);
        }
        // 占领或停止占领状态重置
        if (this.userOperateManager.userOperateType === GameConstans.RESET_TYPE.PLANET.OCCUPY
            || this.userOperateManager.userOperateType === GameConstans.RESET_TYPE.PLANET.STOP_OCCUPY) {
            this.updateTooltipContent(GameConstans.TIPS_CONTENT.NULL);
            this.updateUserOperateType(this.userOperateManager.userOperateType, GameConstans.RESET_TYPE.NULL);
            this.unactivedShipboardButton(null, false, GameConstans.RESET_TYPE.PLANET.OCCUPY);
        }
        // 返回操作场景
        this.updateScene(find('GameManager').getComponent(GameManager)._activeType);
        this.closeDialog(dialog);
    }

    /*
     *@Author: yozora
     *@Description: YES 操作
     *@Date: 2022-02-09 17:10:53
     */
    private yesAction(dialog: Node, action_type: number, ...arg) {
        if (this.userOperateManager.userOperateType === GameConstans.RESET_TYPE.PLANET.JUMP || this.userOperateManager.userOperateType === GameConstans.RESET_TYPE.PLANET.FLIGHT) {
            if (this.userOperateManager.userOperateType === GameConstans.RESET_TYPE.PLANET.JUMP &&
                this.userOperateManager.currentJumpProcess === GameConstans.PROCESS_TYPE.JUMP.BEFORE_CONFIRM_PLANET) {
                action_type = GameConstans.DIALOG_TYPE.ACTION.JUMP_3;
            }
            if (this.userOperateManager.userOperateType === GameConstans.RESET_TYPE.PLANET.FLIGHT &&
                this.userOperateManager.currentJumpProcess === GameConstans.PROCESS_TYPE.JUMP.BEFORE_CONFIRM_PLANET) {
                action_type = GameConstans.DIALOG_TYPE.ACTION.FLIGHT_3;
            }
            this.jumpProcess(action_type, ...arg);
        }
        if (this.userOperateManager.userOperateType === GameConstans.RESET_TYPE.PLANET.COLLECT) {
            if (this.userOperateManager.currentCollectProcess === GameConstans.PROCESS_TYPE.COLLECT.IN) {
                action_type = GameConstans.DIALOG_TYPE.ACTION.COLLECT_3;
            }
            this.collectProcess(action_type, ...arg);
        }
        if (this.userOperateManager.userOperateType === GameConstans.RESET_TYPE.PLANET.OCCUPY) {
            if (this.userOperateManager.currentOccupyProcess === GameConstans.PROCESS_TYPE.OCCUPY.IN) {
                action_type = GameConstans.DIALOG_TYPE.ACTION.OCCUPY_3;
            }
            this.occupyProcess(action_type, ...arg);
        }
        if (this.userOperateManager.userOperateType === GameConstans.RESET_TYPE.PLANET.STOP_COLLECT) {
            if (this.userOperateManager.currentCollectProcess === GameConstans.PROCESS_TYPE.COLLECT.IN) {
                action_type = GameConstans.DIALOG_TYPE.ACTION.COLLECT_3;
            }
            this.stopCollectProcess(action_type, ...arg);
        }
        if (this.userOperateManager.userOperateType === GameConstans.RESET_TYPE.PLANET.STOP_OCCUPY) {
            if (this.userOperateManager.currentOccupyProcess === GameConstans.PROCESS_TYPE.OCCUPY.IN) {
                action_type = GameConstans.DIALOG_TYPE.ACTION.OCCUPY_3;
            }
            this.stopOccupyProcess(action_type, ...arg);
        }
        if (this.userOperateManager.userOperateType === GameConstans.RESET_TYPE.PLANET.PLUNDER) {
            if (this.userOperateManager.currentPlunderProcess === GameConstans.PROCESS_TYPE.PLUNDER.BEFORE_CONFIRM_TARGET) {
                // 锁定对手
                HttpRequest.confirmLockShip(this.dataManager.getShipCode(), this.dataManager.getTargetShipCode()).then((res) => {
                    if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                        action_type = GameConstans.DIALOG_TYPE.ACTION.PLUNDER_1;
                        this.plunderProcess(action_type, ...arg);
                    } else {
                        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.TOAST, res.msg);
                    }

                }).catch((err) => {
                    console.error(err);
                });
            }
            else {
                this.plunderProcess(action_type, ...arg);
            }
        }
    }

    /*
     *@Author: yozora 
     *@Description: 跃迁流程
     *@Date: 2022-02-10 16:15:07
     */
    private jumpProcess(action_type: number, ...arg) {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.STOP_PROCESS, true);
        // 星球跃迁操作
        if (action_type === GameConstans.DIALOG_TYPE.ACTION.JUMP_2) {
            this.changeUserProcess(GameConstans.PROCESS_TYPE.JUMP.BEFORE_CONFIRM_PLANET);
            // 隐藏提示语
            this.updateTooltipContent(GameConstans.TIPS_CONTENT.NULL);
            // 显示对话框
            this.changeDialog(GameConstans.DIALOG_TYPE.SELECT_BASE, GameConstans.TIPS_CONTENT.CONFIRM_JUMP);
        }
        // 星球飞行操作
        if (action_type === GameConstans.DIALOG_TYPE.ACTION.FLIGHT_2) {
            this.changeUserProcess(GameConstans.PROCESS_TYPE.JUMP.BEFORE_CONFIRM_PLANET);
            // 隐藏提示语
            this.updateTooltipContent(GameConstans.TIPS_CONTENT.NULL);
            // 显示对话框
            this.changeDialog(GameConstans.DIALOG_TYPE.SELECT_BASE, GameConstans.TIPS_CONTENT.CONFIRM_FLIGHT);
        }
        // 确认跃迁或飞行
        if (action_type === GameConstans.DIALOG_TYPE.ACTION.JUMP_3 || action_type === GameConstans.DIALOG_TYPE.ACTION.FLIGHT_3) {
            // 修改进程
            this.changeUserProcess(GameConstans.PROCESS_TYPE.JUMP.FINISH);
            this.closeDialog(this.dialogSelectBase);
            // 显示提示语
            if (this.userOperateManager.userOperateType === GameConstans.RESET_TYPE.PLANET.JUMP) {
                this.updateTooltipContent(GameConstans.TIPS_CONTENT.JUMPING);
            } else {
                this.updateTooltipContent(GameConstans.TIPS_CONTENT.FLIGHTING);
            }
            // 回到操作场景
            if (action_type === GameConstans.DIALOG_TYPE.ACTION.FLIGHT_3) {
                this.noAction(this.dialogSelectBase, GameConstans.DIALOG_TYPE.ACTION.FLIGHT_4);
            } else {
                this.noAction(this.dialogSelectBase, GameConstans.DIALOG_TYPE.ACTION.JUMP_4);
            }
        }
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.STOP_PROCESS, false);
    }

    /*
     *@Author: yozora
     *@Description: 采集流程
     *@Date: 2022-02-10 17:33:51
     */
    private collectProcess(action_type: number, ...arg) {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.STOP_PROCESS, true);
        // 确认收集
        if (action_type === GameConstans.DIALOG_TYPE.ACTION.COLLECT_3) {
            this.closeDialog(this.dialogSelectLarge);
            // 激活面板状态
            this.activeShipBoardButton(this.userOperateManager.userOperateType);
            this.updateTooltipContent(GameConstans.TIPS_CONTENT.COLLECTING);
            // 重置用户进程
            this.changeUserProcess(GameConstans.PROCESS_TYPE.NULL);
            // 返回操作场景
            this.updateScene(find('GameManager').getComponent(GameManager)._activeType);
        }
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.STOP_PROCESS, false);
    }

    /*
     *@Author: yozora
     *@Description: 停止采集流程
     *@Date: 2022-02-11 11:28:15
     */
    private stopCollectProcess(action_type: number, ...arg) {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.STOP_PROCESS, true);
        console.log("action_type: ", action_type);
        // 停止收集
        if (action_type === GameConstans.DIALOG_TYPE.ACTION.COLLECT_3) {
            this.closeDialog(this.dialogSelectLarge);
            // 激活面板状态
            this.activeShipBoardButton(this.userOperateManager.userOperateType);
            this.updateTooltipContent(GameConstans.TIPS_CONTENT.STOP_COLLECTING);
            // 重置用户进程
            this.changeUserProcess(GameConstans.PROCESS_TYPE.NULL);
            // 返回操作场景
            this.updateScene(find('GameManager').getComponent(GameManager)._activeType);
        }
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.STOP_PROCESS, false);
    }

    /*
     *@Author: yozora
     *@Description: 占领流程
     *@Date: 2022-02-10 17:33:58
     */
    private occupyProcess(action_type: number, ...arg) {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.STOP_PROCESS, true);
        // 确认占领
        if (action_type === GameConstans.DIALOG_TYPE.ACTION.OCCUPY_3) {
            this.closeDialog(this.dialogSelectLarge);
            // 激活面板状态
            this.activeShipBoardButton(this.userOperateManager.userOperateType);
            this.updateTooltipContent(GameConstans.TIPS_CONTENT.OCCUPING);
            // 重置用户进程
            this.changeUserProcess(GameConstans.PROCESS_TYPE.NULL);
            // 返回操作场景
            this.updateScene(find('GameManager').getComponent(GameManager)._activeType);
        }
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.STOP_PROCESS, false);
    }

    /*
     *@Author: yozora
     *@Description: 停止占领流程
     *@Date: 2022-02-11 11:28:23
     */
    private stopOccupyProcess(action_type: number, ...arg) {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.STOP_PROCESS, true);
        // 停止占领
        if (action_type === GameConstans.DIALOG_TYPE.ACTION.OCCUPY_3) {
            this.closeDialog(this.dialogSelectLarge);
            // 激活面板状态
            this.activeShipBoardButton(this.userOperateManager.userOperateType);
            this.updateTooltipContent(GameConstans.TIPS_CONTENT.STOP_OCCUPYING);
            // 重置用户进程
            this.changeUserProcess(GameConstans.PROCESS_TYPE.NULL);
            // 返回操作场景
            this.updateScene(find('GameManager').getComponent(GameManager)._activeType);
        }
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.STOP_PROCESS, false);
    }

    /*
     *@Author: yozora
     *@Description: 战斗流程处理
     *@Date: 2022-02-10 15:22:24
     */
    private plunderProcess(action_type: number, ...arg) {
        // 进行选择策略流程
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.STOP_PROCESS, true);
        if (action_type === GameConstans.DIALOG_TYPE.ACTION.PLUNDER_1) {
            // 取消隐身计时器
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.CANCEL_INVISIBLE);
            this.changeUserProcess(GameConstans.PROCESS_TYPE.PLUNDER.BEFORE_CONFIRM_TACTICS);
            this.closeDialog(this.dialogSelectBase);
            this.openDialog(this.dialogTactics);
        }
        // 进行战斗流程
        if (action_type === GameConstans.DIALOG_TYPE.ACTION.PLUNDER_2) {
            this.changeUserProcess(GameConstans.PROCESS_TYPE.PLUNDER.FINISH);
            this.closeDialog(this.dialogTactics);
            if (!this.myShipBoard) {
                this.myShipBoard = this.canvas.getChildByName('Starmap_area').getChildByName('Ship_board_large');
            }
            if (!this.targetShipBoard) {
                this.targetShipBoard = this.canvas.getChildByName('Planet_area').getChildByName('Ship_board_large_target');
            }
            // 确认策略
            console.log("choose tactics: ", arg[0]);
            // 战斗流程
            this.canvas.getChildByName('Attack_label').active = true;
            // 修改面板位置
            tween(this.myShipBoard.getComponent(Widget)).to(1, { horizontalCenter: GameConstans.UI_POSITON.ATTACK_MY_BOARD_H }, { easing: 'smooth', })
                .parallel(tween(this.targetShipBoard.getComponent(Widget)).to(1, { horizontalCenter: GameConstans.UI_POSITON.ATTACK_TARGET_BOARD_H }, { easing: 'smooth' }).start())
                .start();
            // 结算战斗
            HttpRequest.confirmAttack(this.dataManager.getShipCode(), this.dataManager.getPlanetCode(), arg[0][0]).then((res) => {
                if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                    // 显示战斗策略
                    this.processTactics(res.data);
                } else {
                    ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.TOAST, res.msg);
                }
            }).catch((err) => {
                console.error(err);
            });
        }
        // 结束战斗流程
        if (action_type === GameConstans.DIALOG_TYPE.ACTION.PLUNDER_3) {
            // 关闭战斗面板
            this.myShipBoard.getChildByName('Tactics').active = false;
            this.targetShipBoard.getChildByName('Tactics').active = false;
            this.noAction(this.dialogReport, GameConstans.DIALOG_TYPE.ACTION.PLUNDER_4);
        }
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.STOP_PROCESS, false);
    }

    /*
     *@Author: yozora
     *@Description: 返回操作
     *@Date: 2022-02-15 15:48:11
     */
    public backProcess(action_type: number, ...arg) {
        // 返回选择飞船
        if (action_type === GameConstans.DIALOG_TYPE.ACTION.PLUNDER_1) {
            console.log("back to select ship from before confirm target.");
            this.closeDialog(this.dialogSelectBase);
            // 恢复飞船面板状态
            ClientEvent.dispatchEvent(
                GameConstans.CLIENTEVENT_LIST.PLANET.CLICK_SHIP_BOARD,
                null,
                false);
            // 展示敌方飞船列表
            this.canvas.getChildByName('Hanger-planet').active = true;
            return;
        }
        // 返回选择飞船
        if (action_type === GameConstans.DIALOG_TYPE.ACTION.PLUNDER_2) {
            console.log("back to select ship from before confirm tactics.");
            this.closeDialog(this.dialogTactics);
            // 恢复飞船面板状态
            ClientEvent.dispatchEvent(
                GameConstans.CLIENTEVENT_LIST.PLANET.CLICK_SHIP_BOARD,
                null,
                false);
            // 展示敌方飞船列表
            this.canvas.getChildByName('Hanger-planet').active = true;
            return;
        }

        // 返回选择跃迁或飞行星球
        if (action_type === GameConstans.DIALOG_TYPE.ACTION.JUMP_2) {
            console.log("back to select jump or flight planet.");
            this.closeDialog(this.dialogSelectBase);
            // 返回上一个场景
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_SCENCE_LIST.CHANGE_BACK_SCENE);
        }

        // 返回操作页面
        if (action_type === GameConstans.DIALOG_TYPE.ACTION.OCCUPY_1) {
            console.log('back to occupy main.');
            this.closeDialog(this.dialogSelectLarge);
            // 重置用户操作类型
            this.updateUserOperateType(this.userOperateManager.userOperateType, GameConstans.RESET_TYPE.NULL);
            // 切换按钮状态
            this.unactivedShipboardButton(null, false, GameConstans.RESET_TYPE.PLANET.OCCUPY);
            // 返回操作场景
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_SCENCE_LIST.CHANGE_LAST_SCENE);
        }

        if (action_type === GameConstans.DIALOG_TYPE.ACTION.COLLECT_1) {
            console.log('back to collect main.');
            this.closeDialog(this.dialogSelectLarge);
            // 重置用户操作类型
            this.updateUserOperateType(this.userOperateManager.userOperateType, GameConstans.RESET_TYPE.NULL);
            // 切换按钮状态
            this.unactivedShipboardButton(null, false, GameConstans.RESET_TYPE.PLANET.COLLECT);
            // 返回操作场景
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_SCENCE_LIST.CHANGE_LAST_SCENE);
        }

    }

    /*
     *@Author: yozora
     *@Description: 处理战斗流程
     *@Date: 2022-02-28 19:12:34
     */
    private processTactics(attackResponse: any) {
        this.myShipBoard.getChildByName('Tactics').removeAllChildren();
        this.targetShipBoard.getChildByName('Tactics').removeAllChildren();
        const attackStrategy = attackResponse.attackStrategy;
        const attackedStrategy = attackResponse.attackedStrategy;

        console.log('attackStrategy:', attackStrategy);
        console.log('attackedStrategy:', attackedStrategy);
        let attackTactics: Node;
        let attackedTactics: Node;

        attackStrategy === "1" ? attackTactics = instantiate(this.tactics_attack_prefab) : attackStrategy === "2" ? attackTactics = instantiate(this.tactics_defend_prefab) : attackTactics = instantiate(this.tactics_speed_prefab);
        attackedStrategy === "1" ? attackedTactics = instantiate(this.tactics_attack_prefab) : attackedStrategy === "2" ? attackedTactics = instantiate(this.tactics_defend_prefab) : attackedTactics = instantiate(this.tactics_speed_prefab);
        this.myShipBoard.getChildByName('Tactics').addChild(attackTactics);
        this.targetShipBoard.getChildByName('Tactics').addChild(attackedTactics);
        this.myShipBoard.getChildByName('Tactics').active = true;
        this.targetShipBoard.getChildByName('Tactics').active = true;

        this.scheduleOnce(() => {
            // 显示战斗结果
            this.canvas.getChildByName('Attack_label').active = false;
            // 修改面板位置
            tween(this.myShipBoard.getComponent(Widget)).to(1, { horizontalCenter: GameConstans.UI_POSITON.CLICKED_MY_BOARD_H }, {
                easing: 'smooth', 'onComplete': () => {
                    this.openDialog(this.dialogReport);
                    this.dialogReport.getChildByName('SubTitle_label').getComponent(Label).string = 'PLUNDER';
                    this.dialogReport.getComponent(DialogReport).plunderContent(attackResponse);
                    tween(this.dialogReport).to(0.08, { scale: new Vec3(1, 0.1, 1) }).to(0.42, { scale: new Vec3(1, 1, 1) }).start();
                }
            })
                .parallel(tween(this.targetShipBoard.getComponent(Widget)).to(1, { horizontalCenter: GameConstans.UI_POSITON.CLICKED_TARGET_BOARD_H }, { easing: 'smooth' }).start())
                .start();
        }, 2);
    }

    /*
     *@Author: yozora
     *@Description: 打开对话框
     *@Date: 2022-02-10 15:31:57
     */
    private openDialog(dialog: Node) {
        dialog.active = true;
        tween(dialog).to(0.08, { scale: new Vec3(1, 0.1, 1) }).to(0.42, { scale: new Vec3(1, 1, 1) }).start();
    }

    /*
     *@Author: yozora
     *@Description: 关闭对话框
     *@Date: 2022-02-10 15:32:04
     */
    private closeDialog(dialog: Node) {
        dialog.setScale(this.initDialogScale);
        dialog.active = false;
    }

    /*
     *@Author: yozora
     *@Description: 切换用户流程
     *@Date: 2022-02-15 14:24:36
     */
    private changeUserProcess(processType) {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.CHANGE_PROCESS, processType);
    }

    /*
     *@Author: yozora
     *@Description: 修改提示文字内容
     *@Date: 2022-02-11 14:15:55
     */
    private updateTooltipContent(content: string) {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIPS_LIST.CHANGE_TIPS_CONTENT, content);
    }

    /*
     *@Author: yozora
     *@Description: 激活飞船面板按钮
     *@Date: 2022-02-16 14:29:55
     */
    private activeShipBoardButton(operateType: number) {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.ACTIVE_SHIP_BOARD_BUTTON, operateType);
    }

    /*
     *@Author: yozora
     *@Description: 修改飞船面板激活样式
     *@Date: 2022-02-11 14:45:14
     */
    private unactivedShipboardButton(solarSystemCode: string, pressed: boolean, activeType?: number) {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.CHANGE_SHIP_BOARD_BUTTON, solarSystemCode, pressed, activeType);
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
     *@Description: 修改场景
     *@Date: 2022-02-11 14:20:55
     */
    private updateScene(scene: number) {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_SCENCE_LIST.CHANGE_LAST_SCENE, scene);
    }

    /*
     *@Author: yozora
     *@Description: 加载资源
     *@Date: 2022-02-08 19:04:05
     */
    private loadResource() {
        this.dialogReport = instantiate(this.dialog_report_prefab);
        this.canvas.getChildByName('Dialog_area').addChild(this.dialogReport);
        this.dialogReport.active = false;
        this.dialogSelectBase = instantiate(this.dialog_base_prefab);
        this.canvas.getChildByName('Dialog_area').addChild(this.dialogSelectBase);
        this.dialogSelectBase.active = false;
        this.dialogSelectLarge = instantiate(this.dialog_large_prefab);
        this.canvas.getChildByName('Dialog_area').addChild(this.dialogSelectLarge);
        this.dialogSelectLarge.active = false;
        this.dialogInfo = instantiate(this.dialog_info_prefab);
        this.canvas.getChildByName('Dialog_area').addChild(this.dialogInfo);
        this.dialogInfo.active = false;
        this.dialogTactics = instantiate(this.dialog_tactics_prefab);
        this.canvas.getChildByName('Dialog_area').addChild(this.dialogTactics);
        this.dialogTactics.active = false;
    }
}

