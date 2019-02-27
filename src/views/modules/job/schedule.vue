<template>
  <div class="mod-schedule">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.title" placeholder="标题" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle"
      style="width: 100%;"
    >
      <el-table-column prop="title" header-align="center" align="center" label="标题" width="150" ></el-table-column>
      <el-table-column prop="className" header-align="center" align="left" label="类名称"></el-table-column>
      <el-table-column prop="methodName" header-align="center" align="center" label="方法名称" width="100" ></el-table-column>
      <el-table-column prop="cronStr" header-align="center" align="center" label="cron表达式" width="100" ></el-table-column>
      <el-table-column prop="enable" header-align="center" align="center" label="任务状态" width="80" >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.enable" size="small">启用</el-tag>
          <el-tag v-else size="small"  type="danger" >禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startTime" header-align="center" align="center" label="开始时间" width="160"></el-table-column>
      <el-table-column prop="endTime" header-align="center" align="center" label="结束时间" width="160"></el-table-column>
      <el-table-column prop="state" header-align="center" align="center" label="运行状态" width="80">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.state === 'NONE'" size="small" type="danger">无</el-tag>
          <el-tag v-if="scope.row.state === 'NORMAL'" size="small" type="success">正常</el-tag>
          <el-tag v-if="scope.row.state === 'PAUSED'" size="small" type="warning">暂停</el-tag>
          <el-tag v-if="scope.row.state === 'COMPLETE'" size="small" type="success">完成</el-tag>
          <el-tag v-if="scope.row.state === 'ERROR'" size="small" type="danger">异常</el-tag>
          <el-tag v-if="scope.row.state === 'BLOCKED'" size="small" type="danger">阻塞</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" header-align="center" align="center" label="备注" width="200"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="180" label="操作">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            v-if="!scope.row.enable"
            @click="taskHandle(scope.row.id,'enable','启用')"
          >启用</el-button>
          <el-button
            type="text"
            size="small"
            v-if="scope.row.enable"
            @click="taskHandle(scope.row.id,'disable','停用')"
          >禁用</el-button>
          <el-button
            type="text"
            size="small"
            v-if="scope.row.state === 'NORMAL'"
            @click="taskHandle(scope.row.id,'pause','暂停')"
          >暂停</el-button>
          <el-button
            type="text"
            size="small"
            v-if="scope.row.state === 'PAUSED'"
            @click="taskHandle(scope.row.id,'resume','恢复')"
          >恢复</el-button>
          <el-button
            type="text"
            size="small"
            @click="executionLogHandle(scope.row.id)"
          >运行日志</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper"
    ></el-pagination>
    <!-- 弹窗, 日志列表 -->
    <log v-if="logVisible" ref="log"></log>
  </div>
</template>

<script>
import Log from "./schedule-log";
export default {
  data() {
    return {
      dataForm: {
        title: ""
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      logVisible: false
    };
  },
  components: {
    Log
  },
  activated() {
    this.getDataList();
  },
  methods: {
    // 获取数据列表
    getDataList() {
      this.dataListLoading = true;
      this.$http({
        url: this.$http.adornUrl("/quartzTask/findPageInfo.json"),
        method: "get",
        params: this.$http.adornParams({
          page: this.pageIndex - 1,
          size: this.pageSize,
          LIKE_title: this.dataForm.title
        })
      }).then(({ data }) => {
        if (data && data.success === true) {
          var respData = data.data;
          this.dataList = respData.content;
          this.totalPage = respData.totalElements;
        } else {
          this.dataList = [];
          this.totalPage = 0;
        }
        this.dataListLoading = false;
      });
    },
    // 每页数
    sizeChangeHandle(val) {
      this.pageSize = val;
      this.pageIndex = 1;
      this.getDataList();
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageIndex = val;
      this.getDataList();
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },
    // 暂停
    taskHandle(id, type, title) {
      this.$confirm(
        `确定进行[`+title+`]操作吗?`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(() => {
          this.$http({
            url: this.$http.adornUrl("/quartzTask/"+type+".json"),
            method: "post",
            data: this.$http.adornData(id, false)
          }).then(({ data }) => {
            if (data && data.success === true) {
              this.$message({
                message: "操作成功",
                type: "success",
                duration: 1000,
                onClose: () => {
                  this.getDataList();
                }
              });
            } else {
              this.$message.error(data.message);
            }
          });
        })
        .catch(() => {});
    },
    // 日志列表
    executionLogHandle(id) {
      this.logVisible = true;
      this.$nextTick(() => {
        this.$refs.log.init(id);
      });
    }
  }
};
</script>
