import { director, find, instantiate, Node, Prefab, resources, tween, Vec3, _decorator } from "cc";
import axios, { AxiosInstance } from "axios/dist/axios.min.js";
import { Api } from "../entity/Api";
import { DataManager } from "../DataManager";
import { DialogSystem } from "../ui/model/DialogSystem";
import { GameConstans } from "../entity/GameConstans";
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = HttpRequest
 * DateTime = Thu Sep 16 2021 18:10:54 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = HttpRequest.ts
 * FileBasenameNoExtension = HttpRequest
 * URL = db://assets/scripts/HttpRequest.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

const exclude_api = ["/api/loginCode", "/api/serverInfo"];

const request = axios.create({
  timeout: 5000,
  // baseURL: "http://172.18.1.142:9081",
  baseURL: "http://47.242.195.250:9081",
});

const requestInterceptor = request.interceptors.request.use((req) => {
  // 移除起始部分 / 所有请求url走相对路径
  req.url = req.url.replace(/^\//, "");
  return req;
});

// 响应拦截器
const responseInterceptor = request.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data.code === "401") {
      // 登录校验失败
      const err: Object = {
        url: response.config.url,
        type: "Unauthorized",
        respMsg: "Unauthorized.",
      };
      resources.load('prefab/ui/dialog/Dialog_system', Prefab, (err, asset) => {
        if (err) {
          console.error(err);
          return;
        }
        const dialog = instantiate(asset);
        find('Canvas').getChildByName('Dialog_area').addChild(dialog);
        dialog.getComponent(DialogSystem).initTips(GameConstans.TIPS_CONTENT.LOGOUT, true);
        tween(dialog).to(0.08, { scale: new Vec3(1, 0.1, 1) }).to(0.42, { scale: new Vec3(1, 1, 1) }).start();
      });
      Promise.reject(err);
    } else if (data.code === "403") {
      // 无权限
      return Promise.reject();
    } else if (data.code === "0" || data.code === "1") {
      // 接口正常返回
      let flag: Boolean = true;
      exclude_api.forEach((element) => {
        if (response.config.url.indexOf(element) !== -1) {
          flag = false;
        }
      });
      if (flag) {
        sessionStorage.setItem("bins", response.headers.authorization);
      }
      return Promise.resolve(data);
    }
  },
  (error) => {
    if (error.response) {
      const { data } = error.response;
      const resCode = data.status;
      const resMsg = data.message || "Service error.";
      const err: Object = { code: resCode, respMsg: resMsg };
      return Promise.reject(err);
    } else {
      console.error(error);
      const err = { type: "canceled", respMsg: "Service unavailable." };
      return Promise.reject(err);
    }
  }
);

@ccclass("HttpRequest")
export class HttpRequest {

  // public static channel: string = "ws://172.18.1.142:9000/channel";
  /*
   * websocket
   */
  public static channel: string = "ws://47.242.195.250:9000/channel";

  /*
   * 基础路径
   */
  // private base_path: string = "http://172.18.1.142:9081";
  private base_path: string = "http://47.242.195.250:9081";

  private contentTypes: any = {
    json: "application/json; charset=utf-8",
    urlencoded: "application/x-www-form-urlencoded; charset=utf-8",
    multipart: "multipart/form-data",
  };

  private defaultOptions: any = {
    // 允许把cookie传递到后台(前提是后端服务必须设置具体的Access-Control-Allow-Origin)
    // withCredentials: true,
    headers: {
      Accept: "application/json",
      "Content-Type": this.contentTypes.json,
    },
    timeout: 15000,
  };

  /*
   * axios实例
   */
  private request: AxiosInstance = request;

  /*
   * api实例
   */
  public API: Api = null;

  /*
   * 实例
   */
  public static http: HttpRequest = null;

  public static getChannel() {
    return this.channel;
  }

  /*
   *@Author: yozora
   *@Description: 确认飞船状态
   *@Date: 2021-12-09 16:08:45
   */
  public static async confirmShipStatus(shipCode: string, shipStatus: string) {
    return HttpRequest.http.callApi({
      url:
        HttpRequest.http.API.confirmShipStatus,
      method: "POST",
      data: {
        shipCode: shipCode,
        shipStatus: shipStatus
      },
    })
  }

  /*
   *@Author: yozora
   *@Description: 获取太阳系星球信息
   *@Date: 2022-01-12 14:58:13
   */
  public static async getSolarSystemPlanetList(
    solarSystemCode: string,
    isMinable: string,
    userAddress?: string
  ) {
    return HttpRequest.http.callApi({
      url:
        HttpRequest.http.API.getSolarSystemPlanetList,
      method: "POST",
      data: {
        solarSystemCode: solarSystemCode,
        isMinable: isMinable,
        userAddress: userAddress
      },
    })
  }

  /*
   *@Author: yozora
   *@Description: 获取星球弹窗信息
   *@Date: 2022-02-28 00:58:25
   */
  public static async getPlanetTooltipInfo(
    planetCode: string,
    shipCode: string,
    userAddress: string
  ) {
    return HttpRequest.http.callApi({
      url:
        HttpRequest.http.API.getPlanetTooltipInfo +
        `/${planetCode}/${shipCode}/${userAddress}`,
    })
  }

  /*
   *@Author: yozora
   *@Description: 获取太阳系弹窗信息
   *@Date: 2021-11-17 18:56:41
   */
  public static async getSolarSystemTooltipInfo(
    solarSystemCode: string,
    shipCode: string,
    userAddress: string
  ) {
    return HttpRequest.http.callApi({
      url:
        HttpRequest.http.API.getSolarSystemTooltipInfo +
        `/${solarSystemCode}/${shipCode}/${userAddress}`,
    })
  }

  /*
 *@Author: yozora
 *@Description: 获取太阳系概况信息
 *@Date: 2021-10-13 13:58:23
 */
  public static async getSolarSystemInfoOrCaculateJumpTime(
    solarSystemCode: string,
    shipCode: string,
    queryType: number
  ) {
    if (queryType === 0) {
      return HttpRequest.http.callApi({
        url:
          HttpRequest.http.API.getSolarSystemShipAndPlanet +
          `/${solarSystemCode}/${shipCode}`,
      })
    } else {
      return HttpRequest.http.callApi({
        url: HttpRequest.http.API.calculateJumpTime,
        method: "POST",
        data: {
          solarSystemCode: solarSystemCode,
          shipCode: shipCode,
        },
      })
    }
  }


  /*
   *@Author: yozora
   *@Description: 获取其他太阳系信息
   *@Date: 2021-11-11 14:10:58
   */
  public static getStarmapInfoOther() {
    if (!HttpRequest.http) {
      HttpRequest.http = HttpRequest.getInstance();
    }
    return HttpRequest.http.callApi({
      url: this.http.API.getStarmapInfoOther + "/" + find('DataManager').getComponent(DataManager).getUserAddress(),
    })
  }

  /*
  *@Author: yozora
  *@Description: 获取我已探索无人占领区域飞船信息
  *@Date: 2021-09-28 13:45:51
  */
  public static async getMyships() {
    if (!HttpRequest.http) {
      HttpRequest.http = HttpRequest.getInstance();
    }
    return HttpRequest.http.callApi({
      url:
        this.http.API.getStarmapInfoAboutMe + "/" + find('DataManager').getComponent(DataManager).getUserAddress(),
    })
  }

  /*
   *@Author: yozora
   *@Description: 获取飞船状态
   *@Date: 2022-02-21 18:12:06
   */
  public static async getActivatedShipStatus(shipCode: string) {
    if (!HttpRequest.http) {
      HttpRequest.http = HttpRequest.getInstance();
    }
    return HttpRequest.http.callApi({
      url: this.http.API.getActivatedShipStatus,
      method: "POST",
      data: { shipCode: shipCode },
    })
  }

  /*
   *@Author: yozora
   *@Description: 获取星球对手飞船信息
   *@Date: 2022-02-27 00:06:51
   */
  public static async getPlanetTargetShipInfo(planetCode: string, pageNum: number, pageSize, shipStatus?: number, orderBy?: string) {
    return HttpRequest.http.callApi({
      url: HttpRequest.http.API.getPlanetTargetShipList,
      method: "POST",
      data: { planetCode: planetCode, pageNum: pageNum, pageSize: pageSize, shipStatus: shipStatus, orderBy: orderBy },
    });
  }


  /*
   *@Author: yozora
   *@Description: 获取星球飞船列表
   *@Date: 2021-10-11 14:22:52
   */
  public static async getPlanetShipInfo(planetCode: string, shipCode: string) {
    return HttpRequest.http.callApi({
      url: HttpRequest.http.API.getPlanetShipList,
      method: "POST",
      data: { planetCode: planetCode, shipCode: shipCode },
    });
  }

  /*
   *@Author: yozora
   *@Description: 获取星球矿产信息
   *@Date: 2021-10-14 17:54:19
   */
  public static async queryPlanetMine(
    planetCode: string,
    solarSystemCode?: string
  ) {
    return HttpRequest.http.callApi({
      url: HttpRequest.http.API.queryPlanetMine,
      method: "POST",
      data: { planetCode: planetCode, solarSystemCode: solarSystemCode },
    });
  }

  /*
   *@Author: yozora
   *@Description: 获取飞船列表信息
   *@Date: 2021-11-22 16:21:33
   */
  public static async getShipList(userAddress: string, pageNum: number, pageSize, shipStatus?: number, orderBy?: string) {
    return HttpRequest.http.callApi({
      url: HttpRequest.http.API.getMyShips,
      method: "POST",
      data: { userAddress: userAddress, pageNum: pageNum, pageSize: pageSize, shipStatus: shipStatus, orderBy: orderBy },
    });
  }

  /*
   *@Author: yozora
   *@Description: 根据飞船编码获取飞船信息
   *@Date: 2022-02-21 23:54:20
   */
  public static async getMyShipByCode(userAddress: string, shipCode: string) {
    return HttpRequest.http.callApi({
      url: HttpRequest.http.API.getMyShipByCode,
      method: "POST",
      data: { userAddress: userAddress, shipCode: shipCode },
    });
  }

  /*
   *@Author: yozora
   *@Description: 同步倒计时信息
   *@Date: 2022-02-13 17:40:28
   */
  public static async asyncTimer(timeType: number, shipCode: string, time?: Number) {
    if (!HttpRequest.http) {
      HttpRequest.http = HttpRequest.getInstance();
    }
    return HttpRequest.http.callApi({
      url: HttpRequest.http.API.asyncTimer,
      method: "POST",
      data: { timeType: timeType, shipCode: shipCode, time: time },
    })
  }

  /*
   *@Author: yozora
   *@Description: 获取倒计时信息
   *@Date: 2022-02-14 16:38:20
   */
  public static async getTimer() {
    if (!HttpRequest.http) {
      HttpRequest.http = HttpRequest.getInstance();
    }
    return HttpRequest.http.callApi({
      url: HttpRequest.http.API.getTimer + "/" + find('DataManager').getComponent(DataManager).getUserAddress(),
      method: "POST",
    })
  }

  /********************************************采集相关START*****************************************/

  /**
   * 获取星球矿产
   * @param planetCode 
   * @returns 
   */
  public static async getPlanetMine(shipCode: string, planetCode: string) {
    return HttpRequest.http.callApi({
      url:
        HttpRequest.http.API.getPlanetMine,
      method: "POST",
      data: {
        shipCode: shipCode,
        planetCode: planetCode
      },
    })
  }

  /*
   *@Author: yozora 
   *@Description: 进入采集
   *@Date: 2022-02-21 11:29:18
   */
  public static async confirmMine(shipCode: string, solarSystemCode: string, planetCode: string) {
    return HttpRequest.http.callApi({
      url:
        HttpRequest.http.API.confirmMine,
      method: "POST",
      data: {
        shipCode: shipCode,
        solarSystemCode: solarSystemCode,
        planetCode: planetCode
      },
    })
  }

  /*
   *@Author: yozora
   *@Description: 中断采集
   *@Date: 2022-02-21 11:39:37
   */
  public static async interruptMine(shipCode: string) {
    return HttpRequest.http.callApi({
      url:
        HttpRequest.http.API.interruptMine,
      method: "POST",
      data: {
        shipCode: shipCode,
      },
    })
  }

  /********************************************采集相关END*****************************************/

  /********************************************占领相关START*****************************************/

  /*
   *@Author: yozora
   *@Description: 确认占领
   *@Date: 2022-02-23 11:13:38
   */
  public static async confirmOccupy(shipCode: string, planetCode: string) {
    return HttpRequest.http.callApi({
      url:
        HttpRequest.http.API.confirmOccupy,
      method: "POST",
      data: {
        shipCode: shipCode,
        planetCode: planetCode
      },
    })
  }

  /*
   *@Author: yozora
   *@Description: 中断占领
   *@Date: 2022-02-23 11:14:12
   */
  public static async interruptOccupy(shipCode: string, planetCode: string) {
    return HttpRequest.http.callApi({
      url:
        HttpRequest.http.API.interruptOccupy,
      method: "POST",
      data: {
        shipCode: shipCode,
        planetCode: planetCode
      },
    })
  }

  /********************************************占领相关END*****************************************/


  /********************************************跃迁相关START*****************************************/

  /*
  *@Author: yozora
  *@Description: 获取跃迁信息
  *@Date: 2021-12-02 14:14:38
  */
  public static async getJumpInfo(shipCode: string) {
    return HttpRequest.http.callApi({
      url:
        HttpRequest.http.API.getJumpInfo,
      method: "POST",
      data: {
        shipCode: shipCode,
      },
    })
  }

  /*
   *@Author: yozora
   *@Description: 进入跃迁
   *@Date: 2022-02-16 13:55:48
   */
  public static async confirmJump(shipCode: string, solarSystemCode: string, planetCode: string) {
    return HttpRequest.http.callApi({
      url:
        HttpRequest.http.API.confirmJump,
      method: "POST",
      data: {
        shipCode: shipCode,
        solarSystemCode: solarSystemCode,
        planetCode: planetCode,
      },
    })
  }

  /*
   *@Author: yozora
   *@Description: 进入飞行
   *@Date: 2022-02-23 17:37:44
   */
  public static async confirmFlight(shipCode: string, solarSystemCode: string, planetCode: string) {
    return HttpRequest.http.callApi({
      url:
        HttpRequest.http.API.confirmFlight,
      method: "POST",
      data: {
        shipCode: shipCode,
        solarSystemCode: solarSystemCode,
        planetCode: planetCode,
      },
    })
  }

  /********************************************跃迁相关END*****************************************/

  /********************************************战斗相关START*****************************************/

  /*
   *@Author: yozora
   *@Description: 锁定对手
   *@Date: 2022-02-23 15:15:25
   */
  public static async confirmLockShip(shipCode: string, targetShipCode: string) {
    return HttpRequest.http.callApi({
      url:
        HttpRequest.http.API.confirmLockShip,
      method: "POST",
      data: {
        shipCode: shipCode,
        targetShipCode: targetShipCode,
      },
    })
  }

  /*
   *@Author: yozora
   *@Description: 确认战斗
   *@Date: 2022-02-23 16:17:07
   */
  public static async confirmAttack(shipCode: string, planetCode: string, strategy: number, specialItem?: string) {
    return HttpRequest.http.callApi({
      url:
        HttpRequest.http.API.confirmAttack,
      method: "POST",
      data: {
        shipCode: shipCode,
        planetCode: planetCode,
        strategy: strategy,
        specialItem: specialItem,
      },
    })
  }


  /********************************************战斗相关END*****************************************/

  /*******************************************游戏相关START*****************************************/

  /*
   *@Author: yozora
   *@Description: 获取用户游戏统计信息
   *@Date: 2021-12-09 14:25:57
   */
  public static async getUserProfile(userAddress: string) {
    if (!HttpRequest.http) {
      HttpRequest.http = HttpRequest.getInstance();
    }
    return HttpRequest.http.callApi({
      url: HttpRequest.http.API.userProfile + `/${userAddress}`,
    })
  }

  /*
   *@Author: yozora
   *@Description: 获取游戏信息
   *@Date: 2021-10-13 10:57:05
   */
  public static async getGameInfo() {
    if (!HttpRequest.http) {
      HttpRequest.http = HttpRequest.getInstance();
    }
    return HttpRequest.http.callApi({
      url: HttpRequest.http.API.gameInfo,
    })
  }

  public static async getServerInfo() {
    if (!HttpRequest.http) {
      HttpRequest.http = HttpRequest.getInstance();
    }
    return HttpRequest.http.callApi({
      url: HttpRequest.http.API.serverInfo,
    })
  }

  /*
   *@Author: yozora
   *@Description: 钱包登录
   *@Date: 2022-03-07 11:30:53
   */
  public static async loginFromWallet(walletAddress: string) {
    if (!HttpRequest.http) {
      HttpRequest.http = HttpRequest.getInstance();
    }
    return HttpRequest.http.callApi({
      url: HttpRequest.http.API.loginFromWallet,
      method: "POST",
      data: {
        walletAddress: walletAddress,
      },
    })
  }

  /*
   *@Author: yozora
   *@Description: 用户登录
   *@Date: 2022-03-03 23:10:33
   */
  public static async login(username: string, email: string, loginCode: string = '0000000', walletAddress?: string) {
    if (!HttpRequest.http) {
      HttpRequest.http = HttpRequest.getInstance();
    }
    return HttpRequest.http.callApi({
      url: HttpRequest.http.API.login,
      method: "POST",
      data: {
        username: username,
        email: email,
        loginCode: loginCode,
        walletAddress: walletAddress,
      },
    })
  }

  /*******************************************游戏相关END*****************************************/

  private constructor() {
    this.API = Api.getInstance();
  }

  public static getInstance() {
    if (this.http === null) {
      this.http = new HttpRequest();
    }
    return this.http;
  }


  /*
   *@Author: yozora
   *@Description: 调用API
   *@Date: 2021-09-16 18:50:13
   */
  public callApi = ({
    url,
    data = {},
    method = "get",
    options = {
      headers: "",
    },
    contentType = "json", // json || urlencoded || multipart
    prefixUrl = "api",
  }) => {
    if (!url) {
      const error = new Error("Please input url.");
      return Promise.reject(error);
    }
    const fullUrl = `${this.base_path}/${prefixUrl}${url}`;

    const newOptions = {
      ...this.defaultOptions,
      ...options,
      headers: {
        "Content-Type":
          (options.headers && options.headers["Content-Type"]) ||
          this.contentTypes[contentType],
        Authorization:
          sessionStorage.getItem("bins") === null
            ? ""
            : sessionStorage.getItem("bins")
      },
      method,
    };
    if (method === "get") {
      newOptions.params = data;
    }

    if (method !== "get" && method !== "head") {
      if (data instanceof FormData) {
        newOptions.data = data;
        newOptions.headers = {
          "x-requested-with": "XMLHttpRequest",
          "cache-control": "no-cache",
        };
      } else if (
        newOptions.headers["Content-Type"] === this.contentTypes.urlencoded
      ) {
        newOptions.data = data;
      } else {
        Object.keys(data).forEach((item) => {
          if (
            data[item] === null ||
            data[item] === undefined ||
            data[item] === ""
          ) {
            delete data[item];
          }
        });
        newOptions.data = data;
      }
    }

    return this.request({
      url: fullUrl,
      ...newOptions,
    });
  };
}
