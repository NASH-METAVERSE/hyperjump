
import { _decorator, Component, Node, Label, instantiate, Widget, find, Vec3 } from 'cc';
import { AttackReport } from '../../entity/AttackReport';
import { GameConstans } from '../../entity/GameConstans';
import { ShipLogInfo } from '../../entity/ShipLogInfo';
import { UserOperateManager } from '../../UserOperateManager';
import { ClientEvent } from '../../utils/ClientEvent';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = DialogReport
 * DateTime = Thu Feb 10 2022 11:05:12 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = DialogReport.ts
 * FileBasenameNoExtension = DialogReport
 * URL = db://assets/script/ui/model/DialogReport.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('DialogReport')
export class DialogReport extends Component {

    /*
    * 初始化对话框缩放
   */
    private initDialogScale: Vec3 = new Vec3(0, 0, 1);

    /*
     * 副标题节点
     */
    private subTitle: Node = null;

    /*
     * 条目节点
     */
    private item: Node = null;

    /*
     * 条目内容节点
     */
    private itemContent: Node = null;

    private itemStartY: number = 118;

    private itemContentStartY: number = 107;

    private itemDistance: number = 30;

    private destroyFlag: boolean = false;

    onLoad() {
        this.subTitle = this.node.getChildByName('SubTitle_label');
        this.item = this.node.getChildByName('Item_1');
        this.itemContent = this.node.getChildByName('Item_label_1');
    }

    /*
     *@Author: yozora
     *@Description: 掠夺报告
     *@Date: 2022-02-10 11:26:07
     */
    public plunderContent(attackReport: AttackReport, destroyed?: boolean) {
        if (destroyed !== undefined) {
            this.destroyFlag = destroyed;
        }
        let result: string;
        // 判定胜负
        if (attackReport.processorAttack === 1) {
            this.itemContent.getComponent(Label).string = "MISSION COMPLETION: WIN";
            result = `WE GAINED ${attackReport.reward}`;
        } else if (attackReport.processorAttack === 0) {
            this.itemContent.getComponent(Label).string = "MISSION COMPLETION: LOSE";
            result = `WE LOST ${attackReport.reward}`;
        } else {
            this.itemContent.getComponent(Label).string = "MISSION COMPLETION: EVEN";
            result = `Draw. Be happy.`;
        }
        const item2 = this.node.getChildByName('Item_2');
        const item2Content = this.node.getChildByName('Item_label_2');
        item2Content.getComponent(Label).string = result;
        item2.active = true;
        item2Content.active = true
    }

    /*
     *@Author: yozora
     *@Description: 跃迁日志
     *@Date: 2022-02-24 17:28:39
     */
    public jumpContent(shipLog: ShipLogInfo, destroyed?: boolean) {

        if (destroyed !== undefined) {
            this.destroyFlag = destroyed;
        }

        this.itemContent.getComponent(Label).string = `TARGET PLANET NAME: ${shipLog.target}`;

        const item2 = this.node.getChildByName('Item_2');
        const item2Content = this.node.getChildByName('Item_label_2');
        item2Content.getComponent(Label).string = `TARGET PLANET OWNER: ${shipLog.planetOwner === null ? 'NONE' : shipLog.planetOwner}`;
        item2.active = true;
        item2Content.active = true;

        const item3 = this.node.getChildByName('Item_3');
        const item3Content = this.node.getChildByName('Item_label_3');
        item3Content.getComponent(Label).string = `TARGET RESOURCE: ${shipLog.planetMineral}`;
        item3.active = true;
        item3Content.active = true;

        const item4 = this.node.getChildByName('Item_4');
        const item4Content = this.node.getChildByName('Item_label_4');
        item4Content.getComponent(Label).string = `TIME COST: ${shipLog.costTime}`;
        item4.active = true;
        item4Content.active = true;

    }

    /*
     *@Author: yozora
     *@Description: 采集日志
     *@Date: 2022-02-28 16:25:35
     */
    public collectContent(shipLog: ShipLogInfo, destroyed?: boolean) {

        if (destroyed !== undefined) {
            this.destroyFlag = destroyed;
        }

        this.itemContent.getComponent(Label).string = `TARGET PLANET NAME: ${shipLog.target}`;

        const item2 = this.node.getChildByName('Item_2');
        const item2Content = this.node.getChildByName('Item_label_2');
        item2Content.getComponent(Label).string = `TIME COST: ${shipLog.costTime}`;
        item2.active = true;
        item2Content.active = true;

        const item3 = this.node.getChildByName('Item_3');
        const item3Content = this.node.getChildByName('Item_label_3');
        item3Content.getComponent(Label).string = `TOTAL COLLECTED: ${shipLog.totalCollect}`;
        item3.active = true;
        item3Content.active = true;

    }

    /*
     *@Author: yozora
     *@Description: 占领日志
     *@Date: 2022-02-28 16:25:46
     */
    public occupyContent(shipLog: ShipLogInfo, destroyed?: boolean) {

        if (destroyed !== undefined) {
            this.destroyFlag = destroyed;
        }

        this.itemContent.getComponent(Label).string = `TARGET PLANET NAME: ${shipLog.target}`;

        const item2 = this.node.getChildByName('Item_2');
        const item2Content = this.node.getChildByName('Item_label_2');
        item2Content.getComponent(Label).string = `TIME COST: ${shipLog.costTime}`;
        item2.active = true;
        item2Content.active = true;

        const item3 = this.node.getChildByName('Item_3');
        const item3Content = this.node.getChildByName('Item_label_3');
        item3Content.getComponent(Label).string = `TOTAL COLLECTED: ${shipLog.result}`;
        item3.active = true;
        item3Content.active = true;

    }

    /*
     *@Author: yozora
     *@Description: 完成任务报告
     *@Date: 2022-02-10 15:19:48
     */
    private close() {
        if (this.destroyFlag) {
            this.node.destroy();
            return;
        }
        if (find('Canvas').getComponent(UserOperateManager).userOperateType === GameConstans.RESET_TYPE.PLANET.PLUNDER) {
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_UI_LIST.BUTTON_ACTION, this.node, GameConstans.DIALOG_TYPE.ACTION.YES, GameConstans.DIALOG_TYPE.ACTION.PLUNDER_3);
        } else {
            this.node.setScale(this.initDialogScale);
            this.node.active = false;
        }
        this.node.getChildByName('Item_2').active = false;
        this.node.getChildByName('Item_3').active = false;
        this.node.getChildByName('Item_4').active = false;
        this.node.getChildByName('Item_label_2').active = false;
        this.node.getChildByName('Item_label_3').active = false;
        this.node.getChildByName('Item_label_4').active = false;
    }

}
