package com.segmentfault.openapi.pinball.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.segmentfault.openapi.pinball.domain.Pinball;

public interface PinballMapper {
	
	Integer insertPinball(Pinball pinball);
	
	List<Pinball> list(Pinball pinball);

	Pinball selectOneByOpenid(String openid);

	Integer updateScore(Pinball pinball);

	Integer countNoSelf(String openid);

	Integer countByScoreNoSelf(@Param("score")String score,@Param("openid") String openid);
	
}
