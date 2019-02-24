<template>
  <el-dialog :title="(!dataForm.id ? '新增' : '修改' ) + dataForm.type.message " :close-on-click-modal="false" :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <!-- <el-form-item label="类型" prop="type">
        <span>{{ dataForm.type.message }}</span>
        <el-radio-group v-model="dataForm.type">
          <el-radio v-for="(type, index) in dataForm.typeList" :label="index" :key="index">{{ type }}</el-radio>
        </el-radio-group>
      </el-form-item> -->
      <el-form-item :label="dataForm.type.message + '名称'" prop="name">
        <el-input v-model="dataForm.name" :placeholder="dataForm.type.message + '名称'"></el-input>
      </el-form-item>
      <el-form-item label="上级菜单" prop="parentName">
        <el-popover ref="menuListPopover" placement="bottom-start" trigger="click" :disabled="dataForm.type.name === 'BUTTON'">
          <el-tree 
            :data="menuList"
            :props="menuListTreeProps"
            node-key="id"
            ref="menuListTree"
            @current-change="menuListTreeCurrentChangeHandle"
            :default-expand-all="true"
            :highlight-current="true"
            :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.parentName" v-popover:menuListPopover :disabled="dataForm.type.name === 'BUTTON'" :readonly="true" placeholder="点击选择上级菜单" class="menu-list__input" clearable></el-input>
      </el-form-item>
      <el-form-item v-if="dataForm.type.name === 'MENU'" label="菜单路由" prop="url">
        <el-input  v-model="dataForm.url" :readonly="true" :disabled="true" placeholder="菜单路由"></el-input>
      </el-form-item>
      <el-form-item v-if="dataForm.type.name !== 'CATALOG'" label="授权标识" prop="resCode">
        <el-input v-model="dataForm.resCode" placeholder="多个用逗号分隔, 如: user:list,user:create" :readonly="true" :disabled="true"></el-input>
      </el-form-item>
      <el-form-item v-if="dataForm.type.name !== 'BUTTON'" label="排序号" prop="orderNum">
        <el-input-number v-model="dataForm.orderNum" controls-position="right" :min="0" label="排序号"></el-input-number>
      </el-form-item>
      <el-form-item v-if="dataForm.type.name !== 'BUTTON'" label="菜单图标" prop="iconStyle">
        <el-row>
          <el-col :span="22">
            <el-popover
              ref="iconListPopover"
              placement="bottom-start"
              trigger="click"
              popper-class="mod-menu__icon-popover">
              <div class="mod-menu__icon-list">
                <el-button
                  v-for="(item, index) in iconList"
                  :key="index"
                  @click="iconActiveHandle(item)"
                  :class="{ 'is-active': item === dataForm.iconStyle }">
                  <icon-svg :name="item"></icon-svg>
                </el-button>
              </div>
            </el-popover>
            <el-input v-model="dataForm.iconStyle" v-popover:iconListPopover :readonly="true" placeholder="菜单图标名称" class="icon-list__input" clearable></el-input>
          </el-col>
          <el-col :span="2" class="icon-list__tips">
            <el-tooltip placement="top" effect="light">
              <div slot="content">全站推荐使用SVG Sprite, 详细请参考:icons/index.js描述</div>
              <i class="el-icon-warning"></i>
            </el-tooltip>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { treeDataTranslate } from '@/utils'
  import Icon from '@/icons'
  export default {
    data () {
      var validateUrl = (rule, value, callback) => {
        if (this.dataForm.type === 1 && !/\S/.test(value)) {
          callback(new Error('菜单URL不能为空'))
        } else {
          callback()
        }
      }
      return {
        visible: false,
        dataForm: {
          id: 0,
          type: {code :'catalog', name:'CATALOG', message:'目录'}, // 默认为目录
          name: '',
          parentId: 0,
          parentName: '',
          url: '',
          resCode: '',
          orderNum: 0,
          iconStyle: '',
          iconList: []
        },
        dataRule: {
          name: [
            { required: true, message: '菜单名称不能为空', trigger: 'blur' }
          ],
          parentName: [
            { required: false, message: '上级菜单不能为空', trigger: 'change' }
          ],
          url: [
            { validator: validateUrl, trigger: 'blur' }
          ]
        },
        menuList: [],
        menuListTreeProps: {
          label: 'name',
          children: 'children'
        }
      }
    },
    created () {
      this.iconList = Icon.getNameList()
    },
    methods: {
      init (row) {
        this.dataForm.id = row.id || 0
        this.$http({
          url: this.$http.adornUrl('/sys/menu/allList.json'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({data}) => {
          this.menuList = treeDataTranslate(data.data, 'id')
        }).then(() => {
          this.visible = true
          this.$nextTick(() => {
            this.$refs['dataForm'].resetFields()
            this.dataForm.type =  {code :'catalog', name:'CATALOG', message:'目录'}
          })
        }).then(() => {
          if (!this.dataForm.id) {
            // 新增
            this.menuListTreeSetCurrentNode()
          } else {
            // 修改
            this.dataForm.id = row.id
            this.dataForm.type = row.type
            this.dataForm.name = row.name
            this.dataForm.parentId = row.parentId
            this.dataForm.url = row.url
            this.dataForm.resCode = row.resCode
            this.dataForm.orderNum = row.orderNum
            this.dataForm.iconStyle = row.iconStyle
            this.menuListTreeSetCurrentNode()
          }
        })
      },
      // 菜单树选中
      menuListTreeCurrentChangeHandle (data, node) {
        this.dataForm.parentId = data.id
        this.dataForm.parentName = data.name
      },
      // 菜单树设置当前选中节点
      menuListTreeSetCurrentNode () {
        this.$refs.menuListTree.setCurrentKey(this.dataForm.parentId)
        this.dataForm.parentName = (this.$refs.menuListTree.getCurrentNode() || {})['name']
      },
      // 图标选中
      iconActiveHandle (iconName) {
        this.dataForm.iconStyle = iconName
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            console.log(JSON.stringify(this.dataForm))
            // this.$http({
            //   url: this.$http.adornUrl(`/sys/menu/${!this.dataForm.id ? 'save' : 'update'}`),
            //   method: 'post',
            //   data: this.$http.adornData({
            //     'id': this.dataForm.id || undefined,
            //     'type': this.dataForm.type.name,
            //     'name': this.dataForm.name,
            //     'parentId': this.dataForm.parentId,
            //     'url': this.dataForm.url,
            //     'resCode': this.dataForm.resCode,
            //     'orderNum': this.dataForm.orderNum,
            //     'iconStyle': this.dataForm.iconStyle
            //   })
            // }).then(({data}) => {
            //   if (data && data.success === true) {
            //     this.$message({
            //       message: '操作成功',
            //       type: 'success',
            //       duration: 1000,
            //       onClose: () => {
            //         this.visible = false
            //         this.$emit('refreshDataList')
            //       }
            //     })
            //   } else {
            //     this.$message.error(data.message)
            //   }
            // })
          }
        })
      }
    }
  }
</script>

<style lang="scss">
  .mod-menu {
    .menu-list__input,
    .icon-list__input {
       > .el-input__inner {
        cursor: pointer;
      }
    }
    &__icon-popover {
      max-width: 370px;
    }
    &__icon-list {
      max-height: 180px;
      padding: 0;
      margin: -8px 0 0 -8px;
      > .el-button {
        padding: 8px;
        margin: 8px 0 0 8px;
        > span {
          display: inline-block;
          vertical-align: middle;
          width: 18px;
          height: 18px;
          font-size: 18px;
        }
      }
    }
    .icon-list__tips {
      font-size: 18px;
      text-align: center;
      color: #e6a23c;
      cursor: pointer;
    }
  }
</style>
