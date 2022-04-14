import {
  _decorator,
  Component,
  Node,
  Vec3,
  Prefab,
  instantiate,
  find,
  Graphics,
  Camera,
} from "cc";
import { Quaternion } from "./Quaternion";
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Ra
 * DateTime = Tue Sep 28 2021 14:53:41 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = Ra.ts
 * FileBasenameNoExtension = Ra
 * URL = db://assets/Scripts/Ra.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * 绕点运动组件
 *
 */

@ccclass("RotateAround")
export class RotateAround extends Component {

  @property({ type: Node, tooltip: "围绕旋转的目标" })
  public target: Node = null;

  /*
   * 轨道线
   */
  @property({
    type: Prefab,
  })
  private track: Prefab = null;

  /*
  * 轨道线
  */
  @property({
    type: Prefab,
  })
  private trackLine: Prefab = null;

  /*
   * 当前轨道数量
   */
  private trackCount: number = 0;

  /*
   * 最大轨道数量
   */
  private trackMax: number = 72;

  /*
   * 角度
   */
  public angle: number = 0;

  /*
   * 半径
   */
  public radius: number = 0;

  /*
   * 当前位置
   */
  public _curPosition: Vec3 = new Vec3(0, 0, 0);

  /*
   * 轨道缩放
   */
  private _trackScale: Vec3 = new Vec3(10, 1, 1);

  /*
   * 轨道点
   */
  private lines: Vec3[] = [];

  /*
   * 自定义图形
   */
  private ctx: Graphics = null;

  /*
   * 每帧运动角度
   */
  private timePerAngle = 0.01;

  private planetCode: string = null;

  start() {
    this.node.getWorldPosition(this._curPosition);
    this.timePerAngle = Math.random() * 0.01 + 0.01;
    this.initArc();
  }

  update(deltaTime: number) {
    //围绕旋转
    Quaternion.RotationAroundNode(
      this.node,
      this.target.position,
      Vec3.UP,
      this.timePerAngle
    );
  }

  public setPlanetCode(planetCode: string) {
    this.planetCode = planetCode;
  }

  public getPlanetCode() {
    return this.planetCode;
  }

  /*
   *@Author: yozora
   *@Description:
   *@Date: 2022-01-19 10:52:52
   */
  private initArc() {
    // 激活轨道
    const track_index = this.radius / 5;
    this.target.getChildByName("Track").getChildByName(`Track_${track_index}`).active = true;
    for (let index = 0; index < this.trackMax; index++) {
      if (index === 0) {
        const radio = Number((this._curPosition.x / 90 * 5).toFixed(2)) / 0.378;
        // const radio = 2 * Math.cos(87.5) / 0.3;
        this._trackScale.x = this._trackScale.x * radio;
      }
      let trackNode = instantiate(this.trackLine);
      trackNode.setScale(this._trackScale);
      trackNode.name = `track_${this.node.name}_${this.trackCount}`;
      this.target.getChildByName("Track").getChildByName(`Track_${track_index}`).addChild(trackNode);
      this.target
        .getChildByName("Track")
        .getChildByName(`Track_${track_index}`)
        .getChildByName(`track_${this.node.name}_${this.trackCount}`)
        .setWorldPosition(this._curPosition);
      Quaternion.RotationAroundNode(
        trackNode,
        this.target.position,
        Vec3.UP,
        index * 5
      );
      this.target
        .getChildByName("Track")
        .getChildByName(`Track_${track_index}`)
        .getChildByName(`track_${this.node.name}_${this.trackCount}`).setRotationFromEuler(0, (360 / 72) * index + 90, 0);
      this.trackCount++;
    }
  }

  /*
   *@Author: yozora
   *@Description: 放置轨道点(线段)
   *@Date: 2022-01-13 13:34:26
   */
  // public initArc() {
  //   const initPosition = this.node.getPosition(this._curPosition);
  //   let trackNode = instantiate(this.track);
  //   trackNode.setScale(this._trackScale);
  //   trackNode.name = `track_${this.node.name}_0`;
  //   this.target.getChildByName("Track").addChild(trackNode);
  //   for (let index = 0; index < this.trackMax; index++) {
  //     this.target
  //       .getChildByName("Track")
  //       .getChildByName(`track_${this.node.name}_0`)
  //       .setWorldPosition(this._curPosition);
  //     Quaternion.RotationAroundNode(
  //       trackNode,
  //       this.target.position,
  //       Vec3.UP,
  //       index * 5
  //     );
  //     const linePos = trackNode.getWorldPosition();
  //     // linePos.z = 0;
  //     this.lines.push(linePos);
  //     // this.trackCount++;
  //   }
  //   // initPosition.z = 0
  //   this.target
  //     .getChildByName("Track")
  //     .getChildByName(`track_${this.node.name}_0`).destroy();
  //   this.lines.push(initPosition);
  //   // 线段宽度
  //   const c = new CurveRange();
  //   c.constant = 0.05;
  //   let lines = instantiate(this.track);
  //   lines.setScale(this._trackScale);
  //   lines.name = `track_${this.node.name}_lines`;
  //   const line = lines.addComponent(Line);
  //   line.width = c;
  //   const r = new GradientRange();
  //   r.color = Color.GRAY;
  //   line.color = r;
  //   line.worldSpace = true;
  //   line.positions.push(...this.lines);
  //   this.target.getChildByName("Track").addChild(lines);
  // }

  /*
   *@Author: yozora
   *@Description: 绘制圆形轨迹
   *@Date: 2021-09-28 16:34:49
   */
  drawArc() {
    if (this.trackCount < this.trackMax && this.angle % 5 === 0) {
      let trackNode = instantiate(this.track);
      trackNode.setScale(this._trackScale);
      trackNode.name = `track_${this.node.name}_${this.trackCount}`;
      this.target.getChildByName("Track").addChild(trackNode);
      this.target
        .getChildByName("Track")
        .getChildByName(`track_${this.node.name}_${this.trackCount}`)
        .setWorldPosition(this._curPosition);
      this.trackCount++;
    }
  }

  drawLine() {
    const mainCamera = find("Main Camera").getComponent(Camera);
    let center = mainCamera.convertToUINode(
      this.target.getWorldPosition(),
      find("Canvas")
    );
    let position = mainCamera.convertToUINode(
      this.node.getWorldPosition(),
      find("Canvas")
    );
    this.ctx.clear();
    this.ctx.circle(center.x, center.y, Vec3.distance(position, center));
    this.ctx.stroke();
  }

}
