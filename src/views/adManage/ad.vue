<template>

    <div>
        <el-form :inline="true" :model="query" class="query-form" size="mini">
            <el-form-item class="query-form-item">
                <el-input v-model="query.connectName" placeholder="数据库名称"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button-group>
                    <el-button type="primary" icon="el-icon-refresh" @click="onReset"></el-button>
                    <el-button type="primary" icon="search" @click="onSubmit">查询</el-button>
                    <el-button type="primary" @click.native="handleForm(null,null)">新增</el-button>
                </el-button-group>
            </el-form-item>
        </el-form>
        <el-table
            v-loading="loading"
            :data="list"
            style="width: 100%;">
            <el-table-column
                label="ID"
                prop="id"
                fixed>
            </el-table-column>
            <el-table-column
                label="连接名称"
                prop="connectName"
                with="300"
                :show-overflow-tooltip="true"
                fixed>
            </el-table-column>
            <el-table-column
                label="数据库"
                prop="dataBaseName"
                with="300"
                :show-overflow-tooltip="true">
            </el-table-column>
            <el-table-column
                label="数据库类型"
                prop="dataBaseType">
            </el-table-column>
            <el-table-column
                label="数据库版本"
                prop="dataBaseVersion"
                with="300"
                :show-overflow-tooltip="true">
            </el-table-column>
            <el-table-column
                label="服务器地址"
                prop="serverUrl"
                with="300"
                :show-overflow-tooltip="true">
            </el-table-column>
            <el-table-column
                label="用户名"
                prop="username"
                with="300"
                :show-overflow-tooltip="true">
            </el-table-column>
            <el-table-column
                label="操作"
                fixed="right">
                <template slot-scope="scope">
                    <el-button type="text" size="small" @click.native="handleForm(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="text" size="small" @click.native="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination
            :page-size="query.limit"
            @current-change="handleCurrentChange"
            layout="prev, pager, next"
            :total="total">
        </el-pagination>

        <!--表单-->
        <el-dialog
            title="数据源连接信息"
            :visible.sync="formVisible"
            :before-close="hideForm"
            style="--el-dialog-margin-top: 2%; --el-dialog-width: 50%;">
            <el-form :model="formData" :rules="formRules" ref="dataForm">
                <el-form-item label="连接名称" prop="connectName" label-width="100px">
                    <el-input v-model="formData.connectName" auto-complete="off"></el-input>
                </el-form-item>
                <el-row :gutter="10">
                    <el-col :span="12">
                <el-form-item label="数据库类型" prop="dataBaseType" style="font-size: 8px;"label-width="100px">
                    <el-input v-model="formData.dataBaseType" ></el-input>
                </el-form-item>
                    </el-col>
                    <el-col :span="12">
                <el-form-item label="数据库版本" prop="dataBaseVersion" style="font-size: 8px;" label-width="100px">
                    <el-input v-model="formData.dataBaseVersion"></el-input>
                </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="10">
                    <el-col :span="12">
                        <el-form-item label="服务器地址" prop="serverUrl" label-width="100px">
                            <el-input v-model="formData.serverUrl"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="服务器端口" prop="serverPort" label-width="100px">
                            <el-input v-model="formData.serverPort"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="用户名" prop="username" label-width="100px">
                    <el-input v-model="formData.username" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password" label-width="100px">
                    <el-input  type="password"  show-password v-model="formData.password" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="数据库" prop="dataBaseName" label-width="100px">
                    <el-input v-model="formData.dataBaseName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="驱动" prop="dataBaseDriver" label-width="100px">
                    <el-input v-model="formData.dataBaseDriver" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="URL" prop="dataBaseUrl" label-width="100px">
                    <el-input v-model="formData.dataBaseUrl" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="hideForm">取消</el-button>
                <el-button type="primary" @click.native="formSubmit()" :loading="formLoading">提交</el-button>
            </div>
        </el-dialog>

    </div>

</template>

<script>
import { adList, adSave, adDelete } from "../../api/ad/ad";
import Upload from "../../components/File/Upload.vue";
const formJson = {
    adId: "",
    connectName: "",
    describe: "",
    pic: "",
    picUrl: "",
    jumpType: "",
    jumpUrl: "",
    iosUrl: "",
    androidUrl: "",
    wxaAppid: "",
    channelType: 0,
    channelList: [],
    androidVersionType: 0,
    androidVersionList: [],
    iosVersionType: 0,
    iosVersionList: [],
    newShowStartNum: 0,
    newShowMaxNum: 0,
    oldShowStartNum: 0,
    oldShowMaxNum: 0,
    endTime: "",
    eventName: "",
    status: 1
};
export default {
    data() {
        return {
            query: {
                connectName: "",
                page: 1,
                limit: 20
            },
            channelListInput: "",
            androidVersionListInput: "",
            iosVersionListInput: "",
            list: [],
            total: 0,
            loading: true,
            index: null,
            formName: null,
            formMap: {
                add: "新增",
                edit: "编辑"
            },
            formLoading: false,
            formVisible: false,
            formData: formJson,
            formRules: {
                connectName: [
                    {
                        required: true,
                        message: "请输入连接名称",
                        trigger: "blur"
                    }
                ],
                pic: [
                    {
                        required: true,
                        message: "请选择封面图片",
                        trigger: "change"
                    }
                ],
                jumpType: [
                    {
                        required: true,
                        message: "请选择跳转方式",
                        trigger: "change"
                    }
                ],
                jumpUrl: [
                    {
                        required: true,
                        message: "请输入跳转链接",
                        trigger: "blur"
                    }
                ],
                androidUrl: [
                    {
                        required: true,
                        message: "请输入Android类名",
                        trigger: "blur"
                    }
                ],
                iosUrl: [
                    {
                        required: true,
                        message: "请输入IOS类名",
                        trigger: "blur"
                    }
                ],
                wxaAppid: [
                    {
                        required: true,
                        message: "请输入小程序Appid",
                        trigger: "blur"
                    }
                ],
                channelList: [
                    {
                        required: true,
                        message: "请输入至少一个渠道名单",
                        trigger: "change"
                    }
                ],
                androidVersionList: [
                    {
                        required: true,
                        message: "请输入至少一个Android版本名单",
                        trigger: "change"
                    }
                ],
                iosVersionList: [
                    {
                        required: true,
                        message: "请输入至少一个iOS版本名单",
                        trigger: "change"
                    }
                ],
                status: [
                    { required: true, message: "请选择状态", trigger: "change" }
                ]
            },
            deleteLoading: false
        };
    },
    components: {
        Upload
    },
    methods: {
        onReset() {
            this.$router.push({
                path: ""
            });
            this.query = {
                connectName: "",
                page: 1,
                limit: 20
            };
            this.getList();
        },
        onSubmit() {
            this.$router.push({
                path: "",
                query: this.query
            });
            this.getList();
        },
        handleSizeChange(val) {
            this.query.limit = val;
            this.getList();
        },
        handleCurrentChange(val) {
            this.query.page = val;
            this.getList();
        },
        getList() {
            this.loading = true;
            adList(this.query)
                .then(response => {
                    this.loading = false;
                    this.list = response.data.list || [];
                    this.total = response.data.total || 0;
                })
                .catch(() => {
                    this.loading = false;
                    this.list = [];
                    this.total = 0;
                });
        },
        // 删除渠道
        handleChannelListClose(index) {
            console.log(index);
            // 更改值
            this.formData.channelList.splice(index, 1);
        },
        // 添加渠道白名单
        handleChannelListSubmit() {
            // 更改值
            if (
                this.channelListInput &&
                this.formData.channelList.length < 15
            ) {
                let arr = this.channelListInput.split(",");
                for (let i in arr) {
                    if (
                        arr[i] !== "" &&
                        (this.formData.channelList.length === 0 ||
                            this.formData.channelList.indexOf(arr[i]) < 0)
                    ) {
                        this.formData.channelList.push(arr[i]);
                    }
                }
                this.channelListInput = "";
                this.$refs.channelListRef.focus();
            }
        },
        // 删除Android版本
        handleAndroidVersionListClose(index) {
            // 更改值
            this.formData.androidVersionList.splice(index, 1);
        },
        // 添加Android版本
        handleAndroidVersionListSubmit() {
            // 更改值
            if (
                this.androidVersionListInput &&
                this.formData.androidVersionList.length < 15
            ) {
                let arr = this.androidVersionListInput.split(",");
                for (let i in arr) {
                    let avList = this.formData.androidVersionList;
                    if (
                        arr[i] !== "" &&
                        (avList.length === 0 || avList.indexOf(arr[i]) < 0)
                    ) {
                        this.formData.androidVersionList.push(arr[i]);
                    }
                }
                this.androidVersionListInput = "";
                this.$refs.androidVersionListRef.focus();
            }
        },
        // 删除Ios版本
        handleIosVersionListClose(index) {
            // 更改值
            this.formData.iosVersionList.splice(index, 1);
        },
        // 添加Ios版本
        handleIosVersionListSubmit() {
            // 更改值
            if (
                this.iosVersionListInput &&
                this.formData.iosVersionList.length < 15
            ) {
                let arr = this.iosVersionListInput.split(",");
                for (let i in arr) {
                    if (
                        arr[i] !== "" &&
                        (this.formData.iosVersionList.length === 0 ||
                            this.formData.iosVersionList.indexOf(arr[i]) < 0)
                    ) {
                        this.formData.iosVersionList.push(arr[i]);
                    }
                }
                this.iosVersionListInput = "";
                this.$refs.iosVersionListRef.focus();
            }
        },
        // 刷新表单
        resetForm() {
            if (this.$refs["dataForm"]) {
                // 清空字段
                this.$refs["dataForm"].resetFields();
                // 清空验证信息表单
                this.$refs["dataForm"].clearValidate();
            }
        },
        // 隐藏表单
        hideForm() {
            // 更改值
            this.formVisible = !this.formVisible;
            return true;
        },
        // 显示表单
        handleForm(index, row) {
            this.formVisible = true;
            // 刷新表单
            this.resetForm();
            this.formData = JSON.parse(JSON.stringify(formJson));
            if (row !== null) {
                this.formData = Object.assign({}, row);
            }
            this.formName = "add";
            if (index !== null) {
                this.index = index;
                this.formName = "edit";
            }
        },
        formSubmit() {
            this.$refs["dataForm"].validate(valid => {
                if (valid) {
                    this.formLoading = true;
                    let data = Object.assign({}, this.formData);
                    adSave(data, this.formName)
                        .then(response => {
                            this.formLoading = false;
                            if (response.code) {
                                this.$message.error(response.message);
                                return false;
                            }
                            this.$message.success("操作成功");
                            this.formVisible = false;
                            if (this.formName === "add") {
                                // 向头部添加数据
                                data.adId = response.data.adId;
                                this.list.unshift(data);
                            } else {
                                this.list.splice(this.index, 1, data);
                            }
                        })
                        .catch(() => {
                            this.formLoading = false;
                        });
                }
            });
        },
        // 删除
        handleDel(index, row) {
            if (row.adId) {
                this.$confirm("确认删除该记录吗?", "提示", {
                    type: "warning"
                })
                    .then(() => {
                        let para = { adId: row.adId };
                        this.deleteLoading = true;
                        adDelete(para)
                            .then(response => {
                                this.deleteLoading = false;
                                if (response.code) {
                                    this.$message.error(response.message);
                                    return false;
                                }
                                this.$message("删除成功");
                                // 刷新数据
                                this.list.splice(index, 1);
                            })
                            .catch(() => {
                                this.deleteLoading = false;
                            });
                    })
                    .catch(() => {
                        this.$message.info("取消删除");
                    });
            }
        },
        onSelectPic(filePath, filePathUrl) {
            this.formData.pic = filePath;
            this.formData.picUrl = filePathUrl;
        }
    },
    filters: {
        statusFilterType(status) {
            const statusMap = {
                0: "gray",
                1: "success"
            };
            return statusMap[status];
        },
        statusFilterName(status) {
            const statusMap = {
                0: "禁用",
                1: "正常"
            };
            return statusMap[status];
        }
    },
    mounted() {},
    created() {
        // 将参数拷贝进查询对象
        let query = this.$route.query;
        this.query = Object.assign(this.query, query);
        this.query.limit = parseInt(this.query.limit);
        // 加载表格数据
        this.getList();
    }
};
</script>

<style type="text/scss" lang="scss">
</style>
