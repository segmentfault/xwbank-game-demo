package com.segmentfault.openapi.wechat.service.impl;

import java.io.UnsupportedEncodingException;

import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.segmentfault.openapi.wechat.domain.WechatUserinfo;
import com.segmentfault.openapi.wechat.mapper.WechatUserinfoMapper;
import com.segmentfault.openapi.wechat.service.IWechatUserinfoService;

@Service
public class WechatUserinfoImpl implements IWechatUserinfoService {

	@Autowired
	private WechatUserinfoMapper wechatUserinfoMapper;

	@Override
	public WechatUserinfo getByOpenid(String openid) {
		WechatUserinfo user = wechatUserinfoMapper.selectWechatUserinfoById(openid);
		String nickname = user.getNickname();
		try {
			nickname = new String(Base64.decodeBase64(nickname),"utf-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		user.setNickname(nickname);
		return user;
	}
	
	
}
