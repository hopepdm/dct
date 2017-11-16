#ThreePlatform
文件操作逻辑

上传压缩文件（大包）->.temp->解压到dist/proname(项目汉字拼音)->文物编辑界面的路径dist/proname/model/objfile/obj(设置了dist为静态文件目录),在页面需要加上proname/model/->
发布 /html文件生成到dist/proname/下,与model同级



### 启动：

`gulp`命令  ：启动node服务（自刷新），less编译，浏览器自刷新 （自刷新有问题，还是手动吧）

`nodemon app`:只启动node服务器（自刷新）

```javascript
// 配置文件

module.exports = {
    db: {
        url: 'mongodb://localhost/',//mongodb 地址
        port: '27017',//端口
        database: 'threePlatform'//数据库名称
    },
    app: {
        port: 3000//  node服务器端口号,自刷新服务也设置了代理（8080）,所以两个端口都可以访问
    }
};

```

部分api说明：
Model.update 更新修改器
`$inc`增减修改器，只对数字有效
Article.update({_id : id}, {$inc : {views : 1}})

//找到id=id，并且将 views递增，返回后的views为之前的views+1。ps：这个属性很有用，对数字直接进行增减。用于更新一些数字（如阅读数）很有用

`$set` 指定字段的值，这个字段不存在就创建它。可以是任何MondoDB支持的类型。

Article.update({_id : id}, {$set : {views : 51, title : '修改后的标题' ...}})
//更新后views为51,标题为'修改后的标题'

`$unset` 同上取反，删除一个字段
Article.update({views : 50}, {$unset : {views : 'remove'}})
//执行后: views字段不存在

save是一个实例方法，需要先new Model()来获取实例；

remove查找并删除，用法：
Model.remove(conditions, [callback])
Model.findByIdAndRemove(id, [options], [callback])
Model.findOneAndRemove(conditions, [options], [callback])

数组修改器:

`$push` 给一个键push一个数组成员,键不存在会创建

Model.update({’age’:22}, {’$push’:{’array’:10} } ); 执行后: 增加一个 array 键,类型为数组, 有一个成员 10

`$addToSet` 向数组中添加一个元素,如果存在就不添加

Model.update({’age’:22}, {’$addToSet’:{’array’:10} } ); 执行后: array中有10所以不会添加

`$each` 遍历数组, 和 $push 修改器配合可以插入多个值

Model.update({’age’:22}, {’$push’:{’array’:{’$each’: [1,2,3,4,5]}} } ); 执行后: array : [10,1,2,3,4,5]

`$pop` 向数组中尾部删除一个元素

Model.update({’age’:22}, {’$pop’:{’array’:1} } ); 执行后: array : [10,1,2,3,4] tips: 将1改成-1可以删除数组首部元素

`$pull` 向数组中删除指定元素

Model.update({’age’:22}, {’$pull’:{’array’:10} } ); 执行后: array : [1,2,3,4] 匹配到array中的10后将其删除


着色器类型会影响模型的表现

无shader时模型呈一片纯色区域，无区分度；PBR类型与matcap类型能表现模型表面的立体感，同时前者的着色方式有两种：光滑组和平滑组。


可调参数：
	常规变换
		旋转
		位置（标识世界坐标中心）
		复位
		模型亮度
		渲染背景（天空盒子）
		缩放级别（据说要绑定）
	灯光
		平行光
		环境光
	材质
		基础颜色
		反射
		光滑度（三者决定了材质的质地，是木材、石头、金属等质感）
		
		法线
		
		背面消隐（可选）
		
	控制面板动态可选
	指定模型导出标准，给定一个合适的面数与材质贴图的最大值，给工程部制定模型导出标准。
	（设想）多级贴图加载，避免高清贴图加载过慢导致的长时间显示模型网格
	（设想）内部视角、缩放手感、漫游播放、复位
	仰俯视等视图面板
		
目前（2017-10.30）存在的问题：首次操作无反应时，可能需要手动刷新。
							  为满足批量发布，需要初始化文件名和页面title。
							  批量发布和删除的ui设计。
							  修改模型状态交互，包含哪些参数及参数的继承。
							  
关于ajax请求status为cancel的解决方案
1、百度网上大部分回答是由于跨域的原因

2、本项目中遇到则是因为get/post请求无返回值，故而datatype无需设置，当设置为json 时就会出现cancel的情况。  另外一种是在get/post请求中没有在最后执行res.end()或者res.send()方法来结束请求，导致请求一直挂起直至超时取消。另外，我百度了下，datatype不设置时ajax会自动识别返回类型的，影响貌似不大。
3、另外百度也有说设置async为false或者timeout时间长一些，这些对本项目都没有用！！！


### 三维文物平台开发

##### log4js的使用

```javascript
log4js.configure(config)//配置
log4js.connectLogger(log4js.getLogger(name))//获取可以作为express中间件的实例
log4js.getLogger(name)//获取配置中 category为name的实例，然后就可以使用这个实例 eg:log.info
```

##### mongoose

```javascript
find({}) //查询所有结果
find({}).count() //查询结果数量
.limit(n)//数量为n的文档
.skip(n)//n后面的文档，就是跳过n前面的文档
```

##### moment

处理时间的中间件

##### multiparty

文件上传

```javascript
var multiparty = require('multiparty');
var form = new multiparty.Form(options);
form.parse(req,function(err,fields,fiels){
  //dosomething
})
```

文件压缩

```javascript
// create a file to stream archive data to.
var output = fs.createWriteStream(__dirname + '/example.zip');
var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
});
archive.pipe(output);

// append a file from stream
var file1 = __dirname + '/file1.txt';
archive.append(fs.createReadStream(file1), { name: 'file1.txt' });//这里的name表示最终在example.zip中的文件名,并且name不可省略

// append a file from string
archive.append('string cheese!', { name: 'file2.txt' });

// append a file from buffer
var buffer3 = new Buffer('buff it!');
archive.append(buffer3, { name: 'file3.txt' });

// append a file
archive.file('file1.txt', { name: 'file4.txt' });

// append files from a directory
archive.directory('./test/');//最终的目录为example.zip/example/test/some.txt

// finalize the archive (ie we are done appending files but streams have to finish yet)
archive.finalize();
```
##### RESTful风格api

```javascript
url:http://example/test/data
api:/upload/:name

url:http://example/data1/data2
api:/upload/:data1/:data2
```
##### 错误处理

express 有一个缺省错误处理，当发生错误，且没有指定错误处理句柄

会执行这个缺省的错误处理，此时后续的中间件都会被跳过，如果有自定义错误处理句柄

会执行这个错误处理句柄

404并不是一个错误，只是表示一个功能没有实现，相当于此时没有中间件会执行这个路由 ，就会跳到404的路由

在404处理中  没有返回，而是使用next(err)把错误传给了 错误处理句柄



##### module.exports 和exports

```javascript
var name = 'rainbow';
exports.name = name;
exports.sayName = function(){
  console.log(name);
}
// 给 exports 赋值相当于给 module.exports 这个空对象添加了两个属性，相当于：
var name = 'rainbow';
module.exports.name = name;
module.exports.sayName = function(){
  console.log(name);
}
```

在使用require时，得到的始终是module.exports（也可以说导出的始终是module.exports），而module.exports=exports   exports.xxx相当于给exports挂属性，也就是对module.exports挂属性，也就是对require得到的模块挂属性，而使用module.exports =xxx 就是直接让这个模块等于xxx



##### 

##### PM2

###### 安装

`npm install pm2 -g`

###### 使用

`pm2 start app.js`

在express项目中，这里需要使用 `pm2 start ./bin/www`

###### 使用文件配置的方式

新建一个配置文件，配置文件可以使用多种格式。PM2 内置一个新建js格式配置文件的命令

`pm2 ecosystem`

使用这个命令会自动生成一个 `ecosystem.config.js`文件

```javascript
module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : "API",//名称
      script    : "app.js",//入口程序
      env: {
        COMMON_VARIABLE: "true"
      },
      env_production : {
        NODE_ENV: "production"
      }
    },

    // Second application
    {
      name      : "WEB",
      script    : "web.js"
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user : "node",
      host : "212.83.163.1",
      ref  : "origin/master",
      repo : "git@github.com:repo.git",
      path : "/var/www/production",
      "post-deploy" : "npm install && pm2 startOrRestart ecosystem.config.js --env production"
    },
    dev : {
      user : "node",
      host : "212.83.163.1",
      ref  : "origin/master",
      repo : "git@github.com:repo.git",
      path : "/var/www/development",
      "post-deploy" : "npm install && pm2 startOrRestart ecosystem.config.js --env dev",
      env  : {
        NODE_ENV: "dev"
      }
    }
  }
}
```

`json`格式的配置文件更好,新建一个 `process.json`文件

```json
{
  "apps" : [{
    "name"        : "worker",
    "script"      : "./worker.js",
    "watch"       : true,
    "env": {
      "NODE_ENV": "development"
    },
    "env_production" : {
       "NODE_ENV": "production"
    }
  },{
    "name"       : "api-app",
    "script"     : "./api.js",
    "instances"  : 4,
    "exec_mode"  : "cluster"
  }]
}
```

配置文件使用方法

`pm2 start process.json`

###### 代码更新

代码更新后使用 `pm2 reload` 重启 

reload可以做到0秒宕机加载新的代码，restart则是重新启动，生产环境中多用reload来完成代码更新！
							  