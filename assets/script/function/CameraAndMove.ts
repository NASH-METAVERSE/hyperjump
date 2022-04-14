import {
  _decorator,
  Component,
  Node,
  Enum,
  Vec3,
  EventMouse,
  input,
  Input,
  EventTouch,
  systemEvent,
  SystemEvent,
  Touch,
  Camera,
} from "cc";
import { GameConstans } from "../entity/GameConstans";
import { ClientEvent } from "../utils/ClientEvent";
const { ccclass, property } = _decorator;

export enum ThirdPersonCameraType {
  /** 相机紧跟随着目标，相机不会旋转 */
  Follow = 0,
  /** 相机会旋转紧跟着目标正后方，旋转不可控制 */
  FollowTrackRotation = 1,
  /** 相机紧跟随着目标，相机可以自由旋转 */
  FollowIndependentRotation = 2,
}

const v3_1 = new Vec3();

/**
 * Predefined variables
 * Name = ThirdFreeLookCamera
 * DateTime = Wed Oct 20 2021 14:52:49 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = ThirdFreeLookCamera.ts
 * FileBasenameNoExtension = ThirdFreeLookCamera
 * URL = db://assets/scripts/function/ThirdFreeLookCamera.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * 第三人称相机
 */

@ccclass("CameraAndMove")
export class CameraAndMove extends Component {

  /** 目标 */
  @property(Node)
  target: Node = null;

  /** 注视的目标，这里我想让相机对准目标的上方一点，所有多加了注视（相机正对着）的目标 */
  @property(Node)
  lookAt: Node = null;

  @property({ type: Enum(ThirdPersonCameraType) })
  cameraType: ThirdPersonCameraType = ThirdPersonCameraType.Follow;

  /** 距离目标距离 */
  @property
  positionOffset: Vec3 = new Vec3(0, 120, 200);

  /** 移动差值移动系数 */
  @property
  moveSmooth: number = 0.02;

  /** 差值旋转系数 */
  @property
  rotateSmooth: number = 0.03;

  public MouseX: number = 0;
  public MouseY: number = 0;

  /*
   * 锁定相机位置
   */
  private _lockPos: Vec3 = new Vec3(11.31, 0.84, 65);

  /*
   * 解锁相机位置
   */
  private _unlockPos: Vec3 = new Vec3(7.15, 0.84, 65);

  /*
   * 太阳系最大位置
   */
  private _solarSystemMaxPos: Vec3 = new Vec3(0, 0, 160);

  /*
   * 最后一次运动
   */
  private _lastPos = new Vec3();

  /*
   * 当前位置
   */
  private _curPos = new Vec3(0, 0, 65);

  /*
   * 当前FOV
   */
  private _curHeight = 0;

  private pointsDis: number = 0;

  isDown: boolean = false;

  start() {
    systemEvent.on(SystemEvent.EventType.MOUSE_DOWN, this.MouseDown, this);
    systemEvent.on(SystemEvent.EventType.MOUSE_MOVE, this.MouseMove, this);
    systemEvent.on(SystemEvent.EventType.MOUSE_UP, this.MouseUp, this);
    systemEvent.on(SystemEvent.EventType.MOUSE_WHEEL, this.onMousewheel, this);
    systemEvent.on(SystemEvent.EventType.TOUCH_MOVE, this.onTouchMove, this);

    ClientEvent.on(GameConstans.CLIENTEVENT_CAMERA_LIST.CHANGE_STARMAP_CAMERA, this.changeStarmapCamera, this);
    const up = new Vec3(0, 1, 0);
    this.cameraType == ThirdPersonCameraType.Follow &&
      this.node.lookAt(this.target.worldPosition, up);
  }


  private MouseDown(e: EventMouse) {
    if (e.getButton() === 2) {
      this.isDown = true;
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.LOCK_CAMERA_RAY, false);
    }
    if (e.getButton() === 0) {
      // this.leftMouseDown = true;
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.LOCK_CAMERA_RAY, false);
    }
    else {
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.LOCK_CAMERA_RAY, true);
    }
  }

  private MouseMove(e: EventMouse) {
    if (this.cameraType == ThirdPersonCameraType.FollowIndependentRotation) {
      this.SetIndependentRotation(e);
    }
  }

  private MouseUp(e: EventMouse) {
    this.isDown = false;
  }

  update(dt: number) {
    const t = Math.min(dt / 0.2, 1);
    if (this.target) {
      // position
      Vec3.lerp(v3_1, this.node.worldPosition, this._curPos, t);
      this.node.setPosition(v3_1);
      if (!this.isDown && this.node.worldPosition.equals(this._curPos, 0.002)) {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.LOCK_CAMERA_RAY, true);
      }
    }
  }

  /*
   *@Author: yozora
   *@Description: 拖拽事件
   *@Date: 2021-11-25 18:47:52 
   */
  private SetIndependentRotation(e: EventMouse) {
    if (this.isDown) {
      this.node.getWorldPosition(this._curPos);
      this._curPos.x = this._curPos.x - e.getDelta().x / 50;
      this._curPos.y = this._curPos.y - e.getDelta().y / 50;

      this.node.setPosition(this._curPos);
      this.node.getWorldPosition(this._lastPos);
    }
  }

  /*
  *@Author: yozora
  *@Description: 相机缩放
  *@Date: 2021-10-20 15:52:17
  */
  private onMousewheel(event: EventMouse) {
    let scrolly = event.getScrollY();
    if (scrolly < 0) {
      this._curPos.z += 5;
    } else {
      this._curPos.z -= 5;
    }
    if (this._curPos.z <= 10) {
      this._curPos.z = 10;
      return;
    }
    if (this._curPos.z >= 65) {
      this._curPos.z = 65;
      return;
    }
  }

  private onTouchMove(touch: Touch, event: EventTouch) {
    let touches = event.getTouches();
    if (event.getTouches().length == 2) {
      let touchPoint1 = touches[0].getLocation();
      let touchPoint2 = touches[1].getLocation();
      let newPointsDis = touchPoint1.subtract(touchPoint2).length();
      if (newPointsDis < this.pointsDis - 10) {
        this._curPos.z += 5;
        if (this._curPos.z <= 65) {
          this._curPos.x += 0.55;
          this._curPos.y += 0.062;
        }
        this.pointsDis = newPointsDis;
      } else if (newPointsDis > this.pointsDis) {
        this._curPos.z -= 5;
        if (this._curPos.z >= 10) {
          this._curPos.x -= 0.55;
          this._curPos.y -= 0.062;
        }
        this.pointsDis = newPointsDis;
      }
      if (this._curPos.z <= 10) {
        this._curPos.z = 10;
        return;
      }
      if (this._curPos.z >= 65) {
        this._curPos.z = 65;
        return;
      }
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.LOCK_CAMERA_RAY, false);
    }
  }

  public removeEvent() {
    input.off(Input.EventType.MOUSE_DOWN, this.MouseDown, this);
    input.off(Input.EventType.MOUSE_MOVE, this.MouseMove, this);
    input.off(Input.EventType.MOUSE_UP, this.MouseUp, this);
    input.off(Input.EventType.MOUSE_WHEEL, this.onMousewheel, this);
  }

  public resumeEvent() {
    input.on(Input.EventType.MOUSE_DOWN, this.MouseDown, this);
    input.on(Input.EventType.MOUSE_MOVE, this.MouseMove, this);
    input.on(Input.EventType.MOUSE_UP, this.MouseUp, this);
    input.on(Input.EventType.MOUSE_WHEEL, this.onMousewheel, this);
  }

  /*
   *@Author: yozora
   *@Description: 修改星图相机位置
   *@Date: 2021-11-25 19:05:57
   */
  private changeStarmapCamera(cameraType: number) {
    if (cameraType === GameConstans.CAMERA_POSITION.STARMAP_POSITION.UNLOCK) {
      this._curPos = this._unlockPos;
    }
    if (cameraType === GameConstans.CAMERA_POSITION.STARMAP_POSITION.LOCK) {
      this._curPos = this._lockPos;
    }
    if (cameraType === GameConstans.CAMERA_POSITION.SOLAR_SYSTEM_POSITION.MAX) {
      this._curPos = new Vec3(0, 0, 160);
    }
  }

  public GetType(): ThirdPersonCameraType {
    return this.cameraType;
  }


}
