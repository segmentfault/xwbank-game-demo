package com.segmentfault.openapi.pinball.domain;

import java.io.Serializable;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Data;

@Data
public class Pinball implements Serializable{
	private static final long serialVersionUID = 1L;
	@JsonIgnore
	private String id;
	private String avatar;
	private String nickname;
	private String score;
	@JsonIgnore
	private Date createTime;
	@JsonIgnore
	private String openid;
	
	private String rank;//排名，超越百分之多少的人
	//key ,secret,timestamp，sign 都是MD5验证方式需要传递的参数
	@JsonIgnore
	private String key;
	@JsonIgnore
	private String secret;
	@JsonIgnore
	private String timestamp;
	@JsonIgnore
	private String sign;
}
