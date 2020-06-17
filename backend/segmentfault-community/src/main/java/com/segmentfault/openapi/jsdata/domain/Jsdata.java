package com.segmentfault.openapi.jsdata.domain;

import lombok.Data;

@Data
public class Jsdata {

	private String id;
	
	private String domain;
	private String uid;
	
	//web
	private String url;
	private String referer;
	private String ua;
	
	//performance
	private Integer dns;
	private Integer tcp;
	private Integer white;
	private Integer dom;
	private Integer load;
	private Integer ready;
	private Integer redirect;
	private Integer unload;
	private Integer request;
	private Integer render;
	private Integer size;
	private Integer errors;
	
	//device
	private Integer w;
	private Integer h;
	private Integer pixel;
	private String gpu;
	
	private String createTime;

}