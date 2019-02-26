<template>
  <div class="mod-menu">
    <el-form :inline="true" :model="dataForm">
      <el-form-item>
        <el-button type="primary" @click="addOrUpdateHandle()">新增菜单目录</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList" border style="width: 100%;">
      <table-tree-column prop="name" header-align="center" treeKey="id" width="300" label="菜单名称"></table-tree-column>
      <!-- <el-table-column
        prop="parentName"
        header-align="center"
        align="center"
        width="120"
        label="上级菜单"
      ></el-table-column> -->
      <el-table-column header-align="center" align="center"  width="100" label="图标">
        <template slot-scope="scope">
          <icon-svg :name="scope.row.iconStyle || ''"></icon-svg>
        </template>
      </el-table-column>
      <el-table-column prop="type.name" header-align="center" width="100" align="center" label="类型">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.type.name === 'CATALOG'" size="small">目录</el-tag>
          <el-tag v-else-if="scope.row.type.name === 'MENU'" size="small" type="success">菜单</el-tag>
          <el-tag v-else-if="scope.row.type.name === 'BUTTON'" size="small" type="info">按钮</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="orderNum" header-align="center" width="80" align="center" label="排序号"></el-table-column>
      <el-table-column prop="url"  header-align="center" align="left" :show-overflow-tooltip="true" label="菜单URL" ></el-table-column>
      <el-table-column prop="resCode" header-align="center" align="center" :show-overflow-tooltip="true" label="授权标识" ></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row)" >修改</el-button>
          <!-- 只能删除目录 -->
          <el-button v-if="scope.row.type.name === 'CATALOG'" type="text" size="small" @click="deleteHandle(scope.row.id)" >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script>
import TableTreeColumn from "@/components/table-tree-column";
import AddOrUpdate from "./menu-add-or-update";
import { treeDataTranslate } from "@/utils";
export default {
  data() {
    return {
      dataForm: {},
      dataList: [],
      dataListLoading: false,
      addOrUpdateVisible: false
    };
  },
  components: {
    TableTreeColumn,
    AddOrUpdate
  },
  activated() {
    this.getDataList();
  },
  methods: {
    // 获取数据列表
    getDataList() {
      this.dataListLoading = true;
      this.$http({
        url: this.$http.adornUrl("/sys/menu/allList.json"),
        method: "get",
        params: this.$http.adornParams()
      }).then(({ data }) => {
        this.dataList = treeDataTranslate(data.data);
        this.dataListLoading = false;
      });
    },
    // 新增 / 修改
    addOrUpdateHandle(row=[]) {
      this.addOrUpdateVisible = true;
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(row);
      });
    },
    deleteHandle(id) {
      // 删除
      this.$confirm('确定删除该菜单吗？', '提示', {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() =>{
            this.$http({
            url: this.$http.adornUrl("/sys/menu/deleteById.json"),
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
        }).catch(() => {});
    }
  }
};
</script>
