package com.segmentfault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

/**
 * 启动程序
 * 
 * @author segmentfault
 */
@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })
public class SegmentfaultApplication
{
    public static void main(String[] args)
    {
        // System.setProperty("spring.devtools.restart.enabled", "false");
        SpringApplication.run(SegmentfaultApplication.class, args);
        System.out.println("SegmentFault弹珠H5项目启动成功");
    }
}