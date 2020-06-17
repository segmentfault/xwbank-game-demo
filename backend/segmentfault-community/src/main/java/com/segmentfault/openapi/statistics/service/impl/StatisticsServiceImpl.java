package com.segmentfault.openapi.statistics.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.segmentfault.common.utils.StringUtils;
import com.segmentfault.openapi.statistics.domain.Statistics;
import com.segmentfault.openapi.statistics.mapper.StatisticsMapper;
import com.segmentfault.openapi.statistics.service.IStatisticsService;

@Service
public class StatisticsServiceImpl implements IStatisticsService {

	@Autowired
	private StatisticsMapper statisticsMapper;
	
	@Override
	public int insert(Statistics statistics) {
		statistics.setId(StringUtils.uuid());
		return statisticsMapper.insert(statistics);
	}


}
