import bus from '@/common/bus.js'
import dayjs from 'dayjs'
var jweixin = require('jweixin-module')
export default {
  install(Vue, options) {
    Vue.prototype.$bus = bus
    Vue.prototype.$wx = jweixin
    Vue.prototype.pageTitle = '加载中…' // 可以自定义变量
    Vue.prototype.fieldSupportConfig = ['images', 'radio', 'radioFk', 'checkboxFk', 'checkbox', 'file', 'textarea',
      'snote', 'Note', 'date', 'dateTime', 'time', 'Date', 'number', 'digit', 'Float', 'treeSelector',
      'cascader',
      'string', 'String', 'input'
    ]
    /**
     * 登录相关
     */

    /**
     *@param {Array} loginInfoList 要存储的登录信息 [{key:'',value:''}]
     */
    Vue.prototype.GenNonDuplicateID = function(s, e) {
      //  let str = Number(Math.floor((Math.random()+Math.floor(Math.random()*9+1))*Math.pow(10,9)) + Date.now()).toString(12)
      let str = Math.floor((Math.random() + Math.floor(Math.random() * 9 + 1)) * Math.pow(10, 9)).toString(
          16) + Date.now()
        .toString(16)
      //  console.log(Math.random().toString().substr(3,randomLength),Date.now(),str)
      if (s) {
        str = s + str
      }
      if (e) {
        str = str + e
      }
      return str
    }
    Vue.prototype.arrTransformStr = function(val, type, d) {
      let res = null
      let delimiter = d || ','
      if (type === 'string') {
        res = val.join(delimiter)
      } else if (type === 'array') {
        res = val.split(delimiter)
      }
      console.log('arrTransformStr', res, delimiter)
      return res
    }

    Vue.prototype.colNameToLabel = function(cols, col) {
      // pos 位置 pu || po    type  true || false
      let res = ''
      for (let key in cols) {
        if (cols[key].col_type == 'Dict' || cols[key].col_type == 'User' || cols[key].col_type == 'fk') {
          if (col == `_${cols[key].columns}_disp` || cols[key].columns == col) {
            // console.log("colNameToLabel",col,cols[key].columns,cols[key].label)
            res = cols[key].label
          }
        } else {
          if (cols[key].columns == col) {
            // console.log("colNameToLabel",col,cols[key].columns,cols[key].label)
            res = cols[key].label
          }
        }

      }

      return res
    }
    Vue.prototype.sliceString = function(str, len, pos, type) {
      // pos 位置 pu || po    type  true || false
      let res = str === null || str === undefined ? '' : str
      res = res.toString()

      if (pos === 'po') {
        res = res.slice(res.length - len)
      } else {
        res = res.slice(0, len)
      }
      if (type && res.length > len) {
        res += '...'
      }
      return res
    }
    Vue.prototype.getForKeyCond = function(mainData, foreign_key) {
      // pos 位置 pu || po    type  true || false
      let cond = [{
        "colName": foreign_key.column_name,
        "ruleType": "eq",
        "value": mainData[foreign_key.referenced_column_name]
      }]
      return cond
    }
    Vue.prototype.saveLoginInfo = function(loginInfoList = []) {
      loginInfoList.map(item => {
        uni.setStorageSync(item.key, item.value)
      })
    }

    Vue.prototype.$logout = function() {
      try {
        uni.clearStorageSync();
      } catch (e) {
        console.error(e)
      }
    }
    // 初始化查询
    Vue.prototype.selectRequestObjs = function(srv, cond, order) { // 给自定义方法起个名
      let selectRequestObj = {}
      selectRequestObj['serviceName'] = ''
      selectRequestObj['colNames'] = ['*']
      selectRequestObj['condition'] = []
      if (srv) {
        selectRequestObj['serviceName'] = srv
      }
      if (cond) {
        selectRequestObj['condition'] = cond
      }
      if (order) {
        selectRequestObj['order'] = order
      }

      return selectRequestObj
    }
    /**
     * @param {String} srv - 服务名(serviceName)
     * @param {String} srvType 
     * @param {String} pageType  // use_type 取值
     * @param {String} app 
     */
    Vue.prototype.getV2ReqUseType = function() {
        console.log('getV2ReqUseType')
      },
      Vue.prototype.getServiceV2 = async function(srv, srvType, pageType,
        app) { // 表单信息 srvType : add | update | list | detail | select
        // use_type: detail | proclist | list | treelist | detaillist | selectlist | addchildlist | updatechildlist | procdetaillist | add | update     
        let self = this
        let appName = app || uni.getStorageSync("activeApp")
        if (srv && pageType) {
          let len = null
          let serviceName = srv
          if (!srvType) {
            serviceName = srv
          } else {
            len = srv.lastIndexOf('_')
            serviceName = srv.slice(0, len) + '_'
            if (srvType && srvType === 'list' || srvType === 'detail') {
              serviceName += 'select'
            } else {
              serviceName += srvType
            }
          }

          let cols = self.$store.getters.getSrvCol ? self.$store.getters.getSrvCol : []
          let nCols = cols.filter(item => item.service_name === serviceName && item.use_type === pageType)
          // console.log('=====1', nCols,serviceName,pageType)
          if (nCols.length === 0) {
            let req = this.selectRequestObjs()
            req.serviceName = 'srvsys_service_columnex_v2_select'
            req.colNames = ['*']
            req.condition = []
            let condObj = {}
            condObj['colName'] = 'service_name'
            condObj['ruleType'] = 'eq'
            condObj['value'] = serviceName
            req.condition[0] = JSON.parse(JSON.stringify(condObj))
            condObj['colName'] = 'use_type'
            condObj['ruleType'] = 'eq'
            condObj['value'] = pageType === 'select' ? 'detail' : pageType
            req.condition[1] = JSON.parse(JSON.stringify(condObj))
            req.order = [{}]
            req.order[0]['colName'] = 'seq'
            req.order[0]['orderType'] = 'asc'
            let url = Vue.prototype.getServiceUrl(appName, "srvsys_service_columnex_v2_select",
              "select", url)
            url = url + "?colsel_v2=" + serviceName
            const response = await this.$http.post(url, req)
            if (response.data.data) {
              // console.log('=====2', response.data.data)
              response.data.data.use_type = pageType
              if ('rowButton' in response.data.data) {
                // response.data.data._footerBtns = this.getFooterBtns(response.data.data.rowButton)
              }

              // 第一次拿到，缓存
              let pageconfig = Vue.prototype.getPageConfig(response.data.data, pageType)
              // self.$store.commit('setSrvCol', pageconfig)
              return pageconfig
            }
          } else {
            // console.log('=====3', nCols)
            // let pageconfig = Vue.prototype.getPageConfig(nCols[0],pageType)
            // return pageconfig
            return nCols[0]
          }
        } else {
          return false
        }
      }
    /**
     * @param {String} v2res  V2 请求原始数据
     * 
     */
    Vue.prototype.getPageConfig = function(v2res, useType) {
      let pageConfigs = v2res || false
      if (pageConfigs) {
        pageConfigs["_fieldInfo"] = Vue.prototype.getFieldInfo(v2res.srv_cols, useType)
        // pageConfigs["_fieldInfo"] = Vue.prototype.arraySort(pageConfigs["_fieldInfo"], "seq")
        if (useType === 'list') {
          pageConfigs["_buttonInfo"] = Vue.prototype.getButtonInfo(v2res.gridButton)
          pageConfigs["moreConfig"] = v2res.moreConfig ? JSON.parse(v2res.moreConfig) : null
        }
        if (useType === 'treelist') {
          // pageConfigs["_buttonInfo"] = Vue.prototype.getButtonInfo(v2res.gridButton)
          pageConfigs["_rowButtons"] = Vue.prototype.getButtonInfo(v2res.rowButton, useType)
          pageConfigs["_handerButtons"] = Vue.prototype.getButtonInfo(v2res.gridButton, useType)
        } else if (useType === 'update' || useType === 'add' || useType === 'detail') {
          pageConfigs["_formButtons"] = Vue.prototype.getButtonInfo(v2res.formButton, useType)
        }
        // pageConfigs["_pageLevel"] = 
        // console.log("pageConfigs", pageConfigs)
        return pageConfigs
      } else {
        return false
      }
    }
    /** 封装 field 的配置信息
     * @param {String} srvCol  cols 数组
     * @param {String} useType userType,页面类型
     */
    Vue.prototype.getFieldInfo = function(srvCol, useType) {
      let cols = srvCol
      let fieldInfo = {}
      switch (useType) {
        // 统一根据页面类型 过滤字段显示 === 2 暂不支持
        case "add":
          cols = cols.filter((item, index) => {
            // if (item.in_add !== 0) {
            if (item.in_add === 1) {
              return item
            }
          })
          break;
        case "update":
          cols = cols.filter((item, index) => {
            if (item.in_update === 1) {
              return item
            }
          })
          break;
        case "detail":
          cols = cols.filter((item, index) => {
            // if (item.in_detail !== 0) {
            if (item.in_detail === 1) {
              return item
            }
          })
          break;
        default:
          break;
      }
      cols = cols.map((item, index) => {
        fieldInfo = {
          column: "",
          label: "",
          defaultValue: null,
          isRequire: null,
          type: null,
        }
        fieldInfo.column = item.columns
        fieldInfo.label = item.label
        fieldInfo.seq = item.seq
        if (item.init_expr) {
          if (item.init_expr[0] == "'" && item.init_expr[item.init_expr.length - 1] === "'") {
            item.init_expr = item.init_expr.replace(/\'/g, '')
            fieldInfo.defaultValue = item.init_expr
            fieldInfo.initValue = item.init_expr
          } else {
            try {
              let loginUserInfo = uni.getStorageSync('login_user_info');

              if (loginUserInfo?.user_no) {
                top.user = loginUserInfo
              }
              let val = eval(item.init_expr)
              if(item.init_expr==='0.00'){
                val = '0.00'
              }
              if (item.col_type === 'Date') {
                val = dayjs(val).format("YYYY-MM-DD")
              } else if (item.col_type === 'DateTime') {
                val = dayjs(val).format("YYYY-MM-DD HH:mm:ss")
              }
              fieldInfo.defaultValue = val
              fieldInfo.initValue = val
            } catch (e) {
              //TODO handle the exception
              console.log(e)
            }
          }
        }
        fieldInfo.option_list_v2 = item.option_list_v2
        fieldInfo.x_if = item.x_if
        fieldInfo.col_type = item.col_type
        fieldInfo.section = item.section
        fieldInfo.validators = item.validators
        // col_type 转换 表单组件 type 
        if (item.col_type === "String" || item.col_type === "TelNo" || item.col_type ===
          'BankAccountNo' || item.col_type === "Email") {
          fieldInfo.type = "input"
        } else if (item.col_type === "DateTime" || item.col_type === "Date") {
          fieldInfo.type = "date"
        } else if (item.col_type === "FileList") {
          fieldInfo.type = "file"
          fieldInfo.srvInfo = {
            tableName: item.table_name,
            appNo: item.table_name.substring(item.table_name.indexOf("bx") + 2, item
              .table_name.indexOf("_"))
          }
        } else if (item.col_type === "Image") {
          // } else if (item.col_type === "Image" || item.col_type === "FileList") {
          fieldInfo.type = "images"
          fieldInfo.srvInfo = {
            tableName: item.table_name,
            appNo: item.table_name.substring(item.table_name.indexOf("bx") + 2, item
              .table_name.indexOf("_"))
          }
        } else if (item.col_type === "Enum" || item.col_type === "Dict") {
          fieldInfo.type = "radioFk"
          fieldInfo.options = item.option_list_v2
        } else if (item.col_type === "Set") {
          fieldInfo.type = "checkboxFk"
          fieldInfo.options = item.option_list_v2
        } else if (item.col_type === "MultilineText") {
          fieldInfo.type = "textarea"
        } else if (item.col_type === "Money" || item.col_type === "Float") {
          fieldInfo.type = "digit"
        } else if (item.col_type === "Integer" || item.col_type === "int") {
          fieldInfo.type = "number"
        } else if ((item.bx_col_type === "fk" || item.col_type === 'fk' || item.col_type ===
            'bxsys_dict') || (item.col_type && item.col_type.indexOf('bx') !== -1 && item
            .bx_col_type === 'string' && item.col_type !== "String")) {
          fieldInfo.type = "treeSelector"
          fieldInfo.options = item.option_list_v2
        } else if (item.col_type === "User") {
          fieldInfo.type = "treeSelector"
          fieldInfo.option_list_v2 = {
            "refed_col": "user_no",
            "srv_app": "sso",
            "serviceName": "srvsso_user_select",
            // "conditions": [{
            //   "colName": "dept_no",
            //   "ruleType": "eq",
            //   "value": "bx100sys"
            // }],
            "key_disp_col": "user_disp"
          }
          fieldInfo.srvInfo = {
            serviceName: 'srvsso_user_select',
            appNo: 'sso',
            isTree: false,
            column: 'user_no',
            showCol: 'real_name', //要展示的字段
          }
        } else if (fieldInfo.col_type === 'UserList') {
          fieldInfo.isMulti = true
          fieldInfo.type = "treeSelector"
          fieldInfo.option_list_v2 = {
            serviceName: 'srvsso_user_select',
            srv_app: "sso",
            refed_col: 'user_no',
            key_disp_col: 'user_disp',
            show_as_pair: false,
          }
        } else if (fieldInfo.type === 'id_card') {
          fieldInfo.type = 'idCardPicture'
          fieldInfo.buttons = [{
            name: '拍照',
            type: 'car_no'
          }]
        } else {
          fieldInfo.type = item.col_type + 'undefined'
        }

        fieldInfo.disabled = false //字段是否冻结
        switch (useType) {
          case "add":
            fieldInfo.showExp = (item.in_add === 1)
            fieldInfo.display = (item.in_add === 1)
            fieldInfo.in_add = item.in_add

            fieldInfo.disabled = item.updatable === 0 ? true : false //字段是否冻结
            break;
          case "update":
            fieldInfo.showExp = (item.in_update === 1)
            fieldInfo.display = (item.in_update === 1)
            fieldInfo.in_update = item.in_update

            fieldInfo.disabled = item.updatable === 0 ? true : false //字段是否冻结
            break;
          case "list":
            fieldInfo.showExp = (item.in_list === 1)
            fieldInfo.display = (item.in_list === 1)
            break;
          case "detail":
            fieldInfo.showExp = (item.in_detail === 1)
            fieldInfo.display = (item.in_detail === 1)
            break;
          case "proclist":
            fieldInfo.showExp = (item.in_list === 1)
            fieldInfo.display = (item.in_list === 1)
            break;
          case "cond":
            break;
          default:
            break;
        }
        // 处理字段统一属性
        fieldInfo.redundant = item.redundant
        fieldInfo.bx_col_type = item.bx_col_type
        fieldInfo._validators = Vue.prototype.getValidators(item.validators, item
          .validators_message)
        fieldInfo.isRequire = fieldInfo._validators.required
        fieldInfo.value = null //初始化ｖａｌｕｅ
        fieldInfo._colDatas = item //保存原始ｄａｔａ
        return fieldInfo
      })
      return cols
    }
    /** 封装按钮的配置信息
     * @param {String} buttons  按钮数据
     * 
     */
    Vue.prototype.getButtonInfo = function(buttons, pageType) {

      let cols = buttons
      let buttonInfo = {}
      cols = cols.filter((item, index) => {
        switch (pageType) {
          case "treelist":
            if ((item.button_type === "addchild" || item.button_type === "edit" || item
                .button_type === "delete" ||
                item.button_type === "add") && item.permission) {
              return item
            }
            break;
          case "list":
            if ((item.button_type === "addchild" || item.button_type === "edit" || item
                .button_type === "delete" ||
                item.button_type === "add") && item.permission) {
              return item
            }
            break;
          case "add":
            if ((item.button_type === "reset" || item.button_type === "submit") && item
              .permission) {
              return item
            }
            break;
          case "update":
            if ((item.button_type === "reset" || item.button_type === "edit") && item
              .permission) {
              return item
            }
            break;
          case "detail":
            if ((item.button_type === "customize") && item.permission) {
              if (item.operate_params && typeof item.operate_params === 'string') {
                try {
                  item.operate_params = JSON.parse(item.operate_params)
                } catch (e) {
                  console.log(e)
                  //TODO handle the exception
                }
                return item
              }
            }
            break;
          default:
            break;
        }

        // if( item.button_type === "submit"){
        // 	buttonInfo.ontap = Vue.prototype.onRequest
        // }

      })
      return cols
    }
    /**
     * 树形数据封装
     */
    Vue.prototype.treeReform = function(e, pidcol, idcol) {
      // 
      let data = Vue.prototype.deepClone(e)
      let to1Data = e.filter((item, index) => {
        // console.log(item.menu_name,item[pidcol])
        return item[pidcol] === null || item[pidcol] === ""
      })
      let to2Data = e.filter((item, index) => {
        return item[pidcol] !== null || item[pidcol] === ""
      })
      let reform = function(allData, pd, id, data) {
        // 根据顶级节点组装数有子节点
        let datas = Vue.prototype.deepClone(data) // 当前级别
        let aDatas = Vue.prototype.deepClone(allData) // 剩余data
        for (let i = 0; i < datas.length; i++) {
          let child = []
          for (let j = 0; j < aDatas.length; j++) {
            // console.log("slice==="+j,datas[i][id],aDatas[j][pd])
            if (datas[i][id] === aDatas[j][pd]) {
              child.push(aDatas[j])
              aDatas.slice(j, 1)
              // console.log("slice==="+j,aDatas,aDatas[j],j)
            }
          }
          if (child.length > 0) {
            datas[i]["_childNode"] = reform(aDatas, pd, id, child)
          } else {
            datas[i]["_childNode"] = child
          }
          // console.log("datas[i]._childNode" + i,datas)
        }
        return datas
      }
      to1Data = reform(to2Data, pidcol, idcol, to1Data)
      // console.log("_childNode",e,to1Data)
      return to1Data
    }
    /**
     * 普通请求方法封装
     * @param {String} optionType -操作类型(select||operate||add...)
     * @param {String} srv -服务名 serviceName
     * @param {Object} req -请求参数
     * @param {String} app 
     */
    Vue.prototype.onRequest = async function(optionType, srv, req, app) {
      let self = this
      let reqType = optionType
      if (optionType === "add" || optionType === "update") {
        reqType = optionType
      } else if (optionType === "select") {

      }
      let url = Vue.prototype.getServiceUrl(app || uni.getStorageSync("activeApp"), srv, optionType)
      return self.$http.post(url, req)
    }

    // -------------------公共方法-------------------------------
    /**
     * @param {String} app 
     * @param {String} srv - 服务名(serviceName)
     * @param {String} srvType 
     * @param {String} url - 协议+ip+端口
     */
    Vue.prototype.getServiceUrl = function(app, srv, srvType, url) {
        // 获取转换URL app, srv, srvType, url
        let singleApp = this.$api.singleApp

        let urlVal = url || this.$api.srvHost
        let appVal = app
        if (singleApp) {
          appVal = this.$api.appName

        } else {
          appVal = uni.getStorageSync('activeApp')
        }
        if (app) {
          appVal = app
        }
        let srvTypeVal = srvType
        let srvVal = srv
        // console.log("url:", urlVal + '/' + appVal + '/' + srvTypeVal + '/' + srvVal)
        return urlVal + '/' + appVal + '/' + srvTypeVal + '/' + srvVal
      },

      /**
       * 封装配置的校验信息
       *  @param {String} vds - col 配置的 validators
       *  @param {String} msg - col 配置的 validators_message
       */
      Vue.prototype.getValidators = function(vds, msg) { // 获取校验信息返回组件data
        if (vds !== null && msg !== null) {
          let str = vds
          // console.log('vds', vds)
          let getStr = function(val, state, end) {
            if (val.length > state.length + end.length) {
              let s = val.indexOf(state)
              if (s === -1) {
                return ''
              } else {
                let nval = val.slice(s + state.length, val.length)
                let e = nval.indexOf(end)
                let str = nval.slice(0, e)
                if (e === -1) {
                  str = nval.slice(0)
                }
                return str
              }
            } else {
              return ''
            }
          }
          let Validators = {}
          let reg = /required/gi
          Validators['max'] = getStr(str, 'ngMaxlength=', ';').length > 0 ? parseInt(getStr(str,
              'ngMaxlength=', ';')) :
            null
          Validators['min'] = getStr(str, 'ngMinlength=', ';').length > 0 ? parseInt(getStr(str,
              'ngMinlength=', ';')) :
            null
          Validators['reg'] = getStr(str, 'ngPattern=', ';')
          Validators['required'] = reg.test(str)
          Validators['msg'] = getStr(msg, 'ngPattern=', ';')
          Validators['js_validate'] = getStr(str, 'js_validate=', ';')
          Validators['isType'] = function(e) {
            let reg = new RegExp(getStr(str, 'ngPattern=', ';'))
            if (reg.test(e)) {
              let obj = {
                valid: reg.test(e),
                msg: "有效"
              }
              return obj
            } else {
              let msgs = getStr(msg, 'ngPattern=', ';')
              msgs = msgs === '' ? '信息有误' : msgs
              let obj = {
                valid: reg.test(e),
                msg: msgs
              }
              return obj
            }
          }
          return Validators
        } else if (vds && !msg) {
          let reg = /required/gi
          let Validators = {}
          Validators['required'] = reg.test(vds)
          return Validators
        } else {
          return false
        }
      }
    Vue.prototype.deepClone = function(obj) {
      // 深拷贝
      function isObject(o) {
        return (typeof o === 'object' || typeof o === 'function') && o !== null
      }
      if (!isObject(obj)) {
        console.error('非对象:', obj)
        // throw new Error('非对象')
      }
      let isArray = Array.isArray(obj)
      let newObj = isArray ? [...obj] : {
        ...obj
      }
      Reflect.ownKeys(newObj).forEach(key => {
        newObj[key] = isObject(obj[key]) ? Vue.prototype.deepClone(obj[key]) : obj[key]
      })
      return newObj
    }

    Vue.prototype.toPreviousPage = function() {
      uni.navigateBack({
        animationDuration: 2000,
        animationType: 'zoom-fade-in',
        delta: 1
      });
    }

    Vue.prototype.formateDate = function(date, type = 'date') {
      console.log(date)
      date = new Date(date)
      let o = {
        'yy': date.getFullYear(),
        'MM': (() => {
          let MM = date.getMonth() + 1
          if (MM < 10) {
            MM = '0' + MM
          }
          return MM
        })(),
        'dd': date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
        'HH': date.getHours() < 10 ? '0' + date.getHours() : date.getHours(),
        'mm': (() => {
          let mm = date.getMinutes()
          if (mm < 10) {
            mm = '0' + mm
          }
          return mm
        })(),
        'ss': date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()
      };
      if (type === 'date' || type === 'YYYY-MM-DD') {
        return o.yy + '-' + o.MM + '-' + o.dd + ' '
      } else if (type === 'dateTime') {
        return o.HH + ':' + o.mm
      } else {
        return o.yy + '-' + o.MM + '-' + o.dd + ' ' + o.HH + ':' + o.mm + ':' + o.ss;
      }
    };
    // -------------------- 微信相关 -----------------
    /**
     *  判断是否当前环境是微信
     *  @return {boolean} true||false
     */
    Vue.prototype.isWeixinClient = function() {
      // #ifdef H5
      let ua = navigator.userAgent.toLowerCase()
      // 微信公众号环境
      let isWeixin = ua.indexOf('micromessenger') !== -1
      if (isWeixin) {
        return true
      } else {
        return false
      }
      // #endif
      // #ifdef MP-WEIXIN
      // 微信小程序环境
      return true
      // #endif
    };
    // 表单
    Vue.prototype.getCoulmnConfig = function(e) {
      let cnCol = {
        // "activity_no": "20200208002600000007",
        // "item_no":"000001",
        "item_seq": 1,
        "item_title": e.item_title,
        "item_type": e.item_type,
        "is_require": e.is_require,
        // "column":e.column,
        "item_type_attr": {},
        "is_public": "否",
        "show_cfg": "",
        points: e.points,
        option_img_explain: e.option_img_explain,
        ref_type: e.ref_type,
        srv_app: e.srv_app,
        serviceName: e.serviceName,
        refed_col: e.refed_col,
        key_disp_col: e.key_disp_col,
      }
      switch (e.item_type) {
        case "文本":
          cnCol.item_type_attr['view_model'] = e.view_model
          cnCol.item_type_attr['max_len'] = e.max_len
          break;
        case "选项":
          cnCol.item_type_attr['radioType'] = e.option_type === '单选' ? 'single' : e.option_type === '多选' ?
            'multi' : '',
            console.log(cnCol.item_type_attr['radioType'])
          break;
        case "时间日期":
          cnCol.item_type_attr['dateType'] = e.format
          break;
        case "数字":
          cnCol.item_type_attr['numberType'] = e.decimal_places
          cnCol.item_type_attr['max'] = e.max
          cnCol.item_type_attr['min'] = e.min
          break;
        case "图片":
          cnCol.item_type_attr['fileNum'] = e.max_num
          break;
        case "地址":
          break;
        case "引用":
          cnCol.item_type_attr['ref_type'] = e.ref_type
          cnCol.item_type_attr['srv_app'] = e.srv_app
          cnCol.item_type_attr['serviceName'] = e.serviceName
          cnCol.item_type_attr['refed_col'] = e.refed_col
          cnCol.item_type_attr['key_disp_col'] = e.key_disp_col
          cnCol.item_type_attr['option_list_v2'] = e.option_list_v2
          break;
        default:
          ''
      }
      cnCol.item_type_attr = JSON.stringify(cnCol.item_type_attr)
      // cnCol.show_cfg = JSON.stringify(cnCol.show_cfg)
      cnCol.option_data = JSON.stringify(cnCol.option_data)
      return cnCol
    }
    /**
     * QUsHE inputs inputsArray 数据构造
     * 
     * */
    Vue.prototype.getInputsArray = function(e) {
      let viewCfg = e

      let inputTemp = function() {
        let a = {

          type: "", //input textarea pics  radio checkbox picker-date（picker-dateTime| String| 日期加时间| | picker-date| String| 日期| | picker-time| String| 时间|） picker-city text  infinitePics
          title: "名称", //
          inputType: "", // text number
          maxlength: "", // 最大长度
          // ignore:false,// 是否为空
          defaultValue: "", // 默认值
          itemArray: [], // 选项值和名称 name value
          column: "",
        }
        return a
      }
      let inputsDatas = viewCfg.map((item, index) => {
        let inputData = inputTemp()
        inputData.title = item.item_title
        inputData.column = item.column
        inputData.no = item.item_no
        inputData.width = "100"
        switch (item.item_type) {
          case "string":
            if (item.item_type_attr.hasOwnProperty("view_model")) {
              if (item.item_type_attr.view_model === "单行") {
                inputData.type = "input"

                return inputData
              } else if (item.item_type_attr.view_model === "多行") {
                inputData.type = "textarea"
                return inputData
              }
            } else {
              inputData.type = "input"

              return inputData
            }
            break;
          case "checkbox":
            if (item.item_type_attr.hasOwnProperty("option_type")) {

              if (item.item_type_attr.option_type === "单选") {
                inputData.type = "radio"
                inputData.itemArray = item.option_data.map((item, index) => {
                  let a = {
                    name: item.option_value,
                    value: item.option_no
                  }
                  return a
                })
                return inputData
              } else if (item.item_type_attr.option_type === "多选") {
                inputData.type = "checkbox"
                inputData.itemArray = item.option_data.map((item, index) => {
                  let a = {
                    name: item.option_value,
                    value: item.option_no
                  }
                  return a
                })
                return inputData
              }
            }
            break;
          case "date":
            inputData.type = "picker-date"
            if (item.item_type_attr.hasOwnProperty("format")) {
              if (item.item_type_attr.format === 'date') {
                inputData.mode = "picker-date"
              } else if (item.item_type_attr.format === 'time') {
                inputData.mode = "picker-time"
              } else if (item.item_type_attr.format === 'datetime') {
                inputData.mode = "picker-datetime"
              }
            }
            return inputData
            break;
          case "number":
            inputData.type = "input"
            inputData.inputType = "number"
            if (item.item_type_attr.hasOwnProperty("decimal_places")) {
              if (item.item_type_attr.decimal_places === "decimal") {
                inputData.verifyType = "Number"
                inputData.filterType = "twoDecimalPlaces"
              } else if (item.item_type_attr.decimal_places === "Int") {
                inputData.verifyType = "Int"
              }
            }
            return inputData
            break;
          case "image":
            if (item.item_type_attr.hasOwnProperty("max_num")) {
              inputData.type = "infinitePics"
              inputData.max = item.item_type_attr.max_num
              return inputData
            }
            break;
          default:
            return inputData
        }
      })
      return inputsDatas
    }
    // eval 替代方案
    Vue.prototype.evalInTo = function(e, q) {
        let item = q
        let exp = e.isShowExp
        let showExp = false
        let isShowNum = 0
        if (exp && exp.length > 0) {

          for (let i = 0; i < exp.length; i++) {
            if (exp[i].type === 'eq') {
              if (item[exp[i].column] === exp[i].value) {
                isShowNum++
              }
            } else if (exp[i].type === 'neq') {
              if (item[exp[i].column] !== exp[i].value) {
                isShowNum++
              }
            }
          }
          return exp.length === isShowNum
        } else {
          return true
        }
      },
      /**
       * 是否显示item
       * @param {Object} e 
       * @param {Object} q 
       */
      Vue.prototype.colItemShowExps = function(e, q) {
        let data = e
        let obj = q
        let exp = e.isShowExp
        let showExp = false
        let isShowNum = 0
        if (exp && exp.length > 0) {
          exp.forEach(item => {
            if (item.ruleType === 'eq') {
              if (obj[item.colName] === item.value) {
                isShowNum++
              }
            } else if (item.ruleType === 'neq') {

              if (obj[item.colName] !== item.value) {
                isShowNum++
              }
            }
          })
          return exp.length === isShowNum
        } else {
          return true
        }
      }
    // 获取图片路径
    Vue.prototype.getFilePath = async function(e) {
      let url = Vue.prototype.getServiceUrl('file', 'srvfile_attachment_select', 'select')
      let req = {
        "serviceName": "srvfile_attachment_select",
        "colNames": ["*"],
        "condition": [{
          "colName": "file_no",
          "value": e,
          "ruleType": "in",
        }, {
          "colName": "is_delete",
          "value": "1",
          "ruleType": "eq",
        }, ]
      }
      if (e) {
        let response = await this.$http.post(url, req);
        console.log('srvfile_attachment_select', response);
        if (response.data.state === 'SUCCESS' && response.data.data.length > 0) {
          return response.data.data
        }
      }
      // http://srvms.100xsys.cn/file/select/srvfile_attachment_select?srvfile_attachment_select
    }
    Vue.prototype.getDayDate = function(e) {
      if (e) {
        var date = new Date(e);
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
      } else {
        var date = new Date();
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
      }
    }
    Vue.prototype.getResData = function(e) {
      if (e.length > 0) {
        return e[0].response.effect_data[0]
      }
    }
    Vue.prototype.setWxUserInfo = async function(e) {
      let userInfo = JSON.parse(e)
      console.log("setWxUserInfo", userInfo)
      let url = Vue.prototype.getServiceUrl('wx', 'srvwx_basic_user_info_save', 'operate')
      let req = [{
        "serviceName": "srvwx_basic_user_info_save",
        "data": [{
            "app_no": "APPNO20200107181133",
            "nickname": userInfo.nickname,
            "sex": userInfo.sex,
            "country": userInfo.country,
            "province": userInfo.province,
            "city": userInfo.city,
            "headimgurl": userInfo.headimgurl
          }

        ],
      }]
      if (e) {
        let response = await this.$http.post(url, req);
        console.log('srvfile_attachment_select', response);
        if (response.data.state === 'SUCCESS' && response.data.data.length > 0) {
          return response.data.data
        }
      }
    }
    Vue.prototype.isInvalid = function(e) {
      if (e === '' || e === null || e === undefined) {
        return false
      } else {
        return true
      }
    }
    Vue.prototype.arraySort = function(arr, col) {
      var compare = function(prop) {
        return function(obj1, obj2) {
          var val1 = obj1[prop];
          var val2 = obj2[prop];
          if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
            val1 = Number(val1);
            val2 = Number(val2);
          }
          if (val1 < val2) {
            return -1;
          } else if (val1 > val2) {
            return 1;
          } else {
            return 0;
          }
        }
      }
      return arr.sort(compare(col))
    }
    Vue.prototype.judgeClientEnviroment = function() {
      let client_env = '';
      // #ifdef H5
      const isWeixin = Vue.prototype.isWeixinClient();
      // console.log('isWeixin', isWeixin);
      client_env = isWeixin ? 'wxh5' : 'web';

      // #endif
      // #ifdef MP-WEIXIN
      client_env = 'wxmp';
      //#endif
      // #ifdef APP-PLUS
      client_env = 'app';
      // #endif
      let client_type = '';
      switch (uni.getSystemInfoSync().platform) {
        case 'android':
          // console.log('运行Android上');
          client_type = 'android';
          break;
        case 'ios':
          // console.log('运行iOS上');
          client_type = 'ios';
          break;
        default:
          client_type = 'web';
      }
      uni.setStorageSync('client_env', client_env);
      uni.setStorageSync('client_type', client_type);
    }
    Vue.prototype.getDecodeUrl = function(e) {
      if (Vue.prototype.isInvalid(e)) {
        let url = decodeURIComponent(e)
        console.log('getDecodeUrl 01', url)
        if (url.indexOf("%") !== -1) {
          console.log('getDecodeUrl 02', url)
          url = decodeURIComponent(e)
          Vue.prototype.getDecodeUrl(url)
        } else {
          console.log('getDecodeUrl 03', url)
          return url
        }
      } else {
        return false
      }
    }
    Vue.prototype.iObject = function(e) {
      if (e) {
        return Object.prototype.toString.call(e) === "[object Object]"
      } else {
        return false
      }
    }
    Vue.prototype.iArray = function(e) {
      if (e) {
        // return Array.isArray(e)
        return Object.prototype.toString.call(e) === "[object Array]"
      } else {
        return false
      }
    }
    Vue.prototype.isArray = function(e) {
      return Array.isArray(e)
    }
    Vue.prototype.setCodeUrl = function(obj) {
      if (obj) {
        let url = ""
        for (let key in obj) {
          url += ("&" + key + "=" + (Vue.prototype.iObject(obj[key]) || Vue.prototype.iArray(obj[key]) ?
            encodeURIComponent(JSON.stringify(obj[key])) : encodeURIComponent(obj[key])))
        }
        return url
      } else {
        return false
      }
    }
    Vue.prototype.setFieldsDefaultVal = function(field, values, disabled) {
      if (Vue.prototype.iArray(field) && Vue.prototype.iObject(values)) {
        for (let i = 0; i < field.length; i++) {
          for (let key in values) {
            if (field[i].column === key) {
              field[i].value = values[key]
              field[i].defaultValue = values[key]
              if (disabled && disabled === true) {
                field[i].disabled = true
              }
              if (values.hasOwnProperty(`_${key}_disp`)) {
                field[i].valueForDisplay = values[`_${key}_disp`]
              }
            }
          }
        }
        return field
      } else {
        return false
      }
    }
    Vue.prototype.onButtonRequest = function(e) {
      let btn, row, condition, defaultVal
      if (e && Vue.prototype.iObject(e) && e.hasOwnProperty("button")) {
        btn = e.button
        let params = {
          "type": "update",
          "condition": [{
            "colName": "id",
            "ruleType": "in",
            "value": e.hasOwnProperty("row") ? e.row.id : null
          }],
          "serviceName": btn.service_name,
          "defaultVal": null
        }
        switch (btn.button_type) {
          case "edit":
            if (e.hasOwnProperty("row")) {
              row = e.row
              let params = {
                "type": "update",
                "condition": [{
                  "colName": "id",
                  "ruleType": "in",
                  "value": row.id
                }],
                "serviceName": btn.service_name,
                "defaultVal": row
              }
              console.log("点击了【有效】的公共编辑按钮", row)
              uni.navigateTo({
                url: "/pages/public/formPage/formPage?params=" + JSON.stringify(params)
              })
            } else {
              console.log("点击了【无效】的公共编辑按钮")
            }
            //代码块
            break;
          case "delete":
            return new Promise((resolve, reject) => {
              uni.showModal({
                content: "是否确认删除操作？",
                success: function(res) {
                  if (res.confirm) {
                    console.log('用户点击确定');
                    let req = [{
                      "serviceName": params.serviceName,
                      "colNames": ["*"],
                      "condition": params.condition
                    }]
                    Vue.prototype.onRequest("delete", params.serviceName,
                      req).then((res) => {
                      if (res.data.state === "SUCCESS") {

                        resolve(res.data)
                        // uni.showToast({
                        // 	title:e.button.button_name
                        // })
                      } else {
                        reject(res.data)
                      }

                    })
                  } else if (res.cancel) {
                    resolve('用户点击取消')
                  }
                }
              })
            })
            //代码块
            break;
          case "add":
            //代码块
            break;
          default:
            //默认代码块
        }
      }
    }
    /**
     * 按钮跳转的统一处理
     * 
     */
    Vue.prototype.onButtonToUrl = function(e) {
      console.log("onButtonToUrl", e)
      let btn, row, condition, defaultVal
      if (e && Vue.prototype.iObject(e)) {
        btn = e.button
        if (btn.is_public) {
          switch (btn.button_type) {
            // 流程详情
            case "procdetail":
              if (e.row && e.row.proc_instance_no) {
                uni.navigateTo({
                  url: '/pages/public/proc/procDetail/procDetail?proc_instance_no=' + e
                    .row.proc_instance_no
                })
              }
              break;
            case "edit":
              if (e.hasOwnProperty("row")) {
                row = e.row

                let params = {
                  "type": "update",
                  "condition": [{
                    "colName": "id",
                    "ruleType": "in",
                    "value": row.id
                  }],
                  "serviceName": btn.service_name,
                  "defaultVal": row
                }
                console.log("点击了【有效】的公共编辑按钮", row)
                uni.navigateTo({
                  url: "/pages/public/formPage/formPage?params=" + JSON.stringify(params)
                })
              } else {
                console.log("点击了【无效】的公共编辑按钮")
              }
              return new Promise((resolve, reject) => {
                resolve("跳转")
              })
              //代码块
              break;
            case "delete":
              return new Promise((resolve, reject) => {
                Vue.prototype.onButtonRequest(e).then((res) => {
                  if (res) {
                    resolve(res)
                    // uni.showToast({
                    // 	title:e.button.button_name
                    // })
                  } else {
                    reject(res)
                  }
                })
              })
              //代码块
              break;
            case "add":
              //代码块
              return new Promise((resolve, reject) => {
                resolve(e)
              })
              break;
            case "detail":
              return new Promise((resolve, reject) => {
                resolve(e)
              })
              break;
            default:
              return new Promise((resolve, reject) => {
                resolve(e)
              })
              //默认代码块
          }
        } else {
          switch (btn.button_type) {
            case "detail":
              if (e.hasOwnProperty("row")) {
                row = e.row
                let params = {
                  "type": "detail",
                  "condition": [{
                    "colName": "id",
                    "ruleType": "in",
                    "value": row.id
                  }],
                  "serviceName": btn.service_name,
                  "defaultVal": row
                }
                console.log("点击了【有效】的公共编辑按钮", row)
                uni.navigateTo({
                  url: "/pages/public/formPage/formPage?params=" + JSON.stringify(params)
                })

              } else {
                console.log("点击了【无效】的公共编辑按钮")
                return new Promise((resolve, reject) => {
                  resolve(e)
                })
              }

              break;
            case "delete":
              //代码块
              break;
            case "add":
              //代码块
              break;
            default:
              //默认代码块
          }
        }
        return new Promise((resolve, reject) => {
          resolve(e)
        })
        console.log("btn", btn)
      } else {
        uni.showToast({
          title: "参数错误"
        })
      }

    }

    Vue.prototype.renderStr = (str, obj) => {
      if (typeof obj === 'object' && str) {
        str = str.replace(/\$\{(.*?)\}/g, (match, key) => {
          key = key.trim()
          let result = obj[key]
          if (key === 'today') {
            result = dayjs().format("YYYY-MM-DD")
          }
          let arr = key.split('.')
          if (arr.length > 1) {
            result = obj
            arr.forEach(item => {
              try {
                result = result[item] ?? '';
                if (result === 0) {
                  result = '0'
                }
              } catch (e) {
                //TODO handle the exception
              }
            })
          }
          return result
        })
      }
      return str
    }


    Vue.prototype.strReplace = function(str, before, after) {
      console.log(str, before, after)
      if (str && before) {
        let a = before
        return str.replace(/[a]/g, after)
      } else {
        return false
      }
    }
    Vue.prototype.html2text = (str) => {
      return str.replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, '').replace(/<[^>]+?>/g, '')
        .replace(
          /\s+/g, ' ').replace(/ /g, ' ').replace(/>/g, ' ')
    }
    Vue.prototype.money2zh = (money) => {
      //汉字的数字
      let cnNums = new Array('零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖');
      //基本单位
      let cnIntRadice = new Array('', '拾', '佰', '仟');
      //对应整数部分扩展单位
      let cnIntUnits = new Array('', '万', '亿', '兆');
      //对应小数部分单位
      let cnDecUnits = new Array('角', '分', '毫', '厘');
      //整数金额时后面跟的字符
      let cnInteger = '整';
      //整型完以后的单位
      let cnIntLast = '元';
      //最大处理的数字
      let maxNum = 999999999999999.9999;
      //金额整数部分
      let integerNum;
      //金额小数部分
      let decimalNum;
      //输出的中文金额字符串
      let chineseStr = '';
      //分离金额后用的数组，预定义
      let parts;


      if (money == '') {
        return '';
      }
      money = parseFloat(money);
      if (money >= maxNum) {
        //超出最大处理数字
        return '';
      }
      if (money == 0) {
        chineseStr = cnNums[0] + cnIntLast + cnInteger;
        return chineseStr;
      }
      //转换为字符串
      money = money.toString();
      if (money.indexOf('.') == -1) {
        integerNum = money;
        decimalNum = '';
      } else {
        parts = money.split('.');
        integerNum = parts[0];
        decimalNum = parts[1].substr(0, 4);
      }

      //获取整型部分转换
      if (parseInt(integerNum, 10) > 0) {
        let zeroCount = 0;
        let IntLen = integerNum.length;
        for (let i = 0; i < IntLen; i++) {
          let n = integerNum.substr(i, 1);
          let p = IntLen - i - 1;
          let q = p / 4;
          let m = p % 4;
          if (n == '0') {
            zeroCount++;
          } else {
            if (zeroCount > 0) {
              chineseStr += cnNums[0];
            }
            //归零
            zeroCount = 0;
            chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
          }
          if (m == 0 && zeroCount < 4) {
            chineseStr += cnIntUnits[q];
          }
        }
        chineseStr += cnIntLast;
      }

      //小数部分
      if (decimalNum != '') {
        let decLen = decimalNum.length;
        for (let i = 0; i < decLen; i++) {
          let n = decimalNum.substr(i, 1);
          if (n != '0') {
            chineseStr += cnNums[Number(n)] + cnDecUnits[i];
          }
        }
      }
      if (chineseStr == '') {
        chineseStr += cnNums[0] + cnIntLast + cnInteger;
      } else if (decimalNum == '') {
        chineseStr += cnInteger;
      }
      return chineseStr;
    }
  }
}
