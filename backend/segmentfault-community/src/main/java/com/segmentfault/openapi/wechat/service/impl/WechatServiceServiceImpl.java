package com.segmentfault.openapi.wechat.service.impl;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.text.MessageFormat;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.segmentfault.common.core.domain.AjaxResult;
import com.segmentfault.common.utils.StringUtils;
import com.segmentfault.openapi.statistics.domain.Statistics;
import com.segmentfault.openapi.statistics.mapper.StatisticsMapper;
import com.segmentfault.openapi.util.HttpUtils;
import com.segmentfault.openapi.wechat.domain.WechatJsSdk;
import com.segmentfault.openapi.wechat.domain.WechatToken;
import com.segmentfault.openapi.wechat.domain.WechatUserinfo;
import com.segmentfault.openapi.wechat.mapper.WechatUserinfoMapper;
import com.segmentfault.openapi.wechat.service.IWechatService;

import net.sf.json.JSONObject;

/**
 * 
　 * <p>Title: WechatServiceServiceImpl</p>
　 * <p>Description:微信相关接口层处理 </p>
　 * @author chenshuwei
　 * @date 2020年5月8日
 */
@Service
public class WechatServiceServiceImpl implements IWechatService
{
	
	
	@Value("${wechat.host}")
	private String host;
	
	@Value("${wechat.gettoken}")
	private String gettoken;
	
	@Value("${wechat.authorize}")
	private String authorize;
	
	@Value("${wechat.signature}")
	private String signature;
	
	@Value("${wechat.type_urlencoded}")
	private String type_urlencoded;
	
	@Value("${wechat.redirect_uri}")
	private String redirect_uri;
	
	@Value("${wechat.snsapi_userinfo}")
	private String snsapi_userinfo;
	
	// 设置Cookie的过期时间，秒为单位
    @Value("${wechat.maxAge}")
    private int maxAge;

    //jsApiList列表
    //public  final static String[] jsApiList={"menuItem:share:appMessage","menuItem:share:timeline","menuItem:share:qq"};
    //public  final static String[] jsApiList={"chooseImage","previewImage","uploadImage","downloadImage","closeWindow"};
    public  final static String[] jsApiList={"onMenuShareTimeline","onMenuShareAppMessage","onMenuShareQQ","onMenuShareQZone"};

	@Autowired
	private WechatUserinfoMapper wechatUserinfoMapper;
	
	@Autowired
	private StatisticsMapper statisticsMapper;
	
	@Override
	public AjaxResult getToken() {
		String url=MessageFormat.format("{0}{1}", host, gettoken);
		Map<String,String> headers =new HashMap<String, String>();
		headers.put("Content-Type", type_urlencoded); 
		String  resultMessage=HttpUtils.getRequest(url);
		JSONObject json = JSONObject.fromObject(resultMessage);
		AjaxResult result=AjaxResult.success();
	try {
		WechatToken wechatToken=(WechatToken) JSONObject.toBean(json, WechatToken.class);
		result.put("info", wechatToken);
	} catch (Exception e) {
		result=AjaxResult.error();
		}
	return result;
	}
	
	
	@Override
	public void authorize(HttpServletRequest request,HttpServletResponse response,String cookie_openid) {
		//开始时间
		//long startTime = System.currentTimeMillis(); //获取开始时间

		if(StringUtils.isNotBlank(cookie_openid)) {//如果cookie中已经存储了openid，那么不需要再次调用微信接口，直接跳转到重定向页面
			WechatUserinfo  wechatUserinfo= wechatUserinfoMapper.selectWechatUserinfoById(cookie_openid);
			if(wechatUserinfo!=null) {
				String nickname = wechatUserinfo.getNickname();
				try {
				    //进行解码
				    nickname = new  String(Base64.decodeBase64(nickname), "UTF-8");
				    //空格问题，空格替换
				   // nickname=nickname.replaceAll(" ", "%20");
				    //编码后再传递
				   // nickname= URLEncoder.encode(nickname,"utf-8");
				} catch (UnsupportedEncodingException e) {
				    e.printStackTrace();
				}
				  wechatUserinfo.setNickname(nickname);
			  try {
					/*
					 * long endTime = System.currentTimeMillis(); //获取结束时间 long responsetime=
					 * endTime - startTime; //输出程序运行时间 Statistics statistics=new Statistics();
					 * statistics.setId(StringUtils.uuid()); statistics.setInterfaceName("开始游戏");
					 * statistics.setResponseTime(responsetime+"");
					 * statistics.setOpenid(wechatUserinfo.getOpenid());
					 * statisticsMapper.insert(statistics);
					 */
				
				request.getSession().setAttribute("user",wechatUserinfo);
				response.sendRedirect("https://xwfintech.qingke.io/openapi/wechat/gogameurl");
				return;
			} catch (IOException e) {
				} 
			}
		}
		//回调地址	redirect_uri	String		Y	授权后重定向的回调链接地址，请使用urlencode对链接进行处理
		//授权作用域	scope	String		Y	应用授权作用域，snsapi_base （不弹出授权页面，直接跳转，只能获取用户openid），snsapi_userinfo （弹出授权页面，可通过openid拿到昵称、性别、所在地。并且，即使在未关注的情况下，只要用户授权，也能获取其信息）
		String url=MessageFormat.format("{0}{1}?redirect_uri={2}&scope={3}", host, authorize,redirect_uri,snsapi_userinfo);
		try {
			response.sendRedirect(url);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		//jieshu
	}

	/**
	 * js-sdk
	 */
	@Override
	public AjaxResult signature(HttpServletRequest request, HttpServletResponse response) {
		//当前网页的URL	url	String		Y	当前网页的URL，不包含#及其后面部分
		//随机字符串	noncestr	String		N	生成签名的随机串
		//时间戳	timestamp	Int		N	生成签名的时间戳
	    String networkProtocol = request.getScheme();// 网络协议
	    String ServerName=request.getServerName();//服务器地址 
	    int ServerPort= request.getServerPort();//端口号   
	    String ContextPath=request.getContextPath();//项目名称  
	    String ServletPath=request.getServletPath();//请求页面或其他地址  
		String url=request.getParameter("url");
		url=StringUtils.isNotBlank(url)?url:
		MessageFormat.format("{0}{1}{2}{3}{4}",networkProtocol , ServerName,ServerPort,ContextPath,ServletPath);
		String apiurl=MessageFormat.format("{0}{1}", host, signature);
		Map<String,String> headers =new HashMap<String, String>();
		headers.put("Content-Type", type_urlencoded); 
		Map<String, Object> params=new HashMap<String, Object>();
		params.put("url", url);
		String  resultMessage=HttpUtils.getRequest(apiurl, headers, params);
		AjaxResult result=AjaxResult.success();
		try {
			JSONObject json = JSONObject.fromObject(resultMessage);
			WechatJsSdk wechatJsSdk=(WechatJsSdk) JSONObject.toBean(json, WechatJsSdk.class);
			wechatJsSdk.setJsApiList(jsApiList);
			result.put("jssdk", wechatJsSdk);
		} catch (Exception e) {
			result=AjaxResult.error();
		}
		return result;
	}


	@Override
	public void getUserInfo(HttpServletRequest request, HttpServletResponse response, String cookie_openid) {
		//开始时间
		//long startTime = System.currentTimeMillis(); //获取开始时间
		
		WechatUserinfo  wechatUserinfo=new WechatUserinfo();
		Cookie cookie = null;
		String user=null;
		//if(StringUtils.isBlank(cookie_openid)) {//只有首次openid是null应该是
			try {
				user=request.getParameter("user");
				JSONObject json = JSONObject.fromObject(user); 
				wechatUserinfo=(WechatUserinfo) JSONObject.toBean(json, WechatUserinfo.class); //openid 存cookie一下？ String
				String nickname=wechatUserinfo.getNickname();
				nickname=Base64.encodeBase64String(nickname.getBytes("UTF-8"));	
				wechatUserinfo.setNickname(nickname);
				WechatUserinfo  updatetwechatUserinfo=wechatUserinfoMapper.selectWechatUserinfoById(wechatUserinfo.getOpenid());
				if(updatetwechatUserinfo!=null) {//更新
					wechatUserinfoMapper.updateWechatUserinfo(wechatUserinfo); 
				}
				else {
					wechatUserinfoMapper.insertWechatUserinfo(wechatUserinfo);
				}
				//存cookie一下？ 
				if(StringUtils.isNotBlank(wechatUserinfo.getOpenid())) {
					cookie = new Cookie("cookie_openid", wechatUserinfo.getOpenid()); 
					cookie.setMaxAge(maxAge*24*60*60);// 设置为maxAge天 
					cookie.setPath("/");
					response.addCookie(cookie);
				}
				
			} catch (Exception e) {
				//如果存儲出現異常，不要放進cookie,下次訪問再存儲一次
				cookie.setMaxAge(0);// 馬上失效，下次重新获取
			}
		//}
		//else {
			//wechatUserinfo= wechatUserinfoMapper.selectWechatUserinfoById(cookie_openid);
		//}
		try {
			String nickname = wechatUserinfo.getNickname();
			try {
			    //进行解码
			    nickname = new  String(Base64.decodeBase64(nickname), "UTF-8");
				/*
				 * //空格问题，空格替换 nickname=nickname.replaceAll(" ", "%20"); //编码后再传递 nickname=
				 * URLEncoder.encode(nickname,"utf-8");
				 */
			} catch (UnsupportedEncodingException e) {
			    e.printStackTrace();
			}
			/*
			 * long endTime = System.currentTimeMillis(); //获取结束时间 long responsetime=
			 * endTime - startTime; //输出程序运行时间 Statistics statistics=new Statistics();
			 * statistics.setId(StringUtils.uuid()); statistics.setInterfaceName("开始游戏");
			 * statistics.setResponseTime(responsetime+"");
			 * statistics.setOpenid(wechatUserinfo.getOpenid());
			 * statisticsMapper.insert(statistics);
			 */
			
		    wechatUserinfo.setNickname(nickname);
			request.getSession().setAttribute("user",wechatUserinfo);
			response.sendRedirect("https://xwfintech.qingke.io/openapi/wechat/gogameurl");
		} catch (IOException e) {
		}
	}


	@Override
	public void  clean(HttpServletRequest request, HttpServletResponse response) {
		Cookie cookie = new Cookie("cookie_openid", null);
		cookie.setMaxAge(0);
		cookie.setPath("/");//根据你创建cookie的路径进行填写   
	    response.addCookie(cookie);   
	}


	@Override
	public String goGameurl() {
		return "gameurl";
	}
	
	public static void main(String[] args) throws UnsupportedEncodingException {
		System.out.println(Base64.encodeBase64String("三💪".getBytes("UTF-8")));	
		
		
		
	}


	@Override
	public void putcookie(HttpServletRequest request, HttpServletResponse response) {
		
		Cookie cookie = new Cookie("cookie_openid","o4HNR0TUaHxb5l1hxFuinuvYNu1c"); 
		cookie.setMaxAge(maxAge*24*60*60);// 设置为maxAge天 
		cookie.setPath("/");
		response.addCookie(cookie);
		
		
	}
}
