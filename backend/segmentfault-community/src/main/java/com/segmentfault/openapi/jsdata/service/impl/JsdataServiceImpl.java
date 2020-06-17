package com.segmentfault.openapi.jsdata.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.segmentfault.common.utils.StringUtils;
import com.segmentfault.openapi.jsdata.domain.Jsdata;
import com.segmentfault.openapi.jsdata.mapper.JsdataMapper;
import com.segmentfault.openapi.jsdata.service.IJsdataService;

@Service
public class JsdataServiceImpl implements IJsdataService {

	@Autowired
	private JsdataMapper jsdataMapper;

	@Override
	public int insert(Jsdata jsdata) {
		jsdata.setId(StringUtils.uuid());
		return jsdataMapper.insert(jsdata);
	}
	


}
