
import { _decorator, Component, Node, Prefab, instantiate, Vec3, Material, MeshRenderer, find, Animation, AnimationClip, error, Mesh, MeshCollider, resources, Graphics, Layers, Line, CurveRange, Camera } from 'cc';
import { GameConstans } from './entity/GameConstans';
import { SolarSystemPrefix } from './entity/SolarSystemPrefix';
import { StarmapInfo } from './entity/StarmapInfo';
import { Quaternion } from './function/Quaternion';
import { SolarSystem } from './SolarSystem';
import { GalaxyStatisticsInfo } from './ui/model/GalaxyStatisticsInfo';
import { ClientEvent } from './utils/ClientEvent';
import { HttpRequest } from './utils/HttpRequest';
const { ccclass, property } = _decorator;

let code: number = 1;

let processCount: number = 0;

/**
 * Predefined variables
 * Name = StarmapManager
 * DateTime = Tue Nov 02 2021 13:54:32 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = StarmapManager.ts
 * FileBasenameNoExtension = StarmapManager
 * URL = db://assets/script/StarmapManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 * 星图场景-星图管理
 */

@ccclass('StarmapManager')
export class StarmapManager extends Component {

    /*
     * 初始化太阳系模型
     */
    @property({
        type: Prefab,
    })
    public solar_0: Prefab | null = null;

    /*
     * 圆环模型
     */
    @property({
        type: Mesh,
    })
    public unexpectedMesh: Mesh = null;

    /*
     * 平面模型
     */
    @property({
        type: Mesh,
    })
    public expectedMesh: Mesh = null;

    /*
     * 未探索区域
     */
    @property({
        type: Material,
    })
    public unexplored_mat: Material | null = null;

    /*
    * 未探索别人占领区域
    */
    @property({
        type: Material,
    })
    public unexplored_ohter_mat: Material | null = null;

    /*
    * 无人区域
    */
    @property({
        type: Material,
    })
    public nobody_mat: Material | null = null;

    /*
    * 别人占领区域
    */
    @property({
        type: Material,
    })
    public other_area_mat: Material | null = null;

    /*
    * 我的飞船区域
    */
    @property({
        type: Material,
    })
    public my_ship_mat: Material | null = null;

    /*
     * 最高积分飞船
     */
    @property({
        type: Material,
    })
    public max_score_ship_mat: Material | null = null;

    /*
     * 我占领的区域
     */
    @property({
        type: Material,
    })
    public my_area_mat: Material | null = null;

    /*
     * 太阳系脚本
     */
    private solarSystemManager: SolarSystem = null;

    /*
     * 太阳系象限层级索引数组
     */
    public quadrantMap: Map<string, number[]> = new Map();

    /*
     * 中心点
     */
    private _centerPoint: Vec3 = new Vec3(0, 0, 0);

    /*
     * 我的飞船信息
     */
    private myships: [SolarSystemPrefix] = null;

    /*
     * 我占领的区域信息
     */
    private myArea: Array<number> = [];

    /*
     * 太阳系节点数组
     */
    public solarSystemNodes: Node[] = [];

    /*
     * 太阳系类型信息
     */
    private solarSystemTypeInfo: [SolarSystemPrefix] = null;

    /*
     * 积分最高飞船所在太阳系
     */
    private firstTargetCode: string = null;

    /*
    * 星图连接区域
    */
    private connectAreas: Array<Array<Node>> = new Array();

    /*
     * 绘制线段
     */
    private drawAreas: Map<Vec3, Array<Vec3>> = new Map();

    /*
     * 完全相等特殊线段
     */
    private specialDrawAreas: Map<number, Array<Vec3>> = new Map();

    onLoad() {
        this.processStarmap();
        ClientEvent.on(GameConstans.CLIENTEVENT_DEBUG_LIST.RESET_STARMAP, this.processStarmap, this);
        // ClientEvent.on(GameConstans.CLIENTEVENT_LIST.SOLAR_SYSTEM_ADD,
        //     this.updateSolarSystem,
        //     this);
    }

    /*
     *@Author: yozora 
     *@Description: 初始化星图
     *@Date: 2021-11-02 14:28:56
     */
    private async processStarmap(starmapInfo?: StarmapInfo) {

        // 1层
        this.processFloor(8, 45, 1, starmapInfo);

        // 2、3、4层
        for (let i = 0; i < 3; ++i) {
            this.processFloor(24, 15, i + 2, starmapInfo);
        }

        // 5、6、7、8、9、10、11、12、13层
        for (let j = 0; j < 9; j++) {
            this.processFloor(72, 5, j + 5, starmapInfo);
        }

        // 14层以上
        for (let k = 0; k < 27; k++) {
            this.processFloor(216, 1.666, k + 14, starmapInfo);
        }
        // 0层
        const solar0 = instantiate(this.solar_0);
        // 设置太阳系信息
        solar0.name = 'solar_0';
        this.solarSystemManager = solar0.getComponent(SolarSystem);
        this.solarSystemManager.solarSystemCode = "0";
        this.solarSystemManager.solarSystemType = "0";
        this.solarSystemManager.quadrant = 0;
        this.solarSystemManager.floor = 0;
        this._centerPoint.x = 0;
        solar0.setPosition(this._centerPoint);
        const cylinderCollider = solar0.addComponent(MeshCollider);
        cylinderCollider.mesh = this.expectedMesh;
        cylinderCollider.center = new Vec3(0, 0, 0);
        this.solarSystemNodes.push(solar0);
        this.quadrantMap.set(`10`, [0]);
        // this.quadrantMap.set(`20`, [0]);
        // this.quadrantMap.set(`30`, [0]);
        // this.quadrantMap.set(`40`, [0]);

        this.node.addChild(solar0);
        // 获取我的飞船信息
        HttpRequest.getMyships().then(async (res) => {
            this.myships = res.data;
            await this.processSolarSystemType();
            // 判断是否存在我的飞船
            let myAreaCount = 0;
            for (let index = 0; index < this.myships.length; index++) {
                const ele = this.myships[index];
                if (ele.solarSystemType === GameConstans.SOLAR_SYSTEM_TYPE.MY_SHIP) {
                    this.node
                        .getChildByPath(`/solar_${ele.solarSystemCode}`).getComponent(MeshRenderer).mesh = this.expectedMesh;
                    this.node
                        .getChildByPath(`/solar_${ele.solarSystemCode}`).getComponent(MeshRenderer).setMaterial(this.my_ship_mat, 0);
                    this.node
                        .getChildByPath(`/solar_${ele.solarSystemCode}`).getComponent(SolarSystem).solarSystemType = GameConstans.SOLAR_SYSTEM_TYPE.MY_SHIP;
                }
                if (ele.solarSystemType === GameConstans.SOLAR_SYSTEM_TYPE.MY_AREA) {
                    this.node
                        .getChildByPath(`/solar_${ele.solarSystemCode}`).getComponent(MeshRenderer).mesh = this.expectedMesh;
                    this.node
                        .getChildByPath(`/solar_${ele.solarSystemCode}`).getComponent(MeshRenderer).setMaterial(this.my_area_mat, 0);
                    this.myArea.push(Number(ele.solarSystemCode));
                    this.node
                        .getChildByPath(`/solar_${ele.solarSystemCode}`).getComponent(SolarSystem).solarSystemType = GameConstans.SOLAR_SYSTEM_TYPE.MY_AREA;
                    myAreaCount++;
                }
            }
            // 传递占领数据
            find("Canvas").getChildByName("Galaxy_statistics").getComponent(GalaxyStatisticsInfo).myAreaCount = myAreaCount;
            const connectArea: Array<Node> = new Array();
            for (let index = 0; index < this.myArea.length; index++) {
                connectArea.push(this.node.getChildByPath(`/solar_${this.myArea[index]}`));
            }
            this.connectAreas.push(connectArea);
            this.processEightCnnectedDraw();
            // 直接绘画连通区域
            // 标记最高积分飞船
            this.signMaxScoreShip();
        }).catch((err) => {
            error(err);
            return;
        });

    }

    /*
     *@Author: yozora
     *@Description: 处理每层级信息
     *@Date: 2021-11-04 15:05:23
     */
    private processFloor(
        count: number,
        radio: number,
        floor: number,
        starmapInfo?: StarmapInfo,
    ) {
        // 圈层信息
        let ring: number = -1;
        if (floor === 1) {
            this._centerPoint.x = this._centerPoint.x + 0.54;
            ring = 1;
        }
        if (floor > 1 && floor <= 4) {
            if (floor === 2) {
                this._centerPoint.x = this._centerPoint.x + 1.9;
            } else {
                this._centerPoint.x = this._centerPoint.x + 1.9 + Number(((0.41) * (floor - 2)).toFixed(2));
            }
            ring = 2;
        }
        if (floor > 4 && floor <= 13) {
            if (floor === 5) {
                this._centerPoint.x = this._centerPoint.x + 4.9;
            } else {
                this._centerPoint.x = this._centerPoint.x + 4.9 + Number(((0.399) * (floor - 5)).toFixed(2));
            }
            ring = 3;
        }
        if (floor > 13 && floor <= 22) {
            if (floor === 14) {
                this._centerPoint.x = this._centerPoint.x + 11.03;
            } else {
                this._centerPoint.x = this._centerPoint.x + 11.03 + Number(((0.458) * (floor - 14)).toFixed(2));
            }
            ring = 4;
        }
        if (floor > 22 && floor <= 31) {
            if (floor === 23) {
                this._centerPoint.x = this._centerPoint.x + 15.8;
            } else {
                this._centerPoint.x = this._centerPoint.x + 15.8 + Number(((0.355) * (floor - 23)).toFixed(2));
            }
            ring = 5;
        }
        if (floor > 31) {
            if (floor === 32) {
                this._centerPoint.x = this._centerPoint.x + 20.05;
            } else {
                this._centerPoint.x = this._centerPoint.x + 20.05 + Number(((0.355) * (floor - 32)).toFixed(2));
            }
            ring = 6;
        }
        // 通过旋转中心生成太阳系
        for (let index = 0; index < count; index++) {
            const trackNode = instantiate(this.solar_0);
            this.solarSystemManager = trackNode.getComponent(SolarSystem);
            // 设置太阳系编号
            trackNode.name = `solar_${code}`;
            this.node.addChild(trackNode);
            this.node
                .getChildByName(`solar_${code}`)
                .setPosition(this._centerPoint);
            Quaternion.RotationAroundNode(
                trackNode,
                this.node.position,
                Vec3.UP,
                Number((index * radio).toFixed(2))
            );
            this.solarSystemManager.solarSystemCode = code.toString();
            // 第一象限
            if (0 <= Number((index * radio).toFixed(2)) && Number((index * radio).toFixed(2)) <= 90) {
                if (this.quadrantMap.get(`1${ring}`) === undefined) {
                    this.quadrantMap.set(`1${ring}`, []);
                }
                this.quadrantMap.get(`1${ring}`).push(code);
                this.solarSystemManager.quadrant = 1;
                this.solarSystemManager.floor = floor;
            }
            // 第二象限
            if (90 <= Number((index * radio).toFixed(2)) && Number((index * radio).toFixed(2)) <= 180) {
                if (this.quadrantMap.get(`2${ring}`) === undefined) {
                    this.quadrantMap.set(`2${ring}`, []);
                }
                this.quadrantMap.get(`2${ring}`).push(code);
                this.solarSystemManager.quadrant = 2;
                this.solarSystemManager.floor = floor;
            }
            // 第三象限
            if (180 <= Number((index * radio).toFixed(2)) && Number((index * radio).toFixed(2)) <= 270) {
                if (this.quadrantMap.get(`3${ring}`) === undefined) {
                    this.quadrantMap.set(`3${ring}`, []);
                }
                this.quadrantMap.get(`3${ring}`).push(code);
                this.solarSystemManager.quadrant = 3;
                this.solarSystemManager.floor = floor;
            }
            // 第四象限
            if (270 <= Number((index * radio).toFixed(2)) && Number((index * radio).toFixed(2)) <= 360) {
                if (this.quadrantMap.get(`4${ring}`) === undefined) {
                    this.quadrantMap.set(`4${ring}`, []);
                }
                this.quadrantMap.get(`4${ring}`).push(code);
                this.solarSystemManager.quadrant = 4;
                this.solarSystemManager.floor = floor;
            }
            this.solarSystemManager.solarSystemType = "0";
            code++;

            // 太阳系节点加入碰撞检测数组
            this.solarSystemNodes.push(trackNode);
            // 隐藏所有3D节点
            // trackNode.active = false;
        }
        this._centerPoint.x = 0;
        processCount++;
    }

    /*
     *@Author: yozora
     *@Description: 标记积分最高飞船
     *@Date: 2021-12-01 11:17:38
     */
    private signMaxScoreShip() {
        this.node
            .getChildByPath(`/solar_${this.firstTargetCode}`).getComponent(SolarSystem).is_first_target = true;
        // 叠加标记层
        const signNode = instantiate(this.solar_0);
        signNode.name = `sign_${this.firstTargetCode}`;
        this.node.addChild(signNode);
        signNode.setPosition(this.node.getChildByPath(`/solar_${this.firstTargetCode}`).getPosition());
        signNode.getComponent(MeshRenderer).mesh = this.expectedMesh;
        signNode.getComponent(MeshRenderer).setMaterial(this.max_score_ship_mat, 0);
        // 播放动画
        resources.load("animation/max_score_large", AnimationClip, (err, assert) => {
            if (err) {
                console.error(err);
                return;
            }
            signNode.addComponent(Animation).createState(assert);
            const anime = signNode.getComponent(Animation);
            if (anime.getState("max_score_large") !== null && !anime.getState("max_score_large").isPlaying) {
                anime.play("max_score_large");
            }
        });
    }

    /*
     *@Author: yozora
     *@Description: 处理太阳系类型
     *@Date: 2021-11-10 17:50:06
     */
    private async processSolarSystemType() {
        // 查询太阳系类型信息
        await HttpRequest.getStarmapInfoOther().then((res) => {
            this.solarSystemTypeInfo = res.data;
        }).catch((err) => {
            error(err);
        });
        let otherAreaCount = 0;
        this.solarSystemTypeInfo.forEach((item) => {
            if (item.solarSystemType === GameConstans.SOLAR_SYSTEM_TYPE.UNEXPLORED_OCCUPIED) {
                this.node
                    .getChildByPath(`/solar_${item.solarSystemCode}`).getComponent(MeshRenderer).mesh = this.expectedMesh;
                this.node
                    .getChildByPath(`/solar_${item.solarSystemCode}`).getComponent(MeshRenderer).setMaterial(this.unexplored_ohter_mat, 0);
                this.node
                    .getChildByPath(`/solar_${item.solarSystemCode}`).getComponent(SolarSystem).solarSystemType = GameConstans.SOLAR_SYSTEM_TYPE.UNEXPLORED_OCCUPIED;
                otherAreaCount++;
            }
            if (item.solarSystemType === GameConstans.SOLAR_SYSTEM_TYPE.EXPLORED_NOBODY) {
                // this.node
                //     .getChildByPath(`/solar_${item.solarSystemCode}`).getComponent(MeshRenderer).mesh = this.expectedMesh;
                this.node
                    .getChildByPath(`/solar_${item.solarSystemCode}`).getComponent(MeshRenderer).setMaterial(this.nobody_mat, 0);
                this.node
                    .getChildByPath(`/solar_${item.solarSystemCode}`).getComponent(SolarSystem).solarSystemType = GameConstans.SOLAR_SYSTEM_TYPE.EXPLORED_NOBODY;
            }
            if (item.solarSystemType === GameConstans.SOLAR_SYSTEM_TYPE.EXPLORED_OCCUPIED) {
                this.node
                    .getChildByPath(`/solar_${item.solarSystemCode}`).getComponent(MeshRenderer).mesh = this.expectedMesh;
                this.node
                    .getChildByPath(`/solar_${item.solarSystemCode}`).getComponent(MeshRenderer).setMaterial(this.other_area_mat, 0);
                this.node
                    .getChildByPath(`/solar_${item.solarSystemCode}`).getComponent(SolarSystem).solarSystemType = GameConstans.SOLAR_SYSTEM_TYPE.EXPLORED_OCCUPIED;
                otherAreaCount++;
            }
            if (item.solarSystemType === GameConstans.SOLAR_SYSTEM_TYPE.MAX_SCORE_SHIP) {
                this.firstTargetCode = item.solarSystemCode;
            }
        })
        // 传递占领数据
        // find("Canvas").getChildByName("Galaxy_statistics").getComponent(GalaxyStatisticsInfo).otherAreaCount = otherAreaCount;
    }

    /*
      *@Author: yozora
      *@Description: 连接占领区域
      *@Date: 2021-12-02 13:42:20
      */
    public processEightCnnectedDraw() {
        // 已连接点及度
        const alreadyDraw: Map<string, number> = new Map();
        const ctx = null;

        // 全连接
        for (let i = 0; i < this.connectAreas[0].length; i++) {
            this.searchPoints(ctx, this.connectAreas[0][i], this.connectAreas[0][i].getComponent(SolarSystem), alreadyDraw);
        }

        // 剪枝
        for (let i = 0; i < this.connectAreas[0].length; i++) {
            this.loppingPoints(ctx, this.connectAreas[0][i], this.connectAreas[0][i].getComponent(SolarSystem), alreadyDraw);
        }

        const area = this.node.getChildByName("Area");
        // 3D层绘制
        this.drawAreas.forEach((values: Array<Vec3>, key: Vec3) => {
            values.forEach((value: Vec3) => {
                const node = new Node();
                node.layer = Layers.Enum.DEFAULT;
                const line = node.addComponent(Line);
                const c = new CurveRange();
                c.constant = 0.05;
                line.width = c;
                line.worldSpace = true;
                line.positions.push(key);
                line.positions.push(value);
                area.addChild(node);
            });
        });

        this.specialDrawAreas.size > 0 && this.specialDrawAreas.forEach((values: Array<Vec3>, key: number) => {
            for (let index = 0; index < values.length; index++) {
                const node = new Node();
                node.layer = Layers.Enum.DEFAULT;
                const line = node.addComponent(Line);
                const c = new CurveRange();
                c.constant = 0.05;
                line.width = c;
                line.worldSpace = true;
                line.positions.push(values[0]);
                line.positions.push(values[3]);
                area.addChild(node);
            }
        });
    }

    /*
     *@Author: yozora
     *@Description: 连接领近点
     *@Date: 2021-12-01 23:23:35
     */
    private searchPoints(ctx: Graphics, target: Node, solarSystemManager: SolarSystem, alreadyDraw: Map<string, number>) {

        const code: number = Number(solarSystemManager.solarSystemCode);
        let areas: Node[] = [];
        let temp_code = 0;
        let temp_top_code = 0;
        let temp_buttom_code = 0;

        // 外
        if (code === 0) {
            temp_code = 5;
        } else {
            const offset_left = this.processFloorSolarSystemCount(solarSystemManager.floor, -1);
            temp_code = code + offset_left;
        }
        this.connectAreas[0].find((item) => {
            // 如果包含此元素则加入当前区域
            if (Number(item.getComponent(SolarSystem).solarSystemCode) === temp_code) {
                areas.push(item);
            }
        });

        // 前
        if (code === 0) {
            temp_code = 3;
        } else {
            temp_code = code - 1;
        }
        temp_top_code = temp_code;
        this.connectAreas[0].find((item) => {
            // 如果包含此元素则加入当前区域
            if (Number(item.getComponent(SolarSystem).solarSystemCode) === temp_code) {
                areas.push(item);
            }
        });

        // 前外
        if (code === 0) {
            temp_code = 4;
        } else {
            const offset_left = this.processFloorSolarSystemCount(solarSystemManager.floor, -1);
            temp_code = temp_top_code + offset_left;
        }
        this.connectAreas[0].find((item) => {
            // 如果包含此元素则加入当前区域
            if (Number(item.getComponent(SolarSystem).solarSystemCode) === temp_code) {
                areas.push(item);
            }
        });

        // 前内
        if (code === 0) {
            temp_code = 2;
        } else {
            const offset_right = this.processFloorSolarSystemCount(solarSystemManager.floor, 1);
            temp_code = temp_top_code - offset_right;
        }
        this.connectAreas[0].find((item) => {
            // 如果包含此元素则加入当前区域
            if (Number(item.getComponent(SolarSystem).solarSystemCode) === temp_code) {
                areas.push(item);
            }
        });

        // 内
        if (code === 0) {
            temp_code = 1;
        } else {
            const offset_right = this.processFloorSolarSystemCount(solarSystemManager.floor, 1);
            temp_code = code - offset_right;
        }
        this.connectAreas[0].find((item) => {
            // 如果包含此元素则加入当前区域
            if (Number(item.getComponent(SolarSystem).solarSystemCode) === temp_code) {
                areas.push(item);
            }
        });

        // 后
        if (code === 0) {
            temp_code = 7;
        } else {
            temp_code = code + 1;
        }
        temp_buttom_code = temp_code;
        this.connectAreas[0].find((item) => {
            // 如果包含此元素则加入当前区域
            if (Number(item.getComponent(SolarSystem).solarSystemCode) === temp_code) {
                areas.push(item);
            }
        });

        // 后外
        if (code === 0) {
            temp_code = 6;
        } else {
            const offset_left = this.processFloorSolarSystemCount(solarSystemManager.floor, -1);
            temp_code = temp_buttom_code + offset_left;
        }
        this.connectAreas[0].find((item) => {
            // 如果包含此元素则加入当前区域
            if (Number(item.getComponent(SolarSystem).solarSystemCode) === temp_code) {
                areas.push(item);
            }
        });

        // 后内
        if (code === 0) {
            temp_code = 8;
        } else {
            const offset_right = this.processFloorSolarSystemCount(solarSystemManager.floor, 1);
            temp_code = temp_buttom_code - offset_right;
        }
        this.connectAreas[0].find((item) => {
            // 如果包含此元素则加入当前区域
            if (Number(item.getComponent(SolarSystem).solarSystemCode) === temp_code) {
                areas.push(item);
            }
        });
        if (areas.length > 0) {
            // const startPosition = this.mainCamera.convertToUINode(
            //     target.getWorldPosition(),
            //     this.node
            // );
            areas = Array.from(new Set(areas));
            // 绘制区域
            for (let index = 0; index < areas.length; index++) {

                // 记录绘制点
                // ctx.moveTo(startPosition.x, startPosition.y);
                // let position = this.mainCamera.convertToUINode(
                //     areas[index].getWorldPosition(),
                //     this.node
                // );
                // if (this.drawAreas.get(startPosition) === undefined) {
                //   this.drawAreas.set(startPosition, [position]);
                // } else if (this.drawAreas.get(startPosition).length > 0) {
                //   this.drawAreas.get(startPosition).push(position);
                // }

                // 3D层绘制
                if (this.drawAreas.get(target.getWorldPosition()) === undefined) {
                    this.drawAreas.set(target.getWorldPosition(), [areas[index].getWorldPosition()]);
                } else if (this.drawAreas.get(target.getWorldPosition()).length > 0) {
                    this.drawAreas.get(target.getWorldPosition()).push(areas[index].getWorldPosition());
                }

                // 连接区域
                // ctx.lineTo(position.x, position.y);
            }
            alreadyDraw.set(solarSystemManager.solarSystemCode, areas.length);
            // ctx.close();
            // ctx.stroke();
        }
    }

    /*
     *@Author: yozora
     *@Description: 剪枝
     *@Date: 2021-12-30 14:20:45
     */
    private loppingPoints(ctx: Graphics, target: Node, solarSystemManager: SolarSystem, alreadyDraw: Map<string, number>) {

        const code: number = Number(solarSystemManager.solarSystemCode);
        let alreadyActivationPoints: Map<number, number> = new Map();
        let temp_code = 0;
        let temp_top_code = 0;
        let temp_buttom_code = 0;
        let startPosition;
        let endPosition;

        // 记录临近激活点

        // 外
        if (code === 0) {
            temp_code = 5;
        } else {
            const offset_left = this.processFloorSolarSystemCount(solarSystemManager.floor, -1);
            temp_code = code + offset_left;
        }
        this.connectAreas[0].find((item) => {
            // 如果包含此元素则加入当前区域
            if (Number(item.getComponent(SolarSystem).solarSystemCode) === temp_code) {
                alreadyActivationPoints.set(-1, temp_code);
            }
        });

        // 前
        if (code === 0) {
            temp_code = 3;
        } else {
            temp_code = code - 1;
        }
        temp_top_code = temp_code;
        this.connectAreas[0].find((item) => {
            // 如果包含此元素则加入当前区域
            if (Number(item.getComponent(SolarSystem).solarSystemCode) === temp_code) {
                alreadyActivationPoints.set(2, temp_code);
            }
        });

        // 内
        if (code === 0) {
            temp_code = 1;
        } else {
            const offset_right = this.processFloorSolarSystemCount(solarSystemManager.floor, 1);
            temp_code = code - offset_right;
        }
        this.connectAreas[0].find((item) => {
            // 如果包含此元素则加入当前区域
            if (Number(item.getComponent(SolarSystem).solarSystemCode) === temp_code) {
                alreadyActivationPoints.set(1, temp_code);
            }
        });

        // 后
        if (code === 0) {
            temp_code = 7;
        } else {
            temp_code = code + 1;
        }
        temp_buttom_code = temp_code;
        this.connectAreas[0].find((item) => {
            // 如果包含此元素则加入当前区域
            if (Number(item.getComponent(SolarSystem).solarSystemCode) === temp_code) {
                alreadyActivationPoints.set(-2, temp_code);
            }
        });

        // 记录是否存在对角线

        // 前外
        if (code === 0) {
            temp_code = 4;
        } else {
            const offset_left = this.processFloorSolarSystemCount(solarSystemManager.floor, -1);
            temp_code = temp_top_code + offset_left;
        }
        this.connectAreas[0].find((item) => {
            // 如果包含此元素则加入当前区域
            if (Number(item.getComponent(SolarSystem).solarSystemCode) === temp_code) {
                this.reduceDrawLine(ctx, -1, 2, temp_code, solarSystemManager, alreadyActivationPoints, alreadyDraw, startPosition, endPosition);
            }
        });

        // 前内
        if (code === 0) {
            temp_code = 2;
        } else {
            const offset_right = this.processFloorSolarSystemCount(solarSystemManager.floor, 1);
            temp_code = temp_top_code - offset_right;
        }
        this.connectAreas[0].find((item) => {
            // 如果包含此元素则加入当前区域
            if (Number(item.getComponent(SolarSystem).solarSystemCode) === temp_code) {
                this.reduceDrawLine(ctx, 1, 2, temp_code, solarSystemManager, alreadyActivationPoints, alreadyDraw, startPosition, endPosition);
            }
        });

        // 后外
        if (code === 0) {
            temp_code = 6;
        } else {
            const offset_left = this.processFloorSolarSystemCount(solarSystemManager.floor, -1);
            temp_code = temp_buttom_code + offset_left;
        }
        this.connectAreas[0].find((item) => {
            // 如果包含此元素则加入当前区域
            if (Number(item.getComponent(SolarSystem).solarSystemCode) === temp_code) {
                this.reduceDrawLine(ctx, -1, -2, temp_code, solarSystemManager, alreadyActivationPoints, alreadyDraw, startPosition, endPosition);
            }
        });

        // 后内
        if (code === 0) {
            temp_code = 8;
        } else {
            const offset_right = this.processFloorSolarSystemCount(solarSystemManager.floor, 1);
            temp_code = temp_buttom_code - offset_right;
        }
        this.connectAreas[0].find((item) => {
            // 如果包含此元素则加入当前区域
            if (Number(item.getComponent(SolarSystem).solarSystemCode) === temp_code) {
                this.reduceDrawLine(ctx, 1, -2, temp_code, solarSystemManager, alreadyActivationPoints, alreadyDraw, startPosition, endPosition);
            }
        });

    }

    /*
     *@Author: yozora
     *@Description: 删除多余的线条
     *@Date: 2021-12-30 14:20:55
     */
    private reduceDrawLine(ctx: Graphics, point1: number, point2: number, temp_code: number, solarSystemManager: SolarSystem, alreadyActivationPoints: Map<number, number>, alreadyDraw: Map<string, number>, startPosition: Vec3, endPosition: Vec3) {
        // 判断是否激活相邻点
        if (alreadyActivationPoints.get(point1) !== undefined && alreadyActivationPoints.get(point2) !== undefined
            && alreadyActivationPoints.get(point1) !== null && alreadyActivationPoints.get(point2) !== null) {

            // 判断度
            if (alreadyDraw.get(solarSystemManager.solarSystemCode) + alreadyDraw.get(temp_code.toString())
                > alreadyDraw.get(alreadyActivationPoints.get(point1).toString()) + alreadyDraw.get(alreadyActivationPoints.get(point2).toString())) {
                // 删除多余对角线
                // startPosition = this.mainCamera.convertToUINode(
                //   find(`GameManager/StarmapManager/solar_${alreadyActivationPoints.get(point1)}`).getWorldPosition(),
                //   this.node
                // );
                // endPosition = this.mainCamera.convertToUINode(
                //   find(`GameManager/StarmapManager/solar_${alreadyActivationPoints.get(point2)}`).getWorldPosition(),
                //   this.node
                // );

                startPosition = find(`GameManager/StarmapManager/solar_${alreadyActivationPoints.get(point1)}`).getWorldPosition();
                endPosition = find(`GameManager/StarmapManager/solar_${alreadyActivationPoints.get(point2)}`).getWorldPosition();

            } else if (alreadyDraw.get(solarSystemManager.solarSystemCode) + alreadyDraw.get(temp_code.toString())
                === alreadyDraw.get(alreadyActivationPoints.get(point1).toString()) + alreadyDraw.get(alreadyActivationPoints.get(point2).toString())) {
                const avg1 = (alreadyDraw.get(solarSystemManager.solarSystemCode) + alreadyDraw.get(temp_code.toString())) / 2.0;
                const avg2 = (alreadyDraw.get(alreadyActivationPoints.get(point1).toString()) + + alreadyDraw.get(alreadyActivationPoints.get(point2).toString())) / 2.0;
                const e1 = (Math.pow(alreadyDraw.get(solarSystemManager.solarSystemCode) - avg1, 2) + Math.pow(alreadyDraw.get(temp_code.toString()) - avg1, 2)) * 1.0 / 2.0;
                const e2 = (Math.pow(alreadyDraw.get(alreadyActivationPoints.get(point1).toString()) - avg2, 2) + Math.pow(alreadyDraw.get(alreadyActivationPoints.get(point2).toString()) - avg2, 2)) * 1.0 / 2.0;
                if (e1 > e2) {
                    // startPosition = this.mainCamera.convertToUINode(
                    //   find(`GameManager/StarmapManager/solar_${alreadyActivationPoints.get(point1)}`).getWorldPosition(),
                    //   this.node
                    // );
                    // endPosition = this.mainCamera.convertToUINode(
                    //   find(`GameManager/StarmapManager/solar_${alreadyActivationPoints.get(point2)}`).getWorldPosition(),
                    //   this.node
                    // );
                    startPosition = find(`GameManager/StarmapManager/solar_${alreadyActivationPoints.get(point1)}`).getWorldPosition();
                    endPosition = find(`GameManager/StarmapManager/solar_${alreadyActivationPoints.get(point2)}`).getWorldPosition();
                    // 方差相等的情况下，删除多余对角线
                } else {
                    if (e1 === e2) {
                        const key = (Number(solarSystemManager.solarSystemCode) * temp_code * alreadyActivationPoints.get(point1) * alreadyActivationPoints.get(point2));
                        this.specialDrawAreas.set(key, []);
                        // this.specialDrawAreas.get(key).push(this.mainCamera.convertToUINode(
                        //   find(`GameManager/StarmapManager/solar_${alreadyActivationPoints.get(point1)}`).getWorldPosition(),
                        //   this.node
                        // ));
                        // this.specialDrawAreas.get(key).push(this.mainCamera.convertToUINode(
                        //   find(`GameManager/StarmapManager/solar_${solarSystemManager.solarSystemCode}`).getWorldPosition(),
                        //   this.node
                        // ));
                        // this.specialDrawAreas.get(key).push(this.mainCamera.convertToUINode(
                        //   find(`GameManager/StarmapManager/solar_${temp_code}`).getWorldPosition(),
                        //   this.node
                        // ));
                        // this.specialDrawAreas.get(key).push(this.mainCamera.convertToUINode(
                        //   find(`GameManager/StarmapManager/solar_${alreadyActivationPoints.get(point2)}`).getWorldPosition(),
                        //   this.node
                        // ));

                        this.specialDrawAreas.get(key).push(
                            find(`GameManager/StarmapManager/solar_${alreadyActivationPoints.get(point1)}`).getWorldPosition(),
                        );
                        this.specialDrawAreas.get(key).push(
                            find(`GameManager/StarmapManager/solar_${solarSystemManager.solarSystemCode}`).getWorldPosition(),
                        );
                        this.specialDrawAreas.get(key).push(
                            find(`GameManager/StarmapManager/solar_${temp_code}`).getWorldPosition(),
                        );
                        this.specialDrawAreas.get(key).push(
                            find(`GameManager/StarmapManager/solar_${alreadyActivationPoints.get(point2)}`).getWorldPosition(),
                        );
                    }

                    // startPosition = this.mainCamera.convertToUINode(
                    //   find(`GameManager/StarmapManager/solar_${solarSystemManager.solarSystemCode}`).getWorldPosition(),
                    //   this.node
                    // );
                    // endPosition = this.mainCamera.convertToUINode(
                    //   find(`GameManager/StarmapManager/solar_${temp_code}`).getWorldPosition(),
                    //   this.node
                    // );
                    startPosition = find(`GameManager/StarmapManager/solar_${solarSystemManager.solarSystemCode}`).getWorldPosition();
                    endPosition = find(`GameManager/StarmapManager/solar_${temp_code}`).getWorldPosition();
                }
            } else {
                // startPosition = this.mainCamera.convertToUINode(
                //   find(`GameManager/StarmapManager/solar_${solarSystemManager.solarSystemCode}`).getWorldPosition(),
                //   this.node
                // );
                // endPosition = this.mainCamera.convertToUINode(
                //   find(`GameManager/StarmapManager/solar_${temp_code}`).getWorldPosition(),
                //   this.node
                // );
                startPosition = find(`GameManager/StarmapManager/solar_${solarSystemManager.solarSystemCode}`).getWorldPosition();
                endPosition = find(`GameManager/StarmapManager/solar_${temp_code}`).getWorldPosition();
            }
            this.drawAreas.forEach((values: Array<Vec3>, key: Vec3) => {
                if (key.equals(startPosition)) {
                    values.forEach((value: Vec3) => {
                        if (value.equals(endPosition)) {
                            values.splice(values.indexOf(value), 1);
                        }
                    });
                }
            });
        }
    }


    /*
     *@Author: yozora
     *@Description: 判断区域间隔
     *@Date: 2021-12-03 13:46:07
     */
    private processFloorSolarSystemCount(floor: number, type: number) {
        // 内方向 
        if (type === 1) {
            if (floor === 1) {
                return 8;
            }
            if (floor > 1 && floor <= 4) {
                return 24;
            }
            if (floor > 4 && floor <= 14) {
                return 72;
            }
            if (floor > 14) {
                return 216;
            }
        }
        // 外方向
        if (type === -1) {
            if (floor >= 1 && floor < 4) {
                return 24;
            }
            if (floor >= 4 && floor < 13) {
                return 72;
            }
            if (floor >= 13) {
                return 216;
            }
        }

    }


    /*
     *@Author: yozora
     *@Description: 缩放移动间距
     *@Date: 2021-12-30 16:20:02
     */
    private updateSolarSystem(type) {
        if (type === 1) {
            this.solarSystemNodes.forEach((solar) => {
                if (solar.name === "solar_1") {
                    console.log("solar_1: ", solar.getPosition());
                }
                solar.setPosition(Vec3.multiplyScalar(solar.position, solar.position, 1.1));
            });
        } else {
            this.solarSystemNodes.forEach((solar) => {
                if (solar.name === "solar_1") {
                    console.log("solar_1: ", solar.getPosition());
                }
                solar.setPosition(Vec3.multiplyScalar(solar.position, solar.position, 0.9));
            });
        }
    }
}

