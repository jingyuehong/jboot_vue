<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="80px">
      <el-form-item label="登录名" prop="userName">
        <el-input v-model="dataForm.userName" :disabled="dataForm.id" placeholder="登录帐号"></el-input>
      </el-form-item>
      <el-form-item label="用户名" prop="displayName">
        <el-input v-model="dataForm.displayName" placeholder="用户名称"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password" :class="{ 'is-required': !dataForm.id }">
        <el-input v-model="dataForm.password" type="password" placeholder="密码（选填）"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="comfirmPassword" :class="{ 'is-required': !dataForm.id }">
        <el-input v-model="dataForm.comfirmPassword" type="password" placeholder="确认密码"></el-input>
      </el-form-item>
      <el-form-item label="角色" size="mini" prop="roleIds">
        <el-checkbox-group v-model="dataForm.roleIds">
          <el-checkbox v-for="role in roleList" :key="role.key" :label="role.key">{{ role.value }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <!-- <el-form-item label="状态" size="mini" prop="enable">
        <el-radio-group v-model="dataForm.enable">
          <el-radio :label="false">禁用</el-radio>
          <el-radio :label="true">启用</el-radio>
        </el-radio-group>
      </el-form-item> -->
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { isEmail, isMobile } from '@/utils/validate'
  export default {
    data () {
      var validatePassword = (rule, value, callback) => {
        if (!this.dataForm.id && !/\S/.test(value)) {
          callback(new Error('密码不能为空'))
        } else {
          callback()
        }
      }
      var validateComfirmPassword = (rule, value, callback) => {
        if (!this.dataForm.id && !/\S/.test(value)) {
          callback(new Error('确认密码不能为空'))
        } else if (this.dataForm.password !== value) {
          callback(new Error('确认密码与密码输入不一致'))
        } else {
          callback()
        }
      }
      return {
        visible: false,
        roleList: [],
        dataForm: {
          id: 0,
          userName: '',
          displayName: '',
          password: '',
          comfirmPassword: '',
          roleIds: []
        },
        dataRule: {
          userName: [
            { required: true, message: '登录名不能为空', trigger: 'blur' }
          ],
          displayName: [
            {required: true, message: '用户名不能为空', trigger: 'blur'}
          ],
          password: [
            { validator: validatePassword, trigger: 'blur' }
          ],
          comfirmPassword: [
            { validator: validateComfirmPassword, trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        this.$http({
          url: this.$http.adornUrl('/sys/role/comboList.json'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({data}) => {
          this.roleList = data && data.success === true ? data.data : []
        }).then(() => {
          this.visible = true
          this.$nextTick(() => {
            this.$refs['dataForm'].resetFields()
          })
        }).then(() => {
          if (this.dataForm.id) {
            this.$http({
              url: this.$http.adornUrl(`/sys/user/findById.json`),
              method: 'get',
              params: this.$http.adornParams({
                'id': this.dataForm.id
              })
            }).then(({data}) => {
              if (data && data.success === true) {
                this.dataForm.userName = data.data.userName
                this.dataForm.displayName = data.data.displayName
                this.dataForm.roleIds = data.data.roleIds || []
              }
            })
          }
        })
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/sys/user/${!this.dataForm.id ? 'create.json' : 'update.json'}`),
              method: 'post',
              data: this.$http.adornData({
                'id': this.dataForm.id || undefined,
                'username': this.dataForm.userName,
                'displayName': this.dataForm.displayName,
                'password': this.dataForm.password,
                'roleIds': this.dataForm.roleIds
              })
            }).then(({data}) => {
              if (data && data.success === true) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.visible = false
                    this.$emit('refreshDataList')
                  }
                })
              } else {
                this.$message.error(data.message)
              }
            })
          }
        })
      }
    }
  }
</script>
