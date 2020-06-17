package com.segmentfault.openapi.wechat.mapper;

import java.util.List;

import com.segmentfault.openapi.wechat.domain.WechatUserinfo;

/**
 * 微信相关用户信息Mapper接口
 * 
 * @author 陈树伟
 * @date 2020-05-08
 */
public interface WechatUserinfoMapper 
{
    /**
     * 查询微信相关用户信息
     * 
     * @param openid 微信相关用户信息ID
     * @return 微信相关用户信息
     */
    public WechatUserinfo selectWechatUserinfoById(String openid);

    /**
     * 新增微信相关用户信息
     * 
     * @param twechatUserinfo 微信相关用户信息
     * @return 结果
     */
    public int insertWechatUserinfo(WechatUserinfo wechatUserinfo);

    /**
     * 修改微信相关用户信息
     * 
     * @param twechatUserinfo 微信相关用户信息
     * @return 结果
     */
    public int updateWechatUserinfo(WechatUserinfo wechatUserinfo);

    /**
     * 查询微信用户分页信息
     * 
     * @param twechatUserinfo 微信相关用户信息
     * @return 结果
     */
	public List<WechatUserinfo> listOfWechatUserinfo(WechatUserinfo user);
}
