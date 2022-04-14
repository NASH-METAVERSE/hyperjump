import { _decorator, Component, Node, Vec3, CCInteger, CCFloat } from "cc";
import { Quaternion } from "./Quaternion";
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Rotate
 * DateTime = Wed Oct 20 2021 18:42:08 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = Rotate.ts
 * FileBasenameNoExtension = Rotate
 * URL = db://assets/scripts/function/Rotate.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * 自转
 */

@ccclass("Rotate")
export class Rotate extends Component {

  /*
   * 0--->x 1--->y 2--->z
   */
  @property({ type: CCInteger, tooltip: "0--->x 1--->y 2--->z 4--->xy 5--->yz 6--->zx" })
  private rotateType: number = 0;

  @property({ type: CCFloat })
  private rotateSpeed: number = 0.01;


  update(deltaTime: number) {
    //围绕旋转
    if (this.rotateType == 0) {
      Quaternion.RotateX(this.node, this.rotateSpeed);
    } if (this.rotateType == 1) {
      Quaternion.RotateY(this.node, this.rotateSpeed);
    } if (this.rotateType == 2) {
      Quaternion.RotateZ(this.node, this.rotateSpeed);
    }
    if (this.rotateType == 4) {
      Quaternion.RotateX(this.node, this.rotateSpeed);
      Quaternion.RotateY(this.node, this.rotateSpeed);
    } if (this.rotateType == 5) {
      Quaternion.RotateY(this.node, this.rotateSpeed);
      Quaternion.RotateZ(this.node, this.rotateSpeed);
    } if (this.rotateType == 6) {
      Quaternion.RotateZ(this.node, this.rotateSpeed);
      Quaternion.RotateX(this.node, this.rotateSpeed);
    }
    if (this.rotateType == 7) {
      Quaternion.RotateX(this.node, this.rotateSpeed);
      Quaternion.RotateY(this.node, this.rotateSpeed);
      Quaternion.RotateZ(this.node, this.rotateSpeed);
    }

  }
}
