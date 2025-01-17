import Vue from "vue";
import VueRouter from "vue-router";

if (process.env.NODE_ENV === "development") {
    Vue.use(VueRouter);
}

import { ROUTER_MODE } from "../config/app";

import Home from "../views/home/index.vue";

// 管理组相关
import adminRouter from "../views/userManage/admin/router.vue";
import authAdmin from "../views/userManage/admin/authAdmin.vue";
import authRole from "../views/userManage/admin/authRole.vue";
import authPermissionRule from "../views/userManage/admin/authPermissionRule.vue";

// 上传相关
import tinymce from "../views/components/tinymce-demo.vue";
import upload from "../views/components/upload-demo.vue";

// 广告管理
import sourceDatabase from "../views/dataBase/sourceDatabase.vue";
import targetDatabase from "../views/dataBase/targetDatabase.vue";
import task from "../views/compareTask/task.vue";

// Vue.use(VueRouter);

const err401 = r =>
    require.ensure([], () => r(require("../views/error/err401.vue")), "home");
const err404 = r =>
    require.ensure([], () => r(require("../views/error/err404.vue")), "home");
const login = r =>
    require.ensure([], () => r(require("../views/login/index.vue")), "home");
const main = r =>
    require.ensure([], () => r(require("../views/dataBase/sourceDatabase.vue")), "home");

// 注意 权限字段 authRule （严格区分大小写）
export const constantRouterMap = [
    {
        path: "*",
        component: err404,
        hidden: true
    },
    {
        path: "/401",
        component: err401,
        name: "401",
        hidden: true
    },
    {
        path: "/404",
        component: err404,
        name: "404",
        hidden: true
    },
    {
        path: "/500",
        component: err404,
        name: "500",
        hidden: true
    },
    {
        path: "/login",
        component: login,
        name: "登录",
        hidden: true
    },
    {
        path: "/",
        component: Home,
        redirect: "/dataBase",
        name: "首页",
        hidden: true
    },
    {
        path: "/components",
        redirect: "/components/uploadList",
        component: Home,
        name: "components",
        icon: "tongyong",
        hidden: true,
        children: [
            {
                path: "uploadList",
                name: "上传图片的展示",
                component: r =>
                    require.ensure(
                        [],
                        () => r(require("../views/components/uploadList.vue")),
                        "home"
                    )
            },
            {
                path: "tinymce",
                name: "tinymce富文本编辑器",
                component: tinymce
            },
            {
                path: "upload",
                name: "上传的demo",
                component: upload
            }
        ]
    }
];

export default new VueRouter({
    // mode: 'history', //后端支持可开
    mode: ROUTER_MODE,
    routes: constantRouterMap,
    strict: process.env.NODE_ENV !== "production"
});

export const asyncRouterMap = [
    {
        path: "/userManage",
        redirect: "/userManage/adminManage/index",
        component: Home,
        icon: "guanliyuan1",
        name: "用户管理",
        meta: {
            authRule: ["user_manage"]
        },
        // noDropdown: true,
        children: [
            {
                path: "/userManage/adminManage",
                component: adminRouter,
                redirect: "/userManage/authAdmin/index",
                name: "管理组",
                icon: "",
                meta: {
                    authRule: ["user_manage/admin_manage"]
                },
                children: [
                    {
                        path: "authAdmin",
                        component: authAdmin,
                        name: "管理员管理",
                        icon: "",
                        meta: {
                            authRule: ["admin/auth/admin/index"]
                        }
                    },
                    {
                        path: "authRole",
                        component: authRole,
                        name: "角色管理",
                        icon: "",
                        meta: {
                            authRule: ["admin/auth/role/index"]
                        }
                    },
                    {
                        path: "authPermissionRule",
                        component: authPermissionRule,
                        name: "权限管理",
                        icon: "",
                        meta: {
                            authRule: ["admin/auth/permission_rule/index"]
                        }
                    }
                ]
            }
        ]
    },
    {
        path: "/dataBase",
        redirect: "/dataBase/sourceDatabase",
        component: Home,
        icon: "guanggao",
        name: "数据源管理",
        meta: {
            // authRule: ["ad_manage"]
        },
        // noDropdown: true,
        children: [
            {
                path: "sourceDatabase",
                component: sourceDatabase,
                name: "源数据库管理",
                icon: "",
                meta: {
                    // authRule: ["admin/ad/site/index"]
                }
            },
            {
                path: "targetDatabase",
                component: targetDatabase,
                name: "目标数据库管理",
                icon: "",
                meta: {
                    // authRule: ["admin/ad/ad/index"]
                }
            }
        ]
    },
    {
        path: "/compareTask",
        redirect: "/compareTask/task",
        component: Home,
        icon: "guanggao",
        name: "比对任务管理",
        meta: {
            // authRule: ["ad_manage"]
        },
        // noDropdown: true,
        children: [
            {
                path: "task",
                component: task,
                name: "比对任务",
                icon: "",
                meta: {
                    // authRule: ["admin/ad/site/index"]
                }
            }
        ]
    }
];
