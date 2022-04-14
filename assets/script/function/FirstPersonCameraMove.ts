import {
  _decorator,
  Component,
  EventMouse,
  Vec3,
  Node,
  Quat,
  Vec2,
  Camera,
  EditBox,
  input,
  Input,
} from "cc";
import { GameConstans } from "../entity/GameConstans";
import { ClientEvent } from "../utils/ClientEvent";
const { ccclass, property } = _decorator;

const v2_1 = new Vec2();
const v3_1 = new Vec3();
const v3_2 = new Vec3();
const qt_1 = new Quat();

/**
 * Predefined variables
 * Name = FirstPersonCameraMove
 * DateTime = Thu Oct 21 2021 16:00:48 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = FirstPersonCameraMove.ts
 * FileBasenameNoExtension = FirstPersonCameraMove
 * URL = db://assets/scripts/function/FirstPersonCameraMove.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * 节点拖拽与缩放旋转
 */

@ccclass("FirstPersonCameraMove")
export class FirstPersonCameraMove extends Component {


  /*
   * 最小x视角
   */
  @property
  xAxisMin: number = 140;

  /*
   * 最大x视角
   */
  @property
  xAxisMax: number = 210;

  /*
   * 相机
   */
  @property({ type: Camera })
  private camera: Camera = null


  /*
   * 旋转速度
   */
  @property
  public rotateSpeed = 0.2;

  /*
   * 移动速度
   */
  @property
  public moveSpeed = 0.5;

  /*
  * 移动量除数
  */
  @property
  public moveDot = 50;

  /*
  * 缩放速度
  */
  @property
  public scaleSpeed = 0.2;

  /*
   * 缩放量
   */
  @property
  public scaleNum = 1;

  /*
   * x轴旋转
   */
  private angleX: number = 0;

  /*
   * y轴旋转
   */
  private angleY: number = 90;

  /*
   * 最后一次运动
   */
  private _lastPos = new Vec3();

  /*
   * 当前位置
   */
  private _curPos = new Vec3();

  /*
   * 当前旋转
   */
  private _curRot = new Vec3(90, 0, 0);

  /*
   * 当前缩放
   */
  private _curScale = new Vec3(1, 1, 1);

  /*
   * 暂存参数
   */
  private _velocity = new Vec3();

  /*
 * 移动速度
 */
  private _speedMove = 1;

  /*
   * 缩放速度
   */
  private _speedScale = 1;

  /*
   * 距离x
   */
  private dx = 0;

  /*
   * 距离y
   */
  private dy = 0;

  /*
   * 左键加速度
   */
  private leftAcceleration = 0;

  /*
   * 左键按下
   */
  private leftMouseDown: boolean = false;

  /*
   * 右键按下
   */
  private rightMouseDown: boolean = false;

  /*
   *  连续点击数组
   */
  private timeArray = [];

  /*
   * 缓存移动距离
   */
  private dmove = new Vec2();


  start() {
    input.on(Input.EventType.MOUSE_UP, this.onMouse, this);
    input.on(Input.EventType.MOUSE_DOWN, this.onMouse, this);
    input.on(Input.EventType.MOUSE_MOVE, this.MouseMove, this);
    input.on(Input.EventType.MOUSE_WHEEL, this.onMousewheel, this);

    // systemEvent.on(SystemEvent.EventType.TOUCH_START, this.onTouchStart, this);
    // systemEvent.on(SystemEvent.EventType.TOUCH_MOVE, this.onTouchMove, this);
    // systemEvent.on(SystemEvent.EventType.TOUCH_END, this.onTouchEnd, this);
    ClientEvent.on(
      GameConstans.CLIENTEVENT_CAMERA_LIST.CHANGE_CAMERA_STATUS,
      this.changeCameraEvent,
      this
    );

    this._curPos = this.node.getWorldPosition();
    this.node.getWorldPosition(this._lastPos);
  }


  /*
   *@Author: yozora
   *@Description: 更新节点位置与旋转
   *@Date: 2021-10-25 15:27:36
   */
  update(dt: number) {
    // const t = Math.min(dt / this.damp, 1);

    // rotation
    Quat.fromEuler(qt_1, this._curRot.x, this._curRot.y, this._curRot.z);
    Quat.slerp(qt_1, this.node.rotation, qt_1, Math.min(dt / this.rotateSpeed, 1));
    this.node.setRotation(qt_1);
    // position
    Vec3.transformQuat(v3_1, this._velocity, this.node.rotation);
    // Vec3.scaleAndAdd(
    //   this._curPos,
    //   this._curPos,
    //   v3_1,
    //   this._speedMove * this._speedScale
    // );

    // Vec3.lerp(v3_1, this.node.position, this._curPos, Math.min(dt / this.moveSpeed, 1));
    // this.node.setPosition(v3_1);

    // zoom
    // Vec3.transformQuat(v3_2, this._velocity, this.node.rotation);
    // Vec3.scaleAndAdd(
    //   this._curScale,
    //   this._curScale,
    //   v3_2,
    //   this._speedMove * this._speedScale
    // );
    // Vec3.lerp(v3_2, this.node.worldScale, this._curScale, Math.min(dt / this.scaleSpeed, 1));
    // this.node.setWorldScale(v3_2);

    // 移动过程中取消射线
    if (this._curPos.equals(this.node.position, 0.05)) {
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.LOCK_CAMERA_RAY, true);
    } else {
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.LOCK_CAMERA_RAY, false);
    }

  }

  /*
   *@Author: yozora
   *@Description: 鼠标左右键监听
   *@Date: 2021-10-21 11:10:15
   */
  private onMouse(event: EventMouse) {
    // 左键
    if (event.getButton() === 0) {
      if (event.getType() === Input.EventType.MOUSE_DOWN) {
        // if (game.canvas!["requestPointerLock"]) {
        //   game.canvas!.requestPointerLock();
        // }
        this.leftMouseDown = true;
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.LOCK_CAMERA_RAY, false);

        // 双击监听
        const clickDate = new Date();
        //获取当前时间的毫秒数
        const now = clickDate.getTime();
        if (
          this.timeArray.length > 0 &&
          (now - this.timeArray[0]) / 1000 > 0.3
        ) {
          //1秒内未连续点击
          this.timeArray = [];
        }
        this.timeArray.push(now);
      } else {
        // if (document.exitPointerLock) {
        //   document.exitPointerLock();
        // }
        this.leftMouseDown = false;
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_CAMERA_LIST.LOCK_CAMERA_RAY, true);
        this.leftAcceleration = 0;
        if (this.timeArray.length == 2) {
          //检测双击
          this.resetScene();
          this.timeArray = [];
          return;
        }
      }
    }
    // 右键
    if (event.getButton() === 2) {
      if (event.getType() === Input.EventType.MOUSE_DOWN) {
        // if (game.canvas!["requestPointerLock"]) {
        //   game.canvas!.requestPointerLock();
        // }
        this.rightMouseDown = true;
      } else {
        this.rightMouseDown = false;
        // if (document.exitPointerLock) {
        //   document.exitPointerLock();
        // }
      }
    }
  }

  /*
   *@Author: yozora
   *@Description: 左键旋转,右键拖拽
   *@Date: 2021-10-21 18:52:08
   */
  private MouseMove(e: EventMouse) {
    // 旋转
    // if (this.leftMouseDown) {
    //   this.angleX += (e.movementX + this.leftAcceleration) / 5;
    //   this.angleY += (e.movementY + this.leftAcceleration) / 5;
    //   this.angleY = this.Clamp(this.angleY, this.xAxisMin, this.xAxisMax);

    //   this._curRot = new Vec3(this.angleY, this.angleX, 0);
    // }
    // 拖拽
    if (this.rightMouseDown) {
      this.node.getWorldPosition(this._lastPos);
      this.node.getWorldPosition(this._curPos);

      // Vec2.multiply(this.dmove, this.dmove, new Vec2(4, 4))
      // Vec2.add(this.dmove, e.getDelta(), this.dmove)
      // Vec2.divide(this.dmove, this.dmove, new Vec2(5, 5))
      // // 拖拽加速度
      this._curPos.x = this._curPos.x + e.getDelta().x / this.moveDot;
      this._curPos.y = this._curPos.y + e.getDelta().y / this.moveDot;

      // 屏幕坐标转3d坐标
      // const ray: geometry.Ray = this.camera.screenPointToRay(e.getLocationX(), e.getUILocationY());

      // 屏幕坐标转3d坐标
      // this.camera.screenToWorld(new Vec3(e.getLocationX(), e.getLocationY(), 0), outV3);
      Vec3.lerp(v3_1, this.node.position, this._curPos, this.moveSpeed);
      this.node.setPosition(v3_1);

      // 射线运动
      // let lastScreen = this.camera.worldToScreen(this._lastPos);
      // console.log("lastScreen: ", lastScreen);
      // lastScreen.x = lastScreen.x + e.getDelta().x;
      // lastScreen.y = lastScreen.y + e.getDelta().y;
      // this.camera.screenToWorld(lastScreen, this._lastPos);

      // ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_DEBUG_LIST.CANVAS_MOVE, this._curPos, 1);
    }
  }

  // public onTouchStart() {
  //   if (game.canvas!["requestPointerLock"]) {
  //     game.canvas!.requestPointerLock();
  //   }
  // }

  // public onTouchEnd(t: Touch, e: EventTouch) {
  //   if (document.exitPointerLock) {
  //     document.exitPointerLock();
  //   }
  //   e.getStartLocation(v2_1);
  //   if (v2_1.x < game.canvas!.width * 0.4) {
  //     // position
  //     this._velocity.x = 0;
  //     this._velocity.z = 0;
  //   }
  // }

  /*
   *@Author: yozora
   *@Description: 相机缩放
   *@Date: 2021-10-20 15:52:17
   */
  private onMousewheel(event: EventMouse) {
    let scrolly = event.getScrollY();
    this.node.getWorldScale(this._curScale);
    if (scrolly > 0) {
      this._curScale.x += this.scaleNum;
      if (this._curScale.x >= 1.5) {
        this._curScale.x = 1.5;
      }
      this._curScale.y += this.scaleNum;
      if (this._curScale.y >= 1.5) {
        this._curScale.y = 1.5;
      }
    } else {
      this._curScale.x -= this.scaleNum;
      if (this._curScale.x <= 0.2) {
        this._curScale.x = 0.2;
      }
      this._curScale.y -= this.scaleNum;
      if (this._curScale.y <= 0.2) {
        this._curScale.y = 0.2;
      }
    }
    this._curScale.z = this._curScale.x;
    Vec3.lerp(v3_2, this.node.worldScale, this._curScale, Math.min(this.scaleSpeed, 1));
    this.node.setWorldScale(v3_2);

    // 立即运动
    // this.node.setWorldScale(this._curScale);
    // ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_DEBUG_LIST.CANVAS_MOVE, this._curScale, 2);

  }

  /*
   *@Author: yozora
   *@Description: 视角瞬移
   *@Date: 2021-10-26 14:13:12
   */
  public scaleMove() {
    // 放大地图
    this._curScale = new Vec3(3, 3, 3);
  }

  public scaleMoveReduce() {
    this._curScale = new Vec3(1, 1, 1);
  }

  /*
   *@Author: yozora
   *@Description: 重置视角
   *@Date: 2021-10-26 16:10:25
   */
  private resetScene() {
    const initPos = new Vec3(0, 0, 0);
    const initSca = new Vec3(1, 1, 1);
    const initRot = new Vec3(90, 0, 0);
    this._curPos = initPos;
    this._curRot = initRot;
    this._curScale = initSca;
    // 重置参数
    this.angleX = 0;
    this.angleY = 90;
  }

  /*
   *@Author: yozora
   *@Description: 切换摄像机状态
   *@Date: 2021-10-27 14:00:50
   */
  private changeCameraEvent(eventStatus: string, target?: Node) {
    // 锁定视角
    if (eventStatus === GameConstans.LOCK_CAMERA) {
      input.off(
        Input.EventType.MOUSE_WHEEL,
        this.onMousewheel,
        this
      );
    }
    // 解锁视角
    if (eventStatus === GameConstans.UNLOCK_CAMERA) {
      this.resetScene();
      input.on(
        Input.EventType.MOUSE_WHEEL,
        this.onMousewheel,
        this
      );
    }
  }

  private Clamp(val: number, min: number, max: number): number {
    if (val <= min) val = min;
    if (val >= max) val = max;
    return val;
  }

  /*
   *@Author: yozora
   *@Description: 修改旋转速度
   *@Date: 2021-11-14 22:28:18
   */
  public changeRotateSpeed(rotateBox: EditBox): void {
    this.rotateSpeed = Number(rotateBox.string);

  }

  /*
   *@Author: yozora
   *@Description: 修改拖拽速度
   *@Date: 2021-11-14 22:28:28
   */
  public changeMoveSpeed(moveBox: EditBox): void {
    this.moveSpeed = Number(moveBox.string);
  }

  public changeMoveDot(moveDotBox: EditBox): void {
    this.moveDot = Number(moveDotBox.string);
  }

  public changeScaleNum(scaleNumBox: EditBox): void {
    this.scaleNum = Number(scaleNumBox.string);
  }

  /*
   *@Author: yozora
   *@Description: 修改缩放速度
   *@Date: 2021-11-14 22:28:37
   */
  public changeScaleSpeed(scaleBox: EditBox): void {
    this.scaleSpeed = Number(scaleBox.string);
  }
}
