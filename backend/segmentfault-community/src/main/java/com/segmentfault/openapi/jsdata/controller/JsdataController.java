package com.segmentfault.openapi.jsdata.controller;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.JsonObject;
import com.segmentfault.common.core.controller.BaseController;
import com.segmentfault.common.core.domain.AjaxResult;
import com.segmentfault.openapi.jsdata.controller.util.Aes;
import com.segmentfault.openapi.jsdata.domain.Jsdata;
import com.segmentfault.openapi.jsdata.domain.JsdataJson;
import com.segmentfault.openapi.jsdata.service.IJsdataService;

import net.sf.json.JSONObject;

@RestController
@RequestMapping("/openapi/jsdata")
public class JsdataController extends BaseController{

	@Autowired
	private IJsdataService jsdataService;
	
	@RequestMapping(value="add",method= {RequestMethod.POST})
	//@CrossOrigin
//	public AjaxResult add(String data,HttpServletResponse response) {
//		response.setHeader("Access-Control-Allow-Origin", "*");
//		
//		JsdataJson parseObject = JSONObject.parseObject(data,JsdataJson.class);
//		Jsdata jsdata = parseObject.toJsdata(parseObject);
//		
//		return toAjax(jsdataService.insert(jsdata));
//	}
	public AjaxResult add(@RequestBody JSONObject  jsondata,HttpServletResponse response) {
	//public AjaxResult add(@RequestBody JsdataJson jsdataJson,HttpServletResponse response) {
		//response.setHeader("Access-Control-Allow-Origin", "*");
		if(jsondata==null) {
			return AjaxResult.error();
		}
		String data=jsondata.getString("encrypted");
		data=Aes.aesDecrypt(data);//解密
		JSONObject jsonObject=JSONObject.fromObject(data);
		JsdataJson jsdataJson=(JsdataJson)JSONObject.toBean(jsonObject, JsdataJson.class);
		Jsdata jsdata = jsdataJson.toJsdata(jsdataJson);
		
		return toAjax(jsdataService.insert(jsdata));
	}
	
}