package com.segmentfault.openapi.wechat.controller;


import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.segmentfault.common.core.controller.BaseController;
import com.segmentfault.common.core.domain.AjaxResult;
import com.segmentfault.openapi.wechat.domain.WechatUserinfo;
import com.segmentfault.openapi.wechat.service.IWechatService;
/**
 * 
　 * <p>Title: WechatController</p>
　 * <p>Description:微信相关接口 </p>
　 * @author chenshuwei
　 * @date 2020年5月8日
 */
@Controller
@RequestMapping("/openapi/wechat")
public class WechatController extends BaseController
{
	 @Autowired
	 private IWechatService wechatService;
	 
	/**
	 * 
	<p>*方法名:getToken</p>
	<p>*方法说明:获取微信token</p>
	 *@return
	 */
	@RequestMapping(value = "gettoken", method = { RequestMethod.GET,
			RequestMethod.POST })
	@ResponseBody
	public AjaxResult getToken() {
		return wechatService.getToken();
	}
	
	
	/**
	 * 
	<p>*方法名:authorize</p>
	<p>*方法说明:网页授权</p>
	 *@param request
	 *@return
	 */
	@RequestMapping(value = "h5index", method = { RequestMethod.GET,
			RequestMethod.POST })
	
	public void authorize(HttpServletRequest request,HttpServletResponse response,@CookieValue(value="cookie_openid", required=false)  String cookie_openid) {
		  wechatService.authorize(request,response,cookie_openid);
	}
	
	/**
	 * 
	<p>*方法名:getUserInfo</p>
	<p>*方法说明:获取用户信息，配合authorize方法一起使用</p>
	 *@param request
	 *@param response
	 *@param cookie_openid
	 * @throws JsonProcessingException 
	 */
	@RequestMapping(value = "getuserinfo", method = { RequestMethod.GET,
			RequestMethod.POST })
	public void getUserInfo(HttpServletRequest request,HttpServletResponse response,@CookieValue(value="cookie_openid", required=false)  String cookie_openid) throws JsonProcessingException {
		   wechatService.getUserInfo(request,response,cookie_openid);
		
	}
	
	/**
	 * 
	<p>*方法名:signature</p>
	<p>*方法说明:js-sdk签名</p>
	 *@param request
	 *@param response
	 *@param cookie_openid
	 *@return
	 */
	@RequestMapping(value = "signature", method = { RequestMethod.GET,
			RequestMethod.POST })
	@ResponseBody
	public AjaxResult signature(HttpServletRequest request,HttpServletResponse response) {
		return wechatService.signature(request,response);
	}
    
	
	
	
	
	
	/***********************测试方法************************************/
	
	
	@RequestMapping(value = "clean", method = { RequestMethod.GET,
			RequestMethod.POST })
	@ResponseBody
	public void clean(HttpServletRequest request,HttpServletResponse response) {
		  wechatService.clean(request,response);
	}
	
	
	@RequestMapping(value = "putcookie", method = { RequestMethod.GET,
			RequestMethod.POST })
	@ResponseBody
	public void putcookie(HttpServletRequest request,HttpServletResponse response) {
		  wechatService.putcookie(request,response);
	}
	
	/*
	 * @GetMapping("h5index") public String goIndex() { return "/h5index"; }
	 */
	
    
    @GetMapping("gogameurl")
    public String goGameurl(HttpServletRequest request,HttpServletResponse response) throws IOException
    {	// 获取session中所有的键值  
    	WechatUserinfo wechatUserinfo=(WechatUserinfo) request.getSession().getAttribute("user");   
    	if(wechatUserinfo==null) {
    		response.sendRedirect("https://xwfintech.qingke.io/openapi/wechat/h5index");
    		return null;
    	}
    	return "gameurl";
    	//return	wechatService.goGameurl();
    }
}
