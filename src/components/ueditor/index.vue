<template>
  <div class="mod-demo-ueditor">
    <script :id="ueId" class="ueditor-box" type="text/plain" style="width: 100%; height: 260px;"></script>
  </div>
</template>
<script>
  import ueditor from 'ueditor'
  export default {
    data () {
      return {
        ue: null,
        ueId: `J_ueditorBox_${new Date().getTime()}`,
        ueContent: '',
        loadComplete : false
      }
    },
    props: {
      id: {
        type: String,
        default: `editor_${new Date().getTime()}`
      },
      value: {
        type: String,
        default: ''
      },
      autoLoad: {
        type: Boolean,
        default: true
      }
    },
    watch: {
      value: function(newVal, oldVal) {
        if (this.ue) {
          if (!!newVal && newVal !== this.ueContent) {
            this.ueContent = newVal
            this.setContent(this.ueContent)
          } else if(!newVal) {
            this.setContent('')
          }
        }
      },
    },
    mounted () {
        this.init();
    //   this.ue = ueditor.getEditor(this.ueId, {
    //     zIndex: 3000
    //   })
    },
    methods: {
        init() {
            ueditor.delEditor(this.ueId)
            this.ue = ueditor.getEditor(this.ueId)
            this.ue.addListener("ready", () => {
                this.loadComplete = true
                this.ue.setContent(this.value || '')
            })
            this.ue.addListener( 'contentChange', editor => {
                this.ueContent = this.ue.getContent()
                this.$emit('input', this.ueContent)
            })
        },
        get() {
            return this.ue;
        },
        getContent () {
            return this.ue.getContent();
        },
        setContent(value) {
            if(this.loadComplete) {
                this.ue.setContent(value);
            }
        }
    },
    destroyed() {
        if(this.ue) {
        this.ue.destroy()
        }
    }
  }
</script>
<style lang="scss">
  .mod-demo-ueditor {
    position: relative;
    z-index: 510;
    > .el-alert {
      margin-bottom: 10px;
    }
  }
</style>
