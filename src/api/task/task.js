/**
 * Created by lk on 17/6/4.
 */
import axios from "../../utils/axios";


// 列表
export function taskList(query) {
    return axios({
        url: "/admin/compareTask/list",
        method: "get",
        params: query
    });
}

// 保存
export function taskSave(data, formName, method = "post") {
    var url = formName === "add" ? "/admin/compareTask/save" : "/admin/compareTask/update";
    return axios({
        url: url,
        method: method,
        data: data
    });
}

// 删除
export function taskDelete(data) {
    return axios({
        url: "/admin/compareTask/delete",
        method: "post",
        data: data
    });
}

//获取源数据库下拉列表内容
export function sourceDataBaseList() {
    return axios({
        url: "/admin/compareTask/sourceList",
        method: "get"
    });
}

//获取目标数据库下拉列表内容
export function targetDataBaseList() {
    return axios({
        url: "/admin/compareTask/targetList",
        method: "get"
    });
}
