package com.segmentfault.openapi.statistics.controller;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.segmentfault.common.core.controller.BaseController;
import com.segmentfault.common.core.domain.AjaxResult;
import com.segmentfault.openapi.statistics.domain.Statistics;
import com.segmentfault.openapi.statistics.service.IStatisticsService;

@RestController
@RequestMapping("/openapi/statistics")
public class StatisticsController extends BaseController{

	@Autowired
	private IStatisticsService statisticsService;
	
	@RequestMapping(value="add",method= {RequestMethod.GET,RequestMethod.POST})
	@CrossOrigin
	public AjaxResult add(Statistics statistics,HttpServletResponse response) {
		response.setHeader("Access-Control-Allow-Origin", "*");
		return toAjax(statisticsService.insert(statistics));
	}
	
}
