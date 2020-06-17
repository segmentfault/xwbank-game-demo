package com.segmentfault.openapi.jsdata.domain;

import org.apache.commons.beanutils.BeanUtils;

import lombok.Data;

@Data
public class JsdataJson {
	
	private String id;
	
	private String domain;
	private String uid;
	
	private Object web;
	private Object performance;
	private Object device;
	
	public Jsdata toJsdata(JsdataJson jsdataJson) {
		Jsdata jsdata = new Jsdata();
		jsdata.setId(jsdataJson.getId());
		jsdata.setUid(jsdataJson.getUid());
		jsdata.setDomain(jsdataJson.getDomain());
		try {
			BeanUtils.copyProperties(jsdata,jsdataJson.getWeb());
			BeanUtils.copyProperties(jsdata,jsdataJson.getDevice());
			BeanUtils.copyProperties(jsdata,jsdataJson.getPerformance());
		} catch (Exception e) {
			e.printStackTrace();
		} 
		return jsdata;
	}
	
}
