package com.segmentfault.openapi.pinball.controller;

import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.segmentfault.common.core.controller.BaseController;
import com.segmentfault.common.core.domain.AjaxResult;
import com.segmentfault.common.core.page.TableDataInfo;
import com.segmentfault.common.utils.StringUtils;
import com.segmentfault.openapi.pinball.domain.Pinball;
import com.segmentfault.openapi.pinball.service.IPinballService;

@Controller
@RequestMapping("/openapi/pinball")
public class PinballController extends BaseController{
	
	@Autowired
    private IPinballService pinballService;
    
    /**
     * 存分数 MD5加密方式 简单版(没有session，验证参数只有key，timestamp,sign，没有secret)
     * @param pinball
     * @return
     */
    @RequestMapping(value="/add/measy",method= {RequestMethod.GET,RequestMethod.POST})
    @ResponseBody
    public AjaxResult addSaveMD5Easy(Pinball pinball,@CookieValue(value="cookie_openid", required=false)String cookie_openid,HttpServletResponse response){
    	if (StringUtils.isNotEmpty(cookie_openid)) {
    		pinball.setOpenid(cookie_openid);
    	}
    	//response.setHeader("Access-Control-Allow-Origin", "*");
    	return  pinballService.insertMD5Easy(pinball);
    	//System.out.println("返回信息："+ajaxResult.toString());
		//return ajaxResult;
    }
    
    /**
     * 查询排行榜
     */
    @RequestMapping(value="list",method= {RequestMethod.GET,RequestMethod.POST})
    @ResponseBody
    public TableDataInfo list(Pinball pinball,HttpServletResponse response){
        startPageNew(1, 10);
        List<Pinball> list = pinballService.selectPinballList(pinball);
        //response.setHeader("Access-Control-Allow-Origin", "*");
        return getDataTable(list);
    }
    
}
