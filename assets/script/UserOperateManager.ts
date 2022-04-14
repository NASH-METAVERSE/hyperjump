
import { _decorator, Component, Node, find } from 'cc';
import { GameConstans } from './entity/GameConstans';
import { GameManager } from './GameManager';
import { ClientEvent } from './utils/ClientEvent';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = UserOperateManager
 * DateTime = Mon Feb 07 2022 14:20:03 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = UserOperateController.ts
 * FileBasenameNoExtension = UserOperateController
 * URL = db://assets/script/UserOperateController.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 * 用户行为管理
 */

@ccclass('UserOperateManager')
export class UserOperateManager extends Component {

    /*
     * 用户行为类型
     */
    public userOperateType: number = GameConstans.RESET_TYPE.NULL;

    /*
     * 用户操作场景
     */
    public userOperateScene: number = GameConstans.SCENCE_TYPE.STARMAP;

    /*
     * 当前跃迁进程
     */
    public currentJumpProcess: number = -1;

    /*
     * 当前占领进程
     */
    public currentOccupyProcess: number = -1;

    /*
     * 当前采集进程
     */
    public currentCollectProcess: number = -1;

    /*
     * 当前掠夺进程
     */
    public currentPlunderProcess: number = -1;

    /*
     * 场景标识(指定最上级场景)
     */
    private sceneFlag: number = GameConstans.SCENCE_TYPE.NULL;

    /*
     * 停止操作标识(停止返回操作)
     */
    private stopFlag: boolean = false;

    /*
     * 取消状态标识(先返回场景，再清除状态)
     */
    private cancelFlag: boolean = false;

    start() {
        ClientEvent.on(GameConstans.CLIENTEVENT_USER_LIST.CHANGE_USER_OPERATION, this.changeUserOperate, this);
        ClientEvent.on(GameConstans.CLIENTEVENT_USER_LIST.CHANGE_PROCESS, this.changeProcess, this);
        ClientEvent.on(GameConstans.CLIENTEVENT_USER_LIST.BACK_PROCESS, this.backProcess, this);
        ClientEvent.on(GameConstans.CLIENTEVENT_USER_LIST.STOP_PROCESS, this.stopProcess, this);
        ClientEvent.on(GameConstans.CLIENTEVENT_USER_LIST.CANCEL_PROCESS, this.cancelProcess, this);
        ClientEvent.on(GameConstans.CLIENTEVENT_USER_LIST.JUMP, this.jump, this);
        ClientEvent.on(GameConstans.CLIENTEVENT_USER_LIST.OCCUPY, this.occupy, this);
        ClientEvent.on(GameConstans.CLIENTEVENT_USER_LIST.COLLECT, this.collect, this);
        ClientEvent.on(GameConstans.CLIENTEVENT_USER_LIST.PLUNDER, this.plunder, this);
    }

    /*
     *@Author: yozora
     *@Description: 修改用户操作类型
     *@Date: 2022-02-10 15:36:19
     */
    private changeUserOperate(from_type: number, type: number, clearTips: boolean) {
        if (clearTips) {
            this.userOperateType = GameConstans.RESET_TYPE.NULL;
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIPS_LIST.CHANGE_TIPS_CONTENT, GameConstans.TIPS_CONTENT.NULL);
            this.currentJumpProcess = -1;
            this.currentOccupyProcess = -1;
            this.currentCollectProcess = -1;
            this.currentPlunderProcess = -1;
            return;
        }
        this.userOperateType = type;
        if (type === GameConstans.RESET_TYPE.NULL) {
            // 通知面板解除激活状态
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIME_LIST.INIT_BOARD_BUTTON_STATUS);
        }
    }

    /*
     *@Author: yozora
     *@Description: 切换当前流程
     *@Date: 2022-02-15 14:23:34
     */
    private changeProcess(processType: number) {
        if (this.userOperateType === GameConstans.RESET_TYPE.PLANET.PLUNDER) {
            this.currentPlunderProcess = processType;
        }
        if (this.userOperateType === GameConstans.RESET_TYPE.PLANET.JUMP || this.userOperateType === GameConstans.RESET_TYPE.PLANET.FLIGHT) {
            this.currentJumpProcess = processType;
        }
        if (this.userOperateType === GameConstans.RESET_TYPE.PLANET.OCCUPY || this.userOperateType === GameConstans.RESET_TYPE.PLANET.STOP_OCCUPY) {
            this.currentOccupyProcess = processType;
        }
        if (this.userOperateType === GameConstans.RESET_TYPE.PLANET.COLLECT || this.userOperateType === GameConstans.RESET_TYPE.PLANET.STOP_COLLECT) {
            this.currentCollectProcess = processType;
        }
    }

    /*
     *@Author: yozora
     *@Description: 上一步操作
     *@Date: 2022-02-15 14:47:08
     */
    private backProcess() {
        if (!this.stopFlag) {
            if (this.userOperateType === GameConstans.RESET_TYPE.PLANET.PLUNDER) {
                this.backPlunderProcess();
            } else if (this.userOperateType === GameConstans.RESET_TYPE.PLANET.JUMP || this.userOperateType === GameConstans.RESET_TYPE.PLANET.FLIGHT) {
                this.backJumpProcess();
            } else if (this.userOperateType === GameConstans.RESET_TYPE.PLANET.OCCUPY || this.userOperateType === GameConstans.RESET_TYPE.PLANET.STOP_OCCUPY) {
                this.backOccupyProcess();
            } else if (this.userOperateType === GameConstans.RESET_TYPE.PLANET.COLLECT || this.userOperateType === GameConstans.RESET_TYPE.PLANET.STOP_COLLECT) {
                this.backCollectProcess();
            } else {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_SCENCE_LIST.CHANGE_BACK_SCENE);
            }
        }
    }

    /*
    *@Author: yozora
    *@Description: 跃迁返回流程
    *@Date: 2022-02-15 16:34:41
    */
    private backJumpProcess() {
        if (this.currentJumpProcess === GameConstans.PROCESS_TYPE.NULL || this.currentJumpProcess === GameConstans.PROCESS_TYPE.JUMP.FINISH) {
            return;
        }
        // IN >>> IN
        if (this.currentJumpProcess === GameConstans.PROCESS_TYPE.JUMP.IN) {
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_SCENCE_LIST.CHANGE_BACK_SCENE, this.sceneFlag);
            if (!this.cancelFlag) {
                return;
            } else {
                this.cancelFlag = false;
                this.sceneFlag = GameConstans.SCENCE_TYPE.NULL;
            }
        }
        this.currentJumpProcess--;
        console.log('currentJumpProcess: ', this.currentJumpProcess);
        // IN >>> NULL
        if (this.currentJumpProcess === GameConstans.PROCESS_TYPE.NULL) {
            // 重置用户操作类型
            this.changeUserOperate(GameConstans.RESET_TYPE.PLANET.JUMP, GameConstans.RESET_TYPE.NULL, false);
            // 重置按钮状态
            this.updateShipboardButton(GameConstans.RESET_TYPE.PLANET.JUMP);
            // 修改提示语
            this.updateTooltipContent(GameConstans.TIPS_CONTENT.NULL);
        }
        // CONFIRM_PLANET >>> IN
        if (this.currentJumpProcess === GameConstans.PROCESS_TYPE.JUMP.IN) {
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.BACK_BUTTON_ACTION, GameConstans.DIALOG_TYPE.ACTION.JUMP_2);
        }
    }

    /*
     *@Author: yozora
     *@Description: 掠夺返回流程
     *@Date: 2022-02-15 16:34:24
     */
    private backPlunderProcess() {
        if (this.currentPlunderProcess === GameConstans.PROCESS_TYPE.NULL || this.currentPlunderProcess === GameConstans.PROCESS_TYPE.PLUNDER.FINISH) {
            return;
        }
        this.currentPlunderProcess--;
        // IN >>> NULL
        console.log('currentPlunderProcess: ', this.currentPlunderProcess);
        if (this.currentPlunderProcess === GameConstans.PROCESS_TYPE.NULL) {
            // 重置用户操作类型
            this.changeUserOperate(GameConstans.RESET_TYPE.PLANET.PLUNDER, GameConstans.RESET_TYPE.NULL, false);
            // 重置按钮状态
            this.updateShipboardButton(GameConstans.RESET_TYPE.PLANET.PLUNDER);
            // 修改提示语
            this.updateTooltipContent(GameConstans.TIPS_CONTENT.NULL);
            // 返回操作场景
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_SCENCE_LIST.CHANGE_LAST_SCENE);
        }
        // BEFORE_CONFIRM_TARGET >>> IN
        if (this.currentPlunderProcess === GameConstans.PROCESS_TYPE.PLUNDER.IN) {
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.BACK_BUTTON_ACTION, GameConstans.DIALOG_TYPE.ACTION.PLUNDER_1);
        }
        // BEFORE_CONFIRM_TACTICS >>> BEFORE_CONFIRM_TARGET
        if (this.currentPlunderProcess === GameConstans.PROCESS_TYPE.PLUNDER.BEFORE_CONFIRM_TARGET) {
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.BACK_BUTTON_ACTION, GameConstans.DIALOG_TYPE.ACTION.PLUNDER_2);
        }
    }

    /*
     *@Author: yozora
     *@Description: 采集返回流程
     *@Date: 2022-02-17 16:22:22
     */
    private backCollectProcess() {
        if (this.currentCollectProcess === GameConstans.PROCESS_TYPE.NULL || this.currentCollectProcess === GameConstans.PROCESS_TYPE.COLLECT.FINISH) {
            return;
        }
        this.currentCollectProcess--;
        // IN >>> NULL
        console.log('currentCollectProcess: ', this.currentCollectProcess);
        if (this.currentCollectProcess === GameConstans.PROCESS_TYPE.NULL) {
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.BACK_BUTTON_ACTION, GameConstans.DIALOG_TYPE.ACTION.COLLECT_1);
        }
    }

    /*
     *@Author: yozora
     *@Description: 占领返回流程
     *@Date: 2022-02-17 15:09:17
     */
    private backOccupyProcess() {
        if (this.currentOccupyProcess === GameConstans.PROCESS_TYPE.NULL || this.currentOccupyProcess === GameConstans.PROCESS_TYPE.OCCUPY.FINISH) {
            return;
        }
        this.currentOccupyProcess--;
        // IN >>> NULL
        console.log('currentOccupyProcess: ', this.currentOccupyProcess);
        if (this.currentOccupyProcess === GameConstans.PROCESS_TYPE.NULL) {
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.BACK_BUTTON_ACTION, GameConstans.DIALOG_TYPE.ACTION.OCCUPY_1);
        }
    }

    /*
     *@Author: yozora
     *@Description: 停止返回流程
     *@Date: 2022-02-17 15:09:29
     */
    private stopProcess(flag: boolean) {
        this.stopFlag = flag;
    }

    /*
     *@Author: yozora
     *@Description: 停止返回更高级场景流程
     *@Date: 2022-02-17 15:09:39
     */
    private cancelProcess(flag: boolean) {
        this.cancelFlag = flag;
    }

    /*
     *@Author: yozora
     *@Description: 跃迁飞船
     *@Date: 2022-02-10 16:34:08
     */
    private jump(solarSystemCode: string, type: number) {
        this.currentJumpProcess = GameConstans.PROCESS_TYPE.JUMP.IN;
        if (type === GameConstans.RESET_TYPE.PLANET.JUMP) {
            this.userOperateType = GameConstans.RESET_TYPE.PLANET.JUMP;
            if (find('GameManager').getComponent(GameManager)._activeType === GameConstans.SCENCE_TYPE.PLANET) {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.BUTTON_ACTION, null, GameConstans.DIALOG_TYPE.ACTION.YES, GameConstans.DIALOG_TYPE.ACTION.JUMP_2);
            } else {
                // 修改提示语
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIPS_LIST.CHANGE_TIPS_CONTENT, GameConstans.TIPS_CONTENT.JUMP);
            }
        }
        if (type === GameConstans.RESET_TYPE.PLANET.FLIGHT) {
            this.userOperateType = GameConstans.RESET_TYPE.PLANET.FLIGHT;
            // 太阳系场景进入则修改最上级场景
            if (find('GameManager').getComponent(GameManager)._activeType === GameConstans.SCENCE_TYPE.SOLAR_SYSTEM) {
                this.sceneFlag = GameConstans.SCENCE_TYPE.SOLAR_SYSTEM;
            }
            // 星球场景进入则直接进行第二步
            if (find('GameManager').getComponent(GameManager)._activeType === GameConstans.SCENCE_TYPE.PLANET) {
                this.sceneFlag = GameConstans.SCENCE_TYPE.SOLAR_SYSTEM;
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.BUTTON_ACTION, null, GameConstans.DIALOG_TYPE.ACTION.YES, GameConstans.DIALOG_TYPE.ACTION.FLIGHT_2);
            } else {
                // 修改提示语
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIPS_LIST.CHANGE_TIPS_CONTENT, GameConstans.TIPS_CONTENT.FLIGHT);
            }
        }
    }

    /*
     *@Author: yozora
     *@Description: 占领星球
     *@Date: 2022-02-10 17:34:27
     */
    private occupy(planetCode: string, type: number) {
        this.currentOccupyProcess = GameConstans.PROCESS_TYPE.OCCUPY.IN;
        if (type === GameConstans.RESET_TYPE.PLANET.OCCUPY) {
            this.userOperateType = GameConstans.RESET_TYPE.PLANET.OCCUPY;
            // 清除星图资源
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.RESET_STARMAP, GameConstans.RESET_TYPE.PLANET.OCCUPY);
            // 进入星球界面
            ClientEvent.dispatchEvent(
                GameConstans.CLIENTEVENT_SCENCE_LIST.OPERATE_CHANGE_PLANET,
                planetCode,
                true,
            );
        }
        if (type === GameConstans.RESET_TYPE.PLANET.STOP_OCCUPY) {
            this.userOperateType = GameConstans.RESET_TYPE.PLANET.STOP_OCCUPY;
            // 清除星图资源
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.RESET_STARMAP, GameConstans.RESET_TYPE.PLANET.STOP_OCCUPY);
            // 进入星球界面
            ClientEvent.dispatchEvent(
                GameConstans.CLIENTEVENT_SCENCE_LIST.OPERATE_CHANGE_PLANET,
                planetCode,
                true,
            );
        }
    }

    /*
     *@Author: yozora
     *@Description: 采集星球
     *@Date: 2022-02-10 17:34:33
     */
    private collect(planetCode: string, type: number) {
        this.currentCollectProcess = GameConstans.PROCESS_TYPE.COLLECT.IN;
        if (type === GameConstans.RESET_TYPE.PLANET.COLLECT) {
            this.userOperateType = GameConstans.RESET_TYPE.PLANET.COLLECT;
            // 清除星图资源
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.RESET_STARMAP, GameConstans.RESET_TYPE.PLANET.COLLECT);
            // 进入星球界面
            ClientEvent.dispatchEvent(
                GameConstans.CLIENTEVENT_SCENCE_LIST.OPERATE_CHANGE_PLANET,
                planetCode,
                true,
            );
        }
        if (type === GameConstans.RESET_TYPE.PLANET.STOP_COLLECT) {
            this.userOperateType = GameConstans.RESET_TYPE.PLANET.STOP_COLLECT;
            // 清除星图资源
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.RESET_STARMAP, GameConstans.RESET_TYPE.PLANET.STOP_COLLECT);
            // 进入星球界面
            ClientEvent.dispatchEvent(
                GameConstans.CLIENTEVENT_SCENCE_LIST.OPERATE_CHANGE_PLANET,
                planetCode,
                true,
            );
        }
    }

    /*
    *@Author: yozora
    *@Description: 掠夺飞船
    *@Date: 2022-02-07 11:07:29
    */
    private plunder(planetCode: string) {
        this.currentPlunderProcess = GameConstans.PROCESS_TYPE.PLUNDER.IN;
        this.userOperateType = GameConstans.RESET_TYPE.PLANET.PLUNDER;
        // 清除星图资源
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.RESET_STARMAP, GameConstans.RESET_TYPE.PLANET.PLUNDER);

        // 修改提示语
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIPS_LIST.CHANGE_TIPS_CONTENT, GameConstans.TIPS_CONTENT.CONFIRM_SELECT_PLUNDER);

        // 进入星球界面
        ClientEvent.dispatchEvent(
            GameConstans.CLIENTEVENT_SCENCE_LIST.OPERATE_CHANGE_PLANET,
            planetCode,
            true,
        );
    }

    private updateShipboardButton(actionType: number) {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.RESET_SHIP_BOARD_BUTTON, actionType, null);
    }

    private updateTooltipContent(content: string) {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_TIPS_LIST.CHANGE_TIPS_CONTENT, content);
    }



}
