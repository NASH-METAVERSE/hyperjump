import { _decorator, Component, Node, Animation, Vec3, find, MeshRenderer, AnimationClip } from 'cc';
import { CamaraManager } from './CamaraManager';
import { GameConstans } from './entity/GameConstans';
import { SolarSystem } from './SolarSystem';
import { StarmapManager } from './StarmapManager';
import { ClientEvent } from './utils/ClientEvent';
const { ccclass, property } = _decorator;

const v3_2 = new Vec3();


/**
 * Predefined variables
 * Name = EffectManager
 * DateTime = Mon Nov 08 2021 10:51:45 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = EffectManager.ts
 * FileBasenameNoExtension = EffectManager
 * URL = db://assets/script/EffectManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('EffectManager')
export class EffectManager extends Component {

    /*
     * 太阳系动画剪辑
     */
    @property({ type: AnimationClip })
    private solarSystemLargeClip: AnimationClip = null;

    /*
     * 最近选中太阳系
     */
    private _lastSelectSolarSystem: Node = null;

    /*
     * 星图脚本
     */
    private starmapManager: StarmapManager = null;

    /*
     * 摄像机脚本
     */
    private cameraManager: CamaraManager = null;

    /*
     * 最近选中太阳系次数
     */
    private lastCount: Map<string, number> = new Map();

    onEnable() {
        this.starmapManager = find("GameManager/StarmapManager").getComponent(StarmapManager);
        this.cameraManager = find("Main Camera").getComponent(CamaraManager);
        ClientEvent.on(GameConstans.CLIENTEVENT_ANIMATION_LIST.MOUSE_HOVER_SOLAR_SYSTEM, this.selectSolarSystem, this);
    }

    /*
    *@Author: yozora
    *@Description: 根据击中点选择太阳系
    *@param: {target} 目标对象
    *@param: {selectType} 选择类型 0 hover 1 click
    *@Date: 2021-11-04 23:09:05
    */
    private selectSolarSystem(target: Node, selectType: number) {
        if (!this._lastSelectSolarSystem && target !== null) {
            this._lastSelectSolarSystem = target;
        }
        // 选中目标
        if (target !== null) {
            // 选中新太阳系
            if (this._lastSelectSolarSystem.name !== target.name) {
                if (this._lastSelectSolarSystem.getComponent(Animation) !== null) {
                    const anime_last = this._lastSelectSolarSystem.getComponent(Animation);
                    anime_last.stop();
                    // 重置位置及透明度
                    this._lastSelectSolarSystem.setWorldScale(find("GameManager/solar_init").getWorldScale());
                    this.resetMaterial();
                    this._lastSelectSolarSystem.getComponent(Animation).destroy();
                }
                this._lastSelectSolarSystem = target;
                // 点击状态
                if (selectType === GameConstans.MOUSE_TYPE.CLICK) {
                    this.cameraManager.isClickedSolarTooltip(true);
                    if (target.getComponent(Animation) === null) {
                        target.addComponent(Animation).createState(this.solarSystemLargeClip);
                    }
                    const anime = target.getComponent(Animation);
                    if (anime.getState("solarSystem_small") !== null && !anime.getState("solarSystem_small").isPlaying) {
                        anime.play("solarSystem_small");
                    }
                    // 点击工具栏
                    // ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.SELECT_SOLAR_SYSTEM_TOOLTIP, target, true);
                    // 点击进入太阳系
                    console.log("点击进入太阳系: ", target.name);
                    ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_SCENCE_LIST.CHANG_SOLAR_SYSTEM, target.getComponent(SolarSystem).solarSystemCode);
                }
                this.lastCount.clear();
            } else {
                if (selectType === GameConstans.MOUSE_TYPE.CLICK && this.cameraManager.getClickedSolarTooltip()) {
                    return;
                }
                if (this.lastCount.get(target.name) !== undefined && this.lastCount.get(target.name) >= 100) {
                    console.log("counts");
                    return;
                }
                // 选中同一太阳系
                if (target.getComponent(Animation) === null) {
                    target.addComponent(Animation).createState(this.solarSystemLargeClip);
                }
                const anime = target.getComponent(Animation);
                if (anime.getState("solarSystem_small") !== null && !anime.getState("solarSystem_small").isPlaying) {
                    anime.play("solarSystem_small");
                }
                // if (target.getComponent(SolarSystem).solarSystemType === GameConstans.SOLAR_SYSTEM_TYPE.MY_AREA || target.getComponent(SolarSystem).solarSystemType === GameConstans.SOLAR_SYSTEM_TYPE.EXPLORED_NOBODY) {
                ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.SELECT_SOLAR_SYSTEM_TOOLTIP, target, true);
                // }
                // console.log("nodeName: ", target.name);
                // console.log("nodePosition: ", target.getWorldPosition());
                // 点击状态
                if (selectType === GameConstans.MOUSE_TYPE.CLICK) {
                    this.cameraManager.isClickedSolarTooltip(true);
                    console.log("点击进入太阳系: ", target.name);
                    ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_SCENCE_LIST.CHANG_SOLAR_SYSTEM, target.getComponent(SolarSystem).solarSystemCode);
                }
                this.lastCount.get(target.name) === undefined ? this.lastCount.set(target.name, 1) : this.lastCount.set(target.name, this.lastCount.get(target.name) + 1);
            }
        } else {
            // 空白区域
            if (this._lastSelectSolarSystem) {
                const solar = find(`GameManager/StarmapManager/${this._lastSelectSolarSystem.name}`);
                // 重置位置及透明度
                solar.setWorldScale(find("GameManager/solar_init").getWorldScale());
                this.resetMaterial();
                this._lastSelectSolarSystem = null;
                if (solar.getComponent(Animation) !== null) {
                    const anime_last = solar.getComponent(Animation);
                    anime_last.stop();
                    solar.getComponent(Animation).destroy();
                }
            }
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.SELECT_SOLAR_SYSTEM_TOOLTIP, target, false);
            // 点击状态
            if (selectType === GameConstans.MOUSE_TYPE.CLICK) {
                this.cameraManager.isClickedSolarTooltip(false);
            }
        }
    }


    private resetSolarSystem() {
        const anime_last = this._lastSelectSolarSystem.getComponent(Animation);
        anime_last.stop();
        // 重置位置及透明度
        this._lastSelectSolarSystem.setWorldScale(find("GameManager/solar_init").getWorldScale());
        this.resetMaterial();
        this._lastSelectSolarSystem.getComponent(Animation).destroy();
        this._lastSelectSolarSystem = null;
    }

    /*
     *@Author: yozora
     *@Description: 重置材质
     *@Date: 2021-12-01 13:42:21
     */
    private resetMaterial() {
        if (this._lastSelectSolarSystem.getComponent(SolarSystem).solarSystemType === GameConstans.SOLAR_SYSTEM_TYPE.UNEXPLORED) {
            this._lastSelectSolarSystem.getComponent(MeshRenderer).setMaterial(this.starmapManager.unexplored_mat, 0);
        }
        if (this._lastSelectSolarSystem.getComponent(SolarSystem).solarSystemType === GameConstans.SOLAR_SYSTEM_TYPE.UNEXPLORED_OCCUPIED) {
            this._lastSelectSolarSystem.getComponent(MeshRenderer).setMaterial(this.starmapManager.unexplored_ohter_mat, 0);

        }
        if (this._lastSelectSolarSystem.getComponent(SolarSystem).solarSystemType === GameConstans.SOLAR_SYSTEM_TYPE.EXPLORED_NOBODY) {
            this._lastSelectSolarSystem.getComponent(MeshRenderer).setMaterial(this.starmapManager.nobody_mat, 0);

        }
        if (this._lastSelectSolarSystem.getComponent(SolarSystem).solarSystemType === GameConstans.SOLAR_SYSTEM_TYPE.EXPLORED_OCCUPIED) {
            this._lastSelectSolarSystem.getComponent(MeshRenderer).setMaterial(this.starmapManager.other_area_mat, 0);

        }
        if (this._lastSelectSolarSystem.getComponent(SolarSystem).solarSystemType === GameConstans.SOLAR_SYSTEM_TYPE.MY_SHIP) {
            this._lastSelectSolarSystem.getComponent(MeshRenderer).setMaterial(this.starmapManager.my_ship_mat, 0);

        }
        if (this._lastSelectSolarSystem.getComponent(SolarSystem).solarSystemType === GameConstans.SOLAR_SYSTEM_TYPE.MY_AREA) {
            this._lastSelectSolarSystem.getComponent(MeshRenderer).setMaterial(this.starmapManager.my_area_mat, 0);

        }

        // this.loading.children.forEach((ele, index) => {
        //     const delay = index * 0.1;
        //     cc.tween(ele)
        //       .delay(delay)
        //       .to(0.2, { height: 80 })
        //       .to(0.2, { height: 40 })
        //       .union()
        //       .start()
        //   })
    }

}

