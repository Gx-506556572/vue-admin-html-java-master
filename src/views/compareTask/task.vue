<template>

    <div>
        <el-form :inline="true" :model="query" class="query-form" size="mini">
            <el-form-item class="query-form-item">
                <el-input v-model="query.taskName" placeholder="请输入任务名称"></el-input>
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
                label="序号"
                prop="id"
                fixed>
            </el-table-column>
            <el-table-column
                label="任务名称"
                prop="taskName"
                with="300"
                :show-overflow-tooltip="true"
                fixed>
            </el-table-column>
            <el-table-column
                label="源数据库连接名"
                prop="sourceDatabaseName"
                with="300"
                :show-overflow-tooltip="true">
            </el-table-column>
            <el-table-column
                label="目标数据库连接名"
                prop="targetDatabaseName">
            </el-table-column>
            <el-table-column
                label="状态"
                prop="taskStatusDesc"
                with="300"
                :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    <el-tag
                        :type="scope.row.taskStatusDesc === '未启动' ? 'info' : 'success'"
                        disable-transitions>{{scope.row.taskStatusDesc}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column
                label="开始时间"
                prop="startTime"
                with="300"
                :show-overflow-tooltip="true">
            </el-table-column>
            <el-table-column
                label="结束时间"
                prop="endTime"
                with="300"
                :show-overflow-tooltip="true">
            </el-table-column>
            <el-table-column
                label="操作"
                fixed="right">
                <template slot-scope="scope">
                    <el-button type="text" size="small" v-if="scope.row.taskStatus == 0" @click.native="handleStart(scope.$index, scope.row)">启动</el-button>
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
                <el-form-item label="任务名称" prop="taskName"  label-width="140px">
                    <el-input v-model="formData.taskName" placeholder="请输入任务名称" auto-complete="off"></el-input>
                </el-form-item>
                        <el-form-item label="源数据库连接名" prop="sourceDatabaseName"  label-width="140px">
                            <el-select v-model="formData.sourceId"  auto-complete="off" filterable  placeholder="请选择源数据库连接名">
                                <el-option
                                    v-for="option in sourceDataBaseOptionsList"
                                    :key="option.value"
                                    :label="option.label"
                                    :value="option.value">
                                </el-option>
                            </el-select>
                        </el-form-item>
                <el-form-item label="目标数据库连接名" prop="targetDatabaseName"  label-width="140px">
                    <el-select v-model="formData.targetId"  auto-complete="off" filterable  placeholder="请选择源数据库连接名">
                        <el-option
                            v-for="option in targetDataBaseOptionsList"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="hideForm">取消</el-button>
                <el-button type="primary" @click.native="formSubmit()" :loading="formLoading">提交</el-button>
            </div>
        </el-dialog>
        <!-- 对话框 -->
        <el-dialog title="对比结果数据" :visible.sync="dialogVisible" width="50%">
            <pre>{{ taskData }}</pre>
            <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
        </el-dialog>

    </div>

</template>

<script>
import { taskList, taskSave, taskDelete,sourceDataBaseList,targetDataBaseList,taskStart } from "../../api/task/task";
import Upload from "../../components/File/Upload.vue";
const formJson = {
    id: "",
    taskName: "",
    sourceId: "",
    sourceDatabaseName: "",
    targetDatabaseName: "",
    targetId: "",
    taskStatus: "",
    taskStatusDesc: ""
};
export default {
    data() {
        return {
            query: {
                taskName: "",
                page: 1,
                limit: 20
            },
            dialogVisible: false, // 对话框显示状态
            taskData: null, // 存储返回的 data
            sourceDataBaseOptionsList: [],
            targetDataBaseOptionsList: [],
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
                ]
            },
            deleteLoading: false
        };
    },
    components: {
        Upload
    },
    created() {
        this.sourceDataBaseOptions();
        this.targetDataBaseOptions();
        // 将参数拷贝进查询对象
        let query = this.$route.query;
        this.query = Object.assign(this.query, query);
        this.query.limit = parseInt(this.query.limit);
        // 加载表格数据
        this.getList();
    },
    methods: {
        sourceDataBaseOptions(){
            sourceDataBaseList().then(res => {
                this.sourceDataBaseOptionsList = res.data;
            })
        },
        targetDataBaseOptions(){
            targetDataBaseList().then(res => {
                this.targetDataBaseOptionsList = res.data;
            })
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
            taskList(this.query)
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
        handleStart(index, row){
           // this.loading = true;
            taskStart(row).then(res => {
                if (res.code==0) {
                    this.dialogVisible = true; // 显示对话框
                    console.log(res)
                    this.$message.success('任务启动成功');
                    this.taskData = res.data; // 存储返回的 data

                }
                this.loading = false; // 关闭加载状态
            }).catch(err => {
                console.error(err);
                this.$message.error('任务启动失败');
                this.loading = false; // 关闭加载状态
            });
        },
        formSubmit() {
            this.$refs["dataForm"].validate(valid => {
                if (valid) {
                    this.formLoading = true;
                    let data = Object.assign({}, this.formData);
                    taskSave(data, this.formName)
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
                            this.onSubmit();
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
                        taskDelete(para)
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
        //启动任务
        handlStart(){

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
    mounted() {}
};
</script>

<style type="text/scss" lang="scss">
</style>
