/**
 * Created by lk on 17/6/4.
 */
import axios from "../../utils/axios";

// 谁最懂我相关

// 列表
export function sourceList(query) {
    return axios({
        url: "/admin/sourceBase/list",
        method: "get",
        params: query
    });
}

// 保存
export function sourceSave(data, formName, method = "post") {
    var url =
        formName === "add" ? "/admin/sourceBase/save" : "/admin/sourceBase/update";
    return axios({
        url: url,
        method: method,
        data: data
    });
}

// 删除
export function sourceDelete(data) {
    return axios({
        url: "/admin/sourceBase/delete",
        method: "post",
        data: data
    });
}
