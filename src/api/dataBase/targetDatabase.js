/**
 * Created by lk on 17/6/4.
 */
import axios from "../../utils/axios";

// 谁最懂我相关

// 列表
export function targetList(query) {
    return axios({
        url: "/admin/targetBase/list",
        method: "get",
        params: query
    });
}

// 保存
export function targetSave(data, formName, method = "post") {
    var url = formName === "add" ? "/admin/targetBase/save" : "/admin/targetBase/update";
    return axios({
        url: url,
        method: method,
        data: data
    });
}

// 删除
export function targetDelete(data) {
    return axios({
        url: "/admin/targetBase/delete",
        method: "post",
        data: data
    });
}
