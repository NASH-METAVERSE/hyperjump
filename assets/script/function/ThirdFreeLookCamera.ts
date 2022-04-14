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
  find,
  tween,
  lerp,
  v3,
  Quat,
} from "cc";
import { GameConstans } from "../entity/GameConstans";
import { UserOperateManager } from "../UserOperateManager";
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

@ccclass("ThirdFreeLookCamera")
export class ThirdFreeLookCamera extends Component {

  /*
   * 目标
   */
  @property(Node)
  target: Node = null;

  /*
   * 注视目标
   */
  @property(Node)
  lookAt: Node = null;

  @property({ type: Enum(ThirdPersonCameraType) })
  cameraType: ThirdPersonCameraType = ThirdPersonCameraType.Follow;

  /*
  * 星球最大位置
  */
  private _planetMaxPos: Vec3 = new Vec3(0, 0, 10);

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
  // TODO：相机偏移需在星图外的场景移除
  public _curPos = new Vec3(7.15, 0.84, 65);

  /*
   * 摄像机类型
   */
  private camera_type: number = GameConstans.CAMERA_POSITION.STARMAP_POSITION.UNLOCK;

  /*
   * 触摸间距位置
   */
  private pointsDis: number = 0;

  /*
   * 是否左键按下
   */
  private isLeftMouseDown: boolean = false;

  /*
   * 是否右键按下
   */
  private isRightDown: boolean = false;

  /*
   * 主动更新标识
   */
  private updateFlag: boolean = false;

  /*
  *  连续点击数组
  */
  private timeArray = [];

  /*
  * 当前激活场景(1--星图 2--太阳系 3--星球)
  */
  public _activeType: number = 0;

  /*  
   * 是否暂停监听鼠标滚轮事件
   */
  private stopMouseWheelListener = false;


  start() {
    input.on(Input.EventType.MOUSE_DOWN, this.MouseDown, this);
    input.on(Input.EventType.MOUSE_MOVE, this.MouseMove, this);
    input.on(Input.EventType.MOUSE_UP, this.MouseUp, this);
    input.on(Input.EventType.MOUSE_WHEEL, this.onMousewheel, this);
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);

    ClientEvent.on(GameConstans.CLIENTEVENT_CAMERA_LIST.CHANGE_STARMAP_CAMERA, this.changeStarmapCamera, this);
    const up = new Vec3(0, 1, 0);
    this.cameraType == ThirdPersonCameraType.Follow &&
      this.node.lookAt(this.target.worldPosition, up);
  }

  update(dt: number) {
    const t = Math.min(dt / 0.2, 1);
    if (this.target) {
      // position
      Vec3.lerp(v3_1, this.node.worldPosition, this._curPos, t);
      this.node.setPosition(v3_1);
      if (!this.isRightDown && this.node.worldPosition.equals(this._curPos, 0.002)) {
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.LOCK_CAMERA_RAY, true);
      }
    }
  }

  /*
  *@Author: yozora
  *@Description: 鼠标按下事件
  *@Date: 2022-01-18 16:13:05
  */
  private MouseDown(e: EventMouse) {
    if (e.getButton() === 2) {
      this.isRightDown = true;
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.LOCK_CAMERA_RAY, false);
    }
    if (e.getButton() === 0) {
      this.isLeftMouseDown = true;
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.LOCK_CAMERA_RAY, false);
      // 双击监听
      const clickDate = new Date();
      //获取当前时间的毫秒数
      const now = clickDate.getTime();
      if (
        this.timeArray.length > 0 &&
        (now - this.timeArray[0]) / 1000 > 0.2
      ) {
        //1秒内未连续点击
        this.timeArray = [];
      }
      this.timeArray.push(now);
    } else {
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.LOCK_CAMERA_RAY, true);
    }
  }

  /*
   *@Author: yozora
   *@Description: 鼠标移动事件
   *@Date: 2022-01-18 16:13:32
   */
  private MouseMove(e: EventMouse) {
    if (this.cameraType == ThirdPersonCameraType.FollowIndependentRotation) {
      this.SetIndependentRotation(e);
    }
  }

  /*
   *@Author: yozora
   *@Description: 鼠标抬起事件
   *@Date: 2022-01-18 16:15:43
   */
  private MouseUp(e: EventMouse) {
    // 检测右键返回
    if (this.isRightDown) {
      // 获取上一步操作
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_USER_LIST.BACK_PROCESS);
      this.isRightDown = false;
      return;
    }
    if (this._activeType !== GameConstans.SCENCE_TYPE.STARMAP && this.timeArray.length == 2) {
      //检测双击
      this.resetScene();
      this.timeArray = [];
    }
    this.isLeftMouseDown = false;
  }

  /*
   *@Author: yozora
   *@Description: 拖拽事件
   *@Date: 2021-11-25 18:47:52 
   */
  private SetIndependentRotation(e: EventMouse) {
    if (this.isLeftMouseDown && this.camera_type !== GameConstans.CAMERA_POSITION.PLANET_POSITION.MAX) {
      this.node.getWorldPosition(this._curPos);
      // 拖拽加速度
      this._curPos.x = this._curPos.x - e.getDelta().x / 50;
      this._curPos.y = this._curPos.y - e.getDelta().y / 50;

      this.node.setPosition(this._curPos);
      this.node.getWorldPosition(this._lastPos);
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.LOCK_CAMERA_RAY, false);
    }
  }

  /*
  *@Author: yozora
  *@Description: 相机缩放
  *@Date: 2021-10-20 15:52:17
  */
  // TODO：相机偏移需在星图外的场景移除
  private onMousewheel(event: EventMouse) {
    if (this.stopMouseWheelListener) {
      return;
    }
    let scrolly = event.getScrollY();
    // 星球场景
    if (this.camera_type === GameConstans.CAMERA_POSITION.PLANET_POSITION.MAX) {
      if (scrolly < 0) {
        this._curPos.z += 1;
      } else {
        this._curPos.z -= 1;
      }
      if (this._curPos.z <= 3) {
        this._curPos.z = 3;
      }
      if (this._curPos.z >= this._planetMaxPos.z) {
        this._curPos.z = this._planetMaxPos.z;
      }
    }
    // 太阳系场景
    else if (this.camera_type === GameConstans.CAMERA_POSITION.SOLAR_SYSTEM_POSITION.MAX) {
      if (scrolly < 0) {
        this._curPos.z += 5;
      } else {
        this._curPos.z -= 5;
      }
      if (this._curPos.z <= 10) {
        this._curPos.z = 10;
      }
      if (this._curPos.z >= this._solarSystemMaxPos.z) {
        this._curPos.z = this._solarSystemMaxPos.z;
      }
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.SYNC_TRACK, this._curPos.z);
    }
    // 星图场景
    else {
      if (scrolly < 0) {
        this._curPos.z += 5;
        if (this._curPos.z <= 65) {
          this._curPos.x += 0.55;
          this._curPos.y += 0.062;
        }
        // 以物体为中心缩放
        // this._curPos.x += this._lastPos.x / 11;
        // this._curPos.y += this._lastPos.y / 11;
      } else {
        this._curPos.z -= 5;
        if (this._curPos.z >= 10) {
          this._curPos.x -= 0.55;
          this._curPos.y -= 0.062;
        }
        // 以物体为中心缩放
        // this._curPos.x -= this._lastPos.x / 11;
        // this._curPos.y -= this._lastPos.y / 11;
      }
      // if (this._curPos.z === 10) {
      //   ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.SOLAR_SYSTEM_ADD, 1);
      // }
      if (this._curPos.z <= 10) {
        this._curPos.z = 10;
        // 以物体为中心缩放
        // this._curPos.x = this._lastPos.x / 11 * 10;
        // this._curPos.y = this._lastPos.y / 11 * 10;
      }
      // if (this._curPos.z === 65) {
      //   ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.SOLAR_SYSTEM_ADD, -1);
      // }
      if (this._curPos.z >= 65) {
        this._curPos.z = 65;
        // 以物体为中心缩放
        // this._curPos.x = this._lastPos.x;
        // this._curPos.y = this._lastPos.y;
      }
      // if (scrolly > 0) {
      //   ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.SOLAR_SYSTEM_ADD, 1);
      // } else {
      //   ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.SOLAR_SYSTEM_ADD, -1);
      // }
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.LOCK_CAMERA_RAY, false);
    }

  }

  private onTouchMove(event: EventTouch) {
    let touches = event.getTouches();
    // if (event.getTouches().length == 1) {
    //   this.node.getWorldPosition(this._curPos);
    //   this._curPos.x = this._curPos.x - event.getDelta().x / 50;
    //   this._curPos.y = this._curPos.y - event.getDelta().y / 50;

    //   this.node.setPosition(this._curPos);
    //   this.node.getWorldPosition(this._lastPos);
    // }
    if (event.getTouches().length == 2) {
      let touchPoint1 = touches[0].getLocation();
      let touchPoint2 = touches[1].getLocation();
      let newPointsDis = touchPoint1.subtract(touchPoint2).length();
      // if (!this.pointsDis) {      // 该行代码针对安卓手机
      //   this.pointsDis = 0;
      // }
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
   *@Description: 重置场景到星图
   *@Date: 2022-01-18 16:45:47
   */
  private resetScene() {
    // 操作模式下禁用双击功能
    if (find('Canvas').getComponent(UserOperateManager).userOperateType === GameConstans.RESET_TYPE.NULL) {
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_SCENCE_LIST.CHANGE_STARMAP, this._activeType);
      this.changeStarmapCamera(GameConstans.CAMERA_POSITION.STARMAP_POSITION.UNLOCK);
    }
  }

  /*
   *@Author: yozora
   *@Description: 修改星图相机位置
   *@Date: 2021-11-25 19:05:57
   */
  private changeStarmapCamera(cameraType: number) {
    if (cameraType === GameConstans.CAMERA_POSITION.STARMAP_POSITION.UNLOCK) {
      this._curPos = new Vec3(7.15, 0.84, 65);
      this.camera_type = GameConstans.CAMERA_POSITION.STARMAP_POSITION.UNLOCK;
    }
    if (cameraType === GameConstans.CAMERA_POSITION.STARMAP_POSITION.LOCK) {
      this._curPos = new Vec3(11.31, 0.84, 65);
    }
    if (cameraType === GameConstans.CAMERA_POSITION.SOLAR_SYSTEM_POSITION.MAX) {
      this._curPos = new Vec3(0, 0, 160);
      this.camera_type = GameConstans.CAMERA_POSITION.SOLAR_SYSTEM_POSITION.MAX;
    }
    if (cameraType === GameConstans.CAMERA_POSITION.PLANET_POSITION.MAX) {
      this._curPos = new Vec3(0, 0, 3);
      this.camera_type = GameConstans.CAMERA_POSITION.PLANET_POSITION.MAX;
    }
  }

  public GetType(): ThirdPersonCameraType {
    return this.cameraType;
  }

}
