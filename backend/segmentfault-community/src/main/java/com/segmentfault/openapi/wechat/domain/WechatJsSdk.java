package com.segmentfault.openapi.wechat.domain;

import lombok.Data;

/**
 * 微信相关接口对象 twechat_token
 * 
 * @author segmentfault
 * @date 2020-05-08
 */
@Data
public class WechatJsSdk
{
    private String	appid;//微信appid
    private String	timestamp;//时间戳
    private String	noncestr;// 随机字符串
    private String	signature;//签名
    private String[] jsApiList;//jssdk需要的接口相关

}
