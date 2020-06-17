package com.segmentfault.openapi.wechat.domain;
import java.io.Serializable;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Data;

/**
 * 微信相关用户信息对象 twechat_userinfo
 * 
 * @author 陈树伟
 * @date 2020-05-08
 */
@Data
public class WechatUserinfo  implements Serializable 
{
	private static final long serialVersionUID = 1L;

	/** 用户openid */
    private String openid;

    /** 昵称 */
    private String nickname;

    /** 性别 */
    private String sex;

    /** 省份 */
    private String province;

    /** 市区 */
    private String city;

    /** 区 */
    private String country;

    /** 头像 */
    private String headimgurl;
    @JsonIgnore 
    /** 用户UnionID 唯一 */
    private String unionid;
    @JsonIgnore
    private String[]  privilege;
    @JsonIgnore
    private Date createtime;
    @JsonIgnore
    private Date  updatetime;

}
