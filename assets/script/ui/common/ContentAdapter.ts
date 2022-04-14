
import { _decorator, Component, Node, view, screen, UITransform, log, find, Widget, CCInteger, director, game } from 'cc';
import { DEBUG } from 'cc/env';
import { UIManager } from '../../UIManager';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ContentAdapter
 * DateTime = Thu Mar 17 2022 18:18:34 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = ContentAdapter.ts
 * FileBasenameNoExtension = ContentAdapter
 * URL = db://assets/script/ui/common/ContentAdapter.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 * 适配高度模式下拉伸宽度
 */

@ccclass('ContentAdapter')
export class ContentAdapter extends Component {

    /*
     * 方向 -1左 1右
     */
    @property({ type: CCInteger })
    private direction: number = 0;

    /*
    * 方向 -1左右 1上下
    */
    @property({ type: CCInteger })
    private verticalDirection: number = -1;

    onEnable() {

        if (this.verticalDirection === -1) {
            const canvasWidth = find('Canvas').getComponent(UIManager).canvasWidth - this.node.getComponent(UITransform).width / 2;
            const screenWidth = find('Canvas').getComponent(UIManager).screenWidth - this.node.getComponent(UITransform).width / 2;
            if (find('Canvas').getComponent(UIManager).screenWidth < 1400) {
                this.node.getComponent(Widget).horizontalCenter = screenWidth * this.direction;
            } else {
                this.node.getComponent(Widget).horizontalCenter = canvasWidth * this.direction;
            }
        }
        if (this.verticalDirection === 1) {
            console.log('VisibleSizeInPixel: ', view.getVisibleSizeInPixel());
            let offset = 1400 - view.getVisibleSizeInPixel().height;
            // 不完全显示
            if (offset < 0) {
                // this.node.getComponent(Widget).verticalCenter = view.getVisibleSizeInPixel().height;
                // 完全显示,留黑边
            } else if (offset > 0) {
                this.node.getComponent(Widget).verticalCenter = this.node.getComponent(Widget).verticalCenter + offset - 66;
            }
            console.log('offset: ', offset);
            console.log("verticalCenter: ", this.node.getComponent(Widget).verticalCenter);
        }

    }
}

