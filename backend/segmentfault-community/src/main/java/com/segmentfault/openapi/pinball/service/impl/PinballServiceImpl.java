package com.segmentfault.openapi.pinball.service.impl;

import java.io.UnsupportedEncodingException;
import java.lang.reflect.Field;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.segmentfault.common.core.domain.AjaxResult;
import com.segmentfault.common.core.domain.AjaxResult.Type;
import com.segmentfault.common.utils.DateUtils;
import com.segmentfault.common.utils.StringUtils;
import com.segmentfault.openapi.pinball.domain.Pinball;
import com.segmentfault.openapi.pinball.mapper.PinballMapper;
import com.segmentfault.openapi.pinball.service.IPinballService;
import com.segmentfault.openapi.wechat.domain.WechatUserinfo;
import com.segmentfault.openapi.wechat.mapper.WechatUserinfoMapper;

@Service
public class PinballServiceImpl implements IPinballService {

	@Autowired
	private PinballMapper pinballMapper;
	@Autowired
	private WechatUserinfoMapper wechatUserinfoMapper;

	@Override
	public List<Pinball> selectPinballList(Pinball pinball) {
		List<Pinball> list = pinballMapper.list(pinball);
		for (Pinball pinball2 : list) {
			String nickname=pinball2.getNickname();
			try {
				if (StringUtils.isNotEmpty(nickname)) {
					nickname = new  String(Base64.decodeBase64(nickname), "UTF-8");
				}
			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
			}
			pinball2.setNickname(nickname);
		}
		return list;
	}

	public String buildSignStr(Object object,String secret,String timestamp) {
		try {
			if (object == null) {
				return null;
			}
			Map<String, String> map = new HashMap<String, String>();
			List<String> keyList = new ArrayList<String>();
			for (Field field : object.getClass().getDeclaredFields()) {
				field.setAccessible(true);
				if (null != field.get(object)) {
					map.put(field.getName(), field.get(object).toString());
					keyList.add(field.getName());
				}
			}
			//生成签名时不需要以下几个参数
			List<String> removeList = new ArrayList<String>();
			removeList.add("key");
			removeList.add("secret");
//			removeList.add("timestamp");
			removeList.add("sign");
			keyList.removeAll(removeList);
			Collections.sort(keyList);
//			System.out.println(keyList);
			
			StringBuffer strBuffer = new StringBuffer();
			strBuffer.append(secret);
			keyList.forEach(i ->{
				if (null == map.get(i)) {
					return;
				}
				strBuffer.append(i).append(String.valueOf(map.get(i)));
			});
			
			strBuffer.append(timestamp);
			
			String md5DigestAsHex = DigestUtils.md5Hex(strBuffer.toString());//md5
			return md5DigestAsHex;
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		return null;
	}

	/**
	 * md5加密方式，简单版，无secret
	 */
	@Override
	public AjaxResult insertMD5Easy(Pinball pinball) {
		if("undefined".equals(pinball.getOpenid())){
			return AjaxResult.error("openid没有值,ruturn"); 
		}
		
		//查询排名
		Integer count1 = pinballMapper.countNoSelf(pinball.getOpenid());
		Integer count2 = pinballMapper.countByScoreNoSelf(pinball.getScore(),pinball.getOpenid());
		DecimalFormat df = new DecimalFormat("0.00");
		String rank="0%";
		if(count1==0) {
			rank="100%";
		}
		else {
			rank =df.format((double)count2*100/count1)+"%";
		}
		 
		
		// 分数未超过历史最高分，不计入排行榜
		Pinball one = pinballMapper.selectOneByOpenid(pinball.getOpenid());
		if (StringUtils.isNotNull(one) && StringUtils.isNotEmpty(one.getScore()) 
				&& StringUtils.isNotEmpty(pinball.getScore()) && Integer.valueOf(one.getScore()) >= Integer.valueOf(pinball.getScore())) {
			return new AjaxResult(Type.SUCCESS, "分数未超过历史最高分，不计入排行榜", rank);
		}
		
		// 验证签名 
		boolean b = isSignEasy(pinball); 
		if (!b) { 
			System.out.println("签名未通过");
			return AjaxResult.error("签名未通过"); 
		}
		
		pinball.setId(StringUtils.uuid());
		pinball.setCreateTime(DateUtils.getNowDate());
		Integer num = 0;
		if (StringUtils.isNull(one)) {
			num = pinballMapper.insertPinball(pinball);
		}else {
			num = pinballMapper.updateScore(pinball);
		}
		if (num>0) {
			System.out.println("分数更新成功");
			return new AjaxResult(Type.SUCCESS, "分数更新成功", rank);
		}else {
			System.out.println("分数失败");
			return AjaxResult.error();
		}
	}

	private boolean isSignEasy(Pinball pinball) {
		//验证sign  =md5（secret+排序后的参数）
		String sign = buildSignStrEasy(pinball,pinball.getKey(),pinball.getTimestamp());
		if (StringUtils.isEmpty(sign) || StringUtils.isEmpty(pinball.getSign()) || !sign.equalsIgnoreCase(pinball.getSign())) {
			System.out.println("签名未通过：sign");
			return false;
		}
		return true;
	}

	private String buildSignStrEasy(Object object,String key,String timestamp) {
		try {
			if (object == null) {
				return null;
			}
			Map<String, String> map = new HashMap<String, String>();
			List<String> keyList = new ArrayList<String>();
			for (Field field : object.getClass().getDeclaredFields()) {
				field.setAccessible(true);
				if (null != field.get(object)) {
					map.put(field.getName(), field.get(object).toString());
					keyList.add(field.getName());
				}
			}
			//生成签名时不需要以下几个参数
			List<String> removeList = new ArrayList<String>();
			removeList.add("serialVersionUID");
			removeList.add("key");
			removeList.add("secret");
			removeList.add("sign");
			removeList.add("timestamp");
//			removeList.add("openid");
			keyList.removeAll(removeList);
			Collections.sort(keyList);
			System.out.println(keyList);
			
			StringBuffer strBuffer = new StringBuffer();
			strBuffer.append(key);
			keyList.forEach(i ->{
				if (null == map.get(i)) {
					return;
				}
				strBuffer.append(i).append(String.valueOf(map.get(i)));
			});
			strBuffer.append(timestamp);
			String md5DigestAsHex = DigestUtils.md5Hex(strBuffer.toString());//md5
			return md5DigestAsHex.toUpperCase();
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		return null;
	}

	@Override
	public List<WechatUserinfo> listOfWechatUserinfo(WechatUserinfo user) {
		List<WechatUserinfo> list = wechatUserinfoMapper.listOfWechatUserinfo(user);
		for (WechatUserinfo userinfo : list) {
			String nickname = userinfo.getNickname();
			try {
				nickname =new String(Base64.decodeBase64(nickname),"utf-8");
			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
			}
			userinfo.setNickname(nickname);
		}
		return list;
	}
	
}
