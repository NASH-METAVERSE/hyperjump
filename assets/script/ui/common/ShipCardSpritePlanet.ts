
import { _decorator, Component, Node, SpriteFrame, Sprite, Label, Color, AnimationClip, Animation, Tween, UIOpacity } from 'cc';
import { GameConstans } from '../../entity/GameConstans';
import { ClientEvent } from '../../utils/ClientEvent';
import { ShipCard } from '../model/ShipCard';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ShipCardSpritePlanet
 * DateTime = Thu Jan 06 2022 13:43:17 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = ToggleStatus.ts
 * FileBasenameNoExtension = ToggleStatus
 * URL = db://assets/script/ui/common/ToggleStatus.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 * 点击状态切换
 */

@ccclass('ShipCardSpritePlanet')
export class ShipCardSpritePlanet extends Component {

    /*
    * 飞船默认状态
    */
    @property({ type: SpriteFrame })
    private defaultStatusSpriteFrame: SpriteFrame = null;

    /*
     * 默认背景图
     */
    @property({ type: SpriteFrame })
    private defaultSpriteFrame: SpriteFrame = null;

    /*
     * 非默认背景图
     */
    @property({ type: SpriteFrame })
    private checkedSpriteFrame: SpriteFrame = null;

    /*
     * 默认线框装饰
     */
    @property({ type: SpriteFrame })
    private defaultLineSpriteFrame: SpriteFrame = null;

    /*
     * 非默认线框装饰
     */
    @property({ type: SpriteFrame })
    private checkedLineSpriteFrame: SpriteFrame = null;

    /*
     * 默认上箭头
     */
    @property({ type: SpriteFrame })
    private defaultTopArrowSpriteFrame: SpriteFrame = null;

    /*
     * 非默认上箭头
     */
    @property({ type: SpriteFrame })
    private checkedTopArrowSpriteFrame: SpriteFrame = null;

    /*
     * 默认下箭头
     */
    @property({ type: SpriteFrame })
    private defaultButtomArrowSpriteFrame: SpriteFrame = null;

    /*
     * 非默认下箭头
     */
    @property({ type: SpriteFrame })
    private checkedButtomArrowSpriteFrame: SpriteFrame = null;

    /*
     * 默认矿产状态
     */
    @property({ type: SpriteFrame })
    private defaultMineralSpriteFrame: SpriteFrame = null;

    /*
     * 非默认矿产状态
     */
    @property({ type: SpriteFrame })
    private checkedMineralSpriteFrame: SpriteFrame = null;

    /*
     * 当前焦点卡片
     */
    public hoverName: string = null;

    /*
     * 当前选中卡片
     */
    public checkedName: string = null;

    /*
     * 是否选中状态
     */
    private _isChecked: boolean = false;

    onEnable() {
        ClientEvent.on(GameConstans.CLIENTEVENT_LIST.PLANET.CHANGE_CARD_HOVER_STATUS, this.onHoverCard, this);
        ClientEvent.on(GameConstans.CLIENTEVENT_LIST.PLANET.CHANGE_CARD_PRESSED_STATUS, this.onCheckedCard, this);
    }

    /*
     *@Author: yozora
     *@Description: 切换鼠标悬浮状态
     *@Date: 2022-01-10 16:52:31
     */
    private onHoverCard(shipCardName: string, isShow: boolean) {
        if (!this._isChecked) {
            if (isShow) {
                this.hoverName = shipCardName;
            }
            this.changeCardSprite(shipCardName, isShow, 0);
        } else {
            if (this.checkedName !== shipCardName) {
                if (isShow) {
                    this.hoverName = shipCardName;
                }
                this.changeCardSprite(shipCardName, isShow, 0);
            }
        }
    }

    /*
     *@Author: yozora
     *@Description: 切换点击状态
     *@Date: 2022-01-06 13:56:10
     */
    private onCheckedCard(shipCardName: string, isShow: boolean) {
        if (shipCardName === 'Reset') {
            this._isChecked = false;
            this.changeCardSprite(this.checkedName, isShow, 1);
        }
        // 同一卡片切换
        if (this.checkedName === shipCardName) {
            if (isShow) {
                this._isChecked = true;
            } else {
                this._isChecked = false;
            }
            this.changeCardSprite(shipCardName, isShow, 1);
        }
        // 不同卡片切换
        if (this.checkedName === null || this.checkedName !== shipCardName) {
            if (isShow) {
                if (this.checkedName) {
                    this.node.getChildByName(this.checkedName).getComponent(ShipCard)._isChecked = false;
                    this.changeCardSprite(this.checkedName, false, 1);
                }
                if (this.hoverName) {
                    this.changeCardSprite(this.hoverName, false, 1);
                    this.hoverName === null;
                }
                this.changeCardSprite(shipCardName, true, 1);
                this.checkedName = shipCardName;
                this._isChecked = true;
            } else {
                this._isChecked = false;
            }
        }
    }

    /*
     *@Author: yozora
     *@Description: 修改卡片样式
     *@param: type: 0:鼠标悬浮 1:点击
     *@Date: 2022-01-06 16:08:13
     */
    private changeCardSprite(shipCardName: string, isShow: boolean, type: number) {
        if (isShow) {
            this.node.getChildByName(shipCardName).getChildByName("Ship_card_top_arrow_default").getComponent(Sprite).spriteFrame = this.checkedTopArrowSpriteFrame;
            this.node.getChildByName(shipCardName).getChildByName("Ship_card_buttom_arrow_default").getComponent(Sprite).spriteFrame = this.checkedButtomArrowSpriteFrame;
            this.node.getChildByName(shipCardName).getChildByName("Ship_card_mineral_default").getComponent(Sprite).spriteFrame = this.checkedMineralSpriteFrame;

            this.node.getChildByName(shipCardName).getChildByName("Ship_card_name_label").getComponent(Label).color = new Color(255, 255, 255, 255);
            this.node.getChildByName(shipCardName).getChildByName("Ship_card_mineral_label").getComponent(Label).color = new Color(255, 255, 255, 255);

            if (type === 0) {
                this.node.getChildByName(shipCardName).getChildByName("Ship_card_line_default").getComponent(Sprite).spriteFrame = this.checkedLineSpriteFrame;
            } else {
                this.node.getChildByName(shipCardName).getComponent(Sprite).spriteFrame = this.checkedSpriteFrame;
                this.node.getChildByName(shipCardName).getChildByName("Ship_card_line_default").active = false;
                this.node.getChildByName(shipCardName).getChildByName("Ship_card_line_non_default").active = true;

                // if (this.node.getChildByName(shipCardName).getComponent(Animation) === null) {
                //     this.node.getChildByName(shipCardName).addComponent(Animation).createState(this.cardGrowClip);
                // }
            }
        } else {
            this.node.getChildByName(shipCardName).getChildByName("Ship_card_top_arrow_default").getComponent(Sprite).spriteFrame = this.defaultTopArrowSpriteFrame;
            this.node.getChildByName(shipCardName).getChildByName("Ship_card_buttom_arrow_default").getComponent(Sprite).spriteFrame = this.defaultButtomArrowSpriteFrame;
            this.node.getChildByName(shipCardName).getChildByName("Ship_card_mineral_default").getComponent(Sprite).spriteFrame = this.defaultMineralSpriteFrame;
            this.node.getChildByName(shipCardName).getChildByName("Ship_card_line_default").getComponent(Sprite).spriteFrame = this.defaultLineSpriteFrame;

            this.node.getChildByName(shipCardName).getChildByName("Ship_card_name_label").getComponent(Label).color = new Color(255, 255, 255, 128);
            this.node.getChildByName(shipCardName).getChildByName("Ship_card_mineral_label").getComponent(Label).color = new Color(255, 255, 255, 128);

            if (type !== 0) {
                Tween.stopAllByTag(2);
                this.node.parent.getChildByName("Ship_list_border").getChildByName("Dail_line_top").getComponent(Sprite).fillRange = 0;
                this.node.parent.getChildByName("Ship_list_border").getChildByName("Dail_line_buttom").getComponent(Sprite).fillRange = 0;
                this.node.parent.getChildByName("Ship_list_border").getChildByName("Dail_outer_line").getComponent(Sprite).fillRange = 0;
                this.node.parent.getChildByName("Ship_list_border").getChildByName("Dail_outer_joint").getComponent(Sprite).color = new Color(255, 255, 255, 0);
                this.node.parent.getChildByName("Ship_list_border").getChildByName("Dail_outer_dot").getComponent(Sprite).color = new Color(255, 255, 255, 0);
                // 重置卡片状态
                // if (this.node.getChildByName(shipCardName).getComponent(Animation) !== null) {
                //     this.node.getChildByName(shipCardName).getComponent(Animation).destroy();
                // }
                this.node.getChildByName(shipCardName).getChildByName("Ship_card_line_default").active = true;
            }
            this.node.getChildByName(shipCardName).getComponent(Sprite).spriteFrame = this.defaultSpriteFrame;
            this.node.getChildByName(shipCardName).getChildByName("Ship_card_line_non_default").active = false;
        }

    }

    /*
     *@Author: yozora
     *@Description: 修改飞船状态栏样式
     *@Date: 2022-01-10 17:44:30
     */
    private changeShipStatusSprite(shipCardName: string, statusName: string, isShow: boolean) {
        if (isShow) {
            this.node.getChildByName(shipCardName).getChildByName(statusName).getChildByName('Radio_default').getComponent(UIOpacity).opacity = 255;
            this.node.getChildByName(shipCardName).getChildByName(statusName).getChildByName("Radio_actived").getComponent(UIOpacity).opacity = 255;
        } else {
            this.node.getChildByName(shipCardName).getChildByName(statusName).getChildByName('Radio_default').getComponent(UIOpacity).opacity = 64;
            this.node.getChildByName(shipCardName).getChildByName(statusName).getChildByName("Radio_actived").getComponent(UIOpacity).opacity = 64;
        }
    }

}


