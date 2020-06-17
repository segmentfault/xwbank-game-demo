package com.segmentfault.openapi.pinball.service;

import java.util.List;

import com.segmentfault.common.core.domain.AjaxResult;
import com.segmentfault.openapi.pinball.domain.Pinball;
import com.segmentfault.openapi.wechat.domain.WechatUserinfo;

public interface IPinballService {

	List<Pinball> selectPinballList(Pinball pinball);
	
	AjaxResult insertMD5Easy(Pinball pinball);

	List<WechatUserinfo> listOfWechatUserinfo(WechatUserinfo user);

}
