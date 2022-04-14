/**
 * Predefined variables
 * Name = StorageUtils
 * DateTime = Mon Feb 14 2022 15:49:45 GMT+0800 (中国标准时间)
 * Author = yozorano
 * FileBasename = StorageUtils.ts
 * FileBasenameNoExtension = StorageUtils
 * URL = db://assets/script/utils/StorageUtils.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 * 本地存储工具类
 */

interface obj {
    data: any,
    time: number,
    expire: number
};

export class StorageUtils {


    /*
     *@Author: yozora
     *@Description: 存储数据
     *@Date: 2022-02-14 15:55:56
     */
    public static setExpire = (key, value, expire) => {
        let obj: obj = {
            data: value,
            time: Date.now(),
            expire: expire
        };
        //localStorage 设置的值不能为对象,转为json字符串
        localStorage.setItem(key, JSON.stringify(obj));
    }

    /*
     *@Author: yozora
     *@Description: 获取数据
     *@Date: 2022-02-14 15:56:03
     */
    public static getExpire = (key: any) => {
        let val = localStorage.getItem(key);
        if (!val) {
            return val;
        }
        const obj: obj = JSON.parse(val);
        if (Date.now() - obj.time > obj.expire) {
            localStorage.removeItem(key);
            return null;
        }
        return obj.data;
    }

}
