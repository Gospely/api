/**
 * Created by lilun on 14-10-19.
 * 说明：1 将本程序运行
 *      2 将https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx010a6c93bcd2c702&redirect_uri=http%3a%2f%2fnews.jiecao.fm%2f&response_type=code&scope=snsapi_login
 *        上述链接在微信mac客户端打开，注意（不要使用代理），点击登录，查看terminal的log信息。 或者微信中打开
 *      3 预期结果：得到个人信息：{"openid":"xx","nickname":"xx）","sex":2,"language":"zh_CN","city":"Haidian","province":"Beijing","country":"CN","headimgurl":"http:\/\/wx.qlogo.cn\/mmopen\/QnP43o1LG6zibu92OUh01tUDaNHPZayyMMB5emiaJl8WlOibqibADNkZicIOUVm6l9VTNm0KINnjkOziaiaxhHWMbd0OISHDaCxria1e\/0","privilege":[],"unionid":"o9B3Lt0-j9m-rTk4ISlwMbd9Ut_o"}
 * 其他： 可能会使用root权限运行
 */

var appId = 'wx48e0c6824ebf0d3a';
var secretKey= '4da6c51e080bc1fd7a17f6b51ceff345';
getWechatAuths(appId,secretKey)
