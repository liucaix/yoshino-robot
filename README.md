# yoshino-robot
一个可自定义，开箱即用的任务DDL提醒QQ机器人。


### step1 安装相关依赖
`npm install -g typescript`
`npm install -g ts-node`
### step2 配置
在config文件夹中新建config.ts,
配置如下:
``` 
export const config = {
    //账号
    account:123456789,
    //密码
    password:"123456789",
    //机器人发送目标
    target:[123456,12345678]
}
```
### step3 启动程序
`ts-node app.ts`
