package com.segmentfault.openapi.wechat.service;

import com.segmentfault.openapi.wechat.domain.WechatUserinfo;

public interface IWechatUserinfoService {

	WechatUserinfo getByOpenid(String openid);

}
