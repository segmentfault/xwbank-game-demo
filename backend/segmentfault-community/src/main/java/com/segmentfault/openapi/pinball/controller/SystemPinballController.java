package com.segmentfault.openapi.pinball.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.segmentfault.common.core.controller.BaseController;
import com.segmentfault.common.core.page.TableDataInfo;
import com.segmentfault.openapi.pinball.domain.Pinball;
import com.segmentfault.openapi.pinball.service.IPinballService;
import com.segmentfault.openapi.wechat.domain.WechatUserinfo;
import com.segmentfault.openapi.wechat.service.IWechatUserinfoService;

@Controller
@RequestMapping("/openapi")
public class SystemPinballController extends BaseController{

	@Autowired
	private IPinballService pinballService;
	@Autowired
	private IWechatUserinfoService wechatUserinfoService;
	
    @GetMapping("goUserList")
    public String goUserList() {   
    	return "system/wechatuser/user";
    }
    
    @RequestMapping("user/list")
    @ResponseBody
    public TableDataInfo getUserList(WechatUserinfo user){
    	startPageNew(1,10);
        List<WechatUserinfo> list = pinballService.listOfWechatUserinfo(user);
    	return getDataTable(list);
    }
    
    @GetMapping("/editUser/{openid}")
    public String editUser(@PathVariable("openid") String openid, ModelMap mmap) {   
    	WechatUserinfo user = wechatUserinfoService.getByOpenid(openid);
        mmap.put("user", user);
    	return "system/wechatuser/edit";
    }
    
    @GetMapping("goScoreList")
    public String goScoreList() {   
    	return "system/score/score";
    }
    
    @RequestMapping("score/list")
    @ResponseBody
    public TableDataInfo getScoreList(Pinball pinball){
    	startPageNew(1, 10);
        List<Pinball> list = pinballService.selectPinballList(pinball);
    	return getDataTable(list);
    }
    
}
