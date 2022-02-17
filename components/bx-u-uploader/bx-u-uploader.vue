<template>
  <view>
    <view v-if="disabled">
      <view class="" v-for="(file,index) in filesListDataRun" :key="index">

        <view class="thumb-view flex">
          <image v-if="file.icon" :src="icons[file.icon]" mode="aspectFit"></image>
          <text class="file-name">{{file.name}}</text>
       <!--   <button class="dowloadBtn blue"
            @click="file.icon === 'img'  ? previewImage(file) : dowloadFile(file)">{{file.icon === 'img'  ? '预览' : '下载'}}</button> -->
        </view>
      </view>
    </view>
    <view v-else>
      <view class="" v-for="(file,index) in filesListDataRun" :key="index">

        <view class="thumb-view flex">
          <image v-if="file.icon" :src="icons[file.icon]" mode="aspectFit"></image>
          <text class="file-name" style="width: 50%;">{{file.name}}</text>
          <!-- <button class="dowloadBtn blue"
            @click="file.icon === 'img' ? previewImage(file) : dowloadFile(file)">{{file.icon === 'img' ? '预览' : '下载'}}</button> -->
          <button class="deleteBtn red" @click="deleteFile(file,index)">删除</button>
        </view>
      </view>
      <button type="primary" plain="true" :loading="loaded" v-if="filesListDataRun.length < maxNumber"
        @click="selectImage">上传</button>
    </view>
  </view>
</template>

<script>
  import doc from './image/doc.png'
  import file from './image/file.png'
  import img from './image/img.png'
  import video from './image/video.png'
  export default {
    props: {
      formData: {
        type: Object,
        default () {
          return null
        }
      },
      serverHeader: {
        type: Object,
        default () {
          return null
        }
      },
      viewType: {
        type: String,
        default () {
          return 'mini' // mini || bigGrid
        }
      },
      value: {
        type: Array,
        default () {
          return []
        }
      },
      uploadApi: {
        type: String,
        default () {
          return '' // 上传文件api地址
        }
      },
      deleteApi: {
        type: String,
        default () {
          return '' // 删除文件api地址
        }
      },
      maxNumber: {
        type: Number,
        default () {
          return 99 // 
        }
      },
      minNumber: {
        type: Number,
        default () {
          return 1 // 
        }
      },
      singleMaxSize: {
        type: Number,
        default () {
          return 1024 * 10 //  单位m
        }
      },
      singleMinSize: {
        type: Number,
        default () {
          return 1 //  单位kb
        }
      },
      disabled: {
        type: Boolean,
        default () {
          return false //  
        }
      },
      onDelete: {
        type: Boolean,
        default () {
          return true //  
        }
      },
      onAdd: {
        type: Boolean,
        default () {
          return true //  
        }
      },
      showUploadProgress: {
        type: Boolean,
        default () {
          return true //  
        }
      },

    },
    data() {
      return {
        filesList: this.value,
        loaded: false,

      };
    },
    updated() {
      if (this.value.length > 0) {
        this.filesList = this.value.map((item) => item)
      }
    },
    computed: {
      filesListDataRun: function() {
        let defaultVal = this.value
        defaultVal = defaultVal.map((item) => {
          if (item.type.indexOf('doc') !== -1 || item.type.indexOf('pdf') !== -1 || item.type.indexOf('xls') !== -
            1) {
            item.icon = 'doc'
          } else if (item.type.indexOf('png') !== -1 || item.type.indexOf('jpg') !== -1 || item.type.indexOf(
              'jpeg') !== -1 || item.type.indexOf('gif') !== -1) {
            item.icon = 'img'
          } else if (item.type.indexOf('mp4') !== -1 || item.type.indexOf('avi') !== -1 || item.type.indexOf(
              'mov') !== -1 || item.type.indexOf('gif') !== -1) {
            item.icon = 'video'
          } else {
            item.icon = 'file'
          }
          return item
        })
        return defaultVal
      },
      icons: function() {
        let obj = {
          doc: doc,
          file: file,
          img: img,
          video: video
        }
        return obj
      }
    },
    methods: {
      previewImage: function(e) {
        uni.showToast({
          title: 'doc',
          icon: 'none',
        });
        if (e.icon === 'img') {
          uni.previewImage({
            current: "",
            indicator: "number",
            loop: "true",
            urls: [e.url]
          })
        } else if (e.icon === 'doc') {
          uni.showToast({
            title: 'doc2',
            icon: 'none',
          });
          uni.navigateTo({
            url: "/pages/public/pdf/pdf" + `?fileurl=${e.url}&name=${e.name}`
          })
        }

      },
      dowloadFile(e) {
        uni.postMessage({
          data: {
            type: "download",
            data: e
          }
        })
        return
        console.log('dowloadFile', e.url)
        if (uni.getStorageSync('client_env') === 'wxh5') {
          uni.navigateTo({
            url: "/pages/public/toBrowser/toBrowser" + '?fileurl=' + e.url
          })
        } else if (uni.getStorageSync('client_env') === 'web') {
          window.location.href = e.url;
          // uni.navigateTo({
          // 	url:"/pages/public/toBrowser/toBrowser" + '?fileurl=' + e.url
          // })
        } else {
          if (e.icon === 'doc') {

            uni.showToast({
              title: 'doc',
              icon: 'none',
            });
            uni.downloadFile({
              url: e.url,
              success: function(res) {
                if (res.statusCode === 200) {
                  console.log('下载成功');

                }
                var filePath = res.tempFilePath;
                console.log('打开文档成功', res);
                // uni.showToast({
                // 	title: res.tempFilePath,
                // 	icon:'none',
                // });

                // uni.saveFile({
                // 	tempFilePath: filePath,
                // 	complete: (res) => {
                // 		var savedFilePath = res.savedFilePath;
                // 		console.log(savedFilePath);
                // 		uni.showToast({
                // 			title: '保存成功',
                // 			icon: 'none'
                // 		})
                // 	}
                // });
                // uni.openDocument({
                //   filePath: filePath,
                //   success: function (res) {
                // uni.showToast({
                // 	title: '打开文档成功',
                // 	icon:'none',
                // });
                //     console.log('打开文档成功');
                //   }
                // });
              }
            });
          }
        }


      },
      getFileInfo(e) {
        let self = this
        let data = JSON.parse(e) || null
        if (data) {
          let obj = {
            url: self.$api.getFilePath + data.fileurl + '&bx_auth_ticket=' + uni.getStorageSync('bx_auth_ticket'),
            name: data.src_name,
            type: data.file_type,
            appNo: data.app_no,
            fileNo: data.file_no
          }
          return obj
        } else {
          return null
        }
      },
      deleteFile: function(e, index) {
        let self = this
        let fils = self.deepClone(self.value)
        var deletedImagePath = self.filesList[index].url
        //检查删除图片的服务器地址是否设置，如果设置则调用API，在服务器端删除该图片

        let fileUrl = deletedImagePath.substring(deletedImagePath.lastIndexOf('filePath=') + 9, deletedImagePath
          .length)
        if (deletedImagePath.indexOf('&') !== -1) {
          fileUrl = deletedImagePath.substring(deletedImagePath.lastIndexOf('filePath=') + 9, deletedImagePath
            .indexOf('&'))
        }
        if (self.deleteApi) {

          uni.request({
            url: self.deleteApi,
            method: 'POST',
            header: self.deepClone(self.serverHeader),
            data: {
              fileurl: fileUrl
            },
            success: res => {
              console.log(res.data)
              if (res.data.hasOwnProperty('resultCode') && res.data.resultCode === 'SUCCESS') {
                fils.splice(index, 1)
                uni.showToast({
                  title: '删除成功',
                  icon: 'none',
                  mask: false,
                  duration: 1000
                });
                this.$emit('on-delete-change', {
                  currentImage: deletedImagePath,
                  allImages: fils
                })
              } else {
                uni.showToast({
                  title: res.data.resultMessage,
                  icon: 'none',
                  mask: false,
                  duration: 1000
                });
              }

            }
          });
        }


      },
      selectImage: function() {
        var self = this
        if (!self.filesList) {
          self.filesList = []
        }
        self.loaded = true
        uni.chooseImage({
          sourceType: ['album'],
          count: self.maxNumber ? (self.maxNumber - self.filesList.length) : 999,
          success: function(e) {
            console.log('选择完成', e)
            let imagePathArr = e.tempFilePaths

            //如果设置了limit限制，在web上count参数无效，这里做判断控制选择的数量是否合要求
            //在非微信小程序里，虽然可以选多张，但选择的结果会被截掉
            //在app里，会自动做选择数量的限制
            if (self.maxNumber) {
              var availableImageNumber = self.maxNumber - self.filesList.length
              if (availableImageNumber < imagePathArr.length) {
                uni.showToast({
                  title: '图片总数限制为' + self.maxNumber + '张，当前还可以选' + availableImageNumber + '张',
                  icon: 'none',
                  mask: false,
                  duration: 2000
                });
                return
              }
            }

            // serviceName: srv_bxfile_service
            // interfaceName: add
            // app_no: vxpact
            // table_name: bxvx_contract_agreement_non
            // columns: agreement_file_final
            // file_no: batchno_22b83456a177bd009c4e
            // file: (binary)
            //检查服务器地址是否设置，设置即表示图片要上传到服务器
            if (self.uploadApi) {
              uni.showToast({
                title: '上传进度：0/' + imagePathArr.length,
                icon: 'none',
                mask: false
              });
              var remoteIndexStart = self.filesList.length - imagePathArr.length
              var promiseWorkList = []
              var keyname = (self.fileKeyName ? self.fileKeyName : 'upload-images')
              var completeImages = 0

              for (let i = 0; i < imagePathArr.length; i++) {
                console.log('--->', imagePathArr[i], self.uploadApi, self.serverHeader, self.formData)
                let hander = self.deepClone(self.serverHeader)
                // hander['content-type'] = 'multipart/form-data; boundary=aboundary;'
                promiseWorkList.push(new Promise((resolve, reject) => {
                  let remoteUrlIndex = remoteIndexStart + i
                  uni.uploadFile({
                    url: self.uploadApi,
                    header: hander,
                    formData: self.formData,
                    filePath: imagePathArr[i],
                    name: 'file',
                    success: function(res) {
                      console.log(res)
                      if (res.statusCode === 200) {
                        if (self.isDestroyed) {
                          return
                        }
                        completeImages++
                        if (self.showUploadProgress) {
                          uni.showToast({
                            title: '上传进度：' + completeImages + '/' + imagePathArr.length,
                            icon: 'none',
                            mask: false,
                            duration: 1500
                          });
                        }
                        // console.log('是否显示ADD',self.isShowAdd,(self.limit && self.imageList.length >= this.limit))
                        console.log('success to upload image: ' + res.data)
                        if (typeof res.data === 'string') {
                          try {
                            // res.data = JSON.parse(res.data)
                          } catch (e) {
                            //TODO handle the exception
                            console.log(e)
                          }
                        }
                        resolve(res.data)
                      } else {
                        console.log('fail to upload image:' + res.data)
                        reject('fail to upload image:' + remoteUrlIndex)
                      }

                    },
                    fail: function(res) {
                      console.log('fail to upload image:' + res)
                      reject('fail to upload image:' + remoteUrlIndex)
                    }
                  })
                }))
              }
              Promise.all(promiseWorkList).then((result) => {
                if (self.isDestroyed) {
                  return
                }
                let fils = self.deepClone(self.value)
                for (let i = 0; i < result.length; i++) {

                  fils.push(self.getFileInfo(result[i]))
                }
                self.$emit('on-add-change', {
                  currentImages: imagePathArr,
                  allImages: fils
                })
                self.loaded = false
                // self.$emit('on-add-change', self.filesList)
              })
            } else {
              let fils = self.deepClone(self.value)
              for (let i = 0; i < imagePathArr.length; i++) {
                fils.push(self.getFileInfo(imagePathArr[i]))
              }

              self.$emit('on-add-change', {
                currentImages: imagePathArr,
                allImages: fils
              })
              self.loaded = false
            }
          }
        })
      },
    }

  }
</script>

<style scoped lang="less">
  .thumb-view {
    line-height: 1.5rem;
    align-items: center;
    padding: 10upx 4upx;

    image {
      width: 1rem;
      height: 1rem;
      margin-right: 10upx;
    }

    .file-name {
      white-space: nowrap;
      overflow: hidden;
      width: 60%;

      text-overflow: ellipsis;
    }

    .dowloadBtn {
      margin-left: 20upx;
      border: 1px solid #0081FF;
      padding: 0 10upx;
      border-radius: 10upx;
    }

    .deleteBtn {
      margin-left: 20upx;
      border: 1px solid #ff4213;
      padding: 0 10upx;
      border-radius: 10upx;
    }
  }

  .blue {
    color: #0081FF;
  }

  .red {
    color: #ff4213
  }
</style>
