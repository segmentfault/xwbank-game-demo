package com.segmentfault.openapi.wechat.service;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.segmentfault.common.core.domain.AjaxResult;

/**
 * 
　 * <p>Title: IWechatService</p>
　 * <p>Description: 微信相关接口</p>
　 * @author chenshuwei
　 * @date 2020年5月9日
 */
public interface IWechatService 
{

	public AjaxResult getToken();

	public void authorize(HttpServletRequest request,HttpServletResponse response, String cookie_openid);

	public AjaxResult signature(HttpServletRequest request, HttpServletResponse response);

	public void  getUserInfo(HttpServletRequest request, HttpServletResponse response, String cookie_openid);

	public void clean(HttpServletRequest request, HttpServletResponse response);

	public String goGameurl();

	public void putcookie(HttpServletRequest request, HttpServletResponse response);
   

}
