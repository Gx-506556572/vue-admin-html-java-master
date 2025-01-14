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
                prop="databaseName"
                with="300"
                :show-overflow-tooltip="true">
            </el-table-column>
            <el-table-column
                label="数据库类型"
                prop="databaseType">
            </el-table-column>
            <el-table-column
                label="数据库版本"
                prop="databaseVersion"
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
                    <el-button type="text" size="small" @click.native="handleConnectTest(scope.$index, scope.row)" class="green-text-button">测试</el-button>
                    <el-button type="text" size="small" @click.native="handleDel(scope.$index, scope.row)" class="red-text-button">删除</el-button>
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
                <el-form-item label="连接名称" prop="connectName"  label-width="100px">
                    <el-input v-model="formData.connectName" placeholder="请输入连接名称" auto-complete="off"></el-input>
                </el-form-item>
                <el-row :gutter="10">
                    <el-col :span="12">
                <el-form-item label="数据库类型" prop="databaseType"  label-width="100px">
                    <el-select v-model="formData.databaseType"  @change="handleDatabaseTypeChange" auto-complete="off" filterable  placeholder="请选择数据库类型">
                        <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                    </el-col>
                    <el-col :span="12">
                <el-form-item label="数据库版本" prop="databaseVersion"  label-width="100px">
                    <el-input v-model="formData.databaseVersion" placeholder="请输入数据库版本" auto-complete="off"></el-input>
                </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="10">
                    <el-col :span="12">
                        <el-form-item label="服务器地址" prop="serverUrl" label-width="100px">
                            <el-input v-model="formData.serverUrl"  placeholder="请输入服务器地址"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="服务器端口" prop="serverPort" label-width="100px">
                            <el-input v-model="formData.serverPort" placeholder="请输入服务器端口"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="用户名" prop="username"  label-width="100px">
                    <el-input v-model="formData.username" placeholder="请输入用户名" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password"   label-width="100px">
                    <el-input  type="password" placeholder="请输入密码" show-password v-model="formData.password" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="数据库" prop="databaseName"  label-width="100px">
                    <el-input v-model="formData.databaseName"  placeholder="请输入数据库" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="驱动" prop="databaseDriver"  label-width="100px">
                    <el-input v-model="formData.databaseDriver"  placeholder="请输入驱动" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="URL" prop="databaseUrl"   label-width="100px">
                    <el-input v-model="formData.databaseUrl" placeholder="请输入URL" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="success" @click.native="connectTest">测试</el-button>
                <el-button @click.native="hideForm">取消</el-button>
                <el-button type="primary" @click.native="formSubmit()" :loading="formLoading">提交</el-button>
            </div>
        </el-dialog>

    </div>

</template>

<script>
import { targetList, targetSave, targetDelete } from "../../api/dataBase/targetDatabase";
import { connectTest } from "../../api/task/task";
import Upload from "../../components/File/Upload.vue";
const formJson = {
    id: "",
    connectName: "",
    databaseType: "",
    databaseVersion: "",
    serverUrl: "",
    serverPort: "",
    username: "",
    password: "",
    databaseName: "",
    databaseDriver: "",
    databaseUrl: "",
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
            options: [{
                value: 'MYSQL',
                label: 'MYSQL'
            }, {
                value: 'KINGBASE',
                label: 'KINGBASE'
            }],
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
                databaseType: [
                    {
                        required: true,
                        message: "请选择数据库类型",
                        trigger: "blur"
                    }
                ],
                dataBaseVersion: [
                    {
                        required: true,
                        message: "请填写数据库版本",
                        trigger: "blur"
                    }
                ],
                serverUrl: [
                    {
                        required: true,
                        message: "请输入服务器地址",
                        trigger: "blur"
                    }
                ],
                serverPort: [
                    {
                        required: true,
                        message: "请输入服务器端口",
                        trigger: "blur"
                    }
                ],
                username: [
                    {
                        required: true,
                        message: "请输入用户名",
                        trigger: "blur"
                    }
                ],
                password: [
                    {
                        required: true,
                        message: "请输入密码",
                        trigger: "blur"
                    }
                ],
                databaseName: [
                    {
                        required: true,
                        message: "请输入数据库",
                        trigger: "blur"
                   }
                ],
                databaseDriver: [
                    {
                        required: true,
                        message: "请输入驱动",
                        trigger: "blur"
                    }
                ],
                databaseUrl: [
                    {
                        required: true,
                        message: "请输入URL",
                        trigger: "blur"
                    }
                ]
            },
            deleteLoading: false
        };
    },
    components: {
        Upload
    },
    methods: {
        handleDatabaseTypeChange(value) {
            console.log(value)
            if (value === 'MYSQL') {
                this.formData.serverPort = 3306;
                this.formData.databaseVersion =5.5;
                this.formData.databaseDriver = 'com.mysql.jdbc.Driver';
            }
            if (value === 'KINGBASE'){
                this.formData.serverPort = 54321;
                this.formData.databaseVersion = 'V9';
                this.formData.databaseDriver = 'com.kingbase8.Driver';
            }
        },
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
        handleCurrentChange(val) {
            this.query.page = val;
            this.getList();
        },
        getList() {
            this.loading = true;
            targetList(this.query)
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
        // 刷新表单
        resetForm() {
            if (this.$refs["dataForm"]) {
                // 清空字段
                this.$refs["dataForm"].resetFields();
                // 清空验证信息表单
                this.$refs["dataForm"].clearValidate();
            }
        },
        //测试连接
        connectTest(){
            connectTest(this.formData).then(response => {
                if (response.code == 0) {
                    this.$message.success(response.data);
                    return;
                }else if (response.code == 1) {
                    this.$message.error(response.data);
                    return;
                }
            })
        },
        handleConnectTest(index, row){
            connectTest(row).then(response => {
                if (response.code == 0) {
                    this.$message.success(response.data);
                    return;
                }else if (response.code == 1) {
                    this.$message.error(response.data);
                    return;
                }
            })
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
                    targetSave(data, this.formName)
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
                                data.id = response.data.id;
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
            if (row.id) {
                this.$confirm("确认删除该记录吗?", "提示", {
                    type: "warning"
                })
                    .then(() => {
                        let para = { id: row.id };
                        this.deleteLoading = true;
                        targetDelete(para)
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
@import "../../styles/base.scss";
</style>
