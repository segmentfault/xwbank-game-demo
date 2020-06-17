package com.segmentfault.openapi.wechat.domain;

import lombok.Data;

/**
 * 微信相关接口对象 twechat_token
 * 
 * @author segmentfault
 * @date 2020-05-08
 */
@Data
public class WechatToken
{
    /** 微信access_token */
    private String access_token;

    /** 微信ticket */
    private String ticket;
}
