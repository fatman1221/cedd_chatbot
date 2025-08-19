// 管理员配置
export interface AdminConfig {
  // 管理员邮箱 - 用于接收新用户注册通知
  adminNotificationEmail: string;
  // 系统邮箱 - 用于发送系统邮件
  systemEmail: string;
  // 管理员姓名
  adminName: string;
  // 是否启用新用户注册通知
  enableRegistrationNotification: boolean;
}

// 默认管理员配置
export const defaultAdminConfig: AdminConfig = {
  adminNotificationEmail: 'admin@cedd.gov.hk', // 请修改为您的实际管理员邮箱
  systemEmail: 'noreply@cedd.gov.hk',
  adminName: 'CEDD 系统管理员',
  enableRegistrationNotification: true,
};

// 获取管理员配置
export const getAdminConfig = (): AdminConfig => {
  // 可以从环境变量或配置文件中读取
  return {
    adminNotificationEmail: process.env.REACT_APP_ADMIN_EMAIL || defaultAdminConfig.adminNotificationEmail,
    systemEmail: process.env.REACT_APP_SYSTEM_EMAIL || defaultAdminConfig.systemEmail,
    adminName: process.env.REACT_APP_ADMIN_NAME || defaultAdminConfig.adminName,
    enableRegistrationNotification: process.env.REACT_APP_ENABLE_REG_NOTIFICATION !== 'false',
  };
};

// 验证邮箱格式
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 管理员邮箱设置
export class AdminEmailService {
  private config: AdminConfig;

  constructor() {
    this.config = getAdminConfig();
  }

  // 获取管理员通知邮箱
  getAdminNotificationEmail(): string {
    return this.config.adminNotificationEmail;
  }

  // 获取系统邮箱
  getSystemEmail(): string {
    return this.config.systemEmail;
  }

  // 获取管理员姓名
  getAdminName(): string {
    return this.config.adminName;
  }

  // 检查是否启用注册通知
  isRegistrationNotificationEnabled(): boolean {
    return this.config.enableRegistrationNotification;
  }

  // 更新管理员邮箱配置
  updateAdminEmail(newEmail: string): boolean {
    if (!isValidEmail(newEmail)) {
      throw new Error('邮箱格式不正确');
    }
    
    this.config.adminNotificationEmail = newEmail;
    // 这里可以保存到本地存储或发送到后端
    localStorage.setItem('admin_notification_email', newEmail);
    return true;
  }

  // 从本地存储加载管理员邮箱
  loadAdminEmailFromStorage(): string {
    const savedEmail = localStorage.getItem('admin_notification_email');
    if (savedEmail && isValidEmail(savedEmail)) {
      this.config.adminNotificationEmail = savedEmail;
      return savedEmail;
    }
    return this.config.adminNotificationEmail;
  }

  // 发送新用户注册通知（模拟）
  async sendRegistrationNotification(newUser: { email: string; role: string; registeredAt: string }): Promise<boolean> {
    if (!this.isRegistrationNotificationEnabled()) {
      return false;
    }

    const notificationData = {
      to: this.getAdminNotificationEmail(),
      from: this.getSystemEmail(),
      subject: `新用户注册通知 - CEDD 聊天系统`,
      body: `
        尊敬的 ${this.getAdminName()}：

        有新用户注册了 CEDD 聊天系统：

        用户邮箱：${newUser.email}
        用户角色：${newUser.role === 'root' ? '管理员' : '普通用户'}
        注册时间：${newUser.registeredAt}

        请及时查看并处理相关事务。

        此邮件由 CEDD 聊天系统自动发送，请勿回复。
      `
    };

    try {
      // 这里应该调用实际的邮件发送服务
      console.log('发送管理员通知邮件:', notificationData);
      
      // 模拟邮件发送
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`管理员通知邮件已发送到: ${this.getAdminNotificationEmail()}`);
          resolve(true);
        }, 1000);
      });
    } catch (error) {
      console.error('发送管理员通知邮件失败:', error);
      return false;
    }
  }
}

export const adminEmailService = new AdminEmailService();