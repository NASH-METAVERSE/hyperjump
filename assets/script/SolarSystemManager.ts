
import { _decorator, Component, Node, Prefab, resources, Material, instantiate, MeshRenderer, RenderTexture, Camera, find, Vec3 } from 'cc';
import { GameConstans } from './entity/GameConstans';
import { PlanetInfo } from './entity/PlanetInfo';
import { RotateAround } from './function/RotateAround';
import { ClientEvent } from './utils/ClientEvent';
import { HttpRequest } from './utils/HttpRequest';
const { ccclass, property } = _decorator;


/**
 * Predefined variables
 * Name = SolarSystemManager
 * DateTime = Wed Jan 12 2022 14:41:24 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = SolarSystemManager.ts
 * FileBasenameNoExtension = SolarSystemManager
 * URL = db://assets/script/SolarSystemManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 * 太阳系场景管理器
 */

@ccclass('SolarSystemManager')
export class SolarSystemManager extends Component {

    /*
     * 恒星资源
     */
    @property({ type: Prefab })
    private stellarPrefab: Prefab = null;

    /*
     * 行星资源
     */
    @property({ type: Prefab })
    private planetaryPrefab: Prefab = null;

    /*
     * 星球列表
     */
    public planetList: PlanetInfo[] = [];

    /*
     * 上次进入太阳系编码
     */
    public _lastSelectSolarSystem: string = null;

    /*
     * 恒星
     */
    private stellar: Node = null;

    /*
     * 当前太阳系行星个数
     */
    public planetCount: number = 0;

    onEnable() {
        this.loadResource();
    }

    update(dt: number) {
        const t = Math.min(dt / 0.2, 1);
    }

    /*
     *@Author: yozora
     *@Description: 更新太阳系信息
     *@Date: 2022-02-19 23:05:52
     */
    public async initSolarSystemInfo(solarSystemCode: string) {
        // 初始化太阳系
        if (this._lastSelectSolarSystem === null || this._lastSelectSolarSystem !== solarSystemCode) {
            await HttpRequest.getSolarSystemPlanetList(solarSystemCode, '0', '')
                .then((res) => {
                    if (res.code === GameConstans.DATA_TYPE.SUCCESS) {
                        this.planetList = res.data;
                        this.planetCount = this.planetList.length;
                        this.planetList.forEach(async (planet, i) => {
                            const index = Number(planet.planetCode.substring(planet.planetCode.length - 2, planet.planetCode.length)) % 22;
                            resources.load(`material/planet/Planet_${index}`, Material, (err, assets) => {
                                if (err) {
                                    console.error(err);
                                    return;
                                }
                                // 显示星球
                                const planetNode = this.node.getChildByName('Planet').getChildByName(`Planetary_${i + 1}`);
                                planetNode.active = true;
                                planetNode.getComponent(RotateAround).setPlanetCode(planet.planetCode);
                                planetNode.getComponent(MeshRenderer).setMaterial(assets, 0);
                                this.node.getChildByName('Stellar').getChildByName('Track').getChildByName(`Track_${i + 1}`).active = true;
                            });
                        });
                        // 隐藏超过星球
                        for (let index = this.planetCount + 1; index <= 15; index++) {
                            this.node.getChildByName('Planet').getChildByName(`Planetary_${index}`).active = false;
                            this.node.getChildByName('Stellar').getChildByName('Track').getChildByName(`Track_${index}`).active = false;

                        }
                        // 激活恒星
                        if (!this.stellar) {
                            this.stellar = this.node.getChildByName('Stellar').getChildByName('Ark_sun');
                        } else {
                            this.stellar.active = true;
                        }
                        this._lastSelectSolarSystem = solarSystemCode;
                        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_DATA_LIST.RUNTIME_DATA, 2, solarSystemCode);
                        ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.ACTIVE_SOLAR_SYSTEM_BOARD, true);
                    } else {
                        console.error(res.msg);
                    }
                });
        } else {
            this.stellar.active = true;
            ClientEvent.dispatchEvent(GameConstans.CLIENTEVENT_LIST.ACTIVE_SOLAR_SYSTEM_BOARD, false);
        }
    }

    private loadResource() {
        // 预加载星球材质
        resources.preloadDir("material/planet/", Material, (err) => {
            if (err) {
                console.error(err);
                return;
            }
        });
    }

}

