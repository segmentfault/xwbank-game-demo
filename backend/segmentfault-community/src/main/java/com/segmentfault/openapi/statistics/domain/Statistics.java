package com.segmentfault.openapi.statistics.domain;

import lombok.Data;

@Data
public class Statistics {

	private String id;
	//参赛队伍id
	private String teamId;
	//加载时长
	private String loadTime;
	//接口名称
	private String interfaceName;
	//接口响应时长
	private String responseTime;
	//游戏帧数
	private String fps;
	//页面加载数量
	private String pv;
	//设备数
	private String uv;
	//浏览量
	private String pageviews;
	//注册量
	private String registrations;
	//游戏时长
	private String playTime;
	//创建时间
	private String createTime;
	//微信openid
	private String openid;
}
