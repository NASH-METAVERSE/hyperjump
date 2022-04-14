import {
  _decorator,
  Component,
  PhysicsSystem,
  Camera,
  EventMouse,
  PhysicsRayResult,
  find,
  Vec2,
  Vec3,
  Node,
  CylinderCollider,
  MeshCollider,
  Mesh,
  input,
  Input,
} from "cc";
import { GameConstans } from "./entity/GameConstans";
import { ThirdFreeLookCamera } from "./function/ThirdFreeLookCamera";
import { GameManager } from "./GameManager";
import { StarmapManager } from "./StarmapManager";
import { ClientEvent } from "./utils/ClientEvent";
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = CamaraManager
 * DateTime = Fri Oct 22 2021 16:19:41 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = CamaraManager.ts
 * FileBasenameNoExtension = CamaraManager
 * URL = db://assets/scripts/CamaraManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * 摄像机射线管理
 */

@ccclass("CamaraManager")
export class CamaraManager extends Component {

  /*
   * 相机组件
   */
  private _camera: Camera = null;

  /* 
   * 是否点击状态
   */
  private _clicked: boolean = false;

  /*
   * 是否锁定射线状态
   */
  private _unlocked: boolean = true;

  /*
   * 星图脚本
   */
  private _starmapManager: StarmapManager = null;

  /*
   * 当前选中区域
   */
  private _selectArea: string = null;

  /*
   * 上一次选中区域
   */
  private _lastArea: string = null;

  /*
   * 参考位置
   */
  private _solarInit: Node = null;

  /*
   * 最近选中太阳系
   */
  private lastSelectSolarSystem: Node = null;

  /*
 * 执行时间
 */
  private _curDate: number = null;

  /*
 * 执行延迟
 */
  private _delay: number = 5000;

  @property({
    type: Mesh,
  })
  public expectedMesh: Mesh = null;

  onEnable() {
    this._camera = this.node.getComponent(Camera);
    input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
    ClientEvent.on(GameConstans.CLIENTEVENT_CAMERA_LIST.CHANGE_CAMERA_UI_STATUS, this.changeUIParams, this);
    ClientEvent.on(GameConstans.CLIENTEVENT_CAMERA_LIST.LOCK_CAMERA_RAY, this.lockCameraRay, this);
  }

  onDisable() {
    input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
    input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
  }

  private onMouseMove(event: EventMouse) {
    if (!this._unlocked) {
      return;
    }
    if (!this._curDate) {
      this._curDate = new Date().getTime();
    }
    // 时间范围内鼠标快速移动
    if (find("GameManager").getComponent(GameManager)._activeType === GameConstans.SCENCE_TYPE.STARMAP && this._curDate + this._delay > new Date().getTime()) {
      const radio = (find("Main Camera").getComponent(ThirdFreeLookCamera)._curPos.z - 10.0) / 55.0;
      if (Math.abs(event.getDelta().x) >= (0.8 + (1 * (3 - radio))) || Math.abs(event.getDelta().y) >= (0.8 + (1 * (3 - radio)))) {
        this._curDate = new Date().getTime();
        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_ANIMATION_LIST.MOUSE_HOVER_SOLAR_SYSTEM, null, 0);
        return;
      }
    }
    if (!this._clicked) {
      // 击中目标
      const collider: PhysicsRayResult[] = this.castRay(
        event.getLocationX(),
        event.getLocationY()
      );
      if (collider !== null) {
        // 星图场景
        if (find("GameManager").getComponent(GameManager)._activeType === GameConstans.SCENCE_TYPE.STARMAP) {
          // 获取点击点星图索引
          const repeat = this.processSelectStarmap(collider, event.getLocation());
          // 判断击中点和范围内节点关系
          if (!this._starmapManager) {
            this._starmapManager = find("GameManager/StarmapManager").getComponent(StarmapManager);
          }
          // 目标区域
          const codes: number[] = this._starmapManager.quadrantMap.get(this._selectArea);
          let distance = 0.2;
          let solarCode = null;
          for (let index = 0; index < codes.length; index++) {
            const d = Vec3.distance(collider[0].hitPoint, find(`GameManager/StarmapManager/solar_${codes[index]}`).getWorldPosition());
            if (d < distance) {
              distance = d;
              solarCode = codes[index];
            }
          }
          if (solarCode !== null) {
            this.lastSelectSolarSystem = find(`GameManager/StarmapManager/solar_${solarCode}`);
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_ANIMATION_LIST.MOUSE_HOVER_SOLAR_SYSTEM, find(`GameManager/StarmapManager/solar_${solarCode}`), 0);
          }
        }
        // 太阳系场景
        if (find("GameManager").getComponent(GameManager)._activeType === GameConstans.SCENCE_TYPE.SOLAR_SYSTEM) {
          // 显示太阳系工具栏
          if (collider !== null) {
            // 击中的节点
            ClientEvent.dispatchEvent(
              GameConstans.CLIENTEVENT_LIST.SOLAR_SYSTEM.HOVER_SOLAR_SYSTEM_TOOLTIP,
              collider[0].collider.node,
              true,
            );
          }
        }
      } else {
        if (find("GameManager").getComponent(GameManager)._activeType === GameConstans.SCENCE_TYPE.STARMAP) {
          ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_ANIMATION_LIST.MOUSE_HOVER_SOLAR_SYSTEM, null, 0);
        }
        if (find("GameManager").getComponent(GameManager)._activeType === GameConstans.SCENCE_TYPE.SOLAR_SYSTEM) {
          ClientEvent.dispatchEvent(
            GameConstans.CLIENTEVENT_LIST.SOLAR_SYSTEM.HOVER_SOLAR_SYSTEM_TOOLTIP,
            null,
            false,
          );
        }
      }
    }
    this._curDate = new Date().getTime();
  }

  private onMouseDown(event: EventMouse) {
    if (event.getButton() === 0) {
      // 击中目标
      const collider: PhysicsRayResult[] = this.castRay(
        event.getLocationX(),
        event.getLocationY()
      );
      if (collider !== null) {
        // 星图场景
        if (find("GameManager").getComponent(GameManager)._activeType === GameConstans.SCENCE_TYPE.STARMAP) {
          // 获取点击点星图索引
          const repeat = this.processSelectStarmap(collider, event.getLocation());
          // 判断击中点和范围内节点关系
          if (!this._starmapManager) {
            this._starmapManager = find("GameManager/StarmapManager").getComponent(StarmapManager);
          }
          // 目标区域
          const codes: number[] = this._starmapManager.quadrantMap.get(this._selectArea);
          let distance = 0.2;
          let solarCode = null;
          for (let index = 0; index < codes.length; index++) {
            const d = Vec3.distance(collider[0].hitPoint, find(`GameManager/StarmapManager/solar_${codes[index]}`).getWorldPosition());
            if (d < distance) {
              distance = d;
              solarCode = codes[index];
            }
          }
          if (solarCode !== null) {
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_ANIMATION_LIST.MOUSE_HOVER_SOLAR_SYSTEM, find(`GameManager/StarmapManager/solar_${solarCode}`), 1);
            this._clicked = false;
          }
        }
        // 太阳系场景
        if (find("GameManager").getComponent(GameManager)._activeType === GameConstans.SCENCE_TYPE.SOLAR_SYSTEM) {
          // 击中的节点
          if (collider !== null) {
            // 击中的节点
            ClientEvent.dispatchEvent(
              GameConstans.CLIENTEVENT_SCENCE_LIST.CHANG_PLANET,
              collider[0].collider.node,
              true,
            );
          }
        }
      } else {
        if (find("GameManager").getComponent(GameManager)._activeType === GameConstans.SCENCE_TYPE.STARMAP) {
          ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_ANIMATION_LIST.MOUSE_HOVER_SOLAR_SYSTEM, null, 1);
        }
      }
    }
  }


  /*
   *@Author: yozora
   *@Description: 修改点击状态
   *@Date: 2021-11-05 14:09:12
   */
  public changeUIParams() {
    this._clicked = !this._clicked;
  }

  public isClickedSolarTooltip(flag: boolean) {
    this._clicked = flag;
  }

  public getClickedSolarTooltip() {
    return this._clicked;
  }

  /*
   *@Author: yozora
   *@Description: 处理点击点位置获取索引
   *@Date: 2021-11-05 14:23:48
   */
  private processSelectStarmap(collider: PhysicsRayResult[], position: Vec2) {
    let quadrant = -1;
    if (!this._solarInit) {
      this._solarInit = find("GameManager/solar_init");
    }
    const screenPos = new Vec3();
    this._camera.worldToScreen(this._solarInit.getWorldPosition(), screenPos);
    // 第二、三象限
    if (position.x <= screenPos.x) {
      // 第三象限
      if (position.y <= screenPos.y) {
        quadrant = 3;
      } else {
        quadrant = 2;
      }
    } else {
      // 第一、四象限
      // 第四象限
      if (position.y <= screenPos.y) {
        quadrant = 4;
      } else {
        quadrant = 1;
      }
    }
    let floor = "";
    collider.forEach((ele) => {
      if (ele.collider.node.name.indexOf("box_") !== -1) {
        floor = ele.collider.node.name.split("_")[1];
      }
      if (ele.collider.node.name === 'solar_0') {
        quadrant = 1;
        floor = "0";
      }
    })
    const area = `${quadrant}${floor}`;
    this._selectArea = area;
    // 重复区域
    if (!this._lastArea || this._lastArea !== area) {
      if (this._lastArea) {
        this.removeColliderAndRay();
      }
      this._lastArea = area;
      return false;
    } else {
      return true;
    }
  }

  /*
   *@Author: yozora
   *@Description: 清除最近的碰撞范围
   *@Date: 2021-11-08 00:40:46
   */
  private removeColliderAndRay() {
    if (this._lastArea) {
      if (!this._starmapManager) {
        this._starmapManager = find("GameManager/StarmapManager").getComponent(StarmapManager);
      }
      const codes: number[] = this._starmapManager.quadrantMap.get(this._lastArea);
      if (codes !== undefined && codes.length > 0) {
        // 增加临时碰撞盒
        codes.forEach(code => {
          if (find(`GameManager/StarmapManager/solar_${code}`).getComponent(CylinderCollider) !== null) {
            find(`GameManager/StarmapManager/solar_${code}`).getComponent(CylinderCollider).destroy();
          }
        });
      }
    }
  }

  /*
   *@Author: yozora
   *@Description: 添加临时碰撞体并发送射线
   *@Date: 2021-11-05 14:48:16
   */
  private addColliderAndRay() {
    if (!this._starmapManager) {
      this._starmapManager = find("GameManager/StarmapManager").getComponent(StarmapManager);
    }
    const codes: number[] = this._starmapManager.quadrantMap.get(this._selectArea);
    console.log("index: ", this._selectArea);
    // 增加临时碰撞盒
    if (codes !== undefined && codes.length > 0) {
      codes.forEach(code => {
        // const cylinderCollider = find(`GameManager/StarmapManager/solar_${code}`).addComponent(CylinderColliderComponent);
        // cylinderCollider.radius = 0.1;
        // cylinderCollider.height = 0.1;
        // cylinderCollider.direction = EAxisDirection.Y_AXIS;
        // cylinderCollider.center = new Vec3(0, 0, 0);
        const cylinderCollider = find(`GameManager/StarmapManager/solar_${code}`).addComponent(MeshCollider);
        cylinderCollider.mesh = this.expectedMesh;
        cylinderCollider.center = new Vec3(0, 0, 0);
      });

      return true;
    } else {
      return false;
    }
  }

  /*
   *@Author: yozora
   *@Description: 射线检测
   *@Date: 2021-10-22 16:54:38
   */
  private castRay(x, y) {
    let ray = this._camera.screenPointToRay(x, y);
    if (PhysicsSystem.instance.raycast(ray)) {
      return PhysicsSystem.instance.raycastResults;
    }
    return null;
  }

  private castRayClose(x, y) {
    let ray = this._camera.screenPointToRay(x, y);
    if (PhysicsSystem.instance.raycastClosest(ray)) {
      return PhysicsSystem.instance.raycastClosestResult;
    }
    return null;
  }

  /*
   *@Author: yozora
   *@Description: 锁定射线状态
   *@Date: 2021-11-08 17:00:39
   */
  private lockCameraRay(flag: boolean) {
    // 清除已存在UI
    if (!flag) {
      ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_ANIMATION_LIST.MOUSE_HOVER_SOLAR_SYSTEM, null, 0);
    }
    this._unlocked = flag;
  }

  /*
   *@Author: yozora
   *@Description: 移除系统事件
   *@Date: 2021-11-23 10:59:28
   */
  public removeEvent() {
    input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
    input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
  }

  public resumeEvent() {
    input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
    input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
  }

}
