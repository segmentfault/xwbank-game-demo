/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 50717
 Source Host           : localhost:3306
 Source Schema         : segmentfaulth5

 Target Server Type    : MySQL
 Target Server Version : 50717
 File Encoding         : 65001

 Date: 28/06/2020 09:19:42
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for sys_config
-- ----------------------------
DROP TABLE IF EXISTS `sys_config`;
CREATE TABLE `sys_config`  (
  `config_id` int(5) NOT NULL AUTO_INCREMENT COMMENT '参数主键',
  `config_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '参数名称',
  `config_key` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '参数键名',
  `config_value` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '参数键值',
  `config_type` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT 'N' COMMENT '系统内置（Y是 N否）',
  `create_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime(0) NULL DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`config_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 100 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '参数配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_config
-- ----------------------------
INSERT INTO `sys_config` VALUES (1, '主框架页-默认皮肤样式名称', 'sys.index.skinName', 'skin-blue', 'Y', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '蓝色 skin-blue、绿色 skin-green、紫色 skin-purple、红色 skin-red、黄色 skin-yellow');
INSERT INTO `sys_config` VALUES (2, '用户管理-账号初始密码', 'sys.user.initPassword', '123456', 'Y', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '初始化密码 123456');
INSERT INTO `sys_config` VALUES (3, '主框架页-侧边栏主题', 'sys.index.sideTheme', 'theme-dark', 'Y', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '深黑主题theme-dark，浅色主题theme-light，深蓝主题theme-blue');
INSERT INTO `sys_config` VALUES (4, '账号自助-是否开启用户注册功能', 'sys.account.registerUser', 'false', 'Y', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '是否开启注册用户功能');

-- ----------------------------
-- Table structure for sys_dept
-- ----------------------------
DROP TABLE IF EXISTS `sys_dept`;
CREATE TABLE `sys_dept`  (
  `dept_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '部门id',
  `parent_id` bigint(20) NULL DEFAULT 0 COMMENT '父部门id',
  `ancestors` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '祖级列表',
  `dept_name` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '部门名称',
  `order_num` int(4) NULL DEFAULT 0 COMMENT '显示顺序',
  `leader` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '负责人',
  `phone` varchar(11) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '联系电话',
  `email` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '邮箱',
  `status` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '0' COMMENT '部门状态（0正常 1停用）',
  `del_flag` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  `create_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime(0) NULL DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`dept_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 200 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '部门表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_dept
-- ----------------------------
INSERT INTO `sys_dept` VALUES (100, 0, '0', 'ry科技', 0, '若依', '15888888888', 'ry@qq.com', '0', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00');
INSERT INTO `sys_dept` VALUES (101, 100, '0,100', '深圳总公司', 1, '若依', '15888888888', 'ry@qq.com', '0', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00');
INSERT INTO `sys_dept` VALUES (102, 100, '0,100', '长沙分公司', 2, '若依', '15888888888', 'ry@qq.com', '0', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00');
INSERT INTO `sys_dept` VALUES (103, 101, '0,100,101', '研发部门', 1, '若依', '15888888888', 'ry@qq.com', '0', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00');
INSERT INTO `sys_dept` VALUES (104, 101, '0,100,101', '市场部门', 2, '若依', '15888888888', 'ry@qq.com', '0', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00');
INSERT INTO `sys_dept` VALUES (105, 101, '0,100,101', '测试部门', 3, '若依', '15888888888', 'ry@qq.com', '0', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00');
INSERT INTO `sys_dept` VALUES (106, 101, '0,100,101', '财务部门', 4, '若依', '15888888888', 'ry@qq.com', '0', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00');
INSERT INTO `sys_dept` VALUES (107, 101, '0,100,101', '运维部门', 5, '若依', '15888888888', 'ry@qq.com', '0', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00');
INSERT INTO `sys_dept` VALUES (108, 102, '0,100,102', '市场部门', 1, '若依', '15888888888', 'ry@qq.com', '0', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00');
INSERT INTO `sys_dept` VALUES (109, 102, '0,100,102', '财务部门', 2, '若依', '15888888888', 'ry@qq.com', '0', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00');

-- ----------------------------
-- Table structure for sys_dict_data
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict_data`;
CREATE TABLE `sys_dict_data`  (
  `dict_code` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '字典编码',
  `dict_sort` int(4) NULL DEFAULT 0 COMMENT '字典排序',
  `dict_label` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '字典标签',
  `dict_value` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '字典键值',
  `dict_type` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '字典类型',
  `css_class` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '样式属性（其他样式扩展）',
  `list_class` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '表格回显样式',
  `is_default` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT 'N' COMMENT '是否默认（Y是 N否）',
  `status` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `create_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime(0) NULL DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`dict_code`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 100 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '字典数据表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_dict_data
-- ----------------------------
INSERT INTO `sys_dict_data` VALUES (1, 1, '男', '1', 'sys_user_sex', '', '', 'Y', '0', 'admin', '2018-03-16 11:33:00', 'admin', '2020-05-22 16:54:16', '性别男');
INSERT INTO `sys_dict_data` VALUES (2, 2, '女', '2', 'sys_user_sex', '', '', 'N', '0', 'admin', '2018-03-16 11:33:00', 'admin', '2020-05-25 14:25:23', '性别女');
INSERT INTO `sys_dict_data` VALUES (3, 3, '未知', '0', 'sys_user_sex', '', '', 'N', '0', 'admin', '2018-03-16 11:33:00', 'admin', '2020-05-25 14:25:30', '性别未知');
INSERT INTO `sys_dict_data` VALUES (4, 1, '显示', '0', 'sys_show_hide', '', 'primary', 'Y', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '显示菜单');
INSERT INTO `sys_dict_data` VALUES (5, 2, '隐藏', '1', 'sys_show_hide', '', 'danger', 'N', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '隐藏菜单');
INSERT INTO `sys_dict_data` VALUES (6, 1, '正常', '0', 'sys_normal_disable', '', 'primary', 'Y', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '正常状态');
INSERT INTO `sys_dict_data` VALUES (7, 2, '停用', '1', 'sys_normal_disable', '', 'danger', 'N', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '停用状态');
INSERT INTO `sys_dict_data` VALUES (8, 1, '正常', '0', 'sys_job_status', '', 'primary', 'Y', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '正常状态');
INSERT INTO `sys_dict_data` VALUES (9, 2, '暂停', '1', 'sys_job_status', '', 'danger', 'N', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '停用状态');
INSERT INTO `sys_dict_data` VALUES (10, 1, '默认', 'DEFAULT', 'sys_job_group', '', '', 'Y', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '默认分组');
INSERT INTO `sys_dict_data` VALUES (11, 2, '系统', 'SYSTEM', 'sys_job_group', '', '', 'N', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '系统分组');
INSERT INTO `sys_dict_data` VALUES (12, 1, '是', 'Y', 'sys_yes_no', '', 'primary', 'Y', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '系统默认是');
INSERT INTO `sys_dict_data` VALUES (13, 2, '否', 'N', 'sys_yes_no', '', 'danger', 'N', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '系统默认否');
INSERT INTO `sys_dict_data` VALUES (14, 1, '通知', '1', 'sys_notice_type', '', 'warning', 'Y', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '通知');
INSERT INTO `sys_dict_data` VALUES (15, 2, '公告', '2', 'sys_notice_type', '', 'success', 'N', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '公告');
INSERT INTO `sys_dict_data` VALUES (16, 1, '正常', '0', 'sys_notice_status', '', 'primary', 'Y', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '正常状态');
INSERT INTO `sys_dict_data` VALUES (17, 2, '关闭', '1', 'sys_notice_status', '', 'danger', 'N', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '关闭状态');
INSERT INTO `sys_dict_data` VALUES (18, 99, '其他', '0', 'sys_oper_type', '', 'info', 'N', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '其他操作');
INSERT INTO `sys_dict_data` VALUES (19, 1, '新增', '1', 'sys_oper_type', '', 'info', 'N', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '新增操作');
INSERT INTO `sys_dict_data` VALUES (20, 2, '修改', '2', 'sys_oper_type', '', 'info', 'N', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '修改操作');
INSERT INTO `sys_dict_data` VALUES (21, 3, '删除', '3', 'sys_oper_type', '', 'danger', 'N', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '删除操作');
INSERT INTO `sys_dict_data` VALUES (22, 4, '授权', '4', 'sys_oper_type', '', 'primary', 'N', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '授权操作');
INSERT INTO `sys_dict_data` VALUES (23, 5, '导出', '5', 'sys_oper_type', '', 'warning', 'N', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '导出操作');
INSERT INTO `sys_dict_data` VALUES (24, 6, '导入', '6', 'sys_oper_type', '', 'warning', 'N', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '导入操作');
INSERT INTO `sys_dict_data` VALUES (25, 7, '强退', '7', 'sys_oper_type', '', 'danger', 'N', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '强退操作');
INSERT INTO `sys_dict_data` VALUES (26, 8, '生成代码', '8', 'sys_oper_type', '', 'warning', 'N', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '生成操作');
INSERT INTO `sys_dict_data` VALUES (27, 9, '清空数据', '9', 'sys_oper_type', '', 'danger', 'N', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '清空操作');
INSERT INTO `sys_dict_data` VALUES (28, 1, '成功', '0', 'sys_common_status', '', 'primary', 'N', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '正常状态');
INSERT INTO `sys_dict_data` VALUES (29, 2, '失败', '1', 'sys_common_status', '', 'danger', 'N', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '停用状态');

-- ----------------------------
-- Table structure for sys_dict_type
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict_type`;
CREATE TABLE `sys_dict_type`  (
  `dict_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '字典主键',
  `dict_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '字典名称',
  `dict_type` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '字典类型',
  `status` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `create_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime(0) NULL DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`dict_id`) USING BTREE,
  UNIQUE INDEX `dict_type`(`dict_type`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 100 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '字典类型表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_dict_type
-- ----------------------------
INSERT INTO `sys_dict_type` VALUES (1, '用户性别', 'sys_user_sex', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '用户性别列表');
INSERT INTO `sys_dict_type` VALUES (2, '菜单状态', 'sys_show_hide', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '菜单状态列表');
INSERT INTO `sys_dict_type` VALUES (3, '系统开关', 'sys_normal_disable', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '系统开关列表');
INSERT INTO `sys_dict_type` VALUES (4, '任务状态', 'sys_job_status', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '任务状态列表');
INSERT INTO `sys_dict_type` VALUES (5, '任务分组', 'sys_job_group', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '任务分组列表');
INSERT INTO `sys_dict_type` VALUES (6, '系统是否', 'sys_yes_no', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '系统是否列表');
INSERT INTO `sys_dict_type` VALUES (7, '通知类型', 'sys_notice_type', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '通知类型列表');
INSERT INTO `sys_dict_type` VALUES (8, '通知状态', 'sys_notice_status', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '通知状态列表');
INSERT INTO `sys_dict_type` VALUES (9, '操作类型', 'sys_oper_type', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '操作类型列表');
INSERT INTO `sys_dict_type` VALUES (10, '系统状态', 'sys_common_status', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '登录状态列表');

-- ----------------------------
-- Table structure for sys_job
-- ----------------------------
DROP TABLE IF EXISTS `sys_job`;
CREATE TABLE `sys_job`  (
  `job_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '任务ID',
  `job_name` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '任务名称',
  `job_group` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'DEFAULT' COMMENT '任务组名',
  `invoke_target` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '调用目标字符串',
  `cron_expression` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT 'cron执行表达式',
  `misfire_policy` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '3' COMMENT '计划执行错误策略（1立即执行 2执行一次 3放弃执行）',
  `concurrent` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '1' COMMENT '是否并发执行（0允许 1禁止）',
  `status` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '0' COMMENT '状态（0正常 1暂停）',
  `create_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime(0) NULL DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '备注信息',
  PRIMARY KEY (`job_id`, `job_name`, `job_group`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '定时任务调度表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_job
-- ----------------------------
INSERT INTO `sys_job` VALUES (1, '系统默认（无参）', 'DEFAULT', 'ryTask.ryNoParams', '0/10 * * * * ?', '3', '1', '1', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_job` VALUES (2, '系统默认（有参）', 'DEFAULT', 'ryTask.ryParams(\'ry\')', '0/15 * * * * ?', '3', '1', '1', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_job` VALUES (3, '系统默认（多参）', 'DEFAULT', 'ryTask.ryMultipleParams(\'ry\', true, 2000L, 316.50D, 100)', '0/20 * * * * ?', '3', '1', '1', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');

-- ----------------------------
-- Table structure for sys_job_log
-- ----------------------------
DROP TABLE IF EXISTS `sys_job_log`;
CREATE TABLE `sys_job_log`  (
  `job_log_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '任务日志ID',
  `job_name` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '任务名称',
  `job_group` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '任务组名',
  `invoke_target` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '调用目标字符串',
  `job_message` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '日志信息',
  `status` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '0' COMMENT '执行状态（0正常 1失败）',
  `exception_info` varchar(2000) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '异常信息',
  `create_time` datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`job_log_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '定时任务调度日志表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_job_log
-- ----------------------------

-- ----------------------------
-- Table structure for sys_logininfor
-- ----------------------------
DROP TABLE IF EXISTS `sys_logininfor`;
CREATE TABLE `sys_logininfor`  (
  `info_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '访问ID',
  `login_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '登录账号',
  `ipaddr` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '登录IP地址',
  `login_location` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '登录地点',
  `browser` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '浏览器类型',
  `os` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '操作系统',
  `status` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '0' COMMENT '登录状态（0成功 1失败）',
  `msg` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '提示消息',
  `login_time` datetime(0) NULL DEFAULT NULL COMMENT '访问时间',
  PRIMARY KEY (`info_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 271 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '系统访问记录' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_logininfor
-- ----------------------------

-- ----------------------------
-- Table structure for sys_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_menu`;
CREATE TABLE `sys_menu`  (
  `menu_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
  `menu_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '菜单名称',
  `parent_id` bigint(20) NULL DEFAULT 0 COMMENT '父菜单ID',
  `order_num` int(4) NULL DEFAULT 0 COMMENT '显示顺序',
  `url` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '#' COMMENT '请求地址',
  `target` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '打开方式（menuItem页签 menuBlank新窗口）',
  `menu_type` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '菜单类型（M目录 C菜单 F按钮）',
  `visible` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '0' COMMENT '菜单状态（0显示 1隐藏）',
  `perms` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '权限标识',
  `icon` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '#' COMMENT '菜单图标',
  `create_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime(0) NULL DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`menu_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2012 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '菜单权限表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_menu
-- ----------------------------
INSERT INTO `sys_menu` VALUES (1, '系统管理', 0, 1, '#', '', 'M', '0', '', 'fa fa-gear', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '系统管理目录');
INSERT INTO `sys_menu` VALUES (100, '用户管理', 1, 1, '/system/user', '', 'C', '0', 'system:user:view', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '用户管理菜单');
INSERT INTO `sys_menu` VALUES (101, '角色管理', 1, 2, '/system/role', '', 'C', '0', 'system:role:view', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '角色管理菜单');
INSERT INTO `sys_menu` VALUES (102, '菜单管理', 1, 3, '/system/menu', '', 'C', '0', 'system:menu:view', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '菜单管理菜单');
INSERT INTO `sys_menu` VALUES (103, '部门管理', 1, 4, '/system/dept', '', 'C', '0', 'system:dept:view', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '部门管理菜单');
INSERT INTO `sys_menu` VALUES (105, '字典管理', 1, 6, '/system/dict', '', 'C', '0', 'system:dict:view', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '字典管理菜单');
INSERT INTO `sys_menu` VALUES (106, '参数设置', 1, 7, '/system/config', '', 'C', '0', 'system:config:view', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '参数设置菜单');
INSERT INTO `sys_menu` VALUES (108, '日志管理', 1, 9, '#', '', 'M', '0', '', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '日志管理菜单');
INSERT INTO `sys_menu` VALUES (500, '操作日志', 108, 1, '/monitor/operlog', '', 'C', '0', 'monitor:operlog:view', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '操作日志菜单');
INSERT INTO `sys_menu` VALUES (501, '登录日志', 108, 2, '/monitor/logininfor', '', 'C', '0', 'monitor:logininfor:view', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '登录日志菜单');
INSERT INTO `sys_menu` VALUES (1000, '用户查询', 100, 1, '#', '', 'F', '0', 'system:user:list', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1001, '用户新增', 100, 2, '#', '', 'F', '0', 'system:user:add', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1002, '用户修改', 100, 3, '#', '', 'F', '0', 'system:user:edit', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1003, '用户删除', 100, 4, '#', '', 'F', '0', 'system:user:remove', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1004, '用户导出', 100, 5, '#', '', 'F', '0', 'system:user:export', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1005, '用户导入', 100, 6, '#', '', 'F', '0', 'system:user:import', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1006, '重置密码', 100, 7, '#', '', 'F', '0', 'system:user:resetPwd', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1007, '角色查询', 101, 1, '#', '', 'F', '0', 'system:role:list', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1008, '角色新增', 101, 2, '#', '', 'F', '0', 'system:role:add', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1009, '角色修改', 101, 3, '#', '', 'F', '0', 'system:role:edit', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1010, '角色删除', 101, 4, '#', '', 'F', '0', 'system:role:remove', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1011, '角色导出', 101, 5, '#', '', 'F', '0', 'system:role:export', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1012, '菜单查询', 102, 1, '#', '', 'F', '0', 'system:menu:list', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1013, '菜单新增', 102, 2, '#', '', 'F', '0', 'system:menu:add', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1014, '菜单修改', 102, 3, '#', '', 'F', '0', 'system:menu:edit', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1015, '菜单删除', 102, 4, '#', '', 'F', '0', 'system:menu:remove', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1016, '部门查询', 103, 1, '#', '', 'F', '0', 'system:dept:list', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1017, '部门新增', 103, 2, '#', '', 'F', '0', 'system:dept:add', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1018, '部门修改', 103, 3, '#', '', 'F', '0', 'system:dept:edit', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1019, '部门删除', 103, 4, '#', '', 'F', '0', 'system:dept:remove', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1025, '字典查询', 105, 1, '#', '', 'F', '0', 'system:dict:list', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1026, '字典新增', 105, 2, '#', '', 'F', '0', 'system:dict:add', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1027, '字典修改', 105, 3, '#', '', 'F', '0', 'system:dict:edit', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1028, '字典删除', 105, 4, '#', '', 'F', '0', 'system:dict:remove', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1029, '字典导出', 105, 5, '#', '', 'F', '0', 'system:dict:export', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1030, '参数查询', 106, 1, '#', '', 'F', '0', 'system:config:list', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1031, '参数新增', 106, 2, '#', '', 'F', '0', 'system:config:add', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1032, '参数修改', 106, 3, '#', '', 'F', '0', 'system:config:edit', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1033, '参数删除', 106, 4, '#', '', 'F', '0', 'system:config:remove', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1034, '参数导出', 106, 5, '#', '', 'F', '0', 'system:config:export', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1039, '操作查询', 500, 1, '#', '', 'F', '0', 'monitor:operlog:list', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1040, '操作删除', 500, 2, '#', '', 'F', '0', 'monitor:operlog:remove', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1041, '详细信息', 500, 3, '#', '', 'F', '0', 'monitor:operlog:detail', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1042, '日志导出', 500, 4, '#', '', 'F', '0', 'monitor:operlog:export', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1043, '登录查询', 501, 1, '#', '', 'F', '0', 'monitor:logininfor:list', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1044, '登录删除', 501, 2, '#', '', 'F', '0', 'monitor:logininfor:remove', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1045, '日志导出', 501, 3, '#', '', 'F', '0', 'monitor:logininfor:export', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (1046, '账户解锁', 501, 4, '#', '', 'F', '0', 'monitor:logininfor:unlock', '#', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_menu` VALUES (2008, '项目管理', 0, 2, '#', 'menuItem', 'M', '0', NULL, 'fa fa-gear', 'admin', '2020-05-22 14:20:27', '', NULL, '');
INSERT INTO `sys_menu` VALUES (2009, '用户列表', 2008, 1, 'openapi/goUserList', 'menuItem', 'C', '0', '', '#', 'admin', '2020-05-22 14:23:33', 'admin', '2020-05-22 16:16:08', '');
INSERT INTO `sys_menu` VALUES (2010, '得分列表', 2008, 2, 'openapi/goScoreList', 'menuItem', 'C', '0', '', '#', 'admin', '2020-05-22 14:24:42', 'admin', '2020-05-25 09:49:44', '');
INSERT INTO `sys_menu` VALUES (2011, '查看详情', 2009, 1, '#', 'menuItem', 'F', '0', 'system:user:edit', '#', 'admin', '2020-05-22 16:57:52', '', NULL, '');

-- ----------------------------
-- Table structure for sys_notice
-- ----------------------------
DROP TABLE IF EXISTS `sys_notice`;
CREATE TABLE `sys_notice`  (
  `notice_id` int(4) NOT NULL AUTO_INCREMENT COMMENT '公告ID',
  `notice_title` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '公告标题',
  `notice_type` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '公告类型（1通知 2公告）',
  `notice_content` varchar(2000) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '公告内容',
  `status` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '0' COMMENT '公告状态（0正常 1关闭）',
  `create_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime(0) NULL DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`notice_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '通知公告表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_notice
-- ----------------------------

-- ----------------------------
-- Table structure for sys_oper_log
-- ----------------------------
DROP TABLE IF EXISTS `sys_oper_log`;
CREATE TABLE `sys_oper_log`  (
  `oper_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '日志主键',
  `title` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '模块标题',
  `business_type` int(2) NULL DEFAULT 0 COMMENT '业务类型（0其它 1新增 2修改 3删除）',
  `method` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '方法名称',
  `request_method` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '请求方式',
  `operator_type` int(1) NULL DEFAULT 0 COMMENT '操作类别（0其它 1后台用户 2手机端用户）',
  `oper_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '操作人员',
  `dept_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '部门名称',
  `oper_url` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '请求URL',
  `oper_ip` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '主机地址',
  `oper_location` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '操作地点',
  `oper_param` varchar(2000) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '请求参数',
  `json_result` varchar(2000) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '返回参数',
  `status` int(1) NULL DEFAULT 0 COMMENT '操作状态（0正常 1异常）',
  `error_msg` varchar(2000) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '错误消息',
  `oper_time` datetime(0) NULL DEFAULT NULL COMMENT '操作时间',
  PRIMARY KEY (`oper_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 222 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '操作日志记录' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_oper_log
-- ----------------------------
INSERT INTO `sys_oper_log` VALUES (100, '菜单管理', 2, 'com.haier.web.controller.system.SysMenuController.editSave()', 'POST', 1, 'admin', '研发部门', '/system/menu/edit', '127.0.0.1', '内网IP', '{\r\n  \"menuId\" : [ \"2\" ],\r\n  \"parentId\" : [ \"0\" ],\r\n  \"menuType\" : [ \"M\" ],\r\n  \"menuName\" : [ \"系统监控\" ],\r\n  \"url\" : [ \"#\" ],\r\n  \"target\" : [ \"menuItem\" ],\r\n  \"perms\" : [ \"\" ],\r\n  \"orderNum\" : [ \"2\" ],\r\n  \"icon\" : [ \"fa fa-video-camera\" ],\r\n  \"visible\" : [ \"1\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 11:05:33');
INSERT INTO `sys_oper_log` VALUES (101, '菜单管理', 3, 'com.haier.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/115', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"菜单已分配,不允许删除\",\r\n  \"code\" : 301\r\n}', 0, NULL, '2020-04-02 11:06:25');
INSERT INTO `sys_oper_log` VALUES (102, '菜单管理', 2, 'com.haier.web.controller.system.SysMenuController.editSave()', 'POST', 1, 'admin', '研发部门', '/system/menu/edit', '127.0.0.1', '内网IP', '{\r\n  \"menuId\" : [ \"113\" ],\r\n  \"parentId\" : [ \"3\" ],\r\n  \"menuType\" : [ \"C\" ],\r\n  \"menuName\" : [ \"表单构建\" ],\r\n  \"url\" : [ \"/tool/build\" ],\r\n  \"target\" : [ \"menuItem\" ],\r\n  \"perms\" : [ \"tool:build:view\" ],\r\n  \"orderNum\" : [ \"1\" ],\r\n  \"icon\" : [ \"#\" ],\r\n  \"visible\" : [ \"1\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 11:16:15');
INSERT INTO `sys_oper_log` VALUES (103, '菜单管理', 2, 'com.haier.web.controller.system.SysMenuController.editSave()', 'POST', 1, 'admin', '研发部门', '/system/menu/edit', '127.0.0.1', '内网IP', '{\r\n  \"menuId\" : [ \"115\" ],\r\n  \"parentId\" : [ \"3\" ],\r\n  \"menuType\" : [ \"C\" ],\r\n  \"menuName\" : [ \"系统接口\" ],\r\n  \"url\" : [ \"/tool/swagger\" ],\r\n  \"target\" : [ \"menuItem\" ],\r\n  \"perms\" : [ \"tool:swagger:view\" ],\r\n  \"orderNum\" : [ \"3\" ],\r\n  \"icon\" : [ \"#\" ],\r\n  \"visible\" : [ \"1\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 11:16:20');
INSERT INTO `sys_oper_log` VALUES (104, '代码生成', 6, 'com.haier.generator.controller.GenController.importTableSave()', 'POST', 1, 'admin', '研发部门', '/tool/gen/importTable', '127.0.0.1', '内网IP', '{\r\n  \"tables\" : [ \"t_news\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 11:30:47');
INSERT INTO `sys_oper_log` VALUES (105, '代码生成', 3, 'com.haier.generator.controller.GenController.remove()', 'POST', 1, 'admin', '研发部门', '/tool/gen/remove', '127.0.0.1', '内网IP', '{\r\n  \"ids\" : [ \"1\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 11:32:02');
INSERT INTO `sys_oper_log` VALUES (106, '代码生成', 6, 'com.haier.generator.controller.GenController.importTableSave()', 'POST', 1, 'admin', '研发部门', '/tool/gen/importTable', '127.0.0.1', '内网IP', '{\r\n  \"tables\" : [ \"t_news\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 11:32:05');
INSERT INTO `sys_oper_log` VALUES (107, '代码生成', 3, 'com.haier.generator.controller.GenController.remove()', 'POST', 1, 'admin', '研发部门', '/tool/gen/remove', '127.0.0.1', '内网IP', '{\r\n  \"ids\" : [ \"2\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 11:35:55');
INSERT INTO `sys_oper_log` VALUES (108, '代码生成', 6, 'com.haier.generator.controller.GenController.importTableSave()', 'POST', 1, 'admin', '研发部门', '/tool/gen/importTable', '127.0.0.1', '内网IP', '{\r\n  \"tables\" : [ \"t_news\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 11:35:58');
INSERT INTO `sys_oper_log` VALUES (109, '代码生成', 3, 'com.haier.generator.controller.GenController.remove()', 'POST', 1, 'admin', '研发部门', '/tool/gen/remove', '127.0.0.1', '内网IP', '{\r\n  \"ids\" : [ \"3\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 11:42:18');
INSERT INTO `sys_oper_log` VALUES (110, '代码生成', 6, 'com.haier.generator.controller.GenController.importTableSave()', 'POST', 1, 'admin', '研发部门', '/tool/gen/importTable', '127.0.0.1', '内网IP', '{\r\n  \"tables\" : [ \"t_news\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 11:42:21');
INSERT INTO `sys_oper_log` VALUES (111, '代码生成', 2, 'com.haier.generator.controller.GenController.editSave()', 'POST', 1, 'admin', '研发部门', '/tool/gen/edit', '127.0.0.1', '内网IP', '{\r\n  \"tableId\" : [ \"4\" ],\r\n  \"tableName\" : [ \"t_news\" ],\r\n  \"tableComment\" : [ \"新闻表\" ],\r\n  \"className\" : [ \"News\" ],\r\n  \"functionAuthor\" : [ \"haier\" ],\r\n  \"remark\" : [ \"\" ],\r\n  \"columns[0].columnId\" : [ \"20\" ],\r\n  \"columns[0].sort\" : [ \"1\" ],\r\n  \"columns[0].columnComment\" : [ \"id\" ],\r\n  \"columns[0].javaType\" : [ \"String\" ],\r\n  \"columns[0].javaField\" : [ \"id\" ],\r\n  \"columns[0].queryType\" : [ \"EQ\" ],\r\n  \"columns[0].htmlType\" : [ \"input\" ],\r\n  \"columns[0].dictType\" : [ \"\" ],\r\n  \"columns[1].columnId\" : [ \"21\" ],\r\n  \"columns[1].sort\" : [ \"2\" ],\r\n  \"columns[1].columnComment\" : [ \"标题\" ],\r\n  \"columns[1].javaType\" : [ \"String\" ],\r\n  \"columns[1].javaField\" : [ \"title\" ],\r\n  \"columns[1].isInsert\" : [ \"1\" ],\r\n  \"columns[1].isEdit\" : [ \"1\" ],\r\n  \"columns[1].isList\" : [ \"1\" ],\r\n  \"columns[1].isQuery\" : [ \"1\" ],\r\n  \"columns[1].queryType\" : [ \"LIKE\" ],\r\n  \"columns[1].htmlType\" : [ \"input\" ],\r\n  \"columns[1].dictType\" : [ \"\" ],\r\n  \"columns[2].columnId\" : [ \"22\" ],\r\n  \"columns[2].sort\" : [ \"3\" ],\r\n  \"columns[2].columnComment\" : [ \"内容\" ],\r\n  \"columns[2].javaType\" : [ \"String\" ],\r\n  \"columns[2].javaField\" : [ \"content\" ],\r\n  \"columns[2].isInsert\" : [ \"1\" ],\r\n  \"columns[2].isEdit\" : [ \"1\" ],\r\n  \"columns[2].isList\" : [ \"1\" ],\r\n  \"columns[2].isQuery\" : [ \"1\" ],\r\n  \"columns[2].queryType\" : [ \"LIKE\" ],\r\n  \"columns[2].htmlType\" : [ \"input\" ],\r\n  \"columns[2].dictType\" : [ \"\" ],\r\n  \"columns[3].columnId\" : [ \"23\" ],\r\n  \"columns[3].sort\" : [ \"4\" ],\r\n  \"columns[3].columnComment\" : [ \"创建时间\" ],\r\n  \"columns[3].javaType\" : [ \"String\" ],\r\n  \"columns[3].javaField\" : [ \"createTime\" ],\r\n  \"columns[3].isList\" : [ \"1\" ],\r\n  \"columns[3].isQuery\" : [ \"1\" ],\r\n  \"columns[3].queryType\" : [ \"EQ\" ],\r\n  \"columns[3].htmlType\" : [ \"input\" ],\r\n  \"columns[3].dictType\" : [ \"\" ],\r\n  \"columns[4].columnId\" : [ \"24\" ],\r\n  \"columns[4].sort\" : [ \"5\" ],\r\n  \"columns[4].columnComment\" : [ \"创建人id\" ],\r\n  \"columns[4].javaType\" : [ \"String\" ],\r\n  \"columns[4].javaField\" : [ \"createId\" ],\r\n  \"columns[4].isList\" : [ \"1\" ],\r\n  \"columns[', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 11:43:31');
INSERT INTO `sys_oper_log` VALUES (112, '代码生成', 3, 'com.haier.generator.controller.GenController.remove()', 'POST', 1, 'admin', '研发部门', '/tool/gen/remove', '127.0.0.1', '内网IP', '{\r\n  \"ids\" : [ \"4\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 11:44:09');
INSERT INTO `sys_oper_log` VALUES (113, '代码生成', 6, 'com.haier.generator.controller.GenController.importTableSave()', 'POST', 1, 'admin', '研发部门', '/tool/gen/importTable', '127.0.0.1', '内网IP', '{\r\n  \"tables\" : [ \"t_news\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 11:44:12');
INSERT INTO `sys_oper_log` VALUES (114, '代码生成', 3, 'com.haier.generator.controller.GenController.remove()', 'POST', 1, 'admin', '研发部门', '/tool/gen/remove', '127.0.0.1', '内网IP', '{\r\n  \"ids\" : [ \"5\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 11:45:19');
INSERT INTO `sys_oper_log` VALUES (115, '代码生成', 6, 'com.haier.generator.controller.GenController.importTableSave()', 'POST', 1, 'admin', '研发部门', '/tool/gen/importTable', '127.0.0.1', '内网IP', '{\r\n  \"tables\" : [ \"t_news\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 11:45:22');
INSERT INTO `sys_oper_log` VALUES (116, '代码生成', 8, 'com.haier.generator.controller.GenController.genCode()', 'GET', 1, 'admin', '研发部门', '/tool/gen/genCode/t_news', '127.0.0.1', '内网IP', '{ }', 'null', 0, NULL, '2020-04-02 11:45:38');
INSERT INTO `sys_oper_log` VALUES (117, '代码生成', 3, 'com.haier.generator.controller.GenController.remove()', 'POST', 1, 'admin', '研发部门', '/tool/gen/remove', '127.0.0.1', '内网IP', '{\r\n  \"ids\" : [ \"6\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 11:49:12');
INSERT INTO `sys_oper_log` VALUES (118, '代码生成', 6, 'com.haier.generator.controller.GenController.importTableSave()', 'POST', 1, 'admin', '研发部门', '/tool/gen/importTable', '127.0.0.1', '内网IP', '{\r\n  \"tables\" : [ \"t_news\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 11:49:16');
INSERT INTO `sys_oper_log` VALUES (119, '代码生成', 8, 'com.haier.generator.controller.GenController.genCode()', 'GET', 1, 'admin', '研发部门', '/tool/gen/genCode/t_news', '127.0.0.1', '内网IP', '{ }', 'null', 0, NULL, '2020-04-02 11:49:38');
INSERT INTO `sys_oper_log` VALUES (120, '代码生成', 3, 'com.haier.generator.controller.GenController.remove()', 'POST', 1, 'admin', '研发部门', '/tool/gen/remove', '127.0.0.1', '内网IP', '{\r\n  \"ids\" : [ \"7\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 11:51:53');
INSERT INTO `sys_oper_log` VALUES (121, '代码生成', 6, 'com.haier.generator.controller.GenController.importTableSave()', 'POST', 1, 'admin', '研发部门', '/tool/gen/importTable', '127.0.0.1', '内网IP', '{\r\n  \"tables\" : [ \"t_news\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 11:52:16');
INSERT INTO `sys_oper_log` VALUES (122, '代码生成', 8, 'com.haier.generator.controller.GenController.genCode()', 'GET', 1, 'admin', '研发部门', '/tool/gen/genCode/t_news', '127.0.0.1', '内网IP', '{ }', 'null', 0, NULL, '2020-04-02 11:52:19');
INSERT INTO `sys_oper_log` VALUES (123, '菜单管理', 1, 'com.haier.web.controller.system.SysMenuController.addSave()', 'POST', 1, 'admin', '研发部门', '/system/menu/add', '127.0.0.1', '内网IP', '{\r\n  \"parentId\" : [ \"0\" ],\r\n  \"menuType\" : [ \"M\" ],\r\n  \"menuName\" : [ \"项目管理\" ],\r\n  \"url\" : [ \"\" ],\r\n  \"target\" : [ \"menuItem\" ],\r\n  \"perms\" : [ \"\" ],\r\n  \"orderNum\" : [ \"4\" ],\r\n  \"icon\" : [ \"fa fa-university\" ],\r\n  \"visible\" : [ \"0\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 14:04:23');
INSERT INTO `sys_oper_log` VALUES (124, '菜单管理', 1, 'com.haier.web.controller.system.SysMenuController.addSave()', 'POST', 1, 'admin', '研发部门', '/system/menu/add', '127.0.0.1', '内网IP', '{\r\n  \"parentId\" : [ \"2006\" ],\r\n  \"menuType\" : [ \"C\" ],\r\n  \"menuName\" : [ \"新闻管理\" ],\r\n  \"url\" : [ \"/community/news\" ],\r\n  \"target\" : [ \"menuItem\" ],\r\n  \"perms\" : [ \"community:news:view\" ],\r\n  \"orderNum\" : [ \"1\" ],\r\n  \"icon\" : [ \"\" ],\r\n  \"visible\" : [ \"0\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 14:05:09');
INSERT INTO `sys_oper_log` VALUES (125, '菜单管理', 2, 'com.haier.web.controller.system.SysMenuController.editSave()', 'POST', 1, 'admin', '研发部门', '/system/menu/edit', '127.0.0.1', '内网IP', '{\r\n  \"menuId\" : [ \"2000\" ],\r\n  \"parentId\" : [ \"2006\" ],\r\n  \"menuType\" : [ \"C\" ],\r\n  \"menuName\" : [ \"新闻\" ],\r\n  \"url\" : [ \"/community/news\" ],\r\n  \"target\" : [ \"menuItem\" ],\r\n  \"perms\" : [ \"community:news:view\" ],\r\n  \"orderNum\" : [ \"1\" ],\r\n  \"icon\" : [ \"#\" ],\r\n  \"visible\" : [ \"0\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 14:05:48');
INSERT INTO `sys_oper_log` VALUES (126, '菜单管理', 3, 'com.haier.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/2007', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 14:05:59');
INSERT INTO `sys_oper_log` VALUES (127, '新闻', 1, 'com.haier.community.controller.NewsController.addSave()', 'POST', 1, 'admin', '研发部门', '/community/news/add', '127.0.0.1', '内网IP', '{\r\n  \"title\" : [ \"境外输入44例，不能松懈！\" ],\r\n  \"content\" : [ \"截至目前为止。。。。\" ],\r\n  \"createId\" : [ \"\" ],\r\n  \"createName\" : [ \"\" ],\r\n  \"isDel\" : [ \"\" ]\r\n}', 'null', 1, 'nested exception is org.apache.ibatis.exceptions.PersistenceException: \r\n### Error updating database.  Cause: java.lang.IllegalArgumentException: invalid comparison: java.util.Date and java.lang.String\r\n### Cause: java.lang.IllegalArgumentException: invalid comparison: java.util.Date and java.lang.String', '2020-04-02 14:31:42');
INSERT INTO `sys_oper_log` VALUES (128, '新闻', 1, 'com.haier.community.controller.NewsController.addSave()', 'POST', 1, 'admin', '研发部门', '/community/news/add', '127.0.0.1', '内网IP', '{\r\n  \"title\" : [ \"123\" ],\r\n  \"content\" : [ \"13\" ]\r\n}', 'null', 1, 'nested exception is org.apache.ibatis.exceptions.PersistenceException: \r\n### Error updating database.  Cause: java.lang.IllegalArgumentException: invalid comparison: java.util.Date and java.lang.String\r\n### Cause: java.lang.IllegalArgumentException: invalid comparison: java.util.Date and java.lang.String', '2020-04-02 14:32:43');
INSERT INTO `sys_oper_log` VALUES (129, '新闻', 1, 'com.haier.community.controller.NewsController.addSave()', 'POST', 1, 'admin', '研发部门', '/community/news/add', '127.0.0.1', '内网IP', '{\r\n  \"title\" : [ \"123\" ],\r\n  \"content\" : [ \"13\" ]\r\n}', 'null', 1, 'nested exception is org.apache.ibatis.exceptions.PersistenceException: \r\n### Error updating database.  Cause: java.lang.IllegalArgumentException: invalid comparison: java.util.Date and java.lang.String\r\n### Cause: java.lang.IllegalArgumentException: invalid comparison: java.util.Date and java.lang.String', '2020-04-02 14:37:06');
INSERT INTO `sys_oper_log` VALUES (130, '新闻', 1, 'com.haier.community.controller.NewsController.addSave()', 'POST', 1, 'admin', '研发部门', '/community/news/add', '127.0.0.1', '内网IP', '{\r\n  \"title\" : [ \"23\" ],\r\n  \"content\" : [ \"23\" ]\r\n}', 'null', 1, 'nested exception is org.apache.ibatis.exceptions.PersistenceException: \r\n### Error updating database.  Cause: java.lang.IllegalArgumentException: invalid comparison: java.util.Date and java.lang.String\r\n### Cause: java.lang.IllegalArgumentException: invalid comparison: java.util.Date and java.lang.String', '2020-04-02 14:37:51');
INSERT INTO `sys_oper_log` VALUES (131, '新闻', 1, 'com.haier.community.controller.NewsController.addSave()', 'POST', 1, 'admin', '研发部门', '/community/news/add', '127.0.0.1', '内网IP', '{\r\n  \"title\" : [ \"12\" ],\r\n  \"content\" : [ \"12\" ]\r\n}', 'null', 1, 'nested exception is org.apache.ibatis.exceptions.PersistenceException: \r\n### Error updating database.  Cause: java.lang.IllegalArgumentException: invalid comparison: java.util.Date and java.lang.String\r\n### Cause: java.lang.IllegalArgumentException: invalid comparison: java.util.Date and java.lang.String', '2020-04-02 14:38:38');
INSERT INTO `sys_oper_log` VALUES (132, '新闻', 1, 'com.haier.community.controller.NewsController.addSave()', 'POST', 1, 'admin', '研发部门', '/community/news/add', '127.0.0.1', '内网IP', '{\r\n  \"title\" : [ \"12\" ],\r\n  \"content\" : [ \"12\" ]\r\n}', 'null', 1, 'nested exception is org.apache.ibatis.exceptions.PersistenceException: \r\n### Error updating database.  Cause: java.lang.IllegalArgumentException: invalid comparison: java.util.Date and java.lang.String\r\n### Cause: java.lang.IllegalArgumentException: invalid comparison: java.util.Date and java.lang.String', '2020-04-02 14:40:29');
INSERT INTO `sys_oper_log` VALUES (133, '新闻', 1, 'com.haier.community.controller.NewsController.addSave()', 'POST', 1, 'admin', '研发部门', '/community/news/add', '127.0.0.1', '内网IP', '{\r\n  \"title\" : [ \"23\" ],\r\n  \"content\" : [ \"23\" ]\r\n}', 'null', 1, 'nested exception is org.apache.ibatis.exceptions.PersistenceException: \r\n### Error updating database.  Cause: java.lang.IllegalArgumentException: invalid comparison: java.util.Date and java.lang.String\r\n### Cause: java.lang.IllegalArgumentException: invalid comparison: java.util.Date and java.lang.String', '2020-04-02 14:42:13');
INSERT INTO `sys_oper_log` VALUES (134, '新闻', 1, 'com.haier.community.controller.NewsController.addSave()', 'POST', 1, 'admin', '研发部门', '/community/news/add', '127.0.0.1', '内网IP', '{\r\n  \"title\" : [ \"23\" ],\r\n  \"content\" : [ \"23\" ]\r\n}', 'null', 1, 'nested exception is org.apache.ibatis.exceptions.PersistenceException: \r\n### Error updating database.  Cause: java.lang.IllegalArgumentException: invalid comparison: java.util.Date and java.lang.String\r\n### Cause: java.lang.IllegalArgumentException: invalid comparison: java.util.Date and java.lang.String', '2020-04-02 14:42:17');
INSERT INTO `sys_oper_log` VALUES (135, '新闻', 1, 'com.haier.community.controller.NewsController.addSave()', 'POST', 1, 'admin', '研发部门', '/community/news/add', '127.0.0.1', '内网IP', '{\r\n  \"title\" : [ \"12\" ],\r\n  \"content\" : [ \"12\" ]\r\n}', 'null', 1, 'nested exception is org.apache.ibatis.exceptions.PersistenceException: \r\n### Error updating database.  Cause: java.lang.IllegalArgumentException: invalid comparison: java.util.Date and java.lang.String\r\n### Cause: java.lang.IllegalArgumentException: invalid comparison: java.util.Date and java.lang.String', '2020-04-02 14:43:00');
INSERT INTO `sys_oper_log` VALUES (136, '新闻', 1, 'com.haier.community.controller.NewsController.addSave()', 'POST', 1, 'admin', '研发部门', '/community/news/add', '127.0.0.1', '内网IP', '{\r\n  \"title\" : [ \"23\" ],\r\n  \"content\" : [ \"23\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 14:44:07');
INSERT INTO `sys_oper_log` VALUES (137, '新闻', 3, 'com.haier.community.controller.NewsController.remove()', 'POST', 1, 'admin', '研发部门', '/community/news/remove', '127.0.0.1', '内网IP', '{\r\n  \"ids\" : [ \"12\" ]\r\n}', '{\r\n  \"msg\" : \"操作失败\",\r\n  \"code\" : 500\r\n}', 0, NULL, '2020-04-02 14:49:03');
INSERT INTO `sys_oper_log` VALUES (138, '新闻', 3, 'com.haier.community.controller.NewsController.remove()', 'POST', 1, 'admin', '研发部门', '/community/news/remove', '127.0.0.1', '内网IP', '{\r\n  \"ids\" : [ \"0fea6e02ba744304884ad9b1e1a68561\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 14:49:08');
INSERT INTO `sys_oper_log` VALUES (139, '新闻', 1, 'com.haier.community.controller.NewsController.addSave()', 'POST', 1, 'admin', '研发部门', '/community/news/add', '127.0.0.1', '内网IP', '{\r\n  \"title\" : [ \"32\" ],\r\n  \"content\" : [ \"23\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 14:54:13');
INSERT INTO `sys_oper_log` VALUES (140, '新闻', 2, 'com.haier.community.controller.NewsController.editSave()', 'POST', 1, 'admin', '研发部门', '/community/news/edit', '127.0.0.1', '内网IP', '{\r\n  \"id\" : [ \"2f4eb7896c564cae89147d60d59f5dcf\" ],\r\n  \"title\" : [ \"323\" ],\r\n  \"content\" : [ \"23\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 14:54:16');
INSERT INTO `sys_oper_log` VALUES (141, '新闻', 3, 'com.haier.community.controller.NewsController.remove()', 'POST', 1, 'admin', '研发部门', '/community/news/remove', '127.0.0.1', '内网IP', '{\r\n  \"ids\" : [ \"2f4eb7896c564cae89147d60d59f5dcf\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 14:54:22');
INSERT INTO `sys_oper_log` VALUES (142, '新闻', 1, 'com.haier.community.controller.NewsController.addSave()', 'POST', 1, 'admin', '研发部门', '/community/news/add', '127.0.0.1', '内网IP', '{\r\n  \"title\" : [ \"海尔衣联网成立上海智研院：专注研发智能新品、新场景\" ],\r\n  \"content\" : [ \"近期，海尔衣联网在体验端的创新落地动作频频。12月21日，海尔衣联网智慧生态上海研究院在海尔智谷正式成立，距离衣物界\\\"盒马鲜生\\\"之称的海尔衣联网1号店开业仅过去4天。\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 14:55:02');
INSERT INTO `sys_oper_log` VALUES (143, '新闻', 1, 'com.haier.community.controller.NewsController.addSave()', 'POST', 1, 'admin', '研发部门', '/community/news/add', '127.0.0.1', '内网IP', '{\r\n  \"title\" : [ \"康得新与海尔共塑衣联生态\" ],\r\n  \"content\" : [ \"作为全球首款融合3D试衣与衣物管理的智能终端，海尔LOHO智能衣柜镜是一款基于海尔衣联生态、依托康得新3D身体测量算法以及ITO电容触控镜面的智能硬件 产品，具备衣服智能管理、搭配推荐、3D试衣、身体测量、健身指导等众多“黑科技”。\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-04-02 14:55:29');
INSERT INTO `sys_oper_log` VALUES (144, '代码生成', 3, 'com.segmentfault.generator.controller.GenController.remove()', 'POST', 1, 'admin', '研发部门', '/tool/gen/remove', '127.0.0.1', '内网IP', '{\r\n  \"ids\" : [ \"8\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-08 16:41:35');
INSERT INTO `sys_oper_log` VALUES (145, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/2005', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-08 16:42:10');
INSERT INTO `sys_oper_log` VALUES (146, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/2004', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-08 16:42:19');
INSERT INTO `sys_oper_log` VALUES (147, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/2003', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-08 16:42:26');
INSERT INTO `sys_oper_log` VALUES (148, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/2001', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-08 16:42:31');
INSERT INTO `sys_oper_log` VALUES (149, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/2002', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-08 16:42:35');
INSERT INTO `sys_oper_log` VALUES (150, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/2000', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-08 16:42:39');
INSERT INTO `sys_oper_log` VALUES (151, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/3', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"存在子菜单,不允许删除\",\r\n  \"code\" : 301\r\n}', 0, NULL, '2020-05-11 15:38:06');
INSERT INTO `sys_oper_log` VALUES (152, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/113', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"菜单已分配,不允许删除\",\r\n  \"code\" : 301\r\n}', 0, NULL, '2020-05-11 15:38:13');
INSERT INTO `sys_oper_log` VALUES (153, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/113', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"菜单已分配,不允许删除\",\r\n  \"code\" : 301\r\n}', 0, NULL, '2020-05-11 15:38:26');
INSERT INTO `sys_oper_log` VALUES (154, '菜单管理', 2, 'com.segmentfault.web.controller.system.SysMenuController.editSave()', 'POST', 1, 'admin', '研发部门', '/system/menu/edit', '127.0.0.1', '内网IP', '{\r\n  \"menuId\" : [ \"113\" ],\r\n  \"parentId\" : [ \"3\" ],\r\n  \"menuType\" : [ \"C\" ],\r\n  \"menuName\" : [ \"表单构建\" ],\r\n  \"url\" : [ \"/tool/build\" ],\r\n  \"target\" : [ \"menuItem\" ],\r\n  \"perms\" : [ \"tool:build:view\" ],\r\n  \"orderNum\" : [ \"1\" ],\r\n  \"icon\" : [ \"#\" ],\r\n  \"visible\" : [ \"0\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:38:37');
INSERT INTO `sys_oper_log` VALUES (155, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/107', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"存在子菜单,不允许删除\",\r\n  \"code\" : 301\r\n}', 0, NULL, '2020-05-11 15:40:25');
INSERT INTO `sys_oper_log` VALUES (156, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1036', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"菜单已分配,不允许删除\",\r\n  \"code\" : 301\r\n}', 0, NULL, '2020-05-11 15:40:31');
INSERT INTO `sys_oper_log` VALUES (157, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1038', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"菜单已分配,不允许删除\",\r\n  \"code\" : 301\r\n}', 0, NULL, '2020-05-11 15:40:53');
INSERT INTO `sys_oper_log` VALUES (158, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/2006', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:41:51');
INSERT INTO `sys_oper_log` VALUES (159, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/115', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"菜单已分配,不允许删除\",\r\n  \"code\" : 301\r\n}', 0, NULL, '2020-05-11 15:41:57');
INSERT INTO `sys_oper_log` VALUES (160, '角色管理', 2, 'com.segmentfault.web.controller.system.SysRoleController.editSave()', 'POST', 1, 'admin', '研发部门', '/system/role/edit', '127.0.0.1', '内网IP', '{\r\n  \"roleId\" : [ \"2\" ],\r\n  \"roleName\" : [ \"普通角色\" ],\r\n  \"roleKey\" : [ \"common\" ],\r\n  \"roleSort\" : [ \"2\" ],\r\n  \"status\" : [ \"0\" ],\r\n  \"remark\" : [ \"普通角色\" ],\r\n  \"menuIds\" : [ \"1,100,1000,1001,1002,1003,1004,1005,1006,101,1007,1008,1009,1010,1011,102,1012,1013,1014,1015,103,1016,1017,1018,1019,104,1020,1021,1022,1023,1024,105,1025,1026,1027,1028,1029,106,1030,1031,1032,1033,1034,108,500,1039,1040,1041,1042,501,1043,1044,1045,1046\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:45:45');
INSERT INTO `sys_oper_log` VALUES (161, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/113', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:45:52');
INSERT INTO `sys_oper_log` VALUES (162, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/115', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:45:55');
INSERT INTO `sys_oper_log` VALUES (163, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/114', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"存在子菜单,不允许删除\",\r\n  \"code\" : 301\r\n}', 0, NULL, '2020-05-11 15:45:59');
INSERT INTO `sys_oper_log` VALUES (164, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1057', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:46:03');
INSERT INTO `sys_oper_log` VALUES (165, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1059', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:46:09');
INSERT INTO `sys_oper_log` VALUES (166, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1061', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:46:14');
INSERT INTO `sys_oper_log` VALUES (167, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/114', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"存在子菜单,不允许删除\",\r\n  \"code\" : 301\r\n}', 0, NULL, '2020-05-11 15:46:17');
INSERT INTO `sys_oper_log` VALUES (168, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1058', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:46:22');
INSERT INTO `sys_oper_log` VALUES (169, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1060', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:46:27');
INSERT INTO `sys_oper_log` VALUES (170, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/114', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:46:30');
INSERT INTO `sys_oper_log` VALUES (171, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/3', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:46:32');
INSERT INTO `sys_oper_log` VALUES (172, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/111', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:46:37');
INSERT INTO `sys_oper_log` VALUES (173, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/112', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:46:40');
INSERT INTO `sys_oper_log` VALUES (174, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1053', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:46:45');
INSERT INTO `sys_oper_log` VALUES (175, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1056', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:46:50');
INSERT INTO `sys_oper_log` VALUES (176, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1052', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:46:56');
INSERT INTO `sys_oper_log` VALUES (177, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1055', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:47:01');
INSERT INTO `sys_oper_log` VALUES (178, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1054', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:47:05');
INSERT INTO `sys_oper_log` VALUES (179, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1051', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:47:17');
INSERT INTO `sys_oper_log` VALUES (180, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1050', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:47:22');
INSERT INTO `sys_oper_log` VALUES (181, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/110', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:47:27');
INSERT INTO `sys_oper_log` VALUES (182, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1049', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:47:36');
INSERT INTO `sys_oper_log` VALUES (183, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1048', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:48:02');
INSERT INTO `sys_oper_log` VALUES (184, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/109', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"存在子菜单,不允许删除\",\r\n  \"code\" : 301\r\n}', 0, NULL, '2020-05-11 15:48:05');
INSERT INTO `sys_oper_log` VALUES (185, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1047', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:48:09');
INSERT INTO `sys_oper_log` VALUES (186, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/109', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:48:12');
INSERT INTO `sys_oper_log` VALUES (187, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/2', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:48:15');
INSERT INTO `sys_oper_log` VALUES (188, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1038', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:49:06');
INSERT INTO `sys_oper_log` VALUES (189, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1037', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:49:11');
INSERT INTO `sys_oper_log` VALUES (190, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1036', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:49:21');
INSERT INTO `sys_oper_log` VALUES (191, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1035', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:49:26');
INSERT INTO `sys_oper_log` VALUES (192, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/107', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-11 15:49:29');
INSERT INTO `sys_oper_log` VALUES (193, '重置密码', 2, 'com.segmentfault.web.controller.system.SysUserController.resetPwd()', 'GET', 1, 'admin', '研发部门', '/system/user/resetPwd/2', '127.0.0.1', '内网IP', '{ }', '\"system/user/resetPwd\"', 0, NULL, '2020-05-12 16:55:30');
INSERT INTO `sys_oper_log` VALUES (194, '重置密码', 2, 'com.segmentfault.web.controller.system.SysUserController.resetPwdSave()', 'POST', 1, 'admin', '研发部门', '/system/user/resetPwd', '127.0.0.1', '内网IP', '{\r\n  \"userId\" : [ \"2\" ],\r\n  \"loginName\" : [ \"ry\" ],\r\n  \"password\" : [ \"123456\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-12 16:55:39');
INSERT INTO `sys_oper_log` VALUES (195, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1024', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"菜单已分配,不允许删除\",\r\n  \"code\" : 301\r\n}', 0, NULL, '2020-05-13 11:17:57');
INSERT INTO `sys_oper_log` VALUES (196, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1023', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"菜单已分配,不允许删除\",\r\n  \"code\" : 301\r\n}', 0, NULL, '2020-05-13 11:18:02');
INSERT INTO `sys_oper_log` VALUES (197, '菜单管理', 3, 'com.segmentfault.web.controller.system.SysMenuController.remove()', 'GET', 1, 'admin', '研发部门', '/system/menu/remove/1024', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"菜单已分配,不允许删除\",\r\n  \"code\" : 301\r\n}', 0, NULL, '2020-05-13 11:34:00');
INSERT INTO `sys_oper_log` VALUES (198, '菜单管理', 1, 'com.segmentfault.web.controller.system.SysMenuController.addSave()', 'POST', 1, 'admin', '研发部门', '/system/menu/add', '127.0.0.1', '内网IP', '{\r\n  \"parentId\" : [ \"0\" ],\r\n  \"menuType\" : [ \"M\" ],\r\n  \"menuName\" : [ \"项目管理\" ],\r\n  \"url\" : [ \"\" ],\r\n  \"target\" : [ \"menuItem\" ],\r\n  \"perms\" : [ \"\" ],\r\n  \"orderNum\" : [ \"2\" ],\r\n  \"icon\" : [ \"fa fa-gear\" ],\r\n  \"visible\" : [ \"0\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-22 14:20:27');
INSERT INTO `sys_oper_log` VALUES (199, '菜单管理', 1, 'com.segmentfault.web.controller.system.SysMenuController.addSave()', 'POST', 1, 'admin', '研发部门', '/system/menu/add', '127.0.0.1', '内网IP', '{\r\n  \"parentId\" : [ \"2008\" ],\r\n  \"menuType\" : [ \"C\" ],\r\n  \"menuName\" : [ \"用户列表\" ],\r\n  \"url\" : [ \"system:use:list\" ],\r\n  \"target\" : [ \"menuItem\" ],\r\n  \"perms\" : [ \"\" ],\r\n  \"orderNum\" : [ \"1\" ],\r\n  \"icon\" : [ \"\" ],\r\n  \"visible\" : [ \"0\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-22 14:23:33');
INSERT INTO `sys_oper_log` VALUES (200, '菜单管理', 2, 'com.segmentfault.web.controller.system.SysMenuController.editSave()', 'POST', 1, 'admin', '研发部门', '/system/menu/edit', '127.0.0.1', '内网IP', '{\r\n  \"menuId\" : [ \"2009\" ],\r\n  \"parentId\" : [ \"2008\" ],\r\n  \"menuType\" : [ \"C\" ],\r\n  \"menuName\" : [ \"用户列表\" ],\r\n  \"url\" : [ \"openapi/user\" ],\r\n  \"target\" : [ \"menuItem\" ],\r\n  \"perms\" : [ \"\" ],\r\n  \"orderNum\" : [ \"1\" ],\r\n  \"icon\" : [ \"#\" ],\r\n  \"visible\" : [ \"0\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-22 14:24:01');
INSERT INTO `sys_oper_log` VALUES (201, '菜单管理', 1, 'com.segmentfault.web.controller.system.SysMenuController.addSave()', 'POST', 1, 'admin', '研发部门', '/system/menu/add', '127.0.0.1', '内网IP', '{\r\n  \"parentId\" : [ \"2008\" ],\r\n  \"menuType\" : [ \"C\" ],\r\n  \"menuName\" : [ \"得分列表\" ],\r\n  \"url\" : [ \"openapi/score\" ],\r\n  \"target\" : [ \"menuItem\" ],\r\n  \"perms\" : [ \"\" ],\r\n  \"orderNum\" : [ \"2\" ],\r\n  \"icon\" : [ \"\" ],\r\n  \"visible\" : [ \"0\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-22 14:24:42');
INSERT INTO `sys_oper_log` VALUES (202, '菜单管理', 2, 'com.segmentfault.web.controller.system.SysMenuController.editSave()', 'POST', 1, 'admin', '研发部门', '/system/menu/edit', '127.0.0.1', '内网IP', '{\r\n  \"menuId\" : [ \"2009\" ],\r\n  \"parentId\" : [ \"2008\" ],\r\n  \"menuType\" : [ \"C\" ],\r\n  \"menuName\" : [ \"用户列表\" ],\r\n  \"url\" : [ \"openapi/pinball/goUserList\" ],\r\n  \"target\" : [ \"menuItem\" ],\r\n  \"perms\" : [ \"\" ],\r\n  \"orderNum\" : [ \"1\" ],\r\n  \"icon\" : [ \"#\" ],\r\n  \"visible\" : [ \"0\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-22 15:34:40');
INSERT INTO `sys_oper_log` VALUES (203, '菜单管理', 2, 'com.segmentfault.web.controller.system.SysMenuController.editSave()', 'POST', 1, 'admin', '研发部门', '/system/menu/edit', '127.0.0.1', '内网IP', '{\r\n  \"menuId\" : [ \"2009\" ],\r\n  \"parentId\" : [ \"2008\" ],\r\n  \"menuType\" : [ \"C\" ],\r\n  \"menuName\" : [ \"用户列表\" ],\r\n  \"url\" : [ \"openapi/goUserList\" ],\r\n  \"target\" : [ \"menuItem\" ],\r\n  \"perms\" : [ \"\" ],\r\n  \"orderNum\" : [ \"1\" ],\r\n  \"icon\" : [ \"#\" ],\r\n  \"visible\" : [ \"0\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-22 16:16:08');
INSERT INTO `sys_oper_log` VALUES (204, '字典数据', 2, 'com.segmentfault.web.controller.system.SysDictDataController.editSave()', 'POST', 1, 'admin', '研发部门', '/system/dict/data/edit', '127.0.0.1', '内网IP', '{\r\n  \"dictCode\" : [ \"1\" ],\r\n  \"dictLabel\" : [ \"男\" ],\r\n  \"dictValue\" : [ \"1\" ],\r\n  \"dictType\" : [ \"sys_user_sex\" ],\r\n  \"cssClass\" : [ \"\" ],\r\n  \"dictSort\" : [ \"1\" ],\r\n  \"listClass\" : [ \"\" ],\r\n  \"isDefault\" : [ \"Y\" ],\r\n  \"status\" : [ \"0\" ],\r\n  \"remark\" : [ \"性别男\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-22 16:54:16');
INSERT INTO `sys_oper_log` VALUES (205, '字典数据', 2, 'com.segmentfault.web.controller.system.SysDictDataController.editSave()', 'POST', 1, 'admin', '研发部门', '/system/dict/data/edit', '127.0.0.1', '内网IP', '{\r\n  \"dictCode\" : [ \"2\" ],\r\n  \"dictLabel\" : [ \"女\" ],\r\n  \"dictValue\" : [ \"0\" ],\r\n  \"dictType\" : [ \"sys_user_sex\" ],\r\n  \"cssClass\" : [ \"\" ],\r\n  \"dictSort\" : [ \"2\" ],\r\n  \"listClass\" : [ \"\" ],\r\n  \"isDefault\" : [ \"N\" ],\r\n  \"status\" : [ \"0\" ],\r\n  \"remark\" : [ \"性别女\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-22 16:54:21');
INSERT INTO `sys_oper_log` VALUES (206, '菜单管理', 1, 'com.segmentfault.web.controller.system.SysMenuController.addSave()', 'POST', 1, 'admin', '研发部门', '/system/menu/add', '127.0.0.1', '内网IP', '{\r\n  \"parentId\" : [ \"2009\" ],\r\n  \"menuType\" : [ \"F\" ],\r\n  \"menuName\" : [ \"查看详情\" ],\r\n  \"url\" : [ \"\" ],\r\n  \"target\" : [ \"menuItem\" ],\r\n  \"perms\" : [ \"system:user:edit\" ],\r\n  \"orderNum\" : [ \"1\" ],\r\n  \"icon\" : [ \"\" ],\r\n  \"visible\" : [ \"0\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-22 16:57:52');
INSERT INTO `sys_oper_log` VALUES (207, '菜单管理', 2, 'com.segmentfault.web.controller.system.SysMenuController.editSave()', 'POST', 1, 'admin', '研发部门', '/system/menu/edit', '127.0.0.1', '内网IP', '{\r\n  \"menuId\" : [ \"2010\" ],\r\n  \"parentId\" : [ \"2008\" ],\r\n  \"menuType\" : [ \"C\" ],\r\n  \"menuName\" : [ \"得分列表\" ],\r\n  \"url\" : [ \"openapi/goScoreList\" ],\r\n  \"target\" : [ \"menuItem\" ],\r\n  \"perms\" : [ \"\" ],\r\n  \"orderNum\" : [ \"2\" ],\r\n  \"icon\" : [ \"#\" ],\r\n  \"visible\" : [ \"0\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-25 09:49:44');
INSERT INTO `sys_oper_log` VALUES (208, '角色管理', 1, 'com.segmentfault.web.controller.system.SysRoleController.addSave()', 'POST', 1, 'admin', NULL, '/system/role/add', '127.0.0.1', '内网IP', '{\r\n  \"roleName\" : [ \"游戏管理员\" ],\r\n  \"roleKey\" : [ \"adminH5\" ],\r\n  \"roleSort\" : [ \"3\" ],\r\n  \"status\" : [ \"0\" ],\r\n  \"remark\" : [ \"\" ],\r\n  \"menuIds\" : [ \"2008,2009,2011,2010\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-25 10:32:11');
INSERT INTO `sys_oper_log` VALUES (209, '用户管理', 1, 'com.segmentfault.web.controller.system.SysUserController.addSave()', 'POST', 1, 'admin', NULL, '/system/user/add', '127.0.0.1', '内网IP', '{\r\n  \"deptId\" : [ \"107\" ],\r\n  \"userName\" : [ \"H5游戏管理员\" ],\r\n  \"deptName\" : [ \"运维部门\" ],\r\n  \"phonenumber\" : [ \"13335353434\" ],\r\n  \"email\" : [ \"adminH5@163.com\" ],\r\n  \"loginName\" : [ \"adminH5\" ],\r\n  \"password\" : [ \"adminH5123\" ],\r\n  \"sex\" : [ \"1\" ],\r\n  \"role\" : [ \"100\" ],\r\n  \"remark\" : [ \"\" ],\r\n  \"status\" : [ \"0\" ],\r\n  \"roleIds\" : [ \"100\" ],\r\n  \"postIds\" : [ \"\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-25 10:34:05');
INSERT INTO `sys_oper_log` VALUES (210, '角色管理', 2, 'com.segmentfault.web.controller.system.SysRoleController.editSave()', 'POST', 1, 'admin', NULL, '/system/role/edit', '127.0.0.1', '内网IP', '{\r\n  \"roleId\" : [ \"100\" ],\r\n  \"roleName\" : [ \"游戏管理员\" ],\r\n  \"roleKey\" : [ \"gameAdmin\" ],\r\n  \"roleSort\" : [ \"3\" ],\r\n  \"status\" : [ \"0\" ],\r\n  \"remark\" : [ \"\" ],\r\n  \"menuIds\" : [ \"2008,2009,2011,2010\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-25 10:34:19');
INSERT INTO `sys_oper_log` VALUES (211, '个人信息', 2, 'com.segmentfault.web.controller.system.SysProfileController.updateAvatar()', 'POST', 1, 'adminH5', '运维部门', '/system/user/profile/updateAvatar', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-25 10:49:09');
INSERT INTO `sys_oper_log` VALUES (212, '个人信息', 2, 'com.segmentfault.web.controller.system.SysProfileController.update()', 'POST', 1, 'adminH5', '运维部门', '/system/user/profile/update', '127.0.0.1', '内网IP', '{\r\n  \"id\" : [ \"\" ],\r\n  \"userName\" : [ \"H5游戏管理员\" ],\r\n  \"phonenumber\" : [ \"13335353434\" ],\r\n  \"email\" : [ \"adminH5@163.com\" ],\r\n  \"sex\" : [ \"0\" ]\r\n}', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-25 10:49:24');
INSERT INTO `sys_oper_log` VALUES (213, '字典数据', 2, 'com.segmentfault.web.controller.system.SysDictDataController.editSave()', 'POST', 1, 'admin', '研发部门', '/system/dict/data/edit', '127.0.0.1', '内网IP', '{\n  \"dictCode\" : [ \"2\" ],\n  \"dictLabel\" : [ \"女\" ],\n  \"dictValue\" : [ \"2\" ],\n  \"dictType\" : [ \"sys_user_sex\" ],\n  \"cssClass\" : [ \"\" ],\n  \"dictSort\" : [ \"2\" ],\n  \"listClass\" : [ \"\" ],\n  \"isDefault\" : [ \"N\" ],\n  \"status\" : [ \"0\" ],\n  \"remark\" : [ \"性别女\" ]\n}', '{\n  \"msg\" : \"操作成功\",\n  \"code\" : 0\n}', 0, NULL, '2020-05-25 14:25:23');
INSERT INTO `sys_oper_log` VALUES (214, '字典数据', 2, 'com.segmentfault.web.controller.system.SysDictDataController.editSave()', 'POST', 1, 'admin', '研发部门', '/system/dict/data/edit', '127.0.0.1', '内网IP', '{\n  \"dictCode\" : [ \"3\" ],\n  \"dictLabel\" : [ \"未知\" ],\n  \"dictValue\" : [ \"0\" ],\n  \"dictType\" : [ \"sys_user_sex\" ],\n  \"cssClass\" : [ \"\" ],\n  \"dictSort\" : [ \"3\" ],\n  \"listClass\" : [ \"\" ],\n  \"isDefault\" : [ \"N\" ],\n  \"status\" : [ \"0\" ],\n  \"remark\" : [ \"性别未知\" ]\n}', '{\n  \"msg\" : \"操作成功\",\n  \"code\" : 0\n}', 0, NULL, '2020-05-25 14:25:30');
INSERT INTO `sys_oper_log` VALUES (215, '个人信息', 2, 'com.segmentfault.web.controller.system.SysProfileController.updateAvatar()', 'POST', 1, 'adminH5', '运维部门', '/system/user/profile/updateAvatar', '127.0.0.1', '内网IP', '{ }', '{\n  \"msg\" : \"java.io.FileNotFoundException: /tmp/tomcat.2900928605160736475.7000/work/Tomcat/localhost/ROOT/D:/segmentfault/uploadPath/avatar/2020/05/25/517aa59c3bb413dffd3c3ab34f48b88f.png (没有那个文件或目录)\",\n  \"code\" : 500\n}', 0, NULL, '2020-05-25 16:19:15');
INSERT INTO `sys_oper_log` VALUES (216, '个人信息', 2, 'com.segmentfault.web.controller.system.SysProfileController.updateAvatar()', 'POST', 1, 'adminH5', '运维部门', '/system/user/profile/updateAvatar', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-25 16:25:11');
INSERT INTO `sys_oper_log` VALUES (217, '个人信息', 2, 'com.segmentfault.web.controller.system.SysProfileController.updateAvatar()', 'POST', 1, 'adminH5', '运维部门', '/system/user/profile/updateAvatar', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-26 09:10:13');
INSERT INTO `sys_oper_log` VALUES (218, '个人信息', 2, 'com.segmentfault.web.controller.system.SysProfileController.updateAvatar()', 'POST', 1, 'adminH5', '运维部门', '/system/user/profile/updateAvatar', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-26 09:11:43');
INSERT INTO `sys_oper_log` VALUES (219, '个人信息', 2, 'com.segmentfault.web.controller.system.SysProfileController.updateAvatar()', 'POST', 1, 'adminH5', '运维部门', '/system/user/profile/updateAvatar', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-26 09:32:38');
INSERT INTO `sys_oper_log` VALUES (220, '个人信息', 2, 'com.segmentfault.web.controller.system.SysProfileController.updateAvatar()', 'POST', 1, 'adminH5', '运维部门', '/system/user/profile/updateAvatar', '127.0.0.1', '内网IP', '{ }', '{\r\n  \"msg\" : \"操作成功\",\r\n  \"code\" : 0\r\n}', 0, NULL, '2020-05-26 09:41:50');
INSERT INTO `sys_oper_log` VALUES (221, '参数管理', 9, 'com.segmentfault.web.controller.system.SysConfigController.clearCache()', 'GET', 1, 'admin', '研发部门', '/system/config/clearCache', '127.0.0.1', '内网IP', '{ }', '{\n  \"msg\" : \"操作成功\",\n  \"code\" : 0\n}', 0, NULL, '2020-06-09 11:28:50');

-- ----------------------------
-- Table structure for sys_post
-- ----------------------------
DROP TABLE IF EXISTS `sys_post`;
CREATE TABLE `sys_post`  (
  `post_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '岗位ID',
  `post_code` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '岗位编码',
  `post_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '岗位名称',
  `post_sort` int(4) NOT NULL COMMENT '显示顺序',
  `status` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '状态（0正常 1停用）',
  `create_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime(0) NULL DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`post_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '岗位信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_post
-- ----------------------------
INSERT INTO `sys_post` VALUES (1, 'ceo', '董事长', 1, '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_post` VALUES (2, 'se', '项目经理', 2, '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_post` VALUES (3, 'hr', '人力资源', 3, '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');
INSERT INTO `sys_post` VALUES (4, 'user', '普通员工', 4, '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '');

-- ----------------------------
-- Table structure for sys_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role`  (
  `role_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `role_name` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '角色名称',
  `role_key` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '角色权限字符串',
  `role_sort` int(4) NOT NULL COMMENT '显示顺序',
  `data_scope` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '1' COMMENT '数据范围（1：全部数据权限 2：自定数据权限 3：本部门数据权限 4：本部门及以下数据权限）',
  `status` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '角色状态（0正常 1停用）',
  `del_flag` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  `create_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime(0) NULL DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`role_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 101 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '角色信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_role
-- ----------------------------
INSERT INTO `sys_role` VALUES (1, '管理员', 'admin', 1, '1', '0', '0', 'admin', '2018-03-16 11:33:00', 'ry', '2018-03-16 11:33:00', '管理员');
INSERT INTO `sys_role` VALUES (2, '普通角色', 'common', 2, '2', '0', '0', 'admin', '2018-03-16 11:33:00', 'admin', '2020-05-11 15:45:45', '普通角色');
INSERT INTO `sys_role` VALUES (100, '游戏管理员', 'gameAdmin', 3, '1', '0', '0', 'admin', '2020-05-25 10:32:11', 'admin', '2020-05-25 10:34:19', '');

-- ----------------------------
-- Table structure for sys_role_dept
-- ----------------------------
DROP TABLE IF EXISTS `sys_role_dept`;
CREATE TABLE `sys_role_dept`  (
  `role_id` bigint(20) NOT NULL COMMENT '角色ID',
  `dept_id` bigint(20) NOT NULL COMMENT '部门ID',
  PRIMARY KEY (`role_id`, `dept_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '角色和部门关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_role_dept
-- ----------------------------
INSERT INTO `sys_role_dept` VALUES (2, 100);
INSERT INTO `sys_role_dept` VALUES (2, 101);
INSERT INTO `sys_role_dept` VALUES (2, 105);

-- ----------------------------
-- Table structure for sys_role_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_role_menu`;
CREATE TABLE `sys_role_menu`  (
  `role_id` bigint(20) NOT NULL COMMENT '角色ID',
  `menu_id` bigint(20) NOT NULL COMMENT '菜单ID',
  PRIMARY KEY (`role_id`, `menu_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '角色和菜单关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_role_menu
-- ----------------------------
INSERT INTO `sys_role_menu` VALUES (2, 1);
INSERT INTO `sys_role_menu` VALUES (2, 100);
INSERT INTO `sys_role_menu` VALUES (2, 101);
INSERT INTO `sys_role_menu` VALUES (2, 102);
INSERT INTO `sys_role_menu` VALUES (2, 103);
INSERT INTO `sys_role_menu` VALUES (2, 104);
INSERT INTO `sys_role_menu` VALUES (2, 105);
INSERT INTO `sys_role_menu` VALUES (2, 106);
INSERT INTO `sys_role_menu` VALUES (2, 108);
INSERT INTO `sys_role_menu` VALUES (2, 500);
INSERT INTO `sys_role_menu` VALUES (2, 501);
INSERT INTO `sys_role_menu` VALUES (2, 1000);
INSERT INTO `sys_role_menu` VALUES (2, 1001);
INSERT INTO `sys_role_menu` VALUES (2, 1002);
INSERT INTO `sys_role_menu` VALUES (2, 1003);
INSERT INTO `sys_role_menu` VALUES (2, 1004);
INSERT INTO `sys_role_menu` VALUES (2, 1005);
INSERT INTO `sys_role_menu` VALUES (2, 1006);
INSERT INTO `sys_role_menu` VALUES (2, 1007);
INSERT INTO `sys_role_menu` VALUES (2, 1008);
INSERT INTO `sys_role_menu` VALUES (2, 1009);
INSERT INTO `sys_role_menu` VALUES (2, 1010);
INSERT INTO `sys_role_menu` VALUES (2, 1011);
INSERT INTO `sys_role_menu` VALUES (2, 1012);
INSERT INTO `sys_role_menu` VALUES (2, 1013);
INSERT INTO `sys_role_menu` VALUES (2, 1014);
INSERT INTO `sys_role_menu` VALUES (2, 1015);
INSERT INTO `sys_role_menu` VALUES (2, 1016);
INSERT INTO `sys_role_menu` VALUES (2, 1017);
INSERT INTO `sys_role_menu` VALUES (2, 1018);
INSERT INTO `sys_role_menu` VALUES (2, 1019);
INSERT INTO `sys_role_menu` VALUES (2, 1020);
INSERT INTO `sys_role_menu` VALUES (2, 1021);
INSERT INTO `sys_role_menu` VALUES (2, 1022);
INSERT INTO `sys_role_menu` VALUES (2, 1023);
INSERT INTO `sys_role_menu` VALUES (2, 1024);
INSERT INTO `sys_role_menu` VALUES (2, 1025);
INSERT INTO `sys_role_menu` VALUES (2, 1026);
INSERT INTO `sys_role_menu` VALUES (2, 1027);
INSERT INTO `sys_role_menu` VALUES (2, 1028);
INSERT INTO `sys_role_menu` VALUES (2, 1029);
INSERT INTO `sys_role_menu` VALUES (2, 1030);
INSERT INTO `sys_role_menu` VALUES (2, 1031);
INSERT INTO `sys_role_menu` VALUES (2, 1032);
INSERT INTO `sys_role_menu` VALUES (2, 1033);
INSERT INTO `sys_role_menu` VALUES (2, 1034);
INSERT INTO `sys_role_menu` VALUES (2, 1039);
INSERT INTO `sys_role_menu` VALUES (2, 1040);
INSERT INTO `sys_role_menu` VALUES (2, 1041);
INSERT INTO `sys_role_menu` VALUES (2, 1042);
INSERT INTO `sys_role_menu` VALUES (2, 1043);
INSERT INTO `sys_role_menu` VALUES (2, 1044);
INSERT INTO `sys_role_menu` VALUES (2, 1045);
INSERT INTO `sys_role_menu` VALUES (2, 1046);
INSERT INTO `sys_role_menu` VALUES (100, 2008);
INSERT INTO `sys_role_menu` VALUES (100, 2009);
INSERT INTO `sys_role_menu` VALUES (100, 2010);
INSERT INTO `sys_role_menu` VALUES (100, 2011);

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user`  (
  `user_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `dept_id` bigint(20) NULL DEFAULT NULL COMMENT '部门ID',
  `login_name` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '登录账号',
  `user_name` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '用户昵称',
  `user_type` varchar(2) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '00' COMMENT '用户类型（00系统用户 01注册用户）',
  `email` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '用户邮箱',
  `phonenumber` varchar(11) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '手机号码',
  `sex` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '0' COMMENT '用户性别（0男 1女 2未知）',
  `avatar` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '头像路径',
  `password` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '密码',
  `salt` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '盐加密',
  `status` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '0' COMMENT '帐号状态（0正常 1停用）',
  `del_flag` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  `login_ip` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '最后登陆IP',
  `login_date` datetime(0) NULL DEFAULT NULL COMMENT '最后登陆时间',
  `create_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime(0) NULL DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`user_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 101 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '用户信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_user
-- ----------------------------
INSERT INTO `sys_user` VALUES (1, 103, 'admin', '若依', '00', 'ry@163.com', '15888888888', '1', '', '29c67a30398638269fe600f73a054934', '111111', '0', '0', '127.0.0.1', '2020-06-09 11:27:01', 'admin', '2018-03-16 11:33:00', 'ry', '2020-06-09 11:27:00', '管理员');
INSERT INTO `sys_user` VALUES (2, 105, 'ry', '若依', '00', 'ry@qq.com', '15666666666', '1', '', 'a037da26db05c39efa24cbdd926484ed', '73dcbe', '0', '0', '127.0.0.1', '2020-05-12 16:56:37', 'admin', '2018-03-16 11:33:00', 'ry', '2020-05-12 16:56:37', '测试员');
INSERT INTO `sys_user` VALUES (100, 107, 'adminH5', 'H5游戏管理员', '00', 'adminH5@163.com', '13335353434', '0', '', 'd3020b9f7c9874f12e37bb91757b542e', '1df71a', '0', '0', '117.139.13.214', '2020-06-15 16:55:29', 'admin', '2020-05-25 10:34:05', '', '2020-06-15 16:55:29', NULL);

-- ----------------------------
-- Table structure for sys_user_online
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_online`;
CREATE TABLE `sys_user_online`  (
  `sessionId` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '用户会话id',
  `login_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '登录账号',
  `dept_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '部门名称',
  `ipaddr` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '登录IP地址',
  `login_location` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '登录地点',
  `browser` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '浏览器类型',
  `os` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '操作系统',
  `status` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '在线状态on_line在线off_line离线',
  `start_timestamp` datetime(0) NULL DEFAULT NULL COMMENT 'session创建时间',
  `last_access_time` datetime(0) NULL DEFAULT NULL COMMENT 'session最后访问时间',
  `expire_time` int(5) NULL DEFAULT 0 COMMENT '超时时间，单位为分钟',
  PRIMARY KEY (`sessionId`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '在线用户记录' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_user_online
-- ----------------------------

-- ----------------------------
-- Table structure for sys_user_post
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_post`;
CREATE TABLE `sys_user_post`  (
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `post_id` bigint(20) NOT NULL COMMENT '岗位ID',
  PRIMARY KEY (`user_id`, `post_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '用户与岗位关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_user_post
-- ----------------------------
INSERT INTO `sys_user_post` VALUES (1, 1);
INSERT INTO `sys_user_post` VALUES (2, 2);

-- ----------------------------
-- Table structure for sys_user_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_role`;
CREATE TABLE `sys_user_role`  (
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `role_id` bigint(20) NOT NULL COMMENT '角色ID',
  PRIMARY KEY (`user_id`, `role_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '用户和角色关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_user_role
-- ----------------------------
INSERT INTO `sys_user_role` VALUES (1, 1);
INSERT INTO `sys_user_role` VALUES (2, 2);
INSERT INTO `sys_user_role` VALUES (100, 100);

-- ----------------------------
-- Table structure for t_jsdata
-- ----------------------------
DROP TABLE IF EXISTS `t_jsdata`;
CREATE TABLE `t_jsdata`  (
  `id` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'id',
  `domain` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '当前域名，可区分不同选手作品',
  `uid` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '当前访问用户的uid，用作计算uv时去除重复访问',
  `url` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '当前url',
  `referer` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '访问来源页url',
  `ua` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '当前浏览器的UserAgent字符串',
  `dns` int(20) NULL DEFAULT NULL COMMENT 'dns解析时间',
  `tcp` int(20) NULL DEFAULT NULL COMMENT 'tcp连接建立时间',
  `white` int(20) NULL DEFAULT NULL COMMENT '白屏时间',
  `dom` int(20) NULL DEFAULT NULL COMMENT 'dom加载时间',
  `load_time` int(20) NULL DEFAULT NULL COMMENT '页面onload时间',
  `ready` int(20) NULL DEFAULT NULL COMMENT '页面准备时间',
  `redirect` int(20) NULL DEFAULT NULL COMMENT '页面重定向时间',
  `unload` int(20) NULL DEFAULT NULL COMMENT '页面unload时间',
  `request` int(20) NULL DEFAULT NULL COMMENT '整个网络request请求耗时',
  `render` int(20) NULL DEFAULT NULL COMMENT '页面渲染时间',
  `size` int(20) NULL DEFAULT NULL COMMENT '页面所有加载资源的大小',
  `errors_time` int(20) NULL DEFAULT NULL COMMENT '页面错误个数',
  `w` int(20) NULL DEFAULT NULL COMMENT '屏幕宽度',
  `h` int(20) NULL DEFAULT NULL COMMENT '屏幕高度',
  `pixel` int(20) NULL DEFAULT NULL COMMENT '一个像素实际分辨率，比如在retina屏幕上会为2或者更高',
  `gpu` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '当前设备gpu',
  `create_time` datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t_jsdata
-- ----------------------------
INSERT INTO `t_jsdata` VALUES ('028569a52ca94930b9ed2918e609c4f8', 'localhost', '2ovrqm005', 'http://localhost:8001/dist/wx/', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36', 0, 1, 307, 0, 0, 0, 0, 0, 1, 0, 350797, 0, 809, 969, 1, 'ANGLE (Radeon RX Vega M GL Graphics Direct3D11 vs_5_0 ps_5_0)', '2020-06-17 11:34:37');
INSERT INTO `t_jsdata` VALUES ('029e354682ef4457ba67773f0874f0fe', 'xwfintech.qingke.io', '04kfstyyi', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c30) NetType/4G Language/zh_CN', 1, 240, 331, 0, 0, 0, 0, 0, 98, 0, 0, 0, 414, 672, 3, 'Apple GPU', '2020-06-16 11:36:42');
INSERT INTO `t_jsdata` VALUES ('0398fab35b2244d782ed99c534a2a618', 'xwfintech.qingke.io', '78fedirno', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c30) NetType/4G Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 414, 672, 3, 'Apple GPU', '2020-06-16 01:09:16');
INSERT INTO `t_jsdata` VALUES ('064ba39d6e2c4210aad2345afd6454fc', 'xwfintech.qingke.io', 'kxizse2v4', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/15922752414737004 webdebugger port/17481', 0, 106, 161, 0, 0, 0, 0, 0, 54, 0, 260774, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 10:41:58');
INSERT INTO `t_jsdata` VALUES ('06fcf9dfaeab4df0a596a318b9553124', '192.168.1.211', '7olvf84vo', 'http://192.168.1.211:9800/h5/', '', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1', 0, 0, 6, 0, 0, 0, 0, 0, 2, 0, 85435, 0, 375, 667, 2, 'ANGLE (NVIDIA GeForce GTX 750 Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 11:39:46');
INSERT INTO `t_jsdata` VALUES ('0f7626608d64467ebd7093be5464b7ad', 'localhost', 'gdab8isdv', 'http://localhost:8002/dist/wx/', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36', 0, 1, 316, 448, 0, 0, 0, 0, 12, 120, 1303690, 0, 1920, 969, 1, 'ANGLE (Radeon RX Vega M GL Graphics Direct3D11 vs_5_0 ps_5_0)', '2020-06-19 11:38:44');
INSERT INTO `t_jsdata` VALUES ('125d31dafead45559f642788f1436308', 'xwfintech.qingke.io', 'acxouyr3z', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.13(0x17000d24) NetType/WIFI Language/zh_CN', 1, 3435, 3476, 0, 0, 0, 0, 0, 3350, 0, 0, 0, 414, 623, 3, 'Apple GPU', '2020-06-17 20:14:49');
INSERT INTO `t_jsdata` VALUES ('146a1e05460343bab8c4fed4f30fe96c', 'xwfintech.qingke.io', 'afefumnkk', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c30) NetType/4G Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 321, 0, 0, 0, 414, 672, 3, 'Apple GPU', '2020-06-16 01:19:48');
INSERT INTO `t_jsdata` VALUES ('172df2af2c7d4688b1ab69244855ff3d', 'xwfintech.qingke.io', 'dub71zlwu', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/15924686368771492 webdebugger port/58675', 0, 0, 3, 0, 0, 0, 0, 0, 5, 0, 261087, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-18 17:53:29');
INSERT INTO `t_jsdata` VALUES ('183f90860336404d8ec9c1c750a4de5f', 'xwfintech.qingke.io', 'u8kkqe8v3', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c31) NetType/4G Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 414, 672, 3, 'Apple GPU', '2020-06-17 11:22:55');
INSERT INTO `t_jsdata` VALUES ('19050099ae1547a9954222b453138b3b', 'xwfintech.qingke.io', 'lwu7s3qgk', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c30) NetType/4G Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 7016, 0, 0, 0, 375, 603, 2, 'Apple GPU', '2020-06-16 00:53:10');
INSERT INTO `t_jsdata` VALUES ('194dfa819e3e4e76b25c91aaac8530d9', 'xwfintech.qingke.io', 'vdb91g72i', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/15924686368771492 webdebugger port/58675', 0, 211, 288, 0, 0, 0, 0, 0, 77, 0, 261087, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-18 16:24:07');
INSERT INTO `t_jsdata` VALUES ('1db550b2f3714f7398f1e413ac1d6326', 'xwfintech.qingke.io', 's8yehqp6u', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c31) NetType/WIFI Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 414, 808, 3, 'Apple GPU', '2020-06-17 21:00:45');
INSERT INTO `t_jsdata` VALUES ('1ff6325118fd4635a4e985f39b6132bf', 'xwfintech.qingke.io', 'wejfx9efc', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c32) NetType/4G Language/zh_CN', 0, 297, 393, 1270, 0, 0, 0, 0, 111, 857, 0, 0, 414, 672, 3, 'Apple GPU', '2020-06-19 11:30:52');
INSERT INTO `t_jsdata` VALUES ('222af5b199244efaaf683e6af9109da1', 'xwfintech.qingke.io', 'h61jknnv2', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c31) NetType/WIFI Language/zh_CN', 0, 3844, 4042, 0, 0, 0, 0, 0, 3508, 0, 0, 0, 414, 725, 3, 'Apple GPU', '2020-06-17 14:17:45');
INSERT INTO `t_jsdata` VALUES ('24f5133cd4604ade9aa20a5b64c34610', 'xwfintech.qingke.io', 'l27a6zytm', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/15922752414737004 webdebugger port/17481', 0, 101, 154, 0, 0, 0, 0, 0, 52, 0, 261087, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 17:16:38');
INSERT INTO `t_jsdata` VALUES ('2595e6b2b90c40a892626f7cdaa7e2d7', 'xwfintech.qingke.io', 'q7qt4rvfe', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.13(0x17000d24) NetType/4G Language/zh_CN', 0, 0, 0, 6983, 0, 0, 0, 0, 2, 6981, 0, 0, 375, 603, 2, 'Apple GPU', '2020-06-19 09:23:19');
INSERT INTO `t_jsdata` VALUES ('2730c9e239e44c61abc250359fb95ba0', 'localhost', '2ovrqm005', 'http://localhost:8001/dist/wx/', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36', 0, 1, 305, 0, 0, 0, 0, 0, 3, 0, 947, 0, 809, 969, 1, 'ANGLE (Radeon RX Vega M GL Graphics Direct3D11 vs_5_0 ps_5_0)', '2020-06-17 11:29:09');
INSERT INTO `t_jsdata` VALUES ('278263844f1442a8a64d739f181fb93d', 'xwfintech.qingke.io', 'l685qyqjk', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/1592226109527738 webdebugger port/54921', 0, 103, 157, 0, 0, 0, 0, 0, 53, 0, 260774, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 00:49:46');
INSERT INTO `t_jsdata` VALUES ('2a1dd27b60934720beaccb767f978edd', 'xwfintech.qingke.io', 'jksqbmkux', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/1592226109527738 webdebugger port/54921', 0, 96, 146, 0, 0, 0, 0, 0, 48, 0, 259702, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 00:12:33');
INSERT INTO `t_jsdata` VALUES ('2ab2e7ba66a0474e875b8d5cd24ed0a4', 'localhost', '5gpmo9qdt', 'http://localhost:8001/dist/wx/', '', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1', 0, 1, 310, 0, 0, 0, 0, 0, 5, 0, 350797, 0, 375, 667, 2, 'ANGLE (NVIDIA GeForce GTX 750 Direct3D11 vs_5_0 ps_5_0)', '2020-06-17 11:15:59');
INSERT INTO `t_jsdata` VALUES ('2ba4e62ed5824a21b6613b794823223d', 'xwfintech.qingke.io', 'jksqbmkux', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/1592226109527738 webdebugger port/54921', 0, 0, 3, 0, 0, 0, 0, 0, 2, 0, 259702, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 00:12:40');
INSERT INTO `t_jsdata` VALUES ('2c5f1550e2ac4c7b8598aaa1b8efe87a', 'xwfintech.qingke.io', 'o78wbdhk6', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/1592226109527738 webdebugger port/54921', 0, 0, 48, 0, 0, 0, 0, 0, 47, 0, 260773, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 00:26:15');
INSERT INTO `t_jsdata` VALUES ('2d2e3e16c533409a8ba9e0748db19b16', 'xwfintech.qingke.io', 'evlsa9sse', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/1592226109527738 webdebugger port/54921', 0, 108, 164, 0, 0, 0, 0, 0, 56, 0, 260773, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 00:21:14');
INSERT INTO `t_jsdata` VALUES ('35a17118cf4b44d89b1d332671862d63', 'xwfintech.qingke.io', 'o1004mjvi', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c30) NetType/WIFI Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 6927, 0, 0, 0, 414, 725, 3, 'Apple GPU', '2020-06-17 16:51:36');
INSERT INTO `t_jsdata` VALUES ('38c88da17ffa493eaaad3554f50fb6b8', '', '63v6be00b', 'file:///E:/desktop/%E5%89%8D%E7%AB%AF%E4%BB%A3%E7%A0%81/dist/wx/index.html', '', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36', 0, 0, 159, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1280, 607, 1, 'ANGLE (NVIDIA GeForce GTX 750 Direct3D11 vs_5_0 ps_5_0)', '2020-06-17 11:10:58');
INSERT INTO `t_jsdata` VALUES ('39bf8f1eccc445d38b04585cec7adbdd', 'xwfintech.qingke.io', 'oshryfb0u', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c30) NetType/4G Language/zh_CN', 1, 3556, 3621, 0, 0, 0, 0, 0, 3371, 0, 0, 0, 414, 808, 3, 'Apple GPU', '2020-06-17 11:25:42');
INSERT INTO `t_jsdata` VALUES ('3a632cc59c2040acb803fb9007e86acc', 'xwfintech.qingke.io', 'zg77cqd89', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/15925293272963714 webdebugger port/41561', 0, 110, 168, 790, 0, 0, 0, 0, 56, 633, 1303326, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-19 09:21:37');
INSERT INTO `t_jsdata` VALUES ('3f8375ce3372485a8c32b5257635f542', 'xwfintech.qingke.io', 'r0ofu2n42', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c31) NetType/WIFI Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 414, 725, 3, 'Apple GPU', '2020-06-17 14:25:34');
INSERT INTO `t_jsdata` VALUES ('40a8b1ab7bce4e248cb495786becdf46', 'xwfintech.qingke.io', 'pkg8dwug6', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c30) NetType/WIFI Language/zh_CN', 1, 3787, 3843, 0, 0, 0, 0, 0, 3098, 0, 0, 0, 375, 603, 3, 'Apple GPU', '2020-06-16 11:37:59');
INSERT INTO `t_jsdata` VALUES ('43fa65bb6e014a87bb6daf9938413d75', 'xwfintech.qingke.io', 'o9sc5woj7', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c31) NetType/WIFI Language/zh_CN', 0, 3479, 3544, 0, 0, 0, 0, 0, 3095, 0, 0, 0, 414, 808, 3, 'Apple GPU', '2020-06-17 10:49:44');
INSERT INTO `t_jsdata` VALUES ('44dadb54504a4e3b9e45e98b6ff8f4a8', '192.168.1.211', '7olvf84vo', 'http://192.168.1.211:9800/h5/', '', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1', 0, 0, 66, 0, 0, 0, 0, 0, 1, 0, 85435, 0, 375, 667, 2, 'ANGLE (NVIDIA GeForce GTX 750 Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 11:38:50');
INSERT INTO `t_jsdata` VALUES ('476fe796328c46298d86cfa9effce1ea', 'xwfintech.qingke.io', 'prxvm5rod', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.13(0x17000d24) NetType/4G Language/zh_CN', 1, 3652, 3782, 15622, 0, 0, 0, 0, 3438, 8543, 0, 0, 375, 603, 2, 'Apple GPU', '2020-06-19 11:36:47');
INSERT INTO `t_jsdata` VALUES ('4a2d78ba6204405891b41d4642ac1582', '192.168.1.211', '7olvf84vo', 'http://192.168.1.211:9800/h5/', '', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1', 0, 0, 5, 0, 0, 0, 0, 0, 1, 0, 85435, 0, 375, 667, 2, 'ANGLE (NVIDIA GeForce GTX 750 Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 11:38:48');
INSERT INTO `t_jsdata` VALUES ('4b705fef87304cc79dbb3318a519e281', 'xwfintech.qingke.io', '4enbqegvp', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.13(0x17000d29) NetType/WIFI Language/zh_CN', 0, 3617, 3704, 10967, 0, 0, 0, 0, 3407, 3944, 0, 0, 375, 554, 2, 'Apple GPU', '2020-06-27 15:27:39');
INSERT INTO `t_jsdata` VALUES ('4b7ac4bbf32146b8a5b14efb0d1cb95f', 'xwfintech.qingke.io', 'ra3g0gpw5', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c32) NetType/4G Language/zh_CN', 0, 0, 0, 110, 0, 0, 0, 0, 2, 111, 0, 0, 414, 672, 3, 'Apple GPU', '2020-06-19 11:31:10');
INSERT INTO `t_jsdata` VALUES ('4bfede1683eb449e8b17bff607a50ed1', 'xwfintech.qingke.io', 'ykowt9hwk', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c31) NetType/4G Language/zh_CN', 0, 267, 344, 0, 0, 0, 0, 0, 89, 0, 0, 0, 414, 672, 3, 'Apple GPU', '2020-06-17 11:22:10');
INSERT INTO `t_jsdata` VALUES ('4c6de685d4e346588253a1f16fb6f42d', 'xwfintech.qingke.io', '27q2nks5g', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/1592226109527738 webdebugger port/54921', 0, 102, 154, 0, 0, 0, 0, 0, 51, 0, 260774, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 01:05:51');
INSERT INTO `t_jsdata` VALUES ('4e3e7052985b4a0f9d67a6d3e2b8e916', 'localhost', '5gpmo9qdt', 'http://localhost:8001/dist/wx/', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36', 0, 0, 228, 0, 0, 0, 128, 0, 2, 0, 1303415, 0, 1422, 766, 0, 'ANGLE (NVIDIA GeForce GTX 750 Direct3D11 vs_5_0 ps_5_0)', '2020-06-17 11:15:07');
INSERT INTO `t_jsdata` VALUES ('518e2757759748f5a13f9230460d4c2b', 'xwfintech.qingke.io', '274jgzqkc', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/1592226109527738 webdebugger port/54921', 0, 100, 155, 0, 0, 0, 0, 0, 53, 0, 260773, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 00:19:30');
INSERT INTO `t_jsdata` VALUES ('51c67fe2ad4d48fc944246cea57fc8a8', 'xwfintech.qingke.io', 'kqxi0b64w', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c31) NetType/WIFI Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 6820, 0, 0, 0, 414, 808, 3, 'Apple GPU', '2020-06-17 20:25:40');
INSERT INTO `t_jsdata` VALUES ('56813a3516624d4bb6aab50784c01a0a', 'xwfintech.qingke.io', 'l27a6zytm', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/15922752414737004 webdebugger port/17481', 0, 96, 146, 0, 0, 0, 0, 0, 48, 0, 260774, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 10:53:58');
INSERT INTO `t_jsdata` VALUES ('59afbb5dd55b4dbbb94ffe6497482a9a', 'xwfintech.qingke.io', 'fq9o848yj', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c31) NetType/WIFI Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 375, 603, 2, 'Apple GPU', '2020-06-17 15:55:52');
INSERT INTO `t_jsdata` VALUES ('5a2a98dded41421abaddc99c9d507047', 'localhost', 'yn1inztr3', 'http://localhost:8001/dist/wx/', 'http://localhost:8001/dist/wx/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36', 0, 0, 304, 0, 0, 0, 0, 0, 2, 0, 350797, 0, 809, 969, 1, 'unknown', '2020-06-17 11:43:35');
INSERT INTO `t_jsdata` VALUES ('6332450afc1c4ce1aa0ba9e7f503336e', 'xwfintech.qingke.io', '2vr21u8ju', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.13(0x17000d24) NetType/4G Language/zh_CN', 0, 6697, 6783, 0, 0, 0, 0, 0, 3407, 0, 0, 0, 375, 603, 2, 'Apple GPU', '2020-06-18 17:59:17');
INSERT INTO `t_jsdata` VALUES ('6396e5f84f79496081297c7461c1e485', 'xwfintech.qingke.io', 'vy44oordy', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c30) NetType/4G Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 414, 808, 3, 'Apple GPU', '2020-06-17 11:33:22');
INSERT INTO `t_jsdata` VALUES ('658241cf56a1415b91fb332adf07cf08', 'xwfintech.qingke.io', '7lnctbiom', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.13(0x17000d24) NetType/4G Language/zh_CN', 0, 7012, 7186, 19399, 0, 0, 0, 0, 3548, 8835, 0, 0, 375, 603, 2, 'Apple GPU', '2020-06-19 11:43:27');
INSERT INTO `t_jsdata` VALUES ('6697eb193e7a40c9a701365c1e0aa38c', 'xwfintech.qingke.io', 'y80qwx3z8', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c30) NetType/4G Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 414, 672, 3, 'Apple GPU', '2020-06-16 01:05:27');
INSERT INTO `t_jsdata` VALUES ('69172ba2ff2c4911b3e0a6ac81eae771', 'xwfintech.qingke.io', 'kht67qpi1', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.13(0x17000d26) NetType/4G Language/zh_CN', 1, 984, 1060, 1917, 0, 0, 0, 0, 90, 839, 0, 0, 375, 641, 3, 'Apple GPU', '2020-06-19 11:18:00');
INSERT INTO `t_jsdata` VALUES ('6c703fcf614348e0a2ec9410cf96d74e', 'xwfintech.qingke.io', 'zt6aog4yo', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c31) NetType/WIFI Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 414, 808, 3, 'Apple GPU', '2020-06-17 10:52:16');
INSERT INTO `t_jsdata` VALUES ('6ef3f1fe7b8b416c90194d2ad9f08c0c', 'xwfintech.qingke.io', '8u818gy6v', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c30) NetType/4G Language/zh_CN', 0, 3674, 3804, 0, 0, 0, 0, 0, 3419, 0, 0, 0, 375, 603, 2, 'Apple GPU', '2020-06-16 00:46:40');
INSERT INTO `t_jsdata` VALUES ('730eec6086684de0a6d0000e742d842a', 'localhost', '2ovrqm005', 'http://localhost:8001/dist/wx/', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36', 0, 0, 322, 0, 0, 0, 0, 0, 17, 0, 350797, 0, 1920, 969, 1, 'ANGLE (Radeon RX Vega M GL Graphics Direct3D11 vs_5_0 ps_5_0)', '2020-06-17 11:27:20');
INSERT INTO `t_jsdata` VALUES ('73159b7f368149bc8d67faf49f10ba0c', 'xwfintech.qingke.io', '0ltmzi391', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c31) NetType/WIFI Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 414, 808, 3, 'Apple GPU', '2020-06-17 14:22:26');
INSERT INTO `t_jsdata` VALUES ('7326abecde0742988854b22b778c339c', 'xwfintech.qingke.io', '46yj32a3i', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c31) NetType/4G Language/zh_CN', 0, 3517, 3584, 0, 0, 0, 0, 0, 3368, 0, 0, 0, 375, 641, 3, 'Apple GPU', '2020-06-17 16:52:41');
INSERT INTO `t_jsdata` VALUES ('743a7ca43a2444799cbfbf21d3386a56', 'xwfintech.qingke.io', 'o78wbdhk6', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/1592226109527738 webdebugger port/54921', 0, 93, 142, 0, 0, 0, 0, 0, 47, 0, 260773, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 00:30:20');
INSERT INTO `t_jsdata` VALUES ('747b5a62cb8f4ffab23e11b1ba47eed1', 'xwfintech.qingke.io', '28hjex1wk', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.13(0x17000d23) NetType/WIFI Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 414, 725, 3, 'Apple GPU', '2020-06-18 16:58:22');
INSERT INTO `t_jsdata` VALUES ('7505d9c3fdbd43f3ac16e406d08c9c98', '', 'uc5i59pdf', 'file:///F:/%E9%94%84%E7%A6%BE-%E7%8E%8B%E6%B5%B7/2020/Z%E5%BC%A0%E4%BC%9F%E6%96%B9%E4%BB%8B%E7%BB%8D%E5%BC%B9%E7%8F%A0%E7%B1%BBH5/%E6%BA%90%E7%A0%81/%E5%89%8D%E7%AB%AF%E4%BB%A3%E7%A0%81/publish.html', '', 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36', 0, 0, 174, 0, 0, 0, 0, 0, 21, 0, 0, 0, 1920, 887, 1, 'ANGLE (Intel(R) HD Graphics 530 Direct3D11 vs_5_0 ps_5_0)', '2020-06-17 10:42:33');
INSERT INTO `t_jsdata` VALUES ('776eafeccd7a48079d94ce4113151bbc', 'www.easygame.cloud', 'jkc7nw5zc', 'http://www.easygame.cloud:18001/game/', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36', 0, 0, 14, 0, 0, 0, 0, 0, 1, 0, 261069, 0, 1920, 969, 1, 'ANGLE (Radeon RX Vega M GL Graphics Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 11:54:07');
INSERT INTO `t_jsdata` VALUES ('781f3f28de854de49367b74bc541a145', 'xwfintech.qingke.io', 'rrvqd9rq1', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c31) NetType/WIFI Language/zh_CN', 1, 137, 179, 0, 0, 0, 0, 0, 44, 0, 0, 0, 375, 557, 2, 'Apple GPU', '2020-06-17 16:52:17');
INSERT INTO `t_jsdata` VALUES ('783477b36d7c414b93b62fc864d008e1', 'xwfintech.qingke.io', 'cjnyddagv', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c31) NetType/4G Language/zh_CN', 1, 3624, 3725, 0, 0, 0, 0, 0, 3371, 0, 0, 0, 375, 554, 2, 'Apple GPU', '2020-06-17 15:59:06');
INSERT INTO `t_jsdata` VALUES ('7ac850aa57694ef7b45e216da159a8f5', '192.168.1.211', '7olvf84vo', 'http://192.168.1.211:9800/h5/', '', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1', 0, 0, 5, 0, 0, 0, 0, 0, 2, 0, 630, 0, 375, 667, 2, 'ANGLE (NVIDIA GeForce GTX 750 Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 11:40:45');
INSERT INTO `t_jsdata` VALUES ('7ff51e45c34746b5a115ad3a33349ff4', 'xwfintech.qingke.io', 'c973vf4z7', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.13(0x17000d29) NetType/WIFI Language/zh_CN', 0, 0, 0, 213, 0, 0, 0, 0, 4, 217, 0, 0, 375, 554, 2, 'Apple GPU', '2020-06-27 16:17:11');
INSERT INTO `t_jsdata` VALUES ('804ba08dd6e04fb8803b5026ac3400ee', 'xwfintech.qingke.io', 'xphyb5rh5', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c31) NetType/4G Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 414, 672, 3, 'Apple GPU', '2020-06-17 11:25:17');
INSERT INTO `t_jsdata` VALUES ('846d2f8618344c82acbb5747cf1a32de', 'xwfintech.qingke.io', 'fag3mxjf8', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c30) NetType/4G Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 375, 603, 3, 'Apple GPU', '2020-06-16 11:38:31');
INSERT INTO `t_jsdata` VALUES ('8550843b306543d383162543495141de', 'xwfintech.qingke.io', 'jksqbmkux', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/1592226109527738 webdebugger port/54921', 0, 0, 3, 0, 0, 0, 0, 0, 1, 0, 259702, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 00:17:54');
INSERT INTO `t_jsdata` VALUES ('8641bb38b86241a7a132a777f6b41d9e', 'www.easygame.cloud', '3fag0x9f0', 'http://www.easygame.cloud:18001/game/', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36', 0, 28, 63, 0, 0, 0, 0, 0, 31, 0, 260967, 0, 1138, 1329, 1, 'ANGLE (Radeon RX Vega M GL Graphics Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 00:33:30');
INSERT INTO `t_jsdata` VALUES ('872bcd41d65f43ef88e8b2b58e0279ac', 'xwfintech.qingke.io', 'z4q6wz1c4', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c31) NetType/WIFI Language/zh_CN', 1, 4859, 5059, 0, 0, 0, 0, 0, 3507, 0, 0, 0, 375, 641, 3, 'Apple GPU', '2020-06-17 14:28:08');
INSERT INTO `t_jsdata` VALUES ('89f441f38cc4496bad207678e7f43685', 'localhost', 'gdab8isdv', 'http://localhost:8002/dist/wx/', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36', 0, 0, 24, 1295, 0, 0, 0, 0, 3, 1261, 1303690, 0, 1920, 969, 1, 'ANGLE (Radeon RX Vega M GL Graphics Direct3D11 vs_5_0 ps_5_0)', '2020-06-19 11:37:02');
INSERT INTO `t_jsdata` VALUES ('8a683f0da510484083c598d1602ee6c3', 'localhost', '5gpmo9qdt', 'http://localhost:8001/dist/wx/', '', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1', 0, 0, 5, 0, 0, 0, 0, 0, 2, 0, 350797, 0, 375, 667, 2, 'ANGLE (NVIDIA GeForce GTX 750 Direct3D11 vs_5_0 ps_5_0)', '2020-06-17 11:15:11');
INSERT INTO `t_jsdata` VALUES ('8e446cbd291a43a69831bde303e28330', 'localhost', 'yn1inztr3', 'http://localhost:8001/dist/wx/', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36', 0, 0, 310, 0, 0, 0, 0, 0, 2, 0, 350797, 0, 809, 969, 1, 'ANGLE (Radeon RX Vega M GL Graphics Direct3D11 vs_5_0 ps_5_0)', '2020-06-17 11:37:03');
INSERT INTO `t_jsdata` VALUES ('8e47484434aa4d45bf70b0255b7e4514', 'xwfintech.qingke.io', 'm7zn9ggnr', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.13(0x17000d24) NetType/4G Language/zh_CN', 0, 3578, 3658, 15184, 0, 0, 0, 0, 3294, 8310, 0, 0, 375, 603, 2, 'Apple GPU', '2020-06-19 09:22:28');
INSERT INTO `t_jsdata` VALUES ('91dcf7c373ca43adbfc7c569ecb4784f', '', 'm9msi4weh', 'file:///E:/desktop/h5/index.html', '', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36', 0, 0, 175, 0, 0, 0, 0, 0, 5, 0, 0, 0, 1280, 607, 1, 'ANGLE (NVIDIA GeForce GTX 750 Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 11:37:47');
INSERT INTO `t_jsdata` VALUES ('9639c755bc4145a19fe7dec1f9f06af6', 'xwfintech.qingke.io', 'f1uznhaey', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.11(0x17000b21) NetType/WIFI Language/zh_CN', 0, 3609, 3785, 0, 0, 0, 0, 0, 3477, 0, 0, 0, 414, 808, 2, 'Apple GPU', '2020-06-16 08:24:05');
INSERT INTO `t_jsdata` VALUES ('9b587bac79dc4994b3675fde61bf931d', 'xwfintech.qingke.io', 'fglwyk7w8', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c30) NetType/3G Language/zh_CN', 0, 3545, 3627, 0, 0, 0, 0, 0, 3392, 0, 0, 0, 375, 603, 2, 'Apple GPU', '2020-06-16 11:00:14');
INSERT INTO `t_jsdata` VALUES ('9fb9f7bcb6ab483ba7b05bee86f21889', '192.168.1.211', '7olvf84vo', 'http://192.168.1.211:9800/h5/', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36', 0, 0, 306, 0, 0, 0, 7, 0, 293, 0, 85435, 0, 1280, 689, 1, 'ANGLE (NVIDIA GeForce GTX 750 Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 11:38:45');
INSERT INTO `t_jsdata` VALUES ('a096dd0673ec425f9b9c87eda880a5c4', 'xwfintech.qingke.io', 'dsh7ju1pd', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.8(0x17000820) NetType/WIFI Language/zh_CN', 0, 3577, 3679, 8262, 0, 0, 0, 0, 3337, 1344, 0, 0, 375, 557, 2, 'Apple GPU', '2020-06-26 08:37:14');
INSERT INTO `t_jsdata` VALUES ('a61f41b60ca54cf697a9c7e4c170ba0b', 'xwfintech.qingke.io', 'kht67qpi1', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.13(0x17000d26) NetType/4G Language/zh_CN', 1, 984, 1060, 85, 0, 0, 0, 0, -986, 84, 0, 0, 375, 641, 3, 'Apple GPU', '2020-06-19 11:18:34');
INSERT INTO `t_jsdata` VALUES ('a667af13509a47d7ac5b1eb58fa32386', 'xwfintech.qingke.io', 'lqa38vm3p', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c31) NetType/4G Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 414, 672, 3, 'Apple GPU', '2020-06-17 11:23:06');
INSERT INTO `t_jsdata` VALUES ('a711b71400794718877e5694fda1b359', 'xwfintech.qingke.io', 'n1xpnlnio', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c30) NetType/4G Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 10139, 0, 0, 0, 414, 725, 3, 'Apple GPU', '2020-06-17 14:10:25');
INSERT INTO `t_jsdata` VALUES ('a9b47f49ce6746d68ef1e65ac0b973af', 'xwfintech.qingke.io', 'l685qyqjk', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/1592226109527738 webdebugger port/54921', 0, 94, 143, 0, 0, 0, 0, 0, 48, 0, 260774, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 00:55:22');
INSERT INTO `t_jsdata` VALUES ('a9cac3953d614301bb3f1b1033ec6818', 'xwfintech.qingke.io', 'pjb5wxy2j', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c30) NetType/4G Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 6988, 0, 0, 0, 375, 603, 2, 'Apple GPU', '2020-06-16 01:00:00');
INSERT INTO `t_jsdata` VALUES ('ad796ff47e8541659d98df29e6dff88c', 'xwfintech.qingke.io', 'ez536e0pe', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c30) NetType/4G Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 414, 672, 3, 'Apple GPU', '2020-06-16 01:06:50');
INSERT INTO `t_jsdata` VALUES ('af236c25349f46b18cafa62979b8dfed', 'xwfintech.qingke.io', 'dub71zlwu', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/15924686368771492 webdebugger port/58675', 0, 0, 3, 0, 0, 0, 0, 0, 2, 0, 261087, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-18 17:53:32');
INSERT INTO `t_jsdata` VALUES ('afd973837cda4102ba3c59f256532e0d', 'xwfintech.qingke.io', 'qmuxum6m2', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c31) NetType/WIFI Language/zh_CN', 0, 3170, 3217, 0, 0, 0, 0, 0, 60, 0, 0, 0, 375, 554, 2, 'Apple GPU', '2020-06-17 15:54:12');
INSERT INTO `t_jsdata` VALUES ('aff9537d5a3e430993cc1aba32113f7a', 'xwfintech.qingke.io', 'l5ecdrr8x', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/15922752414737004 webdebugger port/17481', 0, 105, 161, 0, 0, 0, 0, 0, 56, 0, 260774, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 10:43:44');
INSERT INTO `t_jsdata` VALUES ('b56cd4329db140b69d85d126d02029fc', 'xwfintech.qingke.io', 'qzsnlvkaj', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/15922752414737004 webdebugger port/17481', 0, 0, 4, 0, 0, 0, 0, 0, 3, 0, 260774, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 10:52:26');
INSERT INTO `t_jsdata` VALUES ('b8e78f9b65d344ae924fc6e630a4ab02', 'www.easygame.cloud', '3fag0x9f0', 'http://www.easygame.cloud:18001/game/', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36', 35, 31, 104, 0, 0, 0, 0, 0, 33, 0, 260966, 0, 1138, 1329, 1, 'ANGLE (Radeon RX Vega M GL Graphics Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 00:15:16');
INSERT INTO `t_jsdata` VALUES ('b96bedeffdb54fb1927036606c5a9175', 'xwfintech.qingke.io', 'zg77cqd89', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/15925293272963714 webdebugger port/41561', 0, 0, 3, 284, 1, 0, 0, 0, 2, 288, 1303326, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-19 09:21:47');
INSERT INTO `t_jsdata` VALUES ('bce3ae6ff1724bc59cf88e1f77e814eb', 'xwfintech.qingke.io', 'pq2kiuzgv', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c30) NetType/4G Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 321, 0, 0, 0, 414, 672, 3, 'Apple GPU', '2020-06-16 01:07:56');
INSERT INTO `t_jsdata` VALUES ('bf385132c509442487a660f67da0f822', '', 'm9msi4weh', 'file:///E:/desktop/h5/index.html', '', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36', 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 1280, 607, 1, 'ANGLE (NVIDIA GeForce GTX 750 Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 11:37:53');
INSERT INTO `t_jsdata` VALUES ('bfb4df9577fe40e0bbd9dfaac25c3964', '192.168.1.211', '7olvf84vo', 'http://192.168.1.211:9800/h5/', '', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1', 0, 0, 8, 0, 0, 0, 0, 0, 2, 0, 85435, 0, 375, 667, 2, 'ANGLE (NVIDIA GeForce GTX 750 Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 13:50:39');
INSERT INTO `t_jsdata` VALUES ('c15c030e757645a48cfd44ec6b166e30', '192.168.1.211', '7olvf84vo', 'http://192.168.1.211:9800/h5/', '', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1', 0, 0, 10, 0, 0, 0, 0, 0, 3, 0, 630, 0, 375, 667, 2, 'ANGLE (NVIDIA GeForce GTX 750 Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 11:40:11');
INSERT INTO `t_jsdata` VALUES ('c3d6b1d0a0334882a8aae4ea31e8b27f', 'xwfintech.qingke.io', '28hjex1wk', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.13(0x17000d23) NetType/WIFI Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 7780, 0, 0, 0, 414, 725, 3, 'Apple GPU', '2020-06-18 16:52:49');
INSERT INTO `t_jsdata` VALUES ('c42d7fecf66c4542ac5f11bde5d5a850', 'xwfintech.qingke.io', 'u55cfs8xo', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c30) NetType/WIFI Language/zh_CN', 0, 3451, 3496, 0, 0, 0, 0, 0, 3341, 0, 0, 0, 375, 603, 2, 'Apple GPU', '2020-06-16 08:51:01');
INSERT INTO `t_jsdata` VALUES ('cbdda550ec164b90801fbb291d155fcf', 'localhost', '2ovrqm005', 'http://localhost:8001/dist/wx/', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36', 0, 0, 306, 0, 0, 0, 0, 0, 3, 0, 947, 0, 809, 969, 1, 'ANGLE (Radeon RX Vega M GL Graphics Direct3D11 vs_5_0 ps_5_0)', '2020-06-17 11:27:35');
INSERT INTO `t_jsdata` VALUES ('cc493bb8a13e4e68b89dc13c5a726674', 'xwfintech.qingke.io', 'dub71zlwu', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/15924686368771492 webdebugger port/58675', 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 261087, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-18 17:53:37');
INSERT INTO `t_jsdata` VALUES ('cc8384478db64df7bc45fcf68fe4c819', 'xwfintech.qingke.io', 'wud87344p', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c30) NetType/4G Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 6970, 0, 0, 0, 375, 603, 2, 'Apple GPU', '2020-06-16 01:04:21');
INSERT INTO `t_jsdata` VALUES ('cce55afcdfaf4a6db8809bf7b7612c9a', '192.168.1.211', '7olvf84vo', 'http://192.168.1.211:9800/h5/', '', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1', 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 85435, 0, 375, 667, 2, 'ANGLE (NVIDIA GeForce GTX 750 Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 11:40:50');
INSERT INTO `t_jsdata` VALUES ('d21ffb07548e4458b0b052dd40061404', 'xwfintech.qingke.io', 'l27a6zytm', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/15922752414737004 webdebugger port/17481', 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 260774, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 11:20:15');
INSERT INTO `t_jsdata` VALUES ('d364137b74b64fafa88ad167c06a3657', 'xwfintech.qingke.io', '1g25ifn0d', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/1592226109527738 webdebugger port/54921', 0, 108, 165, 0, 0, 0, 0, 0, 55, 0, 260774, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 01:01:23');
INSERT INTO `t_jsdata` VALUES ('d41ac1f8b29c4e78ac035ad8d197769a', 'www.easygame.cloud', '3fag0x9f0', 'http://www.easygame.cloud:18001/game/', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36', 0, 29, 67, 0, 0, 0, 0, 0, 30, 0, 259896, 0, 1138, 1329, 1, 'ANGLE (Radeon RX Vega M GL Graphics Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 00:13:25');
INSERT INTO `t_jsdata` VALUES ('d72d4712fa79423ba8822640cfe745d8', 'xwfintech.qingke.io', 'iswwml7dl', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.8(0x17000820) NetType/WIFI Language/zh_CN', 0, 3464, 3513, 8881, 0, 0, 0, 0, 3084, 2329, 0, 0, 375, 641, 3, 'Apple GPU', '2020-06-25 16:31:15');
INSERT INTO `t_jsdata` VALUES ('d82b2a24c1d243e19133bcebb0ff0d81', 'xwfintech.qingke.io', 'qzsnlvkaj', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/15922752414737004 webdebugger port/17481', 0, 104, 157, 0, 0, 0, 0, 0, 53, 0, 260774, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 10:52:02');
INSERT INTO `t_jsdata` VALUES ('da7c2fd6d17d47a58a5e4832fcb1a40a', 'xwfintech.qingke.io', 'oai6i3wxp', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c30) NetType/4G Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 6901, 0, 0, 0, 375, 603, 2, 'Apple GPU', '2020-06-16 01:07:43');
INSERT INTO `t_jsdata` VALUES ('da9925775f344856b444a3135ca3130e', 'xwfintech.qingke.io', 'l685qyqjk', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/1592226109527738 webdebugger port/54921', 0, 0, 4, 0, 0, 0, 0, 0, 3, 0, 260774, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 00:44:29');
INSERT INTO `t_jsdata` VALUES ('db07640e819540d9bdad706d59b3933a', 'xwfintech.qingke.io', 'l685qyqjk', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/1592226109527738 webdebugger port/54921', 0, 102, 156, 0, 0, 0, 0, 0, 51, 0, 260774, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 00:47:43');
INSERT INTO `t_jsdata` VALUES ('de0310550c384c919f6c6de99d217ce7', 'xwfintech.qingke.io', 'dub71zlwu', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/15924686368771492 webdebugger port/58675', 0, 236, 337, 0, 0, 0, 0, 0, 100, 0, 261087, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-18 17:52:44');
INSERT INTO `t_jsdata` VALUES ('e27c07d8332348e0a23ed1da0042a011', 'xwfintech.qingke.io', 'o78wbdhk6', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/1592226109527738 webdebugger port/54921', 0, 108, 166, 0, 0, 0, 0, 0, 56, 0, 260773, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 00:28:18');
INSERT INTO `t_jsdata` VALUES ('e906b09b64564ed09273ff6bea08584c', 'xwfintech.qingke.io', 'plzq47pdz', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c31) NetType/4G Language/zh_CN', 0, 3564, 3682, 0, 0, 0, 0, 0, 3366, 0, 0, 0, 414, 808, 2, 'Apple GPU', '2020-06-17 15:56:07');
INSERT INTO `t_jsdata` VALUES ('ec481e56dc6b40a8aa535bf0b4043959', 'xwfintech.qingke.io', 'o78wbdhk6', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/1592226109527738 webdebugger port/54921', 0, 126, 193, 0, 0, 0, 0, 0, 65, 0, 260773, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 00:25:06');
INSERT INTO `t_jsdata` VALUES ('ec5ebca5ba0d40f1ae7e744dbe08730b', 'xwfintech.qingke.io', 'plnvcn4j8', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c30) NetType/4G Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 414, 672, 3, 'Apple GPU', '2020-06-16 01:09:53');
INSERT INTO `t_jsdata` VALUES ('ef083fb11ea24d8897cbad7c83ed41e1', 'xwfintech.qingke.io', 'v1cuvj2tp', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/15924686368771492 webdebugger port/58675', 0, 0, 122, 0, 0, 0, 0, 0, 121, 0, 261087, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-18 16:26:09');
INSERT INTO `t_jsdata` VALUES ('ef6ba6d6a5864cbda99e60b9ac901633', 'localhost', '2ovrqm005', 'http://localhost:8001/dist/wx/', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36', 0, 1, 307, 0, 0, 0, 0, 0, 1, 0, 947, 0, 809, 969, 1, 'ANGLE (Radeon RX Vega M GL Graphics Direct3D11 vs_5_0 ps_5_0)', '2020-06-17 11:30:36');
INSERT INTO `t_jsdata` VALUES ('ef8bd9a94e264129a1b6358ec0e38697', 'www.easygame.cloud', '1q02ewdtq', 'http://www.easygame.cloud:18001/game/', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36', 0, 0, 13, 0, 0, 0, 0, 0, 1, 0, 261256, 0, 1920, 969, 1, 'ANGLE (Radeon RX Vega M GL Graphics Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 11:52:02');
INSERT INTO `t_jsdata` VALUES ('efe0b971482f455580b74e20a35e413f', 'xwfintech.qingke.io', 'l685qyqjk', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/1592226109527738 webdebugger port/54921', 0, 102, 153, 0, 0, 0, 0, 0, 51, 0, 260774, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 00:41:49');
INSERT INTO `t_jsdata` VALUES ('f1a21ec8aef64e95b90471fb05dbdf03', 'xwfintech.qingke.io', '43kch49u8', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c31) NetType/4G Language/zh_CN', 0, 3549, 3634, 0, 0, 0, 0, 0, 3300, 0, 0, 0, 414, 725, 2, 'Apple GPU', '2020-06-17 13:45:53');
INSERT INTO `t_jsdata` VALUES ('f1c618b6c6e74b0bbf2ba73514eb4ac5', 'localhost', 'yn1inztr3', 'http://localhost:8001/dist/wx/', 'http://localhost:8001/dist/wx/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36', 0, 0, 6, 0, 0, 0, 0, 0, 4, 0, 350797, 0, 809, 969, 1, 'unknown', '2020-06-17 11:43:22');
INSERT INTO `t_jsdata` VALUES ('f3a5fb0a5ebc4ea6a2045d689021ae93', 'xwfintech.qingke.io', 'vdb91g72i', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 wechatdevtools/1.02.2004020 MicroMessenger/7.0.4 Language/zh_CN webview/15924686368771492 webdebugger port/58675', 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 364151, 0, 414, 672, 3, 'ANGLE (NVIDIA GeForce GTX 1060 with Max-Q Design Direct3D11 vs_5_0 ps_5_0)', '2020-06-18 16:24:46');
INSERT INTO `t_jsdata` VALUES ('f41a1c50d0f748a8aada04be4a86b9fe', 'localhost', 'yn1inztr3', 'http://localhost:8001/dist/wx/', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36', 0, 1, 306, 0, 0, 0, 0, 0, 3, 0, 350797, 0, 809, 969, 1, 'ANGLE (Radeon RX Vega M GL Graphics Direct3D11 vs_5_0 ps_5_0)', '2020-06-17 11:43:13');
INSERT INTO `t_jsdata` VALUES ('f810618eed7c4e638dd924a19d05e6ce', '192.168.1.211', '7olvf84vo', 'http://192.168.1.211:9800/h5/', '', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1', 0, 0, 5, 0, 0, 0, 0, 0, 2, 0, 85435, 0, 375, 667, 2, 'ANGLE (NVIDIA GeForce GTX 750 Direct3D11 vs_5_0 ps_5_0)', '2020-06-16 11:46:06');
INSERT INTO `t_jsdata` VALUES ('f8579ab9393f4a8bb49b77736ff4c7de', 'localhost', '2ovrqm005', 'http://localhost:8001/dist/wx/', '', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36', 0, 0, 306, 0, 0, 0, 0, 0, 3, 0, 350797, 0, 809, 969, 1, 'ANGLE (Radeon RX Vega M GL Graphics Direct3D11 vs_5_0 ps_5_0)', '2020-06-17 11:33:55');
INSERT INTO `t_jsdata` VALUES ('fc781413e3ba455087c019d878911bda', 'xwfintech.qingke.io', 'vxicyim73', 'https://xwfintech.qingke.io:18001/game/index.html', 'https://xwfintech.qingke.io/openapi/wechat/gogameurl', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c32) NetType/WIFI Language/zh_CN', 0, 0, 0, 0, 0, 0, 0, 0, 7158, 0, 0, 0, 375, 641, 3, 'Apple GPU', '2020-06-18 12:07:56');
INSERT INTO `t_jsdata` VALUES ('fe96af3d7fef4725ab4580e7e74cf0b1', 'localhost', 'yn1inztr3', 'http://localhost:8001/dist/wx/', 'http://localhost:8001/dist/wx/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36', 0, 0, 316, 0, 0, 0, 0, 0, 12, 0, 351081, 0, 809, 969, 1, 'unknown', '2020-06-17 11:46:04');

-- ----------------------------
-- Table structure for t_pinball_score
-- ----------------------------
DROP TABLE IF EXISTS `t_pinball_score`;
CREATE TABLE `t_pinball_score`  (
  `id` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'id',
  `score` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '成绩',
  `create_time` datetime(0) NOT NULL COMMENT '创建时间',
  `openid` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '微信openid',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '弹珠游戏成绩表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t_pinball_score
-- ----------------------------

-- ----------------------------
-- Table structure for t_statistics
-- ----------------------------
DROP TABLE IF EXISTS `t_statistics`;
CREATE TABLE `t_statistics`  (
  `id` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'id',
  `team_id` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '参赛队伍id',
  `load_time` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '加载时长',
  `interface_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '接口名称',
  `response_time` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '接口响应时长',
  `fps` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '游戏帧数',
  `pv` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '页面加载数量',
  `uv` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '设备数',
  `pageviews` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '浏览量',
  `registrations` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '注册量',
  `play_time` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '游戏时长',
  `create_time` datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
  `openid` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '微信openid',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '游戏详细数据统计' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t_statistics
-- ----------------------------

-- ----------------------------
-- Table structure for twechat_userinfo
-- ----------------------------
DROP TABLE IF EXISTS `twechat_userinfo`;
CREATE TABLE `twechat_userinfo`  (
  `openid` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '用户openid',
  `nickname` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '昵称',
  `sex` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '性别',
  `province` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '省份',
  `city` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '市区',
  `country` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '区',
  `headimgurl` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '头像',
  `unionid` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '用户UnionID 唯一',
  `createtime` datetime(0) NULL DEFAULT NULL COMMENT '用户信息获取时间',
  `updatetime` datetime(0) NULL DEFAULT NULL COMMENT '用户信息更新时间',
  PRIMARY KEY (`openid`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '微信相关用户信息' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of twechat_userinfo
-- ----------------------------
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0a7Y4oxeJgU_t6ZYDSdVRB8', '5rGf5rmW5Lq656ew6JKC5aeG5ZOl', '1', '四川', '成都', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/UHYFiaSlaGm6IqquoRpL7RVmXqz3FcTKZrMyC9XiaZqnibKxfkPqx5mzQWT1hnOmUp74ORHI2JoyFUOgnx09bATlw/132', NULL, '2020-06-18 14:40:07', '2020-06-18 14:40:07');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0b93ObpClNOmvJyL1Di-MOs', '5ZSQ6ZOt', '2', '上海', '徐汇', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/n8g8lJoiaibia4EC0WO0kFtWSo0CACrc6F2dN4lm7XxAn2kUSt3b3RZebW4C0b991zIhbKZ1gWveHuBBvq6KyUd3Q/132', NULL, '2020-06-16 07:01:14', '2020-06-16 07:01:14');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0b9xFflcW7rQY8lw931QR0s', '6L296Iqx6YWS55qE5bCR5bm0VF5U', '1', '河南', '信阳', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/sMIEWyCyxCQKRw4TPnoEflH3a0poslT1Nev1QvOv4icUThS5BXYmibOicq57WWhDeiauWmdzVR2xQLZFtHvofjYF8w/132', NULL, '2020-06-17 19:30:15', '2020-06-17 19:30:15');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0bGJnx1VdRUAEp2sMYxDXv0', '7oyy5pyJ5pe25oOz5b+1', '1', '山东', '青岛', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83eoeOt7tfJXtMvzyQPE2PiaGemeyum6piaTWfBiayGv1KgU8Ax7MxAAPhh9UOs85d07wdtBVBHtLWej4Q/132', NULL, '2020-06-19 09:33:44', '2020-06-19 09:33:44');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0bLMn9A7cott1HTEIuvx5II', 'RHlsYW4n', '1', '山东', '青岛', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTIrWoh6dYCA8Wys3uuIlXBiaEK08hwQus3p8tibAsCiaiccermKPgJekibJnsmN8GvmSgibdHZuPFlxRCMw/132', NULL, '2020-06-19 11:17:48', '2020-06-19 11:17:48');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0ccQUQwO14zDc4LnmuTiaHw', '6IyD6IyD6IyD5ZCM5a2m', '1', '广东', '深圳', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83erCLPCaCZOnYlYv6UZfUyWnuMPUWP8LebTC6wXnG64PuWSR764nbNrNmicnJFpib4fSZaxJCS0aXB0A/132', NULL, '2020-06-26 09:20:07', '2020-06-26 09:20:07');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0cdHeiXSjNBEkJHQG5IsgNU', '5ZGo5YuH', '1', '四川', '成都', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83epxFFbSBTmerZpwwvUbZoZqolnRHnNjFRLTRZ8Ecprjmmc9PMh4nMsroY1pqhLUGyxCr3QDT9r5YQ/132', NULL, '2020-06-16 01:09:06', '2020-06-16 01:09:06');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0cUv07SEw332wVuvxLv9w48', '5beu5LiN5aSa5YWI55Sf', '1', '四川', '成都', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/g7C2GTSq6zHMlXCqYaO9bT4wO2h1wb99q0wwzU1R5ia1oiaWnfzKPlSArYFZxGzkk5YuuicZUeW3hclZkj4JhX6xQ/132', NULL, '2020-06-17 10:49:11', '2020-06-17 10:49:11');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0cVjZ2cEZZeToRpzaj98E1I', '55S76bm/6LCB', '2', '', '', '列支敦士登', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLyXr5X95sgIcbdezbA2bvg0zTGPadLWMqob7xXtFZSBBXFaQdVHB0kljAe1Djn5OS5UNbmYecvzg/132', NULL, '2020-06-17 15:58:40', '2020-06-17 15:58:40');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0d8dUdZTiQ3a0CrlAQqtKBM', 'V29vaG9v7oCN', '1', '广东', '广州', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/2YmH0icY78hZOPK2DxAYFvEORQmYHsDyNibpnlkibJ4CP1HRdNhvpOo0F5CtU7CSVtPSAXZkSVZwhZQWxBdB86HfQ/132', NULL, '2020-06-22 22:44:05', '2020-06-22 22:44:05');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0dd7Scy10Mj_SsFtVLF6bxA', 'c3RvY2s=', '1', '福建', '厦门', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83eoeZJ1aW5LkAnCa8eVBSCNX3NcH7Eb5CF9SchdumPBfsibf93dLLYBvVmnqrBBibQJ14jKls49Ik4XA/132', NULL, '2020-06-24 07:23:46', '2020-06-24 07:23:46');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0dFSWn_Fy-t9C1wWBMcb9RQ', '55m95bO75Lic', '1', '', '', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/VYneMJE72icgSPzE3OpuD68iakTlVC7q9kib2YYrGxSENNgzzbnPMzrU8hg5kdajHMsTJWvwZSM3ZpynqticgoWIOw/132', NULL, '2020-06-27 15:27:05', '2020-06-27 15:27:05');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0dlr7RooG7-Dm9cT9IHNi7c', '562x562x', '0', '', '', '', 'http://thirdwx.qlogo.cn/mmopen/vi_32/6LkInzF55Pd2Ciba1X2WicYs62ZwZVaRevgCOBhRKOico0F9GcvN4qyfMYnjhNacX20CLyAu4fsndiaUhwREoNiaTDA/132', NULL, '2020-06-17 19:56:29', '2020-06-17 19:56:29');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0dnN5sStuvd8ZVSWkRl3YMI', '5qWg6aOO', '1', '浙江', '舟山', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKib0xISwXuoiafz4llU5muNtGqt6ML8vLkdbuiaaic1fP1SHY6bNia0C8NZOSUQEKJymAJmNO1377Ipjg/132', NULL, '2020-06-17 21:04:14', '2020-06-17 21:04:14');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0dZFF45WusbcZEOHVuuvgEY', '5YeJ5ouM54KS6JuL54KS6aWtKCDhkJsgKc+D', '1', '江苏', '无锡', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTIiagG8gyusGAQGdeh3bHJRIEJ6hnFRE03ovLVjXcuzJVVHz73MfvRGEia0Cic9gMSSTRkYDoDHg6eGw/132', NULL, '2020-06-23 17:22:41', '2020-06-23 17:22:41');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0eCYBmdKC7r8EOMtUDUqq44', '5LiJ', '1', '山东', '青岛', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83erm75LX3RiaXs7bb5NOdpm2a60zgsOJsmt7erypGqEomFr8yq2Ms0uKtwd7gvjVWQDXx3HBMyH1tNw/132', NULL, '2020-06-16 10:43:41', '2020-06-16 10:43:41');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0ef6QKZQUHj102yP4dvN0LY', '5pac6KGX', '1', '浙江', '杭州', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJUzv6S9wroyUdDcd9QOJ293f7ziazTad4B5lExwpbiaHJB3SUD5sicBl7Eric31GRnjsWnIZ5s8XFAug/132', NULL, '2020-06-21 21:16:14', '2020-06-21 21:16:14');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0eGLmY9opKV-e2RDxZiZ-Mo', '546L5bCP5bGx', '1', '浙江', '杭州', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83erO1qUTV3wfINDibElWMbVgQxy0QGRoqLwPZJ5C88yNpqjIMX6YZ7iaicia92tvdXyGKUEklajw4kKKmw/132', NULL, '2020-06-17 13:45:18', '2020-06-17 13:45:18');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0elP7ZjqAT2NK6UYEJZcNQ4', '5ZGo5pmT55KH', '2', '山西', '阳泉', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJe2v5tzdicP1n3XbbTicPZPl1Vl62vXUel4Ox972fRXfpnNDyVwFfashaibSY7GoetMia7pibRTSOicgug/132', NULL, '2020-06-25 00:59:35', '2020-06-25 00:59:35');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0eOvStryc6yMm8yFWeyuN0U', '6LSw5aa5', '2', '四川', '成都', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83eoHicw0e0H5ibtwGWPjicobyULnfY4eN4Uic1MGdKttFXfwe6gA65ZwwCbic2l2DjC0lvdSiccV8196uRfA/132', NULL, '2020-06-17 10:50:50', '2020-06-17 10:50:50');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0eyf1X44Ji8tO0mbI9Ig5jg', 'TWFjcm8=', '1', '四川', '成都', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/icIkeE8W4Q0RPX1ib6CeuXgUTKW9OfYvmiaoPE0wAjo7Aiab4RWcc2QIoW9Lwy1p6O4uaibq5HicSg6I3IBiagRpZR5jg/132', NULL, '2020-06-18 10:55:56', '2020-06-18 10:55:56');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0f71_uk-qukhs91oS0PRHLs', '5pif6L6w5aSn5rW3', '1', '', '', '百慕大', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLk6gw5tGialqomwicDicicSndtUPV2hG0VZkOrokKzoHKxSjejdaALe5icAVXuzloTQQmI4ibLSIRRGXxA/132', NULL, '2020-06-22 10:57:42', '2020-06-22 10:57:42');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0fAENDPby0uzHwlJrjtDpzU', '6JOd6Imy55qE6Zuo', '1', '甘肃', '兰州市', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/bavYBYZumUxbKqSWwEm1HdWXeKFA1ykk20f0J6eNXL5LZsJRcticyWmLmT6ibRf2cJkrO6jLF8A0CibIMR5cgMibew/132', NULL, '2020-06-17 15:28:24', '2020-06-17 15:28:24');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0fJtTvOSQyAjLodWS3hlQtA', 'VHJvdWJsZSBJJ20gSW4=', '1', '山东', '青岛', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLemW5ooZN333tviaaCzBBLxqqd3whDZtgiaV3tyAcunCibAp0JXhYCs42LztsaNPV2LiaicBNKmaIpoqw/132', NULL, '2020-06-16 11:20:18', '2020-06-16 11:20:18');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0ft-E8ks0QVKajlW67fMjkA', '5Lu75qGQ6ZGr', '1', '上海', '闵行', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/23TAC6ia6U7zHHnDb4AbqRacFkYFctwvE8XlB2jmB2DTuoKxibOlf2Nwx2iblrtcFXiaBvXW2kz40aXcO1eNpugfzw/132', NULL, '2020-06-17 16:52:13', '2020-06-17 16:52:13');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0fwQcdMsQzyurhZ_i3KiqPE', 'Sm95cWk=', '1', '浙江', '杭州', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83eoRKu1S5sGO9GV88gNcmZdrRLwal7vz3tWmxUQGd5vic0GZVzNQBnhRBkSuOvLmObnRK3zkXggE6ibQ/132', NULL, '2020-06-16 01:11:39', '2020-06-16 01:11:39');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0Qge48QkLIYZ9eckpS_u41Q', '5aSn6K+d5a2Z', '1', '北京', '海淀', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKgDns1IbgDNpxT7l00ULaTyhqKNY4S5RA19ZGeTNTaq1ayZr4uTkV62K7spVQjSib1hLG77WvGIdg/132', NULL, '2020-06-22 13:20:08', '2020-06-22 13:20:08');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0R-27vjldkiNug2n0JI08TY', '5p6v6I2j5YyG5YyG', '1', '山东', '青岛', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLM0acYGEGj9VvjVCnbqqbxR1iaP6JaiaRBBgjUc3Bz2XYYNLwcGV4JAIIJRBia6ic6p3iaiawQddawxbZA/132', NULL, '2020-06-16 00:43:42', '2020-06-16 00:43:42');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0RCbOJh37T0x5NUEzxiW81c', '5qGi5bu3', '1', '', '', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/a5FMF6AyAoic4ER5ic2UHLpkncfp60wYuUcpQKPDMYAntmkoRZJlbnZyfS7j0D5DPlibmrLXK6J9E3r9l6G5AcOHw/132', NULL, '2020-06-17 23:54:38', '2020-06-17 23:54:38');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0RchliWDAylJW9FGLEwhlEI', '6b6a5qKT6Ziz', '1', '', '', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83eqKKQBN5ialT6z1VuaSljS0TSIoTqwlTAJUSViaRibYDyF7RDfviaw3HsYoCAwcO2pzhUic67QMbtK0ydg/132', NULL, '2020-06-23 22:42:06', '2020-06-23 22:42:06');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0RFMu2XeiD3JqNP46DQ01dQ', '6LC36Zuo5bCP5ruh5peg5bC95aSP', '1', '四川', '成都', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLX1SNXgfhibiawgwQwrcGxibzoNY8GXPicdJXz6mTl4d3icMIn4o3Bia8jiavviaial2tH6q8liaEYib3Zib5kxw/132', NULL, '2020-06-15 20:40:47', '2020-06-15 20:40:47');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0RN2YoAd34USNHy214Bi03w', '5ri45a2Q', '0', '', '', '', 'http://thirdwx.qlogo.cn/mmopen/vi_32/h1lg0V8Bn1oxvr1Cian66ztgUQRa3uK67gpPzYniaUUKoryt0zp5unFBg8PVWnakqZpicErSiaaPqtSxVibTtade4UA/132', NULL, '2020-06-16 01:08:48', '2020-06-16 01:08:48');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0RrD3QjX-3OHRPK4zTJYYGU', '5pmS5aSq6Ziz5YeP6IKl55qE54yr', '1', '', '', '丹麦', 'http://thirdwx.qlogo.cn/mmopen/vi_32/9I123icp1DGIEvkq4bQialn9GvtMtwN8QpeZJKnafAYh2zbdL5YI51Z19DYHGBKGD8c2jukD12ibBxicWic6lLoBC3g/132', NULL, '2020-06-15 20:45:03', '2020-06-15 20:45:03');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0RwgknWMXw2sduH-daBkdRE', '6KO05L2g55yL5aSn5rW3', '1', '山东', '青岛', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/PiajxSqBRaELYrIjC8u4FbxcSFnOHKXVcBia2Q46qiaZL32IBPCBspvQxXXdnxCGzIibazqlv33Beah8hRDIUXDgOw/132', NULL, '2020-06-16 05:26:46', '2020-06-16 05:26:46');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0RyY-OPTkF0pGZGKv023jqw', '5pyd6Zu+5Yid55Sf77yM6JC95Y+26aOY6Zu2', '0', '', '', '', 'http://thirdwx.qlogo.cn/mmopen/vi_32/UYmKalecKCAKEwzFD76ibiaJ8fhuvHNzgtxXSc42esRQXFZicdvLkUuicp3ibLylicNw6dDOm5zor555rxhFJwQk2pIg/132', NULL, '2020-06-18 19:05:58', '2020-06-18 19:05:58');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0S-jLfv6Vz9uwfyhnOBZWOc', 'bGl6', '1', '', '', '直布罗陀', 'http://thirdwx.qlogo.cn/mmopen/vi_32/GibvI22Q4SBLKialOLH5cpAsJ4YW7icI5bMOoZm7sZdxByCyoSFCKceeSz5uXohVbg4mylVqGaDDFvpx5aJiaKRfxw/132', NULL, '2020-06-24 10:39:05', '2020-06-24 10:39:05');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0S8sDWm6ijzkF-uYeJpO0SU', '5Li+5Liq5qCX5a2Q', '1', '内蒙古', '呼和浩特', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/oMc9GHvVQovnV2nZXgQSA4gIjDgVfAEV7nqGrJcb9ePsZzoFdibEvbHZwZH4CV7ye1ZbX1j5vWpqCz8WYZnC9AQ/132', NULL, '2020-06-23 15:38:32', '2020-06-23 15:38:32');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0SY84bZ6mrN_P15EiS7-IKw', '5YCq5pyo5a2Q', '2', '安徽', '安庆', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTIzafHiav2oUFY2nib821BnH0IBHcp6zcYL2viaiaWMeLPNCAf06Z7s7pOWnyqnCH1cmSMUlFVRUZENMA/132', NULL, '2020-06-17 16:52:06', '2020-06-17 16:52:06');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0TH9D66W1060tPHaXQMyogA', '5YiY5piK5aSpIFNpc3lwaHVz', '1', '上海', '徐汇', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTI6c5giaHqaFj791QbuBCpxAEBwQ41AlLQPnREMAz1ZobMeCziaPZEqv91xfMbFezqhW1OuHcPutoNQ/132', NULL, '2020-06-17 14:27:35', '2020-06-17 14:27:35');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0TITVy9XlysdeJU480P_gAM', '8J+Nkg==', '2', '江苏', '南京', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTIEfbmN1P0VnmNeiciabOM727Jar3kGpRHIVHzJpBRticzcDbSibYaiarQ6TJDAQODExBGu5mLuSo9ox6A/132', NULL, '2020-06-17 16:52:14', '2020-06-17 16:52:14');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0TOA_mvRtmgcclshExrhgBY', '5byX5rSb5qGR', '1', '山东', '泰安', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJGxKAwez0vibbSozIaBD7lGggLn7XyZ5fms7S5Esymy9s7kib6rQpOSYtd4eRXTsZDdRZsj0vic2w0Q/132', NULL, '2020-06-18 13:15:35', '2020-06-18 13:15:35');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0TPPcege5IrTTCU_WEJmVng', 'U2FtZWVu8J+MmQ==', '2', '四川', '成都', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/nz3mXQORFLYQLKW6m5eN2RQvoE7EWBnwUd2Gpo5crkxibMbUukoHcXE34rwgRLxnYjIy2nSDPUwCsYPwGMU6GYw/132', NULL, '2020-06-17 15:54:03', '2020-06-17 15:54:03');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0TZC6AD--mhWRzTLJU4Rp2c', '5o2M6LSw6Zu2', '1', '山东', '青岛', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/KUpZEfHx1S98a9NatDGUugfnjYjt2FEib2pAxpBF9UbsglYpibYJmad9kpQia2058TicBCQ87tVd8hYCUAic6329Qpw/132', NULL, '2020-06-16 00:43:36', '2020-06-16 00:43:36');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0U01Xw6x3XAuPI05ZJ7ZYr8', '5pyI55CK', '1', '上海', '杨浦', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLzXqsCY0kUQEklo2RxQDUnsRXApyOd7WwhEeIPYadzQCe95uU46Kg9THTiaGjFdheK7h6LXptN9Nw/132', NULL, '2020-06-17 20:14:28', '2020-06-17 20:14:28');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0ULa8GiOKdrLGieg3fFiVmk', '546L5aSn5q+b', '2', '上海', '长宁', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83epWDxbdBS3Rqv816KSVndtibDl3fnibOPJnp4nk89gIojAZvL4sMibCnCacKt04ibRwPBqccYt2xpAujg/132', NULL, '2020-06-22 15:39:43', '2020-06-22 15:39:43');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0URx7cAsRORykxFJOek_ik8', '5a6J57qi6LGG8J+Nkg==', '2', '', '', '冰岛', 'http://thirdwx.qlogo.cn/mmopen/vi_32/xic14jVPKrLxSFXyjTkz6WodzfjQktsZC9fm7icXBnKD5nSCUP2licvV6ReNHkgJNyX54jTyxsyIBBEarvtgYcDYA/132', NULL, '2020-06-25 21:21:25', '2020-06-25 21:21:25');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0V7y3V3WzXFBQbZuSYyvgOA', '5LmU5o23', '1', '上海', '浦东新区', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTIrrX8cxo1ISTRToZwwpwmgAX7hJX90qTmZvMiaFd5RE6HBFgNM1njeWvZc7AMRqQITvJvp0ZhicicHg/132', NULL, '2020-06-16 00:48:21', '2020-06-16 00:48:21');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0V7YTEbMa7-7x9Dbk2s1Uyk', '5YW154aK54aK8J+Quw==', '2', '四川', '成都', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/icOdHFINMlzsOuc0HOfqwnL3vaODowJkbTyF7W29mCZk8TWtokJ9yH4WicNB74iaxhqLghD2FliaRSnx7g6txdKr0A/132', NULL, '2020-06-17 10:48:42', '2020-06-17 10:48:42');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0VbB0hah5U-Mgd9_iKhftA4', '6buE6YKm5rOi', '1', '', '', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTIFPLV5z6hVwG7Qmk7H3kKeeSQbo6iav1QyN3kbArib4fHHY8w6cThtFdH5Onr8WIDu7NMfwBcgQmsg/132', NULL, '2020-06-25 16:30:51', '2020-06-25 16:30:51');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0VMDM7Ap7xP6vKNQUA9y_Ys', '5Y2h5bCU', '0', '', '', '冰岛', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJD0U2tbSeeQlfaFVibMZ6GnAgdwswC3SsOyICamJT9DdZhuiaJVsC7ECuG8NqkEVsrDsPwByXhHkbg/132', NULL, '2020-06-16 08:50:46', '2020-06-16 08:50:46');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0VZwPZgUTw0aWBN3rxj1Cnk', 'Y2hpY2h1', '1', '', '', '百慕大', 'http://thirdwx.qlogo.cn/mmopen/vi_32/NTIL7G0ycUx7d21HTichtUEPrMgTmAIXPK9ic4IIa1AibJnvGqWjicZdAsfKrdG3vcNoOibXvD6nsDjn8egIicfxRlyA/132', NULL, '2020-06-26 08:36:51', '2020-06-26 08:36:51');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0WEF_0qAaWi4M5hX9suywoo', 'ZWtt', '0', '', '', '', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJ1QK7DcOCCWwBSajZ28fvLDPoCGhykTrjF0eHiaZCSTqN5pVacPIcBty0mnnH1NRbia0zpGW7J49icA/132', NULL, '2020-06-24 08:04:17', '2020-06-24 08:04:17');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0WUpzyXTNun6ggj63V8s63Q', 'RWxldmVu', '1', '四川', '成都', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/QIWtee5d8y8q3Dpfnu1MALWZ7X5fHWOibbl5Sia3pIiaaLUEZvxBHmXriciaPkicwVz85eib93S7eVlcwticc4Jkz4Cehg/132', NULL, '2020-06-17 15:55:40', '2020-06-17 15:55:40');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0WV3SG4RZSx22xMzfLM84oM', 'QWxhbg==', '1', '广东', '广州', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTK2NuRp9rl4IxxRFclcz6iakLzrnod4mprGsvXiapQw2rpbqKSicPQx42t0Mq27DvJrYJFSfkPdPDoXA/132', NULL, '2020-06-17 15:21:07', '2020-06-17 15:21:07');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0Xa9uUIqibxOR_p1yXBdeLo', 'bGVv', '1', '福建', '厦门', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJGVSw8a0EHpE4amYNrOs5ScvxtbhicrhLfRplibg37PyM8M2rfDQFDBDnesInObGVUn24gj9U6luXQ/132', NULL, '2020-06-18 23:11:41', '2020-06-18 23:11:41');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0XcTzuIR3mweJGstV66kYe8', '6KKB57un5Lyf', '1', '', '', '', 'http://thirdwx.qlogo.cn/mmopen/vi_32/UIzHPNHUia7I5SwOkDUpibiaatXyWXTLcJT4Dl9lobq7Iy7h3dXdicYiaEZiblU9otNgPPREoUZt8Tm0R7u2xAdBTHQw/132', NULL, '2020-06-22 18:21:14', '2020-06-22 18:21:14');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0XdEhbmCWhyWh6uOFoLpPsA', 'UmVkZGlzaA==', '2', '北京', '西城', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLdClxWzqLGa0Nonw2soUget9u80OgD2532DoD0zjcLHpKG8HXN9QkA2uEBicGtC9ZqUBZPVyvCbmA/132', NULL, '2020-06-25 19:46:14', '2020-06-25 19:46:14');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0Xh0wxU1jru4bBHHTwcHMwQ', 'eXNq', '1', '四川', '成都', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJnnlTnBPySbYvpD6W3MZ1I17pCdiaLbS0fQtKibiaoJt685wBtichc2zpbFn7VO0ATuSqCibGdI0NX4IQ/132', NULL, '2020-06-18 18:27:55', '2020-06-18 18:27:55');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0XJGz8KAzaZ0VbidM3ExVJc', 'bmFubw==', '2', '', '', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83eohibMPyYOwIeKrbvl8ibq1KCfWxzRhonyIQ77Q20CO4TFiacjBUgbLX4Yyj15zciasia8f3bdHibRicfv5A/132', NULL, '2020-06-22 14:20:50', '2020-06-22 14:20:50');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0Xoda-Pr6DIEqctC4qnxoJs', '5Y+v5Y+v', '1', '湖北', '黄石', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTK8QF4GiaHY0CD1KpH67aU4jtibuiapCPsonib5plTCJSWEicHeLxTWBcSBT1Kxgey05LFTJYjhPUaBuFA/132', NULL, '2020-06-28 09:12:30', '2020-06-28 09:12:30');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0XwI2z21qe1UaxMBuedTMfk', 'Ti1O', '2', '福建', '厦门', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/gl2NbuicUs1N6SKTCTUbYzLhOuMdC5ZEjkic18WmSnelsCqSXJdfaWMd3vdeibVCHRYSTdm39iaEnr9LAMkk6nk78w/132', NULL, '2020-06-22 14:15:24', '2020-06-22 14:15:24');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0Y19LS6d-SaE5h1MOB8JOng', '5rOi5rOi8J+MsU5hZGlh', '2', '北京', '西城', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJB3WhdjBiaQ2rREH9JKz2B3fFFJF429A7Z2oD3Ypev1sSmwJaJ9uqoW6RfIFd7riauZ9LUylVtE1uw/132', NULL, '2020-06-16 01:04:14', '2020-06-16 01:04:14');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0Y8GQ8o7X9FzqnbFJA3Digk', 'Q2ljaQ==', '2', '北京', '石景山', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTK8XibXEJesm3TUthXJaGkRxxnz5RwS1AvU3GGNkcsiaiciaXgeLJmKPrJMZbKa1aD713B4BxldJmkeIQ/132', NULL, '2020-06-16 11:37:37', '2020-06-16 11:37:37');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0YDs7komEkFTDloninvqlB8', '546L5pyI6LaF', '1', '四川', '成都', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83ep0QVoORp4oiajPrPSKHfJhsQ1ZiaBQlkNf6NwRVIlxHricvyuYU4xvUHcln7xiarYVslMZtnay6EYMCg/132', NULL, '2020-06-16 01:28:15', '2020-06-16 01:28:15');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0YGBsv7pzsz7pzOOCW6tZ9g', 'bm9uYW1l', '1', '西藏', '日喀则', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/eWLNtic1NnNsbhGwv5sdM0g6DcIQfqicjbrSTWwujMsqWgJGnckFbYV5avMRlOHGiaH1s1m0cvDdJ1TiaXbvWonVEQ/132', NULL, '2020-06-15 20:59:07', '2020-06-15 20:59:07');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0Z0gniX3cbfqaq6vA8LR9pc', 'Tnp5', '0', '', '', '', 'http://thirdwx.qlogo.cn/mmopen/vi_32/lwy6Y5ybTj3icyiccndVxY8T1TaLu8tTniaG7kibSn25bQ6dmTxEfH9dAGARvoGPHjhl3z6jgpKRXfDDhlZv4siaETg/132', NULL, '2020-06-24 18:59:04', '2020-06-24 18:59:04');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0Z9KWqXSB29iDBxTk8gbgm8', 'c+G0nHPJqg==', '2', '上海', '徐汇', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJhN2ZCwvS17ib1kbvaStxSFAugffeK74RysI5stjGon8jUbSIWxuqwIpZGkyhhStarHB6rYdZhzsA/132', NULL, '2020-06-17 14:17:28', '2020-06-17 14:17:28');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0ZAMh_EiqRKPo2gduND4OxY', 'eWlubGk=', '2', '', '', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJUlvyiaEeYuJcibC77MJWb2syIPPUibicNWztnEETcSqAcib4G4D7HVBXicyRaZ2LuDuBWCsfXicCXE5CGQ/132', NULL, '2020-06-17 15:57:50', '2020-06-17 15:57:50');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0ZcDnzpHeD_ngxbfpXCe7KU', '5ZCR5LiK', '1', '四川', '成都', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/DbvcBGEzm0J4Dmv2WmB9o2dVzJicm5tIsAStALrvZ1ptFappeptjtkE1lnZd9ARrDyYBIubuxO151TCGyCM10uA/132', NULL, '2020-06-16 08:23:44', '2020-06-16 08:23:44');
INSERT INTO `twechat_userinfo` VALUES ('ogIOb0ZntWtr0ioaMMQwhX1-56gc', 'c3g=', '1', '四川', '成都', '中国', 'http://thirdwx.qlogo.cn/mmopen/vi_32/qxWEIjy9XYeCiaQpicOGAsGFFQfe1MZvAcjIIaOjwqOJn4uSIuIjG8iaLghJVNoK6vjdOZ4Qo5yJ8qRMarSyQiahyQ/132', NULL, '2020-06-16 01:14:11', '2020-06-16 01:14:11');

SET FOREIGN_KEY_CHECKS = 1;
