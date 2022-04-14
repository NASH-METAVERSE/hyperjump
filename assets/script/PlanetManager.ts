
import { _decorator, Component, Node, Prefab, MeshRenderer, resources, Material, find } from 'cc';
import { GameConstans } from './entity/GameConstans';
import { RotateAround } from './function/RotateAround';
import { ClientEvent } from './utils/ClientEvent';
import { HttpRequest } from './utils/HttpRequest';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = PlanetManager
 * DateTime = Fri Jan 21 2022 16:15:48 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = PlanetManager.ts
 * FileBasenameNoExtension = PlanetManager
 * URL = db://assets/script/PlanetManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('PlanetManager')
export class PlanetManager extends Component {

    /*
     * 行星资源
     */
    @property({ type: Prefab })
    private planetaryPrefab: Prefab = null;

    // /*
    //  * 星球列表
    //  */
    // public planetList: PlanetInfo[] = [];

    /*
     * 上次进入星球
     */
    public _lastSelectPlanet: string = null;

    /*
     * 当前太阳系行星个数
     */
    public planetCount: number = 0;

    onEnable() {
        // this.loadResource();
    }

    update(dt: number) {
        const t = Math.min(dt / 0.2, 1);
    }

    /*
     *@Author: yozora
     *@Description: 太阳系场景初始化星球
     *@Date: 2022-01-12 16:06:20
     */
    public async initPlanetInfo(planet: Node) {
        // 初始化太阳系
        if (this._lastSelectPlanet === null || this._lastSelectPlanet !== planet.name) {
            // 初始化星球
            this.node.getChildByName("Planet").getComponent(MeshRenderer).setMaterial(planet.getComponent(MeshRenderer).getMaterial(0), 0);
            this._lastSelectPlanet = planet.getComponent(RotateAround).getPlanetCode();
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_DATA_LIST.RUNTIME_DATA, 3, this._lastSelectPlanet);
            // HttpRequest.getSolarSystemPlanetList(planet.name, '0', '').then(res => {
            // if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
            // this.planetList = res.data;
            // this.planetCount = this.planetList.length;
            // this.planetList.forEach((planet, i) => {
            //     const index = Number(planet.planetCode.substring(planet.planetCode.length - 2, planet.planetCode.length)) % 22;
            //     resources.load(`material/planet/Planet_${index}`, Material, (err, assets) => {
            //         if (err) {
            //             console.error(err);
            //             return;
            //         }
            //         // 创建星球
            //         const planetNode = instantiate(this.planetaryPrefab);
            //         planetNode.name = planet.planetCode;
            //         planetNode.getComponent(MeshRenderer).setMaterial(assets, 0);
            //         // 设置星球位置
            //         planetNode.setPosition((i + 1) * 5, 0, 0);
            //         planetNode.getComponent(RotateAround).radius = (i + 1) * 5;
            //         planetNode.getComponent(RotateAround).target = this.node.getChildByName('Stellar');
            //         // 添加到场景
            //         this.node.getChildByName("Planet").addChild(planetNode);
            //     });
            // });
            // // 激活恒星
            // if (!this.stellar) {
            //     this.stellar = instantiate(this.stellarPrefab);
            //     this.node.getChildByName("Stellar").addChild(this.stellar);
            // } else {
            //     this.stellar.active = true;
            // }
            // this._lastSelectSolarSystem = solarSystemCode;
            // ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.ACTIVE_SOLAR_SYSTEM_BOARD, true);
            //     } else {
            //         console.error(res.msg);
            //     }
            // });
        } else {
            // this.stellar.active = true;
            // ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.ACTIVE_SOLAR_SYSTEM_BOARD, false);
        }
    }

    /*
     *@Author: yozora
     *@Description: 战斗行为-星图场景直接切换到星球场景
     *@Date: 2022-02-07 00:44:41
     */
    public directInitPlanetInfo(planetCode: string) {
        const index = Number(planetCode.substring(planetCode.length - 2, planetCode.length)) % 22;
        resources.load(`material/planet/Planet_${index}`, Material, (err, assets) => {
            if (err) {
                console.error(err);
                return;
            }
            this.node.getChildByName("Planet").getComponent(MeshRenderer).setMaterial(assets, 0);
            this._lastSelectPlanet = planetCode;
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_DATA_LIST.RUNTIME_DATA, 3, planetCode);
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.PLANET.INIT_TARGET_SHIP_CARD);
        });
    }

}

