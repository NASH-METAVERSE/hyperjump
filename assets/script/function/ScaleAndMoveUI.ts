import {
  _decorator,
  Component,
  Node,
  EventMouse,
  Vec3,
  EventTouch,
  CCInteger,
  Vec2,
} from "cc";
const { ccclass, property } = _decorator;

const v3_1 = new Vec3();
const v3_2 = new Vec3();

/**
 * Predefined variables
 * Name = ScaleAndMove
 * DateTime = Thu Sep 30 2021 16:43:08 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = ScaleAndMove.ts
 * FileBasenameNoExtension = ScaleAndMove
 * URL = db://assets/Scripts/funcation/ScaleAndMove.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * 拖拽与缩放物体组件
 */

@ccclass("ScaleAndMove")
export class ScaleAndMove extends Component {
  /*
   * 当前地图类型(0-行星 1-太阳系 2-超星系)
   */
  @property({
    type: CCInteger,
  })
  public mapType: number = -1;

  /*
   * 当前位置
   */
  public _curPosition = new Vec3(1400, 700, 0);

  /*
   * 当前缩放
   */
  public _curScale = new Vec3(1, 1, 1);

  onLoad() {
    this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(Node.EventType.MOUSE_WHEEL, this.scaleStarmap, this);
  }

  update(dt: number) {
    const t = Math.min(dt / 0.2, 1);
    // position
    // Vec2.lerp(v3_1, this.node.getChildByName("Starmap").worldPosition, this._curPosition, t);
    // this.node.getChildByName("Starmap").setPosition(v3_1);
    // scale
    Vec3.lerp(v3_2, this.node.getChildByName("Starmap").worldScale, this._curScale, t);
    this.node.getChildByName("Starmap").setScale(v3_2);
  }

  /*
   *@Author: yozora
   *@Description: 修改镜头位置到中央
   *@Date: 2021-10-15 11:20:28
   */
  public setCurPosition(position: Vec3) {
    this.node.getWorldPosition(this._curPosition);
    if (position.y <= this._curPosition.y) {
      this._curPosition.y = this._curPosition.y - position.y;
      this._curPosition.x = -(position.x - this._curPosition.x);

      this._curPosition.x = this._curPosition.x + 960;
      this._curPosition.y = this._curPosition.y + 540;
      this.node.setWorldPosition(this._curPosition);
      return;
    }
    if (position.y > this._curPosition.y) {
      this._curPosition.y = this._curPosition.y - position.y;
      this._curPosition.x = -(position.x - this._curPosition.x);

      this._curPosition.x = this._curPosition.x + 960;
      this._curPosition.y = this._curPosition.y + 540;
      this.node.setWorldPosition(this._curPosition);
      return;
    }
  }

  /*
   *@Author: yozora
   *@Description: 拖拽
   *@Date: 2021-09-26 13:45:13
   */
  private onTouchMove(event: EventTouch) {
    this.node.getChildByName("Starmap").getWorldPosition(this._curPosition);
    const delta = event.getUIDelta();
    const dx = delta.x;
    const dy = delta.y;
    this._curPosition.x = this._curPosition.x + dx;
    this._curPosition.y = this._curPosition.y + dy;
    this.node.getChildByName("Starmap").setWorldPosition(this._curPosition);
  }

  /*
   *@Author: yozora
   *@Description: 缩放
   *@Date: 2021-09-26 13:45:35
   */
  private scaleStarmap(event: EventMouse) {
    let scrolly = event.getScrollY();
    this.node.getChildByName("Starmap").getWorldScale(this._curScale);
    if (scrolly > 0) {
      if (this._curScale.x <= 2.5) {
        this._curScale.x += 0.1;
      }
      if (this._curScale.y <= 2.5) {
        this._curScale.y += 0.1;
      }
    } else {
      if (this._curScale.x >= 0.2) {
        this._curScale.x -= 0.1;
      }
      if (this._curScale.y >= 0.2) {
        this._curScale.y -= 0.1;
      }
    }

    if (this._curScale.x >= 2.5) {
      this._curScale.x = 2.5;
    }
    if (this._curScale.y >= 2.5) {
      this._curScale.y = 2.5;
    }
    // this.node.getChildByName("Starmap").setWorldScale(this._curScale);
    console.log(this._curScale);

  }
}
